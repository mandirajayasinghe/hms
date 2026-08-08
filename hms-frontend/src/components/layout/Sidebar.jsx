import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  LayoutDashboard, Users, Stethoscope, CalendarClock, BedDouble,
  FlaskConical, Pill, Receipt, UserCog, BarChart3, Building2, ShieldCheck,
} from "lucide-react";

const items = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, roles: null, end: true },
  { to: "/app/patients", label: "Patients", icon: Users, roles: ["admin","doctor","nurse","receptionist"] },
  { to: "/app/doctors", label: "Doctors", icon: Stethoscope, roles: null },
  { to: "/app/departments", label: "Departments", icon: Building2, roles: ["admin"] },
  { to: "/app/appointments", label: "Appointments", icon: CalendarClock, roles: ["admin","doctor","nurse","receptionist"] },
  { to: "/app/admissions", label: "Admissions", icon: BedDouble, roles: ["admin","doctor","nurse","receptionist"] },
  { to: "/app/laboratory", label: "Laboratory", icon: FlaskConical, roles: ["admin","doctor","lab_staff","nurse"] },
  { to: "/app/pharmacy", label: "Pharmacy", icon: Pill, roles: ["admin","pharmacist","doctor"] },
  { to: "/app/billing", label: "Billing", icon: Receipt, roles: ["admin","accountant","receptionist"] },
  { to: "/app/staff", label: "Staff", icon: UserCog, roles: ["admin"] },
  { to: "/app/reports", label: "Reports", icon: BarChart3, roles: ["admin","accountant"] },
  { to: "/app/users", label: "Users", icon: ShieldCheck, roles: ["admin"] },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-primary-dark text-white/90 min-h-screen sticky top-0">
      <div className="px-6 py-6 flex items-center gap-2.5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-display text-lg">+</div>
        <div>
          <div className="font-display text-base leading-tight">Meridian</div>
          <div className="text-[10px] uppercase tracking-widest text-white/50">Hospital System</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items
          .filter((i) => !i.roles || i.roles.includes(user?.role))
          .map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-white/15 text-white font-medium" : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
      </nav>
      <div className="px-6 py-4 text-[11px] text-white/30 border-t border-white/10">Meridian HMS v1.0</div>
    </aside>
  );
}