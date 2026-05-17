import { Link } from "@tanstack/react-router";
import { List, Moon, SunDim, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/journal", label: "Journal" },
  { to: "/gallery", label: "Gallery" },
  { to: "/astrology", label: "Astrology" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem("theme");
    if (stored === "dark") setDark(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <header className="relative z-30 border-b border-border/60 backdrop-blur-sm bg-background/70 sticky top-0">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
        <Link
          to="/"
          className="group relative shrink-0 py-1 pr-3"
          aria-label="Hailey Adkins home"
        >
          <span className="relative inline-flex items-end">
            <span className="font-hand text-[2.05rem] italic leading-[0.85] text-foreground transition-colors group-hover:text-primary">
              Hailey
            </span>
            <span className="mb-0.5 ml-1.5 font-serif-display text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
              Adkins
            </span>
            <span className="absolute -bottom-2 left-0 right-1 h-px bg-primary/45" aria-hidden>
              <span className="absolute right-0 top-0 h-px w-5 bg-accent/80" />
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-serif-display italic text-[15px] text-muted-foreground">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="relative hover:text-primary transition-colors after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:bg-current after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform data-[status=active]:after:scale-x-100"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            aria-label="Toggle dark mode"
            onClick={() => setDark((d) => !d)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            {dark ? <SunDim weight="duotone" className="w-4 h-4" /> : <Moon weight="duotone" className="w-4 h-4" />}
          </button>
          <button
            aria-label="Menu"
            className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border/60 px-6 py-4 flex flex-col gap-3 font-serif-display italic text-foreground bg-background">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="py-1"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
