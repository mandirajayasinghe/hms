import { useState } from "react";
import { LogOut, KeyRound } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import ChangePasswordModal from "../ChangePasswordModal";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [pwOpen, setPwOpen] = useState(false);

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
        <button onClick={() => setPwOpen(true)} className="text-ink/40 hover:text-primary transition-colors" title="Change password">
          <KeyRound size={18} />
        </button>
        <button onClick={logout} className="text-ink/40 hover:text-accent transition-colors" title="Log out">
          <LogOut size={18} />
        </button>
      </div>
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </header>
  );
}