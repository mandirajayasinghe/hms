import { motion } from "framer-motion";
import { HeartPulse, Stethoscope, FlaskConical, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import PublicNav from "../../components/PublicNav";

const services = [
  { icon: Stethoscope, title: "Specialist Consultations", desc: "Book time with cardiologists, pediatricians, and 12 other departments." },
  { icon: FlaskConical, title: "Diagnostic Laboratory", desc: "Same-day results for routine panels, digital reports sent to your file." },
  { icon: HeartPulse, title: "Emergency & Inpatient Care", desc: "24/7 emergency response with dedicated wards and monitored beds." },
  { icon: ShieldCheck, title: "Secure Medical Records", desc: "Your history, prescriptions, and reports — private and always accessible to your care team." },
];

export default function Home() {
  return (
    <div>
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="text-xs uppercase tracking-widest text-sage font-medium mb-4">Meridian Hospital — Est. Trust, Every Visit</div>
            <h1 className="font-display text-4xl md:text-5xl leading-[1.1] text-primary-dark mb-5">
              Care that keeps every detail in order.
            </h1>
            <p className="text-ink/60 text-lg mb-8 max-w-md">
              From registration to recovery, our teams and records move together — so your care never waits on paperwork.
            </p>
            <div className="flex gap-3">
              <Link to="/contact" className="rounded-lg bg-accent text-white px-6 py-3 text-sm font-medium hover:bg-accent/90 transition-colors shadow-soft">
                Book an Appointment
              </Link>
              <Link to="/about" className="rounded-lg border border-primary/20 text-primary px-6 py-3 text-sm font-medium hover:bg-primary-soft transition-colors">
                Learn About Us
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=900&q=80"
              alt="Hospital corridor with medical staff"
              className="rounded-2xl shadow-card w-full h-[420px] object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-surface rounded-xl shadow-card px-5 py-3 border border-black/5">
              <div className="text-2xl font-display text-primary-dark">24/7</div>
              <div className="text-xs text-ink/50">Emergency response</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-display text-2xl text-primary-dark mb-10">What we care for</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl border border-black/5 hover:shadow-card transition-shadow hover:-translate-y-0.5 duration-200">
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-4">
                  <Icon size={19} />
                </div>
                <h3 className="font-medium text-ink mb-1.5">{title}</h3>
                <p className="text-sm text-ink/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {[
          { stat: "40+", label: "Specialist doctors across 12 departments" },
          { stat: "120", label: "Inpatient beds across general & critical wards" },
          { stat: "98%", label: "Lab results delivered within 24 hours" },
        ].map((s) => (
          <div key={s.label} className="border-l-2 border-sage pl-5">
            <div className="font-display text-4xl text-primary-dark mb-1">{s.stat}</div>
            <div className="text-sm text-ink/55">{s.label}</div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-primary-dark text-white/60 text-sm">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-4">
        <span>© {new Date().getFullYear()} Meridian Hospital. All rights reserved.</span>
        <span>123 Wellness Ave, Batticaloa · +94 65 000 0000</span>
      </div>
    </footer>
  );
}

export { Footer };