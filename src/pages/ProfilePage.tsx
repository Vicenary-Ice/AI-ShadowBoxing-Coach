import PageShell from "@/components/PageShell";
import { Award, Flame, Calendar, Clock, FileText, Pencil, Camera } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Workouts", key: "total", icon: Flame },
  { label: "Avg. Whoop Strain", value: "14.2", icon: Award },
  { label: "Sessions This Week", value: "5", icon: Calendar },
];

const ProfilePage = () => {
  const { profile, setProfile, workouts } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatarUrl);

  const openEdit = () => {
    setDraft(profile);
    setPreviewUrl(profile.avatarUrl);
    setEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const saveProfile = () => {
    const initials = draft.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    setProfile({ ...draft, initials, avatarUrl: previewUrl });
    setEditing(false);
  };

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center gap-4 pt-6 pb-5">
        <div className="relative">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover glow-red" />
          ) : (
            <div className="w-20 h-20 rounded-full gradient-fire flex items-center justify-center text-primary-foreground font-display text-3xl glow-red">
              {profile.initials}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl text-foreground tracking-wider">{profile.name}</h1>
          <span className="inline-block mt-1 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest rounded-full bg-primary/20 text-primary border border-primary/30">
            {profile.level}
          </span>
        </div>
        <button onClick={openEdit} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition">
          <Pencil size={18} />
        </button>
      </div>

      {/* Bio */}
      <div className="glass-card p-4 mb-4 space-y-2">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Weight</span>
            <p className="font-semibold text-foreground">{profile.weight}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Gym</span>
            <p className="font-semibold text-foreground">{profile.gym}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <s.icon size={18} className="mx-auto mb-1.5 text-primary" />
            <p className="font-display text-2xl text-foreground">
              {s.key === "total" ? workouts.length : s.value}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <h2 className="font-display text-xl text-foreground mb-3 tracking-wider">Past Workouts</h2>
      <div className="space-y-3 pb-4">
        {workouts.map((w, i) => (
          <div key={w.id} className="glass-card p-4 slide-up" style={{ animationDelay: `${i * 60}ms` }}>
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

      {/* Edit Profile Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-wider">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Avatar */}
            <div className="flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative group"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full gradient-fire flex items-center justify-center text-primary-foreground font-display text-3xl">
                    {draft.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Camera size={24} className="text-foreground" />
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Weight Class</label>
              <select
                value={draft.weight}
                onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {["Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight"].map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Gym</label>
              <input
                value={draft.gym}
                onChange={(e) => setDraft({ ...draft, gym: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">About Me</label>
              <textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                rows={3}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
            <Button onClick={saveProfile} className="w-full gradient-fire text-primary-foreground border-none font-semibold py-5">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default ProfilePage;
