import { useQuery } from "@tanstack/react-query";
import { Users, CalendarClock, Wallet, FlaskConical, Pill } from "lucide-react";
import { getDashboard } from "../api/reports";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Today at Meridian" />
      <Card className="p-0 overflow-hidden mb-6">
        <div className="flex flex-wrap divide-black/10 px-5">
          {isLoading ? (
            <div className="py-8 text-ink/40 text-sm">Loading vitals…</div>
          ) : (
            <>
              <StatCard label="Total Patients" value={data.totalPatients} icon={Users} />
              <StatCard label="Today's Appointments" value={data.todaysAppointments} icon={CalendarClock} />
              <StatCard label="Revenue Today" value={`Rs ${data.revenueToday.toLocaleString()}`} icon={Wallet} />
              <StatCard label="Pending Lab Requests" value={data.pendingLabRequests} icon={FlaskConical} />
              <StatCard label="Pharmacy Alerts" value={data.pharmacyAlerts} icon={Pill} sublabel="Low stock / expiring" />
            </>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 animate-fadeUp">
          <h3 className="font-display text-lg text-primary-dark mb-3">Quick actions</h3>
          <p className="text-sm text-ink/50 mb-4">Jump into the workflows your role uses most.</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <a href="/app/patients" className="rounded-lg border border-black/10 px-4 py-3 hover:bg-primary-soft/40 transition-colors">Register a patient</a>
            <a href="/app/appointments" className="rounded-lg border border-black/10 px-4 py-3 hover:bg-primary-soft/40 transition-colors">Book appointment</a>
            <a href="/app/laboratory" className="rounded-lg border border-black/10 px-4 py-3 hover:bg-primary-soft/40 transition-colors">Log lab result</a>
            <a href="/app/billing" className="rounded-lg border border-black/10 px-4 py-3 hover:bg-primary-soft/40 transition-colors">Create invoice</a>
          </div>
        </Card>
        <Card className="p-6 animate-fadeUp">
          <h3 className="font-display text-lg text-primary-dark mb-3">System status</h3>
          <ul className="text-sm text-ink/60 space-y-2">
            <li className="flex justify-between"><span>API</span><span className="text-primary font-medium">Connected</span></li>
            <li className="flex justify-between"><span>Database</span><span className="text-primary font-medium">PostgreSQL — Healthy</span></li>
            <li className="flex justify-between"><span>Uploads</span><span className="text-primary font-medium">Local storage</span></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}