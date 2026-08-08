import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, KeyRound } from "lucide-react";
import { listUsers, createUser, updateUser, resetUserPassword, deactivateUser } from "../../api/users";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";

const roles = ["admin", "doctor", "nurse", "receptionist", "lab_staff", "pharmacist", "accountant"];

export default function UserList() {
  const [open, setOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", username: "", password: "", role: "receptionist" });
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: listUsers });

  const create = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("User created");
      qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      setForm({ fullName: "", email: "", username: "", password: "", role: "receptionist" });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not create user"),
  });

  const deactivate = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => { toast.success("User deactivated"); qc.invalidateQueries({ queryKey: ["users"] }); },
  });

  const activate = useMutation({
    mutationFn: (id) => updateUser(id, { isActive: true }),
    onSuccess: () => { toast.success("User activated"); qc.invalidateQueries({ queryKey: ["users"] }); },
  });

  const resetPw = useMutation({
    mutationFn: () => resetUserPassword(resetTarget.id, newPassword),
    onSuccess: () => { toast.success("Password reset"); setResetTarget(null); setNewPassword(""); },
    onError: (e) => toast.error(e.response?.data?.message || "Could not reset password"),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Users"
        action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add User</Button>}
      />

      {isLoading ? (
        <div className="text-ink/40 text-sm py-10 text-center">Loading…</div>
      ) : (
        <Table
          columns={[
            { key: "full_name", header: "Name" },
            { key: "email", header: "Email" },
            { key: "role", header: "Role", render: (r) => <Badge>{r.role.replace("_", " ")}</Badge> },
            { key: "is_active", header: "Status", render: (r) => <Badge tone={r.is_active ? "success" : "danger"}>{r.is_active ? "active" : "inactive"}</Badge> },
            {
              key: "actions", header: "", render: (r) => (
                <div className="flex gap-3">
                  <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={() => setResetTarget(r)}>
                    <KeyRound size={13} /> Reset password
                  </button>
                  {r.is_active ? (
                    <button className="text-xs text-accent hover:underline" onClick={() => deactivate.mutate(r.id)}>Deactivate</button>
                  ) : (
                    <button className="text-xs text-primary hover:underline" onClick={() => activate.mutate(r.id)}>Activate</button>
                  )}
                </div>
              ),
            },
          ]}
          rows={data}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add User">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <Input label="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <Input label="Temporary password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label="Role" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={roles.map((r) => ({ value: r, label: r.replace("_", " ") }))} />
          <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? "Saving…" : "Create User"}</Button>
        </form>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => { setResetTarget(null); setNewPassword(""); }} title={`Reset Password — ${resetTarget?.full_name || ""}`}>
        <form onSubmit={(e) => { e.preventDefault(); resetPw.mutate(); }} className="space-y-4">
          <Input label="New password" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Button type="submit" className="w-full" disabled={resetPw.isPending}>{resetPw.isPending ? "Resetting…" : "Reset Password"}</Button>
        </form>
      </Modal>
    </div>
  );
}