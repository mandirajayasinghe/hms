import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { createMedicalRecord, addPrescription } from "../../api/medicalRecords";
import { listDoctors } from "../../api/doctors";
import { listMedicines } from "../../api/pharmacy";
import { useAuth } from "../../auth/AuthContext";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";

const emptyRxItem = () => ({ medicineId: "", dosage: "", frequency: "", duration: "", instructions: "" });

export default function AddMedicalRecordModal({ open, onClose, patientId }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [doctorId, setDoctorId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [includeRx, setIncludeRx] = useState(false);
  const [rxItems, setRxItems] = useState([emptyRxItem()]);

  const { data: doctors = [] } = useQuery({ queryKey: ["doctors"], queryFn: () => listDoctors(), enabled: open });
  const { data: medicines = [] } = useQuery({ queryKey: ["medicines"], queryFn: () => listMedicines(), enabled: open && includeRx });

  const reset = () => {
    setDoctorId(""); setDiagnosis(""); setTreatment(""); setNotes("");
    setIncludeRx(false); setRxItems([emptyRxItem()]);
  };

  const closeModal = () => { reset(); onClose(); };

  const createRecord = useMutation({
    mutationFn: async () => {
      const record = await createMedicalRecord({ patientId, doctorId, diagnosis, treatment, notes });
      if (includeRx) {
        const cleanItems = rxItems.filter((it) => it.medicineId);
        if (cleanItems.length > 0) {
          await addPrescription(record.id, { patientId, doctorId, items: cleanItems });
        }
      }
      return record;
    },
    onSuccess: () => {
      toast.success("Medical record added");
      qc.invalidateQueries({ queryKey: ["patient-history", patientId] });
      qc.invalidateQueries({ queryKey: ["patient-rx", patientId] });
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not save record"),
  });

  const updateRxItem = (i, field, value) => {
    setRxItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  };
  const addRxItem = () => setRxItems((prev) => [...prev, emptyRxItem()]);
  const removeRxItem = (i) => setRxItems((prev) => prev.filter((_, idx) => idx !== i));

  const submit = (e) => {
    e.preventDefault();
    if (!doctorId) { toast.error("Select a doctor"); return; }
    createRecord.mutate();
  };

  return (
    <Modal open={open} onClose={closeModal} title="Add Medical Record">
      <form onSubmit={submit} className="space-y-4">
        <Select
          label="Doctor" required value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
          options={[{ value: "", label: "Select doctor" }, ...doctors.map((d) => ({ value: d.id, label: `Dr. ${d.full_name}` }))]}
        />
        <Input label="Diagnosis" required value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
        <label className="block">
          <span className="block text-xs font-medium text-ink/60 mb-1.5">Treatment</span>
          <textarea
            rows={2} value={treatment} onChange={(e) => setTreatment(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-canvas/50 px-3.5 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-ink/60 mb-1.5">Notes</span>
          <textarea
            rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-canvas/50 px-3.5 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeRx} onChange={(e) => setIncludeRx(e.target.checked)} />
          Add a prescription with this visit
        </label>

        {includeRx && (
          <div className="space-y-3 border-t border-black/5 pt-4">
            <span className="block text-xs font-medium text-ink/60">Prescription items</span>
            {rxItems.map((item, i) => (
              <div key={i} className="border border-black/10 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <Select
                    className="flex-1"
                    value={item.medicineId}
                    onChange={(e) => updateRxItem(i, "medicineId", e.target.value)}
                    options={[{ value: "", label: "Select medicine" }, ...medicines.map((m) => ({ value: m.id, label: m.name }))]}
                  />
                  {rxItems.length > 1 && (
                    <button type="button" onClick={() => removeRxItem(i)} className="text-ink/30 hover:text-accent mt-2.5">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Dosage" value={item.dosage} onChange={(e) => updateRxItem(i, "dosage", e.target.value)} />
                  <Input placeholder="Frequency" value={item.frequency} onChange={(e) => updateRxItem(i, "frequency", e.target.value)} />
                  <Input placeholder="Duration" value={item.duration} onChange={(e) => updateRxItem(i, "duration", e.target.value)} />
                </div>
                <Input placeholder="Instructions" value={item.instructions} onChange={(e) => updateRxItem(i, "instructions", e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={addRxItem} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Plus size={13} /> Add another medicine
            </button>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={createRecord.isPending}>
          {createRecord.isPending ? "Saving…" : "Save Record"}
        </Button>
      </form>
    </Modal>
  );
}