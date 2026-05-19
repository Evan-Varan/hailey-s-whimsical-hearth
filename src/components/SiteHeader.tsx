import { Link } from "@tanstack/react-router";
import { List, Moon, SunDim, X, Sparkle } from "@phosphor-icons/react";
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

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? "py-2 px-6"
          : "py-6 px-6"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-card/90 backdrop-blur-md border border-border shadow-soft px-6 py-2 rounded-full max-w-4xl"
            : "bg-transparent border-b border-border/20 pb-4"
        }`}
      >
        <Link to="/" className="group flex items-center gap-2" aria-label="Hailey Adkins home">
          <div className={`relative transition-all duration-500 ${scrolled ? "scale-90" : "scale-100"}`}>
            <span className="font-display italic text-3xl text-foreground group-hover:text-primary transition-colors">
              Hailey
            </span>
            <span className="font-marginalia text-sm text-primary absolute -top-1 -right-4 rotate-12">
              Adkins
            </span>
            {!scrolled && (
              <div className="absolute -bottom-2 left-0 right-0 h-px bg-primary/30 scale-x-110" />
            )}
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className={`font-display text-lg italic transition-all duration-300 hover:text-primary relative group/nav ${
                scrolled ? "text-[16px]" : "text-[18px]"
              }`}
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary scale-x-0 group-hover/nav:scale-x-100 transition-transform origin-center" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle dark mode"
            onClick={() => setDark((d) => !d)}
            className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/70 hover:text-primary"
          >
            {dark ? (
              <SunDim weight="duotone" className="w-5 h-5" />
            ) : (
              <Moon weight="duotone" className="w-5 h-5" />
            )}
          </button>
          
          <div className="md:hidden">
            <button
              aria-label="Menu"
              className="p-2 rounded-full hover:bg-muted transition-colors text-foreground"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
            </button>
          </div>

          {scrolled && (
            <div className="hidden md:block ml-2 text-primary/30">
              <Sparkle weight="fill" className="w-3 h-3 animate-twinkle" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl transition-all duration-500 ease-in-out ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
          <div className="absolute top-8 right-8">
            <button
              onClick={() => setOpen(false)}
              className="p-3 rounded-full bg-card border border-border"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: n.to === "/" }}
              className="font-display italic text-4xl text-foreground hover:text-primary transition-colors"
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-8 flex items-center gap-4 text-primary/40">
            <Sparkle weight="fill" className="w-4 h-4" />
            <div className="w-20 h-px bg-current" />
            <Sparkle weight="fill" className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
