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
import { required, minLength, validateForm, hasErrors } from "../../utils/validators";

const rules = {
  name: [required("Name"), minLength("Name", 2)],
};

export default function DepartmentList() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["departments"], queryFn: listDepartments });

  const create = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success("Department added");
      qc.invalidateQueries({ queryKey: ["departments"] });
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not add department"),
  });

  const closeModal = () => {
    setOpen(false);
    setErrors({});
    setForm({ name: "", description: "" });
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const submit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form, rules);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    create.mutate(form);
  };

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

      <Modal open={open} onClose={closeModal} title="Add Department">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Input label="Name" value={form.name} onChange={handleChange("name")} error={errors.name} />
          <Input label="Description" value={form.description} onChange={handleChange("description")} />
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Add Department"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}