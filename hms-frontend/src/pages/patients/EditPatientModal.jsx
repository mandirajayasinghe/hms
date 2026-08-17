import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updatePatient } from "../../api/patients";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { required, minLength, email, phone, pastOrTodayDate, validateForm, hasErrors } from "../../utils/validators";

const rules = {
  fullName: [required("Full name"), minLength("Full name", 2)],
  phone: [phone],
  email: [email],
  dateOfBirth: [pastOrTodayDate("Date of birth")],
};

export default function EditPatientModal({ open, onClose, patient }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", dateOfBirth: "", gender: "male",
    address: "", bloodGroup: "", emergencyContact: "",
  });
  const [errors, setErrors] = useState({});

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
      setErrors({});
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

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const submit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form, rules);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    update.mutate();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Patient">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Full name" value={form.fullName} onChange={handleChange("fullName")} error={errors.fullName} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" value={form.phone} onChange={handleChange("phone")} error={errors.phone} />
          <Input label="Email" type="email" value={form.email} onChange={handleChange("email")} error={errors.email} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={handleChange("dateOfBirth")} error={errors.dateOfBirth} />
          <Select label="Gender" value={form.gender} onChange={handleChange("gender")}
            options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Blood group" value={form.bloodGroup} onChange={handleChange("bloodGroup")} />
          <Input label="Emergency contact" value={form.emergencyContact} onChange={handleChange("emergencyContact")} />
        </div>
        <Input label="Address" value={form.address} onChange={handleChange("address")} />
        <Button type="submit" className="w-full" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </form>
    </Modal>
  );
}