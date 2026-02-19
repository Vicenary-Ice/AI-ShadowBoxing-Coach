import PageShell from "@/components/PageShell";
import { Award, Flame, Calendar, Clock, FileText } from "lucide-react";

const stats = [
  { label: "Total Workouts", value: "247", icon: Flame },
  { label: "Avg. Whoop Strain", value: "14.2", icon: Award },
  { label: "Sessions This Week", value: "5", icon: Calendar },
];

const workouts = [
  { type: "Heavy Bag", date: "Today", duration: "45 min", notes: "Worked on body shots and uppercuts. Good power on the 3-2 combo." },
  { type: "Sparring", date: "Yesterday", duration: "30 min", notes: "Light rounds with Marcus. Focused on head movement and counter punching." },
  { type: "Shadow Boxing", date: "Feb 16", duration: "25 min", notes: "Morning drill. 6 rounds working footwork pivots and angle changes." },
  { type: "Pads", date: "Feb 15", duration: "40 min", notes: "Coach called combos. Improved slip-counter timing significantly." },
  { type: "Cardio", date: "Feb 14", duration: "50 min", notes: "Jump rope intervals + hill sprints. Heart rate peaked at 185 bpm." },
];

const ProfilePage = () => {
  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center gap-4 pt-6 pb-5">
        <div className="w-20 h-20 rounded-full gradient-fire flex items-center justify-center text-primary-foreground font-display text-3xl glow-red">
          MR
        </div>
        <div>
          <h1 className="font-display text-3xl text-foreground tracking-wider">Marcus Rivera</h1>
          <span className="inline-block mt-1 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest rounded-full bg-primary/20 text-primary border border-primary/30">
            Amateur
          </span>
        </div>
      </div>

      {/* Bio */}
      <div className="glass-card p-4 mb-4 space-y-2">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Weight</span>
            <p className="font-semibold text-foreground">Welterweight</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Gym</span>
            <p className="font-semibold text-foreground">Iron Fist Boxing</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          3 years into the game. Training for my first sanctioned bout this spring. Always looking for quality sparring partners.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <s.icon size={18} className="mx-auto mb-1.5 text-primary" />
            <p className="font-display text-2xl text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <h2 className="font-display text-xl text-foreground mb-3 tracking-wider">Past Workouts</h2>
      <div className="space-y-3 pb-4">
        {workouts.map((w, i) => (
          <div key={i} className="glass-card p-4 slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Flame size={16} className="text-primary" />
                </div>
                <span className="font-semibold text-sm text-foreground">{w.type}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock size={12} />{w.duration}</span>
                <span>{w.date}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
              <FileText size={12} className="mt-0.5 shrink-0 text-muted-foreground/60" />
              {w.notes}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default ProfilePage;
