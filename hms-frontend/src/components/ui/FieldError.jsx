export default function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-accent mt-1">{message}</p>;
}