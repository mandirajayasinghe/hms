const styles = {
  neutral: "bg-black/5 text-ink/70",
  success: "bg-primary-soft text-primary-dark",
  warning: "bg-gold/20 text-[#8a6d2f]",
  danger: "bg-accent-soft text-accent",
};

export default function Badge({ tone = "neutral", children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[tone]}`}>
      {children}
    </span>
  );
}