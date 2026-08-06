import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listAdmissions, dischargePatient } from "../../api/admissions";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

export default function AdmissionList() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admissions"], queryFn: () => listAdmissions() });

  const discharge = useMutation({
    mutationFn: dischargePatient,
    onSuccess: () => { toast.success("Patient discharged"); qc.invalidateQueries({ queryKey: ["admissions"] }); },
  });

  return (
    <div>
      <PageHeader eyebrow="Inpatient / Outpatient" title="Admissions" />
      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <Table
          columns={[
            { key: "patient_name", header: "Patient" },
            { key: "admission_type", header: "Type", render: (r) => <Badge>{r.admission_type}</Badge> },
            { key: "ward_name", header: "Ward / Bed", render: (r) => r.ward_name ? `${r.ward_name} · ${r.bed_number}` : "—" },
            { key: "admitted_at", header: "Admitted", render: (r) => new Date(r.admitted_at).toLocaleDateString() },
            { key: "status", header: "Status", render: (r) => <Badge tone={r.status === "admitted" ? "success" : "neutral"}>{r.status}</Badge> },
            { key: "actions", header: "", render: (r) => r.status === "admitted" && (
                <Button variant="outline" className="!py-1.5 !px-3 text-xs" onClick={() => discharge.mutate(r.id)}>Discharge</Button>
              ),
            },
          ]}
          rows={data}
        />
      )}
    </div>
  );
}