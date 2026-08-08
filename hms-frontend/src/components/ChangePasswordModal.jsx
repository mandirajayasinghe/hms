import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as authApi from "../api/auth";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { Input } from "./ui/Input";

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword(form.currentPassword, form.newPassword),
    onSuccess: () => {
      toast.success("Password updated");
      setForm({ currentPassword: "", newPassword: "" });
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not update password"),
  });

  return (
    <Modal open={open} onClose={onClose} title="Change Password">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        <Input label="Current password" type="password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        <Input label="New password" type="password" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Updating…" : "Update Password"}</Button>
      </form>
    </Modal>
  );
}