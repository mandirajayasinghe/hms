import PublicNav from "../../components/PublicNav";
import { Footer } from "./Home";

const values = [
  { title: "Patient-first", desc: "Every workflow, from triage to billing, is built around reducing time patients wait." },
  { title: "Clinical accuracy", desc: "Structured records and lab pipelines minimise transcription error at every handoff." },
  { title: "Transparent cost", desc: "Itemised billing means no surprises between consultation and discharge." },
];

export default function About() {
  return (
    <div>
      <PublicNav />
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-sage font-medium mb-4">About Meridian</div>
          <h1 className="font-display text-3xl md:text-4xl text-primary-dark mb-5 leading-tight">
            Three decades of care, organised around the patient.
          </h1>
          <p className="text-ink/60 leading-relaxed mb-4">
            Meridian Hospital was founded to close the gap between good clinicians and good coordination.
            Our departments — from laboratory to pharmacy to billing — share one patient record, so your
            care team always has the full picture.
          </p>
          <p className="text-ink/60 leading-relaxed">
            Today we run 12 specialist departments, a 24/7 emergency ward, and a diagnostic lab trusted by
            clinics across the region.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900&q=80"
          alt="Hospital reception and staff"
          className="rounded-2xl shadow-card w-full h-[380px] object-cover"
        />
      </section>

      <section className="bg-surface border-y border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-16 grid sm:grid-cols-3 gap-8">
          {values.map((v) => (
            <div key={v.title}>
              <h3 className="font-display text-lg text-primary-dark mb-2">{v.title}</h3>
              <p className="text-sm text-ink/55 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&q=80"
          alt="Doctor examining patient"
          className="rounded-2xl shadow-soft w-full h-64 object-cover"
        />
        <img
          src="https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=700&q=80"
          alt="Hospital laboratory equipment"
          className="rounded-2xl shadow-soft w-full h-64 object-cover"
        />
      </section>

      <Footer />
    </div>
  );
}