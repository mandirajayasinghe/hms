import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updatePatient } from "../../api/patients";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";

export default function EditPatientModal({ open, onClose, patient }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", dateOfBirth: "", gender: "male",
    address: "", bloodGroup: "", emergencyContact: "",
  });

  useEffect(() => {
    if (patient) {
      setForm({
        fullName: patient.full_name || "",
        phone: patient.phone || "",
        email: patient.email || "",
        dateOfBirth: patient.date_of_birth ? patient.date_of_birth.slice(0, 10) : "",
        gender: patient.gender || "male",
        address: patient.address || "",
        bloodGroup: patient.blood_group || "",
        emergencyContact: patient.emergency_contact || "",
      });
    }
  }, [patient]);

  const update = useMutation({
    mutationFn: () => updatePatient(patient.id, form),
    onSuccess: () => {
      toast.success("Patient updated");
      qc.invalidateQueries({ queryKey: ["patient", patient.id] });
      qc.invalidateQueries({ queryKey: ["patients"] });
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not update patient"),
  });

  return (
    <Modal open={open} onClose={onClose} title="Edit Patient">
      <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-4">
        <Input label="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
            options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Blood group" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
          <Input label="Emergency contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
        </div>
        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <Button type="submit" className="w-full" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </Modal>
  );
}