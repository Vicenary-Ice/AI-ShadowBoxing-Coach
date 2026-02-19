import PageShell from "@/components/PageShell";
import SegmentedControl from "@/components/SegmentedControl";
import { Play, Square, Timer, Activity, Eye, Zap, Target } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const workoutTypes = ["Shadow Boxing", "Heavy Bag", "Sparring", "Pads", "Cardio"];
const combos = ["1-2-3-Slip-2", "Jab-Cross-Hook-Roll", "1-1-2-3-2", "Slip-Slip-Cross-Hook", "Jab-Body-Head"];

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const WorkoutLogger = () => {
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
    setShowForm(false);
    setElapsed(0);
    setNotes("");
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

const AICoach = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [guardDropped, setGuardDropped] = useState(false);
  const [score, setScore] = useState(92);
  const [comboIdx, setComboIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (sessionActive) {
      intervalRef.current = setInterval(() => {
        const drop = Math.random() < 0.25;
        setGuardDropped(drop);
        if (drop) setScore((s) => Math.max(60, s - Math.floor(Math.random() * 5)));
        else setScore((s) => Math.min(100, s + 1));
        setComboIdx((i) => (i + 1) % combos.length);
      }, 2500);
    } else {
      clearInterval(intervalRef.current);
      setGuardDropped(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [sessionActive]);

  return (
    <div className="space-y-4">
      {/* Camera Viewfinder */}
      <div className="glass-card aspect-[3/4] rounded-xl relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
        {/* Skeleton overlay */}
        <svg viewBox="0 0 200 300" className="w-40 opacity-30 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="100" cy="40" r="20" />
          <line x1="100" y1="60" x2="100" y2="160" />
          <line x1="100" y1="80" x2="55" y2="130" />
          <line x1="100" y1="80" x2="145" y2="130" />
          <line x1="100" y1="160" x2="65" y2="250" />
          <line x1="100" y1="160" x2="135" y2="250" />
        </svg>

        {/* Guard Dropped Alert */}
        {sessionActive && guardDropped && (
          <div className="absolute top-4 left-4 right-4 status-bar-danger rounded-lg py-2 px-4 flex items-center justify-center gap-2">
            <Eye size={18} className="text-primary-foreground" />
            <span className="text-sm font-bold text-primary-foreground uppercase tracking-wider">Guard Dropped!</span>
          </div>
        )}

        {/* Live Form Score */}
        {sessionActive && (
          <div className="absolute top-4 right-4 glass-card px-3 py-2 flex items-center gap-2">
            <Target size={14} className="text-accent" />
            <span className="font-display text-xl text-foreground">{score}%</span>
          </div>
        )}

        {!sessionActive && (
          <div className="z-10 text-center">
            <Zap size={32} className="mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">AI Shadow Boxing Coach</p>
          </div>
        )}
      </div>

      {/* Combo Ticker */}
      {sessionActive && (
        <div className="glass-card p-3 flex items-center gap-3 overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">Combo:</span>
          <p className="font-display text-lg text-accent whitespace-nowrap animate-pulse">{combos[comboIdx]}</p>
        </div>
      )}

      <Button
        onClick={() => setSessionActive(!sessionActive)}
        className={`w-full font-semibold py-6 text-lg border-none ${
          sessionActive
            ? "bg-secondary text-foreground hover:bg-secondary/80"
            : "gradient-fire text-primary-foreground glow-red"
        }`}
      >
        {sessionActive ? (
          <><Square size={20} className="mr-2" /> End Session</>
        ) : (
          <><Play size={20} className="mr-2" /> Start Session</>
        )}
      </Button>
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
