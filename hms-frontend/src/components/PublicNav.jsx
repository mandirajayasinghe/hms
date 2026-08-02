import { Link, NavLink } from "react-router-dom";

export default function PublicNav() {
  const link = ({ isActive }) =>
    `text-sm transition-colors ${isActive ? "text-primary font-medium" : "text-ink/60 hover:text-ink"}`;
  return (
    <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur border-b border-black/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-display">+</div>
          <span className="font-display text-lg text-primary-dark">Meridian Hospital</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-8">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/about" className={link}>About</NavLink>
          <NavLink to="/contact" className={link}>Contact</NavLink>
        </nav>
        <Link to="/login" className="rounded-lg bg-primary text-white text-sm px-4 py-2 hover:bg-primary-dark transition-colors">
          Staff Login
        </Link>
      </div>
    </header>
  );
}