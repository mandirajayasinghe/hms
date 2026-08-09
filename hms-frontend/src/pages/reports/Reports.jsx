import { useQuery } from "@tanstack/react-query";
import { getRevenueReport, getPharmacyReport, getLaboratoryReport, getStaffReport, getAppointmentReport } from "../../api/reports";
import client from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

const getPatientReport = () => client.get("/reports/patients").then((r) => r.data.data);

export default function Reports() {
  const { data: revenue } = useQuery({ queryKey: ["report-revenue"], queryFn: () => getRevenueReport() });
  const { data: pharmacy = [] } = useQuery({ queryKey: ["report-pharmacy"], queryFn: getPharmacyReport });
  const { data: lab = [] } = useQuery({ queryKey: ["report-lab"], queryFn: getLaboratoryReport });
  const { data: staff = [] } = useQuery({ queryKey: ["report-staff"], queryFn: getStaffReport });
  const { data: appointments = [] } = useQuery({ queryKey: ["report-appointments"], queryFn: getAppointmentReport });
  const { data: patients } = useQuery({ queryKey: ["report-patients"], queryFn: getPatientReport });

  return (
    <div>
      <PageHeader eyebrow="Analytics" title="Reports" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display text-lg text-primary-dark mb-4">Patients Overview</h3>
          {patients ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-ink/60">Total patients</span>
                <span className="font-mono">{patients.total_patients}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-ink/60">New in last 30 days</span>
                <span className="font-mono">{patients.new_last_30_days}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink/40">Loading…</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg text-primary-dark mb-4">Appointments by Status</h3>
          {appointments.length === 0 ? <p className="text-sm text-ink/40">No appointments yet.</p> : appointments.map((r) => (
            <div key={r.status} className="flex justify-between text-sm py-1.5 border-b border-black/5 last:border-0">
              <span className="capitalize text-ink/60">{r.status.replace("_", " ")}</span>
              <span className="font-mono">{r.count}</span>
            </div>
          ))}
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg text-primary-dark mb-4">Revenue by Category</h3>
          {revenue?.byCategory?.map((r) => (
            <div key={r.category} className="flex justify-between text-sm py-1.5 border-b border-black/5 last:border-0">
              <span className="capitalize text-ink/60">{r.category}</span>
              <span className="font-mono">Rs {Number(r.total).toLocaleString()}</span>
            </div>
          ))}
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-lg text-primary-dark mb-4">Laboratory Status</h3>
          {lab.map((r) => (
            <div key={r.status} className="flex justify-between text-sm py-1.5 border-b border-black/5 last:border-0">
              <span className="capitalize text-ink/60">{r.status.replace("_", " ")}</span>
              <span className="font-mono">{r.count}</span>
            </div>
          ))}
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-lg text-primary-dark mb-4">Pharmacy Alerts</h3>
          {pharmacy.length === 0 ? <p className="text-sm text-ink/40">All stock healthy.</p> : pharmacy.map((m) => (
            <div key={m.name} className="flex justify-between text-sm py-1.5 border-b border-black/5 last:border-0">
              <span>{m.name}</span>
              <span className="font-mono text-accent">{m.stock_quantity} left</span>
            </div>
          ))}
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-lg text-primary-dark mb-4">Staff by Department</h3>
          {staff.map((s) => (
            <div key={s.department || "unassigned"} className="flex justify-between text-sm py-1.5 border-b border-black/5 last:border-0">
              <span>{s.department || "Unassigned"}</span>
              <span className="font-mono">{s.employee_count}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}