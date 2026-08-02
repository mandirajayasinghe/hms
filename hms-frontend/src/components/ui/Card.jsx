export default function Card({ className = "", children, ...props }) {
  return (
    <div className={`bg-surface rounded-2xl shadow-soft border border-black/5 ${className}`} {...props}>
      {children}
    </div>
  );
}