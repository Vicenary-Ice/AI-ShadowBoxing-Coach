import { User, Search, MessageCircle, Dumbbell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", icon: User, label: "Profile" },
  { path: "/discover", icon: Search, label: "Discover" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/training", icon: Dumbbell, label: "Training" },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-all duration-200 ${
                active ? "tab-active" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold tracking-wide uppercase">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
