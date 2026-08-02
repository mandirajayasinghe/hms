import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Welcome back");
      navigate("/app");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block relative">
        <img
          src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1000&q=80"
          alt="Hospital staff hallway"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary-dark/40" />
        <div className="absolute bottom-10 left-10 text-white max-w-sm">
          <div className="font-display text-2xl mb-2">Meridian Hospital</div>
          <p className="text-white/70 text-sm">Staff portal for patient records, scheduling, and care coordination.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-canvas">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-sm bg-surface rounded-2xl shadow-card border border-black/5 p-8 space-y-5"
        >
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-display mb-2">+</div>
          <h1 className="font-display text-2xl text-primary-dark">Staff Sign In</h1>
          <Input label="Username or email" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</Button>
        </motion.form>
      </div>
    </div>
  );
}