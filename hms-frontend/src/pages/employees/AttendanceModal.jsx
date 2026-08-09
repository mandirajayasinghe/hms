import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { markAttendance, getAttendance } from "../../api/employees";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";

const today = () => new Date().toISOString().slice(0, 10);

export default function AttendanceModal({ open, onClose, employee }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ date: today(), status: "present", checkIn: "", checkOut: "" });

  const { data: records = [] } = useQuery({
    queryKey: ["attendance", employee?.id],
    queryFn: () => getAttendance(employee.id),
    enabled: !!employee,
  });

  const mark = useMutation({
    mutationFn: () => markAttendance({ employeeId: employee.id, ...form }),
    onSuccess: () => {
      toast.success("Attendance recorded");
      qc.invalidateQueries({ queryKey: ["attendance", employee.id] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not record attendance"),
  });

  return (
    <Modal open={open} onClose={onClose} title={`Attendance — ${employee?.full_name || ""}`}>
      <div className="space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); mark.mutate(); }} className="space-y-3">
          <Input label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: "present", label: "Present" },
              { value: "absent", label: "Absent" },
              { value: "half_day", label: "Half day" },
              { value: "leave", label: "Leave" },
            ]} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Check-in" type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
            <Input label="Check-out" type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={mark.isPending}>
            {mark.isPending ? "Saving…" : "Save Attendance"}
          </Button>
        </form>

        <div className="border-t border-black/5 pt-4">
          <h4 className="text-sm font-medium mb-2">Recent records</h4>
          {records.length === 0 ? (
            <p className="text-sm text-ink/40">No attendance recorded yet.</p>
          ) : (
            <ul className="divide-y divide-black/5 max-h-56 overflow-y-auto">
              {records.map((r) => (
                <li key={r.id} className="py-2 flex justify-between text-sm">
                  <span>{new Date(r.date).toLocaleDateString()}</span>
                  <span className="capitalize text-ink/60">{r.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}