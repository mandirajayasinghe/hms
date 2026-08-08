import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Pencil } from "lucide-react";
import { listDoctors, registerDoctor, updateDoctor } from "../../api/doctors";
import { listDepartments } from "../../api/departments";
import { useAuth } from "../../auth/AuthContext";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";

export default function DoctorList() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = registering new, else editing
  const [form, setForm] = useState({
    fullName: "", email: "", username: "", password: "",
    departmentId: "", specialization: "", qualification: "", consultationFee: "",
  });
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["doctors"], queryFn: () => listDoctors() });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: listDepartments, enabled: open });

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
    setForm({ fullName: "", email: "", username: "", password: "", departmentId: "", specialization: "", qualification: "", consultationFee: "" });
  };

  const openEdit = (d) => {
    setEditingId(d.id);
    setForm({
      fullName: d.full_name || "", email: "", username: "", password: "",
      departmentId: d.department_id || "", specialization: d.specialization || "",
      qualification: d.qualification || "", consultationFee: d.consultation_fee || "",
    });
    setOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
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
                <button
                  onClick={() => openEdit(d)}
                  className="absolute top-4 right-4 text-ink/30 hover:text-primary"
                  title="Edit doctor"
                >
                  <Pencil size={15} />
                </button>
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
        <form onSubmit={submit} className="space-y-4">
          {!editingId && (
            <>
              <Input label="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <Input label="Temporary password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </>
          )}
          <Select
            label="Department" value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            options={[{ value: "", label: "Unassigned" }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <Input label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
          </div>
          <Input label="Consultation fee" type="number" step="0.01" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
          <Button type="submit" className="w-full" disabled={register.isPending || update.isPending}>
            {editingId ? (update.isPending ? "Saving…" : "Save Changes") : (register.isPending ? "Registering…" : "Register Doctor")}
          </Button>
        </form>
      </Modal>
    </div>
  );
}