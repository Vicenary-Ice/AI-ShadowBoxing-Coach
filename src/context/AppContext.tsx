import React, { createContext, useContext, useState, useCallback } from "react";

export interface Workout {
  id: string;
  type: string;
  date: string;
  duration: string;
  notes: string;
}

export interface Profile {
  name: string;
  initials: string;
  level: string;
  weight: string;
  gym: string;
  bio: string;
  avatarUrl: string | null;
}

export interface ChatEntry {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isGroup?: boolean;
}

interface AppContextType {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  workouts: Workout[];
  addWorkout: (w: Omit<Workout, "id">) => void;
  chats: ChatEntry[];
  openChatWith: (name: string) => void;
  pendingChatOpen: string | null;
  clearPendingChat: () => void;
  friendRequests: Set<string>;
  toggleFriendRequest: (name: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

const defaultWorkouts: Workout[] = [
  { id: "w1", type: "Heavy Bag", date: "Today", duration: "45 min", notes: "Worked on body shots and uppercuts. Good power on the 3-2 combo." },
  { id: "w2", type: "Sparring", date: "Yesterday", duration: "30 min", notes: "Light rounds with Marcus. Focused on head movement and counter punching." },
  { id: "w3", type: "Shadow Boxing", date: "Feb 16", duration: "25 min", notes: "Morning drill. 6 rounds working footwork pivots and angle changes." },
  { id: "w4", type: "Pads", date: "Feb 15", duration: "40 min", notes: "Coach called combos. Improved slip-counter timing significantly." },
  { id: "w5", type: "Cardio", date: "Feb 14", duration: "50 min", notes: "Jump rope intervals + hill sprints. Heart rate peaked at 185 bpm." },
];

const defaultChats: ChatEntry[] = [
  { id: "1", name: "Jaylen Carter", lastMessage: "Down for sparring Thursday?", time: "2m", unread: 2 },
  { id: "2", name: "Sofia Morales", lastMessage: "Good rounds today 🥊", time: "1h", unread: 0 },
  { id: "3", name: "Iron Fist Gym Chat", lastMessage: "Coach: Gym closes early Friday", time: "3h", unread: 5, isGroup: true },
  { id: "4", name: "DeShawn Williams", lastMessage: "Thanks for the tips man", time: "1d", unread: 0 },
  { id: "5", name: "Sparring Partners", lastMessage: "Kai: Anyone free Saturday AM?", time: "2d", unread: 1, isGroup: true },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>({
    name: "Marcus Rivera",
    initials: "MR",
    level: "Amateur",
    weight: "Welterweight",
    gym: "Iron Fist Boxing",
    bio: "3 years into the game. Training for my first sanctioned bout this spring. Always looking for quality sparring partners.",
    avatarUrl: null,
  });

  const [workouts, setWorkouts] = useState<Workout[]>(defaultWorkouts);
  const [chats, setChats] = useState<ChatEntry[]>(defaultChats);
  const [pendingChatOpen, setPendingChatOpen] = useState<string | null>(null);
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());

  const addWorkout = useCallback((w: Omit<Workout, "id">) => {
    setWorkouts((prev) => [{ ...w, id: `w${Date.now()}` }, ...prev]);
  }, []);

  const openChatWith = useCallback((name: string) => {
    setChats((prev) => {
      const exists = prev.find((c) => c.name === name);
      if (exists) return prev;
      return [
        { id: `c${Date.now()}`, name, lastMessage: "Start a conversation…", time: "now", unread: 0 },
        ...prev,
      ];
    });
    setPendingChatOpen(name);
  }, []);

  const clearPendingChat = useCallback(() => setPendingChatOpen(null), []);

  const toggleFriendRequest = useCallback((name: string) => {
    setFriendRequests((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{ profile, setProfile, workouts, addWorkout, chats, openChatWith, pendingChatOpen, clearPendingChat, friendRequests, toggleFriendRequest }}>
      {children}
    </AppContext.Provider>
  );
};
