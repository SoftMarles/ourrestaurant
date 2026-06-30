import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/reserve", label: "Reserve" },
  { to: "/track", label: "Track Order" },
  { to: "/about", label: "About" },
];

export default function Navigation() {
  const loc = useLocation();
  const nav = useNavigate();
  const count = useCart((s) => s.totalCount());
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => (to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground font-display font-bold text-lg shadow-[var(--shadow-cta)]">O</span>
          <span className="font-display text-xl font-bold tracking-tight">
            Ours<span className="text-primary">Restaurant</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-semibold transition ${isActive(l.to) ? "text-primary" : "text-foreground/70 hover:text-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/account" className="hidden md:inline text-sm font-semibold text-foreground/70 hover:text-foreground">
              My Account
            </Link>
          ) : (
            <Link to="/auth" className="hidden md:inline text-sm font-semibold text-foreground/70 hover:text-foreground">
              Sign in
            </Link>
          )}
          <button
            onClick={() => nav("/cart")}
            className="relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-cta)] hover:brightness-110"
          >
            <ShoppingCart className="h-4 w-4" /> Cart
            {count > 0 && (
              <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-background px-1 text-[11px] font-bold text-primary">
                {count}
              </span>
            )}
          </button>
          <button className="md:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`py-2 text-base font-semibold ${isActive(l.to) ? "text-primary" : "text-foreground/80"}`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/account" onClick={() => setOpen(false)} className="py-2 font-semibold">My Account</Link>
                <button
                  onClick={async () => { await supabase.auth.signOut(); setOpen(false); nav("/"); }}
                  className="py-2 text-left font-semibold text-destructive"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="py-2 font-semibold">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
