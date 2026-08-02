import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Search } from "lucide-react";
import { listPatients, createPatient } from "../../api/patients";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";

export default function PatientList() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", dateOfBirth: "", gender: "male", email: "" });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["patients", search],
    queryFn: () => listPatients({ search }),
  });

  const mutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      toast.success("Patient registered");
      qc.invalidateQueries({ queryKey: ["patients"] });
      setOpen(false);
      setForm({ fullName: "", phone: "", dateOfBirth: "", gender: "male", email: "" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to register patient"),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Patients"
        title="Patient Registry"
        action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Register Patient</Button>}
      />

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or code…"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-black/10 bg-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
      </div>

      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading patients…</div>
      ) : (
        <Table
          onRowClick={(row) => navigate(`/app/patients/${row.id}`)}
          columns={[
            { key: "patient_code", header: "Code", render: (r) => <span className="font-mono text-xs">{r.patient_code}</span> },
            { key: "full_name", header: "Name" },
            { key: "gender", header: "Gender" },
            { key: "phone", header: "Phone" },
            { key: "created_at", header: "Registered", render: (r) => new Date(r.created_at).toLocaleDateString() },
          ]}
          rows={data}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Register Patient">
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
          className="space-y-4"
        >
          <Input label="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Register Patient"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}