import { Envelope, InstagramLogo, PinterestLogo, Sparkle } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-12 items-start">
          <div className="space-y-4">
            <div className="relative inline-block">
              <p className="font-display italic text-4xl text-foreground">Hailey Adkins</p>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-primary/30" />
            </div>
            <p className="font-serif-display italic text-base text-muted-foreground max-w-sm leading-relaxed">
              A personal archive of slow mornings, small rituals, and the things that make life softer. Made with tea, moonlight, and a bit of stardust.
            </p>
            <div className="pt-4 marginalia opacity-60">
              stay whimsical, friend
            </div>
          </div>

          <nav className="flex flex-col gap-3">
            <span className="font-sans-ui text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-2">Explore</span>
            {[
              { to: "/journal", label: "The Journal" },
              { to: "/gallery", label: "Visual Scrapbook" },
              { to: "/astrology", label: "Celestial Map" },
              { to: "/animal-facts", label: "Daily Facts" },
              { to: "/about", label: "The Maker" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="font-display italic text-lg text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group"
              >
                <Sparkle weight="fill" className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="md:text-right flex flex-col md:items-end gap-6">
            <div className="space-y-3">
              <span className="font-sans-ui text-[10px] uppercase tracking-[0.3em] text-primary/70 block">Find me</span>
              <div className="flex items-center gap-1 md:justify-end">
                {[
                  { icon: InstagramLogo, label: "Instagram", href: "#" },
                  { icon: Envelope, label: "Email", href: "mailto:haileyliz1130@gmail.com" },
                  { icon: PinterestLogo, label: "Pinterest", href: "#" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-3 rounded-full hover:bg-muted transition-colors text-foreground/70 hover:text-primary"
                  >
                    <social.icon weight="duotone" className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="pt-8">
              <p className="font-serif-display italic text-sm text-muted-foreground">
                © {new Date().getFullYear()} ✦ all small magic reserved
              </p>
              <p className="font-marginalia text-primary/40 text-sm mt-1">
                started in 2026 from the stardust cottage
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
