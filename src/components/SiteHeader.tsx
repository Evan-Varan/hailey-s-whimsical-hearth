import { Link } from "@tanstack/react-router";
import { List, Moon, SunDim, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/journal", label: "Journal" },
  { to: "/gallery", label: "Gallery" },
  { to: "/astrology", label: "Astrology" },
  { to: "/animal-facts", label: "Facts" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="group relative flex items-baseline gap-2" 
            aria-label="Hailey Adkins home"
          >
            <span className="font-hand text-2xl md:text-[1.75rem] text-foreground transition-colors group-hover:text-primary">
              Hailey
            </span>
            <span className="hidden sm:inline font-sans-ui text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-primary/80">
              Adkins
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-foreground bg-muted" }}
                className="relative px-4 py-2 rounded-full font-sans-ui text-[0.8125rem] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setDark((d) => !d)}
              className="p-2.5 rounded-full hover:bg-muted transition-colors"
            >
              {dark ? (
                <SunDim weight="duotone" className="w-[18px] h-[18px]" />
              ) : (
                <Moon weight="duotone" className="w-[18px] h-[18px]" />
              )}
            </button>
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              className="md:hidden p-2.5 rounded-full hover:bg-muted transition-colors"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? (
                <X weight="bold" className="w-[18px] h-[18px]" />
              ) : (
                <List weight="bold" className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container-wide pb-6 pt-2 flex flex-col gap-1 bg-background/95 backdrop-blur-md border-t border-border/50">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-foreground bg-muted" }}
              className="px-4 py-3 rounded-xl font-sans-ui text-[0.9375rem] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
