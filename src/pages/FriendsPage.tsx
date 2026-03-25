import PageShell from "@/components/PageShell";
import { UserPlus, UserMinus, ChevronRight, ArrowLeft, Dumbbell, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useApp, FriendUser } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const workoutTypeColor = (type: string) => {
  switch (type) {
    case "Sparring": return "text-primary";
    case "Heavy Bag": return "text-orange-400";
    case "Pads": return "text-accent";
    case "Shadow Boxing": return "text-blue-400";
    default: return "text-muted-foreground";
  }
};

const FriendProfile = ({ friend, onBack }: { friend: FriendUser; onBack: () => void }) => {
  const { removeFriend, openChatWith } = useApp();
  const navigate = useNavigate();

  const handleMessage = () => {
    openChatWith(friend.name);
    navigate("/messages");
  };

  const handleRemove = () => {
    removeFriend(friend.id);
    onBack();
  };

  return (
    <div className="page-enter min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-semibold text-sm text-foreground">{friend.name}</h2>
      </header>

      <div className="px-4 pt-6 space-y-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center font-display text-2xl text-foreground">
            {friend.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-display text-xl text-foreground">{friend.name}</p>
            <p className="text-sm text-muted-foreground">{friend.nametag}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Level", value: friend.level },
            { label: "Weight", value: friend.weight },
            { label: "Gym", value: friend.gym },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
              <p className="text-xs font-semibold text-foreground leading-snug">{value}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        {friend.bio && (
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground">{friend.bio}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleMessage} className="flex-1 gradient-fire text-primary-foreground border-none font-semibold">
            <MessageCircle size={16} className="mr-2" /> Message
          </Button>
          <Button onClick={handleRemove} variant="outline" className="flex-1 border-border text-muted-foreground hover:text-primary hover:border-primary/50 font-semibold">
            <UserMinus size={16} className="mr-2" /> Remove
          </Button>
        </div>

        {/* Workouts */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell size={14} className="text-muted-foreground" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Recent Workouts</p>
          </div>
          {friend.workouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No workouts yet.</p>
          ) : (
            <div className="space-y-2">
              {friend.workouts.map((w) => (
                <div key={w.id} className="glass-card p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${workoutTypeColor(w.type)}`}>{w.type}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{w.duration}</span>
                      <span>·</span>
                      <span>{w.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{w.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FriendsPage = () => {
  const { friends, addFriendByNametag } = useApp();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "duplicate">("idle");
  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(null);

  if (selectedFriend) {
    return <FriendProfile friend={selectedFriend} onBack={() => setSelectedFriend(null)} />;
  }

  const handleAdd = () => {
    const tag = input.trim();
    if (!tag) return;
    const alreadyFriend = friends.find(
      (f) => f.nametag.toLowerCase() === (tag.startsWith("@") ? tag.toLowerCase() : `@${tag.toLowerCase()}`)
    );
    if (alreadyFriend) {
      setStatus("duplicate");
      return;
    }
    const success = addFriendByNametag(tag);
    setStatus(success ? "success" : "error");
    if (success) setInput("");
  };

  return (
    <PageShell title="Squad">
      <div className="pt-4 space-y-5">
        {/* Add by nametag */}
        <div className="glass-card p-4 space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Add by Nametag</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">@</span>
              <input
                type="text"
                value={input.startsWith("@") ? input.slice(1) : input}
                onChange={(e) => { setInput(e.target.value); setStatus("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="nametag"
                className="w-full bg-secondary border border-border rounded-lg pl-7 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
            </div>
            <Button onClick={handleAdd} className="gradient-fire text-primary-foreground border-none font-semibold px-5">
              <UserPlus size={16} />
            </Button>
          </div>
          {status === "success" && <p className="text-xs text-green-400">Friend added!</p>}
          {status === "error" && <p className="text-xs text-primary">No user found with that nametag.</p>}
          {status === "duplicate" && <p className="text-xs text-accent">Already in your squad.</p>}
          <p className="text-[10px] text-muted-foreground">
            Try: @jaylen_c · @sofia_m · @deshawn_w · @kai_n · @amir_h
          </p>
        </div>

        {/* Friends list */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Your Squad {friends.length > 0 && `· ${friends.length}`}
          </p>
          {friends.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <UserPlus size={28} className="mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No friends added yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Search by nametag to add someone.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFriend(f)}
                  className="w-full glass-card p-4 flex items-center gap-3 text-left hover:border-primary/30 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center font-display text-lg text-foreground shrink-0">
                    {f.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.nametag} · {f.gym}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/50 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default FriendsPage;
