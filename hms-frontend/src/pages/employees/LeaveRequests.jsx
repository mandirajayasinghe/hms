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

const statusTone = { pending: "warning", approved: "success", rejected: "danger" };

export default function LeaveRequests() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", startDate: "", endDate: "", reason: "" });

  const { data = [], isLoading } = useQuery({ queryKey: ["leaves"], queryFn: listLeaves });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: listEmployees, enabled: open });

  const create = useMutation({
    mutationFn: requestLeave,
    onSuccess: () => {
      toast.success("Leave request submitted");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      setOpen(false);
      setForm({ employeeId: "", startDate: "", endDate: "", reason: "" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not submit leave"),
  });

  const decide = useMutation({
    mutationFn: ({ id, status }) => decideLeave(id, status),
    onSuccess: () => { toast.success("Leave updated"); qc.invalidateQueries({ queryKey: ["leaves"] }); },
  });

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

      <Modal open={open} onClose={() => setOpen(false)} title="Request Leave">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <Select label="Employee" required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            options={[{ value: "", label: "Select employee" }, ...employees.map((e) => ({ value: e.id, label: e.full_name }))]} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start date" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End date" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <Input label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Submitting…" : "Submit Request"}
          </Button>
        </form>
      </Modal>
    </Card>
  );
}