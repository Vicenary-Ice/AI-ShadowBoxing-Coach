import PageShell from "@/components/PageShell";
import SegmentedControl from "@/components/SegmentedControl";
import { Search, MapPin, Star, ExternalLink, Trophy, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const boxers = [
  { name: "Jaylen Carter", distance: "0.8 mi", level: "Intermediate", weight: "Middleweight", gym: "Southpaw Athletics", bio: "2 years experience. Looking for technical sparring." },
  { name: "Sofia Morales", distance: "1.2 mi", level: "Advanced", weight: "Featherweight", gym: "Iron Fist Boxing", bio: "Amateur record 5-1. Preparing for Golden Gloves." },
  { name: "DeShawn Williams", distance: "2.4 mi", level: "Beginner", weight: "Heavyweight", gym: "Downtown Boxing Club", bio: "Just started 6 months ago. Eager to learn." },
  { name: "Kai Nakamura", distance: "3.1 mi", level: "Advanced", weight: "Lightweight", gym: "Pacific Rim Boxing", bio: "Former kickboxer transitioning to pure boxing." },
  { name: "Amir Hassan", distance: "4.0 mi", level: "Intermediate", weight: "Welterweight", gym: "Champion's Gym", bio: "Focused on defensive boxing. Great counter-puncher." },
];

const events = [
  { title: "Friday Night Smoker", venue: "Iron Fist Boxing", date: "Feb 28", featured: true, tag: "Sponsored" },
  { title: "Golden Gloves Regional", venue: "Downtown Arena", date: "Mar 15", featured: true, tag: "Tournament" },
  { title: "Boxing Footwork Seminar", venue: "Pacific Rim Boxing", date: "Mar 5", featured: false },
  { title: "Open Sparring Night", venue: "Champion's Gym", date: "Every Thursday", featured: false },
  { title: "Youth Boxing Clinic", venue: "Community Center", date: "Mar 8", featured: false },
];

const levelColor = (level: string) => {
  if (level === "Advanced") return "text-primary";
  if (level === "Intermediate") return "text-accent";
  return "text-muted-foreground";
};

const DiscoveryPage = () => {
  const [search, setSearch] = useState("");
  const [selectedBoxer, setSelectedBoxer] = useState<typeof boxers[0] | null>(null);

  const filtered = boxers.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageShell title="The Squared Circle">
      <div className="pt-4">
        <SegmentedControl tabs={["Find Boxers", "Gym Bulletin"]}>
          {/* Tab A: Find Boxers */}
          <div>
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

          {/* Tab B: Gym Bulletin */}
          <div>
            {/* Featured */}
            <div className="space-y-3 mb-5">
              {events.filter(e => e.featured).map((e) => (
                <div key={e.title} className="glass-card p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground rounded-bl-lg">
                    {e.tag}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={18} className="text-accent" />
                    <h3 className="font-display text-xl text-foreground tracking-wider">{e.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><MapPin size={11} />{e.venue}</span>
                    <span className="flex items-center gap-1"><CalendarIcon size={11} />{e.date}</span>
                  </div>
                  <Button size="sm" className="gradient-fire text-primary-foreground border-none text-xs font-semibold">
                    Learn More <ExternalLink size={12} className="ml-1" />
                  </Button>
                </div>
              ))}
            </div>
            {/* Local Events */}
            <h3 className="font-display text-lg text-foreground mb-3 tracking-wider">Local Events</h3>
            <div className="space-y-2">
              {events.filter(e => !e.featured).map((e) => (
                <div key={e.title} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{e.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{e.venue}</span>
                      <span>·</span>
                      <span>{e.date}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs border-border text-foreground">
                    Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </SegmentedControl>
      </div>

      {/* Boxer Profile Modal */}
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
                <Button className="w-full gradient-fire text-primary-foreground border-none font-semibold mt-2">
                  Request to Train
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default DiscoveryPage;
