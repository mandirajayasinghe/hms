import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import {
  listAppointments, createAppointment, cancelAppointment,
  rescheduleAppointment, updateAppointmentStatus,
} from "../../api/appointments";
import { listPatients } from "../../api/patients";
import { listDoctors } from "../../api/doctors";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Select, Input } from "../../components/ui/Input";

const statusTone = { scheduled: "success", completed: "neutral", cancelled: "danger", rescheduled: "warning", no_show: "danger" };

export default function AppointmentList() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", doctorId: "", scheduledAt: "", reason: "" });
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newTime, setNewTime] = useState("");
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["appointments"], queryFn: () => listAppointments() });
  const { data: patients = [] } = useQuery({ queryKey: ["patients-all"], queryFn: () => listPatients({ limit: 200 }) });
  const { data: doctors = [] } = useQuery({ queryKey: ["doctors"], queryFn: () => listDoctors() });

  const create = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => { toast.success("Appointment booked"); qc.invalidateQueries({ queryKey: ["appointments"] }); setOpen(false); },
    onError: (e) => toast.error(e.response?.data?.message || "Could not book appointment"),
  });

  const cancel = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => { toast.success("Appointment cancelled"); qc.invalidateQueries({ queryKey: ["appointments"] }); },
  });

  const reschedule = useMutation({
    mutationFn: () => rescheduleAppointment(rescheduleTarget.id, newTime),
    onSuccess: () => {
      toast.success("Appointment rescheduled");
      qc.invalidateQueries({ queryKey: ["appointments"] });
      setRescheduleTarget(null);
      setNewTime("");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not reschedule"),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }) => updateAppointmentStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Marked as ${variables.status.replace("_", " ")}`);
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not update status"),
  });

  const isActionable = (status) => status === "scheduled" || status === "rescheduled";

  return (
    <div>
      <PageHeader eyebrow="Scheduling" title="Appointments" action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Book Appointment</Button>} />

      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <Table
          columns={[
            { key: "patient_name", header: "Patient" },
            { key: "doctor_name", header: "Doctor", render: (r) => `Dr. ${r.doctor_name}` },
            { key: "scheduled_at", header: "When", render: (r) => new Date(r.scheduled_at).toLocaleString() },
            { key: "status", header: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status.replace("_", " ")}</Badge> },
            {
              key: "actions", header: "", render: (r) => isActionable(r.status) && (
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setStatus.mutate({ id: r.id, status: "completed" })}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => setStatus.mutate({ id: r.id, status: "no_show" })}
                    className="text-xs text-ink/50 hover:underline"
                  >
                    No Show
                  </button>
                  <button
                    onClick={() => { setRescheduleTarget(r); setNewTime(""); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Reschedule
                  </button>
                  <button onClick={() => cancel.mutate(r.id)} className="text-xs text-accent hover:underline">Cancel</button>
                </div>
              ),
            },
          ]}
          rows={data}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Book Appointment">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <Select label="Patient" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            options={[{ value: "", label: "Select patient" }, ...patients.map((p) => ({ value: p.id, label: p.full_name }))]} />
          <Select label="Doctor" required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            options={[{ value: "", label: "Select doctor" }, ...doctors.map((d) => ({ value: d.id, label: `Dr. ${d.full_name}` }))]} />
          <Input label="Date & time" type="datetime-local" required value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          <Input label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? "Booking…" : "Book Appointment"}</Button>
        </form>
      </Modal>

      <Modal open={!!rescheduleTarget} onClose={() => setRescheduleTarget(null)} title="Reschedule Appointment">
        <form onSubmit={(e) => { e.preventDefault(); reschedule.mutate(); }} className="space-y-4">
          <p className="text-sm text-ink/50">
            {rescheduleTarget?.patient_name} with Dr. {rescheduleTarget?.doctor_name}
          </p>
          <Input label="New date & time" type="datetime-local" required value={newTime} onChange={(e) => setNewTime(e.target.value)} />
          <Button type="submit" className="w-full" disabled={reschedule.isPending}>
            {reschedule.isPending ? "Rescheduling…" : "Confirm Reschedule"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}