import PageShell from "@/components/PageShell";
import { Search, MapPin, Star, MessageCircle, UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

const boxers = [
  { name: "Jaylen Carter", distance: "0.8 mi", level: "Intermediate", weight: "Middleweight", gym: "Southpaw Athletics", bio: "2 years experience. Looking for technical sparring." },
  { name: "Sofia Morales", distance: "1.2 mi", level: "Advanced", weight: "Featherweight", gym: "Iron Fist Boxing", bio: "Amateur record 5-1. Preparing for Golden Gloves." },
  { name: "DeShawn Williams", distance: "2.4 mi", level: "Beginner", weight: "Heavyweight", gym: "Downtown Boxing Club", bio: "Just started 6 months ago. Eager to learn." },
  { name: "Kai Nakamura", distance: "3.1 mi", level: "Advanced", weight: "Lightweight", gym: "Pacific Rim Boxing", bio: "Former kickboxer transitioning to pure boxing." },
  { name: "Amir Hassan", distance: "4.0 mi", level: "Intermediate", weight: "Welterweight", gym: "Champion's Gym", bio: "Focused on defensive boxing. Great counter-puncher." },
];

const levelColor = (level: string) => {
  if (level === "Advanced") return "text-primary";
  if (level === "Intermediate") return "text-accent";
  return "text-muted-foreground";
};

const DiscoveryPage = () => {
  const [search, setSearch] = useState("");
  const [selectedBoxer, setSelectedBoxer] = useState<typeof boxers[0] | null>(null);
  const { openChatWith, friendRequests, toggleFriendRequest } = useApp();
  const navigate = useNavigate();

  const filtered = boxers.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMessage = (name: string) => {
    openChatWith(name);
    setSelectedBoxer(null);
    navigate("/messages");
  };

  return (
    <PageShell title="The Squared Circle">
      <div className="pt-4">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search fighters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
        <div className="space-y-2">
          {filtered.map((b) => (
            <button
              key={b.name}
              onClick={() => setSelectedBoxer(b)}
              className="w-full glass-card p-4 flex items-center gap-3 text-left hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-display text-lg text-foreground">
                {b.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{b.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><MapPin size={10} />{b.distance}</span>
                  <span className={`flex items-center gap-1 ${levelColor(b.level)}`}>
                    <Star size={10} />{b.level}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedBoxer} onOpenChange={() => setSelectedBoxer(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          {selectedBoxer && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl tracking-wider">{selectedBoxer.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Weight</span>
                    <p className="font-semibold">{selectedBoxer.weight}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Level</span>
                    <p className={`font-semibold ${levelColor(selectedBoxer.level)}`}>{selectedBoxer.level}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Gym</span>
                    <p className="font-semibold">{selectedBoxer.gym}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selectedBoxer.bio}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} /> {selectedBoxer.distance} away
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => toggleFriendRequest(selectedBoxer.name)}
                    variant={friendRequests.has(selectedBoxer.name) ? "secondary" : "outline"}
                    className={`flex-1 font-semibold ${friendRequests.has(selectedBoxer.name) ? "text-primary border-primary/30" : "border-border text-foreground"}`}
                  >
                    {friendRequests.has(selectedBoxer.name) ? (
                      <><UserCheck size={16} className="mr-2" /> Requested</>
                    ) : (
                      <><UserPlus size={16} className="mr-2" /> Add Friend</>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleMessage(selectedBoxer.name)}
                    className="flex-1 gradient-fire text-primary-foreground border-none font-semibold"
                  >
                    <MessageCircle size={16} className="mr-2" /> Message
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default DiscoveryPage;
