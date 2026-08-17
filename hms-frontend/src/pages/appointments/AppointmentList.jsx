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
import { required, futureDateTime, validateForm, hasErrors } from "../../utils/validators";

const statusTone = { scheduled: "success", completed: "neutral", cancelled: "danger", rescheduled: "warning", no_show: "danger" };

const bookingRules = {
  patientId: [required("Patient")],
  doctorId: [required("Doctor")],
  scheduledAt: [required("Date & time"), futureDateTime("Date & time")],
};

const rescheduleRules = {
  newTime: [required("New date & time"), futureDateTime("New date & time")],
};

export default function AppointmentList() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", doctorId: "", scheduledAt: "", reason: "" });
  const [formErrors, setFormErrors] = useState({});
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["appointments"], queryFn: () => listAppointments() });
  const { data: patients = [] } = useQuery({ queryKey: ["patients-all"], queryFn: () => listPatients({ limit: 200 }) });
  const { data: doctors = [] } = useQuery({ queryKey: ["doctors"], queryFn: () => listDoctors() });

  const create = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => { toast.success("Appointment booked"); qc.invalidateQueries({ queryKey: ["appointments"] }); closeBooking(); },
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
      setRescheduleError("");
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

  const closeBooking = () => {
    setOpen(false);
    setFormErrors({});
    setForm({ patientId: "", doctorId: "", scheduledAt: "", reason: "" });
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (formErrors[field]) setFormErrors({ ...formErrors, [field]: "" });
  };

  const submitBooking = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form, bookingRules);
    setFormErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    create.mutate(form);
  };

  const submitReschedule = (e) => {
    e.preventDefault();
    const validationErrors = validateForm({ newTime }, rescheduleRules);
    setRescheduleError(validationErrors.newTime || "");
    if (hasErrors(validationErrors)) return;
    reschedule.mutate();
  };

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
                    onClick={() => { setRescheduleTarget(r); setNewTime(""); setRescheduleError(""); }}
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

      <Modal open={open} onClose={closeBooking} title="Book Appointment">
        <form onSubmit={submitBooking} noValidate className="space-y-4">
          <Select
            label="Patient" value={form.patientId} onChange={handleChange("patientId")}
            error={formErrors.patientId}
            options={[{ value: "", label: "Select patient" }, ...patients.map((p) => ({ value: p.id, label: p.full_name }))]}
          />
          <Select
            label="Doctor" value={form.doctorId} onChange={handleChange("doctorId")}
            error={formErrors.doctorId}
            options={[{ value: "", label: "Select doctor" }, ...doctors.map((d) => ({ value: d.id, label: `Dr. ${d.full_name}` }))]}
          />
          <Input
            label="Date & time" type="datetime-local" value={form.scheduledAt}
            onChange={handleChange("scheduledAt")} error={formErrors.scheduledAt}
          />
          <Input label="Reason" value={form.reason} onChange={handleChange("reason")} />
          <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? "Booking…" : "Book Appointment"}</Button>
        </form>
      </Modal>

      <Modal open={!!rescheduleTarget} onClose={() => setRescheduleTarget(null)} title="Reschedule Appointment">
        <form onSubmit={submitReschedule} noValidate className="space-y-4">
          <p className="text-sm text-ink/50">
            {rescheduleTarget?.patient_name} with Dr. {rescheduleTarget?.doctor_name}
          </p>
          <Input
            label="New date & time" type="datetime-local" value={newTime}
            onChange={(e) => { setNewTime(e.target.value); if (rescheduleError) setRescheduleError(""); }}
            error={rescheduleError}
          />
          <Button type="submit" className="w-full" disabled={reschedule.isPending}>
            {reschedule.isPending ? "Rescheduling…" : "Confirm Reschedule"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}