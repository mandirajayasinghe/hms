import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Pencil, CalendarClock } from "lucide-react";
import { listDoctors, registerDoctor, updateDoctor } from "../../api/doctors";
import { listDepartments } from "../../api/departments";
import { useAuth } from "../../auth/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import ScheduleModal from "./ScheduleModal";
import {
  required, minLength, email, usernameFormat, strongPassword, nonNegativeNumber,
  validateForm, hasErrors,
} from "../../utils/validators";

export default function DoctorList() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = registering new, else editing
  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  const [form, setForm] = useState({
    fullName: "", email: "", username: "", password: "",
    departmentId: "", specialization: "", qualification: "", consultationFee: "",
  });
  const [errors, setErrors] = useState({});
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["doctors"], queryFn: () => listDoctors() });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: listDepartments, enabled: open });

  const registerRules = {
    fullName: [required("Full name"), minLength("Full name", 2)],
    email: [required("Email"), email],
    username: [required("Username"), minLength("Username", 3), usernameFormat],
    password: [required("Password"), strongPassword],
    consultationFee: [nonNegativeNumber("Consultation fee")],
  };

  const editRules = {
    consultationFee: [nonNegativeNumber("Consultation fee")],
  };

  const register = useMutation({
    mutationFn: registerDoctor,
    onSuccess: () => {
      toast.success("Doctor registered");
      qc.invalidateQueries({ queryKey: ["doctors"] });
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not register doctor"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => updateDoctor(id, payload),
    onSuccess: () => {
      toast.success("Doctor updated");
      qc.invalidateQueries({ queryKey: ["doctors"] });
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not update doctor"),
  });

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    setErrors({});
    setForm({ fullName: "", email: "", username: "", password: "", departmentId: "", specialization: "", qualification: "", consultationFee: "" });
  };

  const openEdit = (d) => {
    setEditingId(d.id);
    setErrors({});
    setForm({
      fullName: d.full_name || "", email: "", username: "", password: "",
      departmentId: d.department_id || "", specialization: d.specialization || "",
      qualification: d.qualification || "", consultationFee: d.consultation_fee || "",
    });
    setOpen(true);
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const submit = (e) => {
    e.preventDefault();
    const rules = editingId ? editRules : registerRules;
    const validationErrors = validateForm(form, rules);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    if (editingId) {
      update.mutate({
        id: editingId,
        payload: {
          departmentId: form.departmentId || null,
          specialization: form.specialization,
          qualification: form.qualification,
          consultationFee: Number(form.consultationFee || 0),
        },
      });
    } else {
      register.mutate({ ...form, consultationFee: Number(form.consultationFee || 0) });
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Directory"
        title="Doctors"
        action={user?.role === "admin" && (
          <Button onClick={() => setOpen(true)}><Plus size={16} /> Register Doctor</Button>
        )}
      />

      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {data.map((d) => (
            <Card key={d.id} className="p-5 relative">
              {user?.role === "admin" && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setScheduleDoctor(d)}
                    className="text-ink/30 hover:text-primary"
                    title="Manage schedule"
                  >
                    <CalendarClock size={15} />
                  </button>
                  <button
                    onClick={() => openEdit(d)}
                    className="text-ink/30 hover:text-primary"
                    title="Edit doctor"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              )}
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

      <Modal open={open} onClose={closeModal} title={editingId ? "Edit Doctor" : "Register Doctor"}>
        <form onSubmit={submit} noValidate className="space-y-4">
          {!editingId && (
            <>
              <Input label="Full name" value={form.fullName} onChange={handleChange("fullName")} error={errors.fullName} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email" type="email" value={form.email} onChange={handleChange("email")} error={errors.email} />
                <Input label="Username" value={form.username} onChange={handleChange("username")} error={errors.username} />
              </div>
              <Input label="Temporary password" type="password" value={form.password} onChange={handleChange("password")} error={errors.password} />
            </>
          )}
          <Select
            label="Department" value={form.departmentId}
            onChange={handleChange("departmentId")}
            options={[{ value: "", label: "Unassigned" }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Specialization" value={form.specialization} onChange={handleChange("specialization")} />
            <Input label="Qualification" value={form.qualification} onChange={handleChange("qualification")} />
          </div>
          <Input
            label="Consultation fee" type="number" step="0.01"
            value={form.consultationFee} onChange={handleChange("consultationFee")}
            error={errors.consultationFee}
          />
          <Button type="submit" className="w-full" disabled={register.isPending || update.isPending}>
            {editingId ? (update.isPending ? "Saving…" : "Save Changes") : (register.isPending ? "Registering…" : "Register Doctor")}
          </Button>
        </form>
      </Modal>

      <ScheduleModal open={!!scheduleDoctor} onClose={() => setScheduleDoctor(null)} doctor={scheduleDoctor} />
    </div>
  );
}