import { useQuery } from "@tanstack/react-query";
import { listDoctors } from "../../api/doctors";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";

export default function DoctorList() {
  const { data = [], isLoading } = useQuery({ queryKey: ["doctors"], queryFn: () => listDoctors() });

  return (
    <div>
      <PageHeader eyebrow="Directory" title="Doctors" />
      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {data.map((d) => (
            <Card key={d.id} className="p-5">
              <div className="w-10 h-10 rounded-full bg-primary-soft text-primary-dark flex items-center justify-center font-display mb-3">
                {d.full_name?.[0]}
              </div>
              <h3 className="font-medium">{d.full_name}</h3>
              <p className="text-sm text-ink/50">{d.specialization || "General"}</p>
              <p className="text-xs text-ink/40 mt-1">{d.department || "Unassigned department"}</p>
              <p className="text-xs font-mono text-primary mt-2">Fee: Rs {Number(d.consultation_fee).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}