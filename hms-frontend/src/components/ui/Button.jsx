export default function Button({ variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark shadow-soft",
    accent: "bg-accent text-white hover:bg-accent/90 shadow-soft",
    outline: "border border-primary/30 text-primary hover:bg-primary-soft",
    ghost: "text-ink/70 hover:bg-black/5",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}