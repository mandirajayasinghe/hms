import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Pencil, FilePlus } from "lucide-react";
import { getPatient, getPatientHistory } from "../../api/patients";
import { getPatientPrescriptions } from "../../api/medicalRecords";
import { processPrescription } from "../../api/pharmacy";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import EditPatientModal from "./EditPatientModal";
import PatientDocuments from "./PatientDocuments";
import AddMedicalRecordModal from "./AddMedicalRecordModal";

export default function PatientDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const { data: patient, isLoading } = useQuery({ queryKey: ["patient", id], queryFn: () => getPatient(id) });
  const { data: history = [] } = useQuery({ queryKey: ["patient-history", id], queryFn: () => getPatientHistory(id), enabled: !!id });
  const { data: prescriptions = [] } = useQuery({ queryKey: ["patient-rx", id], queryFn: () => getPatientPrescriptions(id), enabled: !!id });

  const process = useMutation({
    mutationFn: processPrescription,
    onSuccess: () => {
      toast.success("Prescription dispensed");
      qc.invalidateQueries({ queryKey: ["patient-rx", id] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not process prescription"),
  });

  if (isLoading) return <div className="text-ink/40 text-sm py-10 text-center">Loading patient…</div>;

  return (
    <div>
      <PageHeader
        eyebrow={patient.patient_code}
        title={patient.full_name}
        action={
          <div className="flex gap-2">
            <Button onClick={() => setRecordOpen(true)}><FilePlus size={15} /> Add Record</Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil size={15} /> Edit Patient</Button>
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1 h-fit">
          <h3 className="font-display text-lg text-primary-dark mb-4">Profile</h3>
          <dl className="text-sm space-y-3">
            <Row label="Gender" value={patient.gender} />
            <Row label="Date of Birth" value={patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "—"} />
            <Row label="Phone" value={patient.phone || "—"} />
            <Row label="Email" value={patient.email || "—"} />
            <Row label="Blood Group" value={patient.blood_group || "—"} />
            <Row label="Emergency Contact" value={patient.emergency_contact || "—"} />
            <Row label="Address" value={patient.address || "—"} />
          </dl>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-display text-lg text-primary-dark mb-4">Medical History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-ink/40">No records yet.</p>
            ) : (
              <ul className="divide-y divide-black/5">
                {history.map((h) => (
                  <li key={h.id} className="py-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{h.diagnosis || "Consultation"}</span>
                      <span className="text-ink/40 font-mono text-xs">{new Date(h.record_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-ink/55">{h.treatment}</p>
                    <p className="text-xs text-ink/40 mt-1">Dr. {h.doctor_name}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-display text-lg text-primary-dark mb-4">Prescriptions</h3>
            {prescriptions.length === 0 ? (
              <p className="text-sm text-ink/40">No prescriptions yet.</p>
            ) : (
              <ul className="space-y-3">
                {prescriptions.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm border-b border-black/5 pb-3 last:border-0">
                    <span>{new Date(p.created_at).toLocaleDateString()} — {p.items?.length || 0} item(s)</span>
                    <div className="flex items-center gap-3">
                      <Badge tone={p.status === "dispensed" ? "success" : "warning"}>{p.status}</Badge>
                      {p.status !== "dispensed" && (
                        <button
                          onClick={() => process.mutate(p.id)}
                          disabled={process.isPending}
                          className="text-xs text-primary hover:underline"
                        >
                          {process.isPending ? "Processing…" : "Dispense"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <PatientDocuments patientId={id} />
        </div>
      </div>

      <EditPatientModal open={editOpen} onClose={() => setEditOpen(false)} patient={patient} />
      <AddMedicalRecordModal open={recordOpen} onClose={() => setRecordOpen(false)} patientId={id} />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink/40">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}