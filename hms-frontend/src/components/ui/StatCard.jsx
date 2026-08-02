export default function StatCard({ label, value, sublabel, icon: Icon }) {
  return (
    <div className="flex-1 min-w-[160px] px-5 py-4 first:pl-0 last:pr-0 border-r last:border-r-0 border-black/10">
      <div className="flex items-center gap-2 text-ink/50 text-xs uppercase tracking-wide font-medium mb-1.5">
        {Icon && <Icon size={14} />}
        {label}
      </div>
      <div className="font-display text-3xl text-primary-dark">{value}</div>
      {sublabel && <div className="text-xs text-ink/40 mt-1">{sublabel}</div>}
    </div>
  );
}