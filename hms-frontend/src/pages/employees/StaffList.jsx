import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, CalendarCheck } from "lucide-react";
import { listEmployees, registerEmployee } from "../../api/employees";
import { listDepartments } from "../../api/departments";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import AttendanceModal from "./AttendanceModal";
import LeaveRequests from "./LeaveRequests";

const roles = ["nurse", "receptionist", "lab_staff", "pharmacist", "accountant"];

export default function StaffList() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [attendanceEmployee, setAttendanceEmployee] = useState(null);
  const [form, setForm] = useState({
    fullName: "", email: "", username: "", password: "", role: "nurse",
    departmentId: "", designation: "", dateJoined: "", salary: "",
  });

  const { data = [], isLoading } = useQuery({ queryKey: ["employees"], queryFn: listEmployees });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: listDepartments, enabled: open });

  const register = useMutation({
    mutationFn: registerEmployee,
    onSuccess: () => {
      toast.success("Employee registered");
      qc.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
      setForm({ fullName: "", email: "", username: "", password: "", role: "nurse", departmentId: "", designation: "", dateJoined: "", salary: "" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not register employee"),
  });

  const submit = (e) => {
    e.preventDefault();
    register.mutate({ ...form, salary: form.salary ? Number(form.salary) : null });
  };

  return (
    <div className="space-y-6">
      <div>
        <PageHeader
          eyebrow="Human Resources"
          title="Staff Directory"
          action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Register Employee</Button>}
        />
        {isLoading ? (
          <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
        ) : (
          <Table
            columns={[
              { key: "full_name", header: "Name" },
              { key: "designation", header: "Designation" },
              { key: "department", header: "Department", render: (r) => r.department || "—" },
              { key: "date_joined", header: "Joined", render: (r) => r.date_joined ? new Date(r.date_joined).toLocaleDateString() : "—" },
              {
                key: "actions", header: "", render: (r) => (
                  <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={() => setAttendanceEmployee(r)}>
                    <CalendarCheck size={13} /> Attendance
                  </button>
                ),
              },
            ]}
            rows={data}
          />
        )}
      </div>

      <LeaveRequests />

      <Modal open={open} onClose={() => setOpen(false)} title="Register Employee">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <Input label="Temporary password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label="Role" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={roles.map((r) => ({ value: r, label: r.replace("_", " ") }))} />
          <Select label="Department" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            options={[{ value: "", label: "Unassigned" }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
          <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date joined" type="date" value={form.dateJoined} onChange={(e) => setForm({ ...form, dateJoined: e.target.value })} />
            <Input label="Salary" type="number" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? "Registering…" : "Register Employee"}
          </Button>
        </form>
      </Modal>

      <AttendanceModal open={!!attendanceEmployee} onClose={() => setAttendanceEmployee(null)} employee={attendanceEmployee} />
    </div>
  );
}