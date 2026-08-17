import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { listLeaves, requestLeave, decideLeave, listEmployees } from "../../api/employees";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { required, validateForm, hasErrors } from "../../utils/validators";

const statusTone = { pending: "warning", approved: "success", rejected: "danger" };

const rules = {
  employeeId: [required("Employee")],
  startDate: [required("Start date")],
  endDate: [required("End date")],
};

const dateRangeValid = (values) => {
  if (!values.startDate || !values.endDate) return "";
  return new Date(values.endDate) >= new Date(values.startDate)
    ? ""
    : "End date must be on or after the start date";
};

export default function LeaveRequests() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", startDate: "", endDate: "", reason: "" });
  const [errors, setErrors] = useState({});

  const { data = [], isLoading } = useQuery({ queryKey: ["leaves"], queryFn: listLeaves });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: listEmployees, enabled: open });

  const create = useMutation({
    mutationFn: requestLeave,
    onSuccess: () => {
      toast.success("Leave request submitted");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not submit leave"),
  });

  const decide = useMutation({
    mutationFn: ({ id, status }) => decideLeave(id, status),
    onSuccess: () => { toast.success("Leave updated"); qc.invalidateQueries({ queryKey: ["leaves"] }); },
  });

  const closeModal = () => {
    setOpen(false);
    setErrors({});
    setForm({ employeeId: "", startDate: "", endDate: "", reason: "" });
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const submit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form, rules);

    const rangeError = dateRangeValid(form);
    if (rangeError) validationErrors.endDate = rangeError;

    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    create.mutate(form);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-primary-dark">Leave Requests</h3>
        <Button variant="outline" className="!py-1.5 !px-3 text-xs" onClick={() => setOpen(true)}>
          <Plus size={14} /> Request Leave
        </Button>
      </div>

      {isLoading ? (
        <div className="text-ink/40 text-sm py-6 text-center">Loading…</div>
      ) : (
        <Table
          columns={[
            { key: "full_name", header: "Employee" },
            { key: "start_date", header: "From", render: (r) => new Date(r.start_date).toLocaleDateString() },
            { key: "end_date", header: "To", render: (r) => new Date(r.end_date).toLocaleDateString() },
            { key: "reason", header: "Reason", render: (r) => r.reason || "—" },
            { key: "status", header: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
            {
              key: "actions", header: "", render: (r) => r.status === "pending" && (
                <div className="flex gap-2">
                  <button className="text-xs text-primary hover:underline" onClick={() => decide.mutate({ id: r.id, status: "approved" })}>Approve</button>
                  <button className="text-xs text-accent hover:underline" onClick={() => decide.mutate({ id: r.id, status: "rejected" })}>Reject</button>
                </div>
              ),
            },
          ]}
          rows={data}
        />
      )}

      <Modal open={open} onClose={closeModal} title="Request Leave">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Select label="Employee" value={form.employeeId} onChange={handleChange("employeeId")} error={errors.employeeId}
            options={[{ value: "", label: "Select employee" }, ...employees.map((e) => ({ value: e.id, label: e.full_name }))]} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start date" type="date" value={form.startDate} onChange={handleChange("startDate")} error={errors.startDate} />
            <Input label="End date" type="date" value={form.endDate} onChange={handleChange("endDate")} error={errors.endDate} />
          </div>
          <Input label="Reason" value={form.reason} onChange={handleChange("reason")} />
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Submitting…" : "Submit Request"}
          </Button>
        </form>
      </Modal>
    </Card>
  );
}