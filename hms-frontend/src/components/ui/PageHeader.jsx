export default function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-6 animate-fadeUp">
      <div>
        {eyebrow && <div className="text-xs uppercase tracking-widest text-sage font-medium mb-1">{eyebrow}</div>}
        <h1 className="font-display text-2xl md:text-3xl text-primary-dark">{title}</h1>
      </div>
      {action}
    </div>
  );
}