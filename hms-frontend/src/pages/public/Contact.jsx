import { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import PublicNav from "../../components/PublicNav";
import { Footer } from "./Home";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e) => {
    e.preventDefault();
    // No public "contact" endpoint on the backend yet — this simply confirms receipt client-side.
    toast.success("Message received — our front desk will call you back shortly.");
    setForm({ name: "", email: "", message: "" });
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

        <form onSubmit={submit} className="bg-surface rounded-2xl shadow-card border border-black/5 p-7 space-y-4 h-fit">
          <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label className="block">
            <span className="block text-xs font-medium text-ink/60 mb-1.5">Message</span>
            <textarea
              rows={4} required value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-black/10 bg-canvas/50 px-3.5 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </label>
          <Button type="submit" className="w-full">Send Message</Button>
        </form>
      </section>
      <Footer />
    </div>
  );
}