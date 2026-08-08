import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { listDepartments, createDepartment } from "../../api/departments";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";

export default function DepartmentList() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["departments"], queryFn: listDepartments });

  const create = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success("Department added");
      qc.invalidateQueries({ queryKey: ["departments"] });
      setOpen(false);
      setForm({ name: "", description: "" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not add department"),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Departments"
        action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Department</Button>}
      />

      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <Table
          columns={[
            { key: "name", header: "Name" },
            { key: "description", header: "Description", render: (r) => r.description || "—" },
            { key: "created_at", header: "Created", render: (r) => new Date(r.created_at).toLocaleDateString() },
          ]}
          rows={data}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Department">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Add Department"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}