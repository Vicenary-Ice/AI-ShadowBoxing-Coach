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

export interface FriendUser {
  id: string;
  name: string;
  nametag: string;
  level: string;
  weight: string;
  gym: string;
  bio: string;
  workouts: Workout[];
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
  friends: FriendUser[];
  addFriendByNametag: (nametag: string) => boolean;
  removeFriend: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

// Pool of searchable users — found by nametag
export const allUsers: FriendUser[] = [
  {
    id: "u1", name: "Jaylen Carter", nametag: "@jaylen_c",
    level: "Intermediate", weight: "Middleweight", gym: "Southpaw Athletics",
    bio: "2 years experience. Looking for technical sparring.",
    workouts: [
      { id: "uw1", type: "Sparring", date: "Today", duration: "30 min", notes: "Good rounds. Worked on the jab-cross-hook combo." },
      { id: "uw2", type: "Heavy Bag", date: "Yesterday", duration: "45 min", notes: "Power shots. Focused on body work." },
      { id: "uw3", type: "Shadow Boxing", date: "Mar 22", duration: "20 min", notes: "Morning session. Footwork and angles." },
    ],
  },
  {
    id: "u2", name: "Sofia Morales", nametag: "@sofia_m",
    level: "Advanced", weight: "Featherweight", gym: "Iron Fist Boxing",
    bio: "Amateur record 5-1. Preparing for Golden Gloves.",
    workouts: [
      { id: "uw4", type: "Pads", date: "Today", duration: "40 min", notes: "Sharp combos. Coach called the 1-2-3-slip-2 all session." },
      { id: "uw5", type: "Sparring", date: "Mar 23", duration: "25 min", notes: "Defense-focused. Worked head movement against pressure fighters." },
      { id: "uw6", type: "Cardio", date: "Mar 21", duration: "50 min", notes: "5-mile run + jump rope intervals." },
    ],
  },
  {
    id: "u3", name: "DeShawn Williams", nametag: "@deshawn_w",
    level: "Beginner", weight: "Heavyweight", gym: "Downtown Boxing Club",
    bio: "Just started 6 months ago. Eager to learn.",
    workouts: [
      { id: "uw7", type: "Heavy Bag", date: "Mar 24", duration: "30 min", notes: "Working on stance and basic combinations." },
      { id: "uw8", type: "Cardio", date: "Mar 22", duration: "35 min", notes: "Jump rope and footwork drills." },
    ],
  },
  {
    id: "u4", name: "Kai Nakamura", nametag: "@kai_n",
    level: "Advanced", weight: "Lightweight", gym: "Pacific Rim Boxing",
    bio: "Former kickboxer transitioning to pure boxing.",
    workouts: [
      { id: "uw9", type: "Shadow Boxing", date: "Today", duration: "30 min", notes: "Slipping and rolling. Working the peek-a-boo style." },
      { id: "uw10", type: "Sparring", date: "Mar 23", duration: "45 min", notes: "Six rounds with mixed partners. Good counter-punching session." },
      { id: "uw11", type: "Pads", date: "Mar 21", duration: "40 min", notes: "Speed work. Coach had me throwing in tight windows." },
    ],
  },
  {
    id: "u5", name: "Amir Hassan", nametag: "@amir_h",
    level: "Intermediate", weight: "Welterweight", gym: "Champion's Gym",
    bio: "Focused on defensive boxing. Great counter-puncher.",
    workouts: [
      { id: "uw12", type: "Pads", date: "Mar 24", duration: "35 min", notes: "Counter-punching drills. 3-2 off the slip." },
      { id: "uw13", type: "Heavy Bag", date: "Mar 22", duration: "40 min", notes: "Power combinations. Body-head sequences." },
      { id: "uw14", type: "Cardio", date: "Mar 20", duration: "45 min", notes: "Sprint intervals on the track." },
    ],
  },
];

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
  const [friends, setFriends] = useState<FriendUser[]>([]);

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

  const addFriendByNametag = useCallback((nametag: string): boolean => {
    const tag = nametag.startsWith("@") ? nametag.toLowerCase() : `@${nametag.toLowerCase()}`;
    const found = allUsers.find((u) => u.nametag.toLowerCase() === tag);
    if (!found) return false;
    setFriends((prev) => {
      if (prev.find((f) => f.id === found.id)) return prev;
      return [...prev, found];
    });
    return true;
  }, []);

  const removeFriend = useCallback((id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{ profile, setProfile, workouts, addWorkout, chats, openChatWith, pendingChatOpen, clearPendingChat, friends, addFriendByNametag, removeFriend }}>
      {children}
    </AppContext.Provider>
  );
};
