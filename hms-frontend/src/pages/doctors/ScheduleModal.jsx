import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { getDoctorSchedule, setDoctorSchedule } from "../../api/doctors";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ScheduleModal({ open, onClose, doctor }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ dayOfWeek: "1", startTime: "09:00", endTime: "17:00", slotMinutes: "15" });

  const { data: slots = [] } = useQuery({
    queryKey: ["doctor-schedule", doctor?.id],
    queryFn: () => getDoctorSchedule(doctor.id),
    enabled: !!doctor,
  });

  const addSlot = useMutation({
    mutationFn: () => setDoctorSchedule(doctor.id, {
      dayOfWeek: Number(form.dayOfWeek),
      startTime: form.startTime,
      endTime: form.endTime,
      slotMinutes: Number(form.slotMinutes),
    }),
    onSuccess: () => {
      toast.success("Schedule slot added");
      qc.invalidateQueries({ queryKey: ["doctor-schedule", doctor.id] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not add slot"),
  });

  return (
    <Modal open={open} onClose={onClose} title={`Schedule — Dr. ${doctor?.full_name || ""}`}>
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3">Current weekly slots</h4>
          {slots.length === 0 ? (
            <p className="text-sm text-ink/40">No slots set yet.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {slots.map((s) => (
                <li key={s.id} className="py-2 flex justify-between text-sm">
                  <span>{days[s.day_of_week]}</span>
                  <span className="font-mono text-ink/60">
                    {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)} · {s.slot_minutes}min slots
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); addSlot.mutate(); }} className="space-y-4 border-t border-black/5 pt-5">
          <h4 className="text-sm font-medium">Add a slot</h4>
          <Select label="Day of week" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            options={days.map((d, i) => ({ value: String(i), label: d }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start time" type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            <Input label="End time" type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <Input label="Slot length (minutes)" type="number" min="5" value={form.slotMinutes} onChange={(e) => setForm({ ...form, slotMinutes: e.target.value })} />
          <Button type="submit" className="w-full" disabled={addSlot.isPending}>
            <Plus size={15} /> {addSlot.isPending ? "Adding…" : "Add Slot"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}