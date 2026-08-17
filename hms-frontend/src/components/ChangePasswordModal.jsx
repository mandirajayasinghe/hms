import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as authApi from "../api/auth";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { Input } from "./ui/Input";
import { required, strongPassword, validateForm, hasErrors } from "../utils/validators";

const rules = {
  currentPassword: [required("Current password")],
  newPassword: [required("New password"), strongPassword],
};

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword(form.currentPassword, form.newPassword),
    onSuccess: () => {
      toast.success("Password updated");
      setForm({ currentPassword: "", newPassword: "" });
      setErrors({});
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not update password"),
  });

  const submit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form, rules);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    mutation.mutate();
  };

  return (
    <Modal open={open} onClose={onClose} title="Change Password">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input
          label="Current password" type="password"
          value={form.currentPassword} onChange={handleChange("currentPassword")}
          error={errors.currentPassword}
        />
        <Input
          label="New password" type="password"
          value={form.newPassword} onChange={handleChange("newPassword")}
          error={errors.newPassword}
        />
        <p className="text-xs text-ink/40 -mt-2">
          Minimum 8 characters, at least one uppercase letter and one number.
        </p>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Updating…" : "Update Password"}
        </Button>
      </form>
    </Modal>
  );
}