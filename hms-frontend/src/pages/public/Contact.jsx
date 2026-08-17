import { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import PublicNav from "../../components/PublicNav";
import { Footer } from "./Home";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { required, email as emailRule, validateForm, hasErrors } from "../../utils/validators";

const rules = {
  name: [required("Full name")],
  email: [required("Email"), emailRule],
  message: [required("Message")],
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const submit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form, rules);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    // No public "contact" endpoint on the backend yet — this simply confirms receipt client-side.
    toast.success("Message received — our front desk will call you back shortly.");
    setForm({ name: "", email: "", message: "" });
    setErrors({});
  };

  return (
    <div>
      <PublicNav />
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <div className="text-xs uppercase tracking-widest text-sage font-medium mb-4">Get in touch</div>
          <h1 className="font-display text-3xl text-primary-dark mb-5">We're here, day or night.</h1>
          <img
            src="https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=800&q=80"
            alt="Hospital front desk"
            className="rounded-2xl shadow-soft w-full h-56 object-cover mb-8"
          />
          <div className="space-y-4 text-sm text-ink/70">
            <div className="flex items-center gap-3"><MapPin size={17} className="text-primary" /> 123 Wellness Ave, Batticaloa, LK</div>
            <div className="flex items-center gap-3"><Phone size={17} className="text-primary" /> +94 65 000 0000</div>
            <div className="flex items-center gap-3"><Mail size={17} className="text-primary" /> care@meridianhospital.example</div>
          </div>
        </div>

        <form onSubmit={submit} noValidate className="bg-surface rounded-2xl shadow-card border border-black/5 p-7 space-y-4 h-fit">
          <Input label="Full name" value={form.name} onChange={handleChange("name")} error={errors.name} />
          <Input label="Email" type="email" value={form.email} onChange={handleChange("email")} error={errors.email} />
          <label className="block">
            <span className="block text-xs font-medium text-ink/60 mb-1.5">Message</span>
            <textarea
              rows={4} value={form.message}
              onChange={handleChange("message")}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${
                errors.message
                  ? "border-accent bg-accent-soft/20 focus:border-accent focus:ring-1 focus:ring-accent"
                  : "border-black/10 bg-canvas/50 focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            />
            {errors.message && <p className="text-xs text-accent mt-1">{errors.message}</p>}
          </label>
          <Button type="submit" className="w-full">Send Message</Button>
        </form>
      </section>
      <Footer />
    </div>
  );
}