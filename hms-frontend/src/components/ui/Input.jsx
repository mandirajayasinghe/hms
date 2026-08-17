export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-ink/60 mb-1.5">{label}</span>}
      <input
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors ${
          error
            ? "border-accent bg-accent-soft/20 focus:border-accent focus:ring-1 focus:ring-accent"
            : "border-black/10 bg-canvas/50 focus:border-primary focus:ring-1 focus:ring-primary"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-accent mt-1">{error}</p>}
    </label>
  );
}

export function Select({ label, options = [], error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-ink/60 mb-1.5">{label}</span>}
      <select
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none ${
          error
            ? "border-accent bg-accent-soft/20 focus:border-accent focus:ring-1 focus:ring-accent"
            : "border-black/10 bg-canvas/50 focus:border-primary focus:ring-1 focus:ring-primary"
        } ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-accent mt-1">{error}</p>}
    </label>
  );
}