import PageShell from "@/components/PageShell";
import SegmentedControl from "@/components/SegmentedControl";
import { Play, Square, Timer, Activity, Eye, Zap, Target } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { HandLandmarker, PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const workoutTypes = ["Shadow Boxing", "Heavy Bag", "Sparring", "Pads", "Cardio"];
const combos = ["1-2-3-Slip-2", "Jab-Cross-Hook-Roll", "1-1-2-3-2", "Slip-Slip-Cross-Hook", "Jab-Body-Head"];

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  if (m < 1) return `${s} sec`;
  return `${m} min`;
};

const WorkoutLogger = () => {
  const { addWorkout } = useApp();
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState(workoutTypes[0]);
  const [notes, setNotes] = useState("");
  const [whoopSync, setWhoopSync] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const endWorkout = () => {
    setActive(false);
    setShowForm(true);
  };

  const saveWorkout = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    addWorkout({
      type,
      date: dateStr,
      duration: formatDuration(elapsed),
      notes: notes || "No notes recorded.",
    });
    setShowForm(false);
    setElapsed(0);
    setNotes("");
    setType(workoutTypes[0]);
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-5 text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Workout Duration</p>
          <p className="font-display text-4xl text-foreground">{formatTime(elapsed)}</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Workout Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {workoutTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="How was your session?"
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
          <div className="flex items-center justify-between glass-card p-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-accent" />
              <span className="text-sm font-semibold text-foreground">Sync Whoop Data</span>
            </div>
            <button
              onClick={() => setWhoopSync(!whoopSync)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${whoopSync ? "bg-primary" : "bg-secondary"} relative`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform duration-200 ${whoopSync ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
          <Button onClick={saveWorkout} className="w-full gradient-fire text-primary-foreground border-none font-semibold py-6">
            Save Workout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 pt-8">
      <div className="glass-card w-48 h-48 rounded-full flex flex-col items-center justify-center glow-red">
        <Timer size={28} className="text-primary mb-2" />
        <p className="font-display text-5xl text-foreground">{formatTime(elapsed)}</p>
      </div>
      {!active ? (
        <Button onClick={() => setActive(true)} className="gradient-fire text-primary-foreground border-none font-semibold px-10 py-6 text-lg rounded-full glow-red">
          <Play size={20} className="mr-2" /> Start Workout
        </Button>
      ) : (
        <Button onClick={endWorkout} variant="outline" className="border-primary text-primary font-semibold px-10 py-6 text-lg rounded-full hover:bg-primary/10">
          <Square size={20} className="mr-2" /> End Workout
        </Button>
      )}
    </div>
  );
};

interface SessionReport {
  punchAccuracy: number;
  guardUptime: number;
  guardDrops: number;
  duration: number;
  punches: number;
}

const AICoach = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [guardDropped, setGuardDropped] = useState(false);
  const [score, setScore] = useState(100);
  const [comboIdx, setComboIdx] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [handsDetected, setHandsDetected] = useState(0);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [sessionReport, setSessionReport] = useState<SessionReport | null>(null);
  const [sessionDuration, setSessionDuration] = useState(180); // seconds
  const [countingDown, setCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const handleEndSessionRef = useRef<(() => void) | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number>();
  const lastVideoTimeRef = useRef<number>(-1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAudioPlayRef = useRef<number>(0);
  const chinYRef = useRef<number | null>(null);
  const previousGuardDroppedRef = useRef<boolean>(false);
  const calibrationStartTimeRef = useRef<number | null>(null);
  const stableHandsCountRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number | null>(null);
  const totalFramesRef = useRef<number>(0);
  const guardUpFramesRef = useRef<number>(0);
  const guardDropCountRef = useRef<number>(0);
  const punchCountRef = useRef<number>(0);
  const cleanPunchCountRef = useRef<number>(0);
  const prevWristPositionsRef = useRef<Array<{ x: number; y: number } | null>>([null, null]);
  const lastPunchTimesRef = useRef<number[]>([0, 0]);
  const PUNCH_VELOCITY_THRESHOLD = 0.13; // min wrist displacement per frame to count as punch
  const PUNCH_COOLDOWN_MS = 800; // ms between punches per hand
  
  // Guard threshold: hands should be above chin + buffer
  const CHIN_BUFFER = 0.15; // 15% buffer below chin (normalized coordinates)
  const CALIBRATION_DURATION = 3000; // 3 seconds of stable hand detection required
  const REQUIRED_HANDS = 2; // Require both hands to be detected
  
  // Initialize audio context for ding sound
  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    return () => {
      audioContext.close();
    };
  }, []);
  
  // Function to play ding sound with 2-second cooldown
  const playDingSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const now = Date.now();
    if (now - lastAudioPlayRef.current < 2000) return; // 2-second cooldown
    
    lastAudioPlayRef.current = now;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = 800; // Higher pitch for ding
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }, []);

  // Initialize MediaPipe Hand Landmarker and Pose Landmarker
  useEffect(() => {
    const initializeDetectors = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
        );
        
        // Initialize Hand Landmarker for fast hand tracking
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        // Initialize Pose Landmarker just for chin detection
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        handLandmarkerRef.current = handLandmarker;
        poseLandmarkerRef.current = poseLandmarker;
      } catch (error) {
        console.error("Failed to initialize detectors:", error);
      }
    };

    if (calibrating || sessionActive || countingDown) {
      initializeDetectors();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [calibrating, sessionActive, countingDown]);

  // Setup camera
  useEffect(() => {
    if (!calibrating && !sessionActive && !countingDown) {
      // Cleanup when not in session or calibration
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraReady(false);
      return;
    }

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              setCameraReady(true);
            }
          };
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Failed to access camera. Please ensure camera permissions are granted.");
        setCalibrating(false);
      }
    };

    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [calibrating, sessionActive, countingDown]);

  // Calibration detection loop - checks for hands before starting session
  useEffect(() => {
    if (!calibrating || !handLandmarkerRef.current || !videoRef.current || !canvasRef.current || !cameraReady) {
      return;
    }

    const calibrateHands = () => {
      if (!videoRef.current || !canvasRef.current || !handLandmarkerRef.current) {
        animationFrameRef.current = requestAnimationFrame(calibrateHands);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(calibrateHands);
        return;
      }

      // Set canvas size to match video
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (video.currentTime !== lastVideoTimeRef.current && video.readyState >= 2) {
        lastVideoTimeRef.current = video.currentTime;
        const timestamp = performance.now();
        
        // Detect hands during calibration
        const handResults = handLandmarkerRef.current.detectForVideo(video, timestamp);
        
        // Clear canvas
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const detectedHands = handResults.landmarks ? handResults.landmarks.length : 0;
        setHandsDetected(detectedHands);
        
        // Draw detected hands
        if (handResults.landmarks && handResults.landmarks.length > 0) {
          handResults.landmarks.forEach((handLandmarks) => {
            const wrist = handLandmarks[0];
            const x = wrist.x * canvas.width;
            const y = wrist.y * canvas.height;
            
            // Draw wrist position in calibration mode (yellow)
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw hand outline
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 2;
            ctx.beginPath();
            handLandmarks.forEach((landmark, idx) => {
              const lx = landmark.x * canvas.width;
              const ly = landmark.y * canvas.height;
              if (idx === 0) {
                ctx.moveTo(lx, ly);
              } else {
                ctx.lineTo(lx, ly);
              }
            });
            ctx.stroke();
          });
        }
        
        // Check if we have stable hand detection
        if (detectedHands >= REQUIRED_HANDS) {
          const now = Date.now();
          
          if (calibrationStartTimeRef.current === null) {
            calibrationStartTimeRef.current = now;
            stableHandsCountRef.current = 0;
          }
          
          const elapsed = now - calibrationStartTimeRef.current;
          const progress = Math.min((elapsed / CALIBRATION_DURATION) * 100, 100);
          setCalibrationProgress(progress);
          
          if (elapsed >= CALIBRATION_DURATION) {
            // Calibration complete - start countdown
            setCalibrating(false);
            setCountingDown(true);
            setCountdown(3);
            setCalibrationProgress(100);
            calibrationStartTimeRef.current = null;
            stableHandsCountRef.current = 0;
          }
        } else {
          // Reset calibration timer if hands are not detected
          calibrationStartTimeRef.current = null;
          setCalibrationProgress(0);
        }
        
        ctx.restore();
      }
      
      animationFrameRef.current = requestAnimationFrame(calibrateHands);
    };

    // Reset calibration state
    calibrationStartTimeRef.current = null;
    stableHandsCountRef.current = 0;
    setCalibrationProgress(0);
    setHandsDetected(0);
    
    calibrateHands();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [calibrating, cameraReady]);

  // Hand and pose detection loop - runs during active session
  useEffect(() => {
    if (!sessionActive || !handLandmarkerRef.current || !poseLandmarkerRef.current || !videoRef.current || !canvasRef.current) {
      return;
    }

    const detectHandsAndPose = () => {
      if (!videoRef.current || !canvasRef.current || !handLandmarkerRef.current || !poseLandmarkerRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectHandsAndPose);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(detectHandsAndPose);
        return;
      }

      // Set canvas size to match video
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (video.currentTime !== lastVideoTimeRef.current && video.readyState >= 2) {
        lastVideoTimeRef.current = video.currentTime;
        const timestamp = performance.now();
        
        // Detect hands
        const handResults = handLandmarkerRef.current.detectForVideo(video, timestamp);
        
        // Detect pose for chin position
        const poseResults = poseLandmarkerRef.current.detectForVideo(video, timestamp);
        
        // Clear canvas
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update chin position from pose detection
        if (poseResults.landmarks && poseResults.landmarks.length > 0) {
          const landmarks = poseResults.landmarks[0];
          // Landmark 0 is the nose, but we want chin - landmark 18 is the chin tip
          // Actually, MediaPipe Pose doesn't have a chin landmark directly
          // Landmark 0 is nose, landmark 2 is left eye, landmark 5 is right eye
          // We'll use nose position + small offset as chin approximation
          const nose = landmarks[0];
          chinYRef.current = nose.y + 0.03; // Small offset below nose for chin
        }
        
        // Check hand positions if we have chin reference
        if (handResults.landmarks && handResults.landmarks.length > 0 && chinYRef.current !== null) {
          const chinThresholdY = chinYRef.current + CHIN_BUFFER;
          let anyHandDropped = false;
          
          // Check each detected hand
          handResults.landmarks.forEach((handLandmarks, handIdx) => {
            // Wrist is landmark 0 in Hand Landmarker
            const wrist = handLandmarks[0];

            if (wrist.y > chinThresholdY) {
              anyHandDropped = true;
            }

            // Punch detection: measure wrist velocity against previous frame
            const prev = prevWristPositionsRef.current[handIdx];
            if (prev !== null) {
              const dx = wrist.x - prev.x;
              const dy = wrist.y - prev.y;
              const velocity = Math.sqrt(dx * dx + dy * dy);
              const now = Date.now();
              if (velocity > PUNCH_VELOCITY_THRESHOLD && now - (lastPunchTimesRef.current[handIdx] ?? 0) > PUNCH_COOLDOWN_MS) {
                punchCountRef.current += 1;
                lastPunchTimesRef.current[handIdx] = now;

                // Check fist quality: fingertips (8,12,16,20) should be curled toward palm.
                // Works for jabs, crosses, hooks, and uppercuts — all require a closed fist.
                const fingerPairs: [number, number][] = [[5, 8], [9, 12], [13, 16], [17, 20]];
                let curledCount = 0;
                fingerPairs.forEach(([mcpIdx, tipIdx]) => {
                  const mcp = handLandmarks[mcpIdx];
                  const tip = handLandmarks[tipIdx];
                  const dMcp = Math.sqrt((wrist.x - mcp.x) ** 2 + (wrist.y - mcp.y) ** 2);
                  const dTip = Math.sqrt((wrist.x - tip.x) ** 2 + (wrist.y - tip.y) ** 2);
                  if (dTip < dMcp * 1.7) curledCount++;
                });
                if (curledCount >= 2) cleanPunchCountRef.current += 1;
              }
            }
            prevWristPositionsRef.current[handIdx] = { x: wrist.x, y: wrist.y };

            // Draw wrist position
            const x = wrist.x * canvas.width;
            const y = wrist.y * canvas.height;
            ctx.fillStyle = wrist.y > chinThresholdY ? "#ef4444" : "#22c55e";
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();
          });
          
          // Update guard dropped state
          const wasGuardDropped = previousGuardDroppedRef.current;
          setGuardDropped(anyHandDropped);

          // Play audio alert when guard drops (with cooldown handled in playDingSound)
          if (anyHandDropped && !wasGuardDropped) {
            playDingSound();
            guardDropCountRef.current += 1;
          }

          previousGuardDroppedRef.current = anyHandDropped;

          // Track frames for uptime calculation
          totalFramesRef.current += 1;
          if (!anyHandDropped) guardUpFramesRef.current += 1;

          // Update score based on guard position
          if (anyHandDropped) {
            setScore((s) => Math.max(0, s - 0.3));
          } else {
            setScore((s) => Math.min(100, s + 0.5));
          }
          
          // Draw threshold line
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(0, chinThresholdY * canvas.height);
          ctx.lineTo(canvas.width, chinThresholdY * canvas.height);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // No hands detected or no chin reference
          setGuardDropped(false);
          previousGuardDroppedRef.current = false;
        }
        
        ctx.restore();
      }
      
      animationFrameRef.current = requestAnimationFrame(detectHandsAndPose);
    };

    detectHandsAndPose();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sessionActive, playDingSound]);

  // Combo rotation during session
  useEffect(() => {
    if (sessionActive) {
      sessionStartTimeRef.current = Date.now();
      const interval = setInterval(() => {
        setComboIdx((i) => (i + 1) % combos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sessionActive]);

  // 3-2-1 countdown before session starts
  useEffect(() => {
    if (!countingDown) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setCountingDown(false);
          setSessionActive(true);
          setTimeRemaining(sessionDuration);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countingDown, sessionDuration]);

  // Session countdown timer — auto-ends when it hits zero
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setTimeout(() => handleEndSessionRef.current?.(), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  const handleStartSession = () => {
    setCalibrating(true);
    setSessionActive(false);
    setCountingDown(false);
    setCountdown(3);
    setTimeRemaining(0);
    setScore(100);
    setGuardDropped(false);
    setHandsDetected(0);
    setCalibrationProgress(0);
    setSessionReport(null);
    chinYRef.current = null;
    lastAudioPlayRef.current = 0;
    calibrationStartTimeRef.current = null;
    stableHandsCountRef.current = 0;
    sessionStartTimeRef.current = null;
    totalFramesRef.current = 0;
    guardUpFramesRef.current = 0;
    guardDropCountRef.current = 0;
    punchCountRef.current = 0;
    cleanPunchCountRef.current = 0;
    prevWristPositionsRef.current = [null, null];
    lastPunchTimesRef.current = [0, 0];
  };

  const handleEndSession = () => {
    const duration = sessionStartTimeRef.current ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000) : 0;
    const uptime = totalFramesRef.current > 0 ? Math.round((guardUpFramesRef.current / totalFramesRef.current) * 100) : 100;
    const punchAccuracy = punchCountRef.current > 0 ? Math.round((cleanPunchCountRef.current / punchCountRef.current) * 100) : 0;
    setSessionReport({
      punchAccuracy,
      guardUptime: uptime,
      guardDrops: guardDropCountRef.current,
      duration,
      punches: punchCountRef.current,
    });
    setCalibrating(false);
    setSessionActive(false);
    setCountingDown(false);
    setTimeRemaining(0);
    setGuardDropped(false);
    setScore(100);
    setHandsDetected(0);
    setCalibrationProgress(0);
    chinYRef.current = null;
    calibrationStartTimeRef.current = null;
    stableHandsCountRef.current = 0;
    sessionStartTimeRef.current = null;
    totalFramesRef.current = 0;
    guardUpFramesRef.current = 0;
    guardDropCountRef.current = 0;
    punchCountRef.current = 0;
    cleanPunchCountRef.current = 0;
    prevWristPositionsRef.current = [null, null];
    lastPunchTimesRef.current = [0, 0];
  };

  // Keep ref in sync so the timer always calls the latest version
  handleEndSessionRef.current = handleEndSession;

  return (
    <div className="space-y-4">
      <div className={`glass-card aspect-[3/4] rounded-xl relative overflow-hidden flex items-center justify-center bg-black transition-all duration-300 ${
        guardDropped ? 'ring-4 ring-red-500 ring-opacity-75 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : ''
      }`}>
        {/* Video feed */}
        {(calibrating || sessionActive || countingDown) && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </>
        )}

        {/* Calibration overlay */}
        {calibrating && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
                <div 
                  className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent transition-all duration-100"
                  style={{ transform: `rotate(${calibrationProgress * 3.6}deg)` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-3xl text-primary">{handsDetected}</span>
                </div>
              </div>
              <div>
                <p className="font-display text-xl text-foreground mb-2">Detecting Hands...</p>
                <p className="text-sm text-muted-foreground">
                  {handsDetected < REQUIRED_HANDS 
                    ? `Show ${REQUIRED_HANDS} hands to the camera`
                    : `Hold steady... ${Math.round(calibrationProgress)}%`
                  }
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full gradient-fire transition-all duration-100"
                  style={{ width: `${calibrationProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* 3-2-1 countdown overlay */}
        {countingDown && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Get Ready</p>
            <span className="font-display text-[96px] leading-none text-primary glow-red">{countdown}</span>
          </div>
        )}

        {/* Guard dropped alert */}
        {sessionActive && guardDropped && (
          <div className="absolute top-4 left-4 right-4 status-bar-danger rounded-lg py-2 px-4 flex items-center justify-center gap-2 z-30 animate-pulse">
            <Eye size={18} className="text-primary-foreground" />
            <span className="text-sm font-bold text-primary-foreground uppercase tracking-wider">Guard Dropped! Readjust!</span>
          </div>
        )}

        {/* Session HUD: time remaining + guard score */}
        {sessionActive && (
          <>
            <div className="absolute top-4 left-4 glass-card px-3 py-2 flex items-center gap-2 z-30">
              <Timer size={14} className="text-primary" />
              <span className="font-display text-xl text-foreground">{formatTime(timeRemaining)}</span>
            </div>
            <div className="absolute top-4 right-4 glass-card px-3 py-2 flex items-center gap-2 z-30">
              <Target size={14} className="text-accent" />
              <span className="font-display text-xl text-foreground">{Math.round(score)}%</span>
            </div>
          </>
        )}

        {/* Initial state */}
        {!calibrating && !sessionActive && !countingDown && (
          <div className="z-10 text-center">
            <Zap size={32} className="mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">AI Shadow Boxing Coach</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
              Real-time guard detection using your camera
            </p>
          </div>
        )}
      </div>

      {/* Duration selector — only shown before session starts */}
      {!calibrating && !sessionActive && !countingDown && (
        <div className="glass-card p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Session Duration</p>
          <div className="grid grid-cols-4 gap-2">
            {[60, 120, 180, 300].map((d) => (
              <button
                key={d}
                onClick={() => setSessionDuration(d)}
                className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                  sessionDuration === d
                    ? "gradient-fire text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {d / 60}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Combo display */}
      {sessionActive && (
        <div className="glass-card p-3 flex items-center gap-3 overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">Combo:</span>
          <p className="font-display text-lg text-accent whitespace-nowrap animate-pulse">{combos[comboIdx]}</p>
        </div>
      )}

      {/* Accuracy report */}
      {sessionReport && !sessionActive && !calibrating && (
        <div className="glass-card p-5 space-y-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Session Report</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Punch Accuracy</p>
              <p className={`font-display text-3xl ${sessionReport.punchAccuracy >= 80 ? "text-green-400" : sessionReport.punchAccuracy >= 50 ? "text-accent" : "text-primary"}`}>
                {sessionReport.punchAccuracy}%
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Guard Uptime</p>
              <p className={`font-display text-3xl ${sessionReport.guardUptime >= 80 ? "text-green-400" : sessionReport.guardUptime >= 50 ? "text-accent" : "text-primary"}`}>
                {sessionReport.guardUptime}%
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Guard Drops</p>
              <p className={`font-display text-3xl ${sessionReport.guardDrops === 0 ? "text-green-400" : sessionReport.guardDrops <= 5 ? "text-accent" : "text-primary"}`}>
                {sessionReport.guardDrops}
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Duration</p>
              <p className="font-display text-3xl text-foreground">{formatTime(sessionReport.duration)}</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Punches Thrown</p>
              <p className="font-display text-3xl text-accent">{sessionReport.punches}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {sessionReport.punchAccuracy >= 80
              ? "Clean punches — great fist technique!"
              : sessionReport.punchAccuracy >= 50
              ? "Work on keeping your fist tight through contact."
              : "Focus on forming a proper fist on jabs, crosses, hooks, and uppercuts."}
          </p>
        </div>
      )}

      {/* Control buttons */}
      {!calibrating && !sessionActive && !countingDown && (
        <Button
          onClick={handleStartSession}
          className="w-full font-semibold py-6 text-lg border-none gradient-fire text-primary-foreground glow-red"
        >
          <Play size={20} className="mr-2" /> {sessionReport ? "Start New Session" : "Start Shadow Boxing"}
        </Button>
      )}

      {(calibrating || countingDown) && (
        <Button
          onClick={handleEndSession}
          className="w-full font-semibold py-6 text-lg border-none bg-secondary text-foreground hover:bg-secondary/80"
        >
          <Square size={20} className="mr-2" /> Cancel
        </Button>
      )}

      {sessionActive && (
        <Button
          onClick={handleEndSession}
          className="w-full font-semibold py-6 text-lg border-none bg-secondary text-foreground hover:bg-secondary/80"
        >
          <Square size={20} className="mr-2" /> End Session
        </Button>
      )}
    </div>
  );
};

const TrainingPage = () => {
  return (
    <PageShell title="Training Camp">
      <div className="pt-4">
        <SegmentedControl tabs={["Workout Logger", "AI Coach"]}>
          <WorkoutLogger />
          <AICoach />
        </SegmentedControl>
      </div>
    </PageShell>
  );
};

export default TrainingPage;
