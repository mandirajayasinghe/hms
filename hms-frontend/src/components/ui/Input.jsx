export function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-ink/60 mb-1.5">{label}</span>}
      <input
        className={`w-full rounded-lg border border-black/10 bg-canvas/50 px-3.5 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, options = [], className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-ink/60 mb-1.5">{label}</span>}
      <select
        className={`w-full rounded-lg border border-black/10 bg-canvas/50 px-3.5 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}