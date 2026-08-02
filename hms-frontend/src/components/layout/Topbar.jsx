import { LogOut } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-black/5 bg-surface/80 backdrop-blur sticky top-0 z-10">
      <div className="text-sm text-ink/40">
        {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium leading-tight">{user?.fullName}</div>
          <div className="text-xs text-ink/40 capitalize leading-tight">{user?.role?.replace("_", " ")}</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center font-display font-medium">
          {user?.fullName?.[0] || "U"}
        </div>
        <button onClick={logout} className="text-ink/40 hover:text-accent transition-colors" title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}