import { Envelope, InstagramLogo, PinterestLogo, ArrowUpRight } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

const footerLinks = {
  explore: [
    { to: "/journal", label: "Journal" },
    { to: "/gallery", label: "Gallery" },
    { to: "/astrology", label: "Astrology" },
    { to: "/animal-facts", label: "Animal Facts" },
  ],
  connect: [
    { to: "/about", label: "About Hailey" },
    { to: "/about#contact", label: "Send a Note" },
  ],
};

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: InstagramLogo },
  { href: "https://pinterest.com", label: "Pinterest", icon: PinterestLogo },
  { href: "mailto:hello@example.com", label: "Email", icon: Envelope },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container-wide section-gap">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="font-hand text-3xl text-foreground">Hailey Adkins</span>
            </Link>
            <p className="mt-4 max-w-sm font-serif-display text-muted-foreground leading-relaxed">
              A small magical journal where crochet meets cosmos, made with care, tea, and a bit of moonlight.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card hover:border-primary hover:text-primary transition-all"
                >
                  <social.icon weight="duotone" className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h3 className="font-sans-ui text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Explore
            </h3>
            <nav className="flex flex-col gap-2.5">
              {footerLinks.explore.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-serif-display text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  {link.label}
                  <ArrowUpRight 
                    weight="bold" 
                    className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" 
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="font-sans-ui text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Connect
            </h3>
            <nav className="flex flex-col gap-2.5">
              {footerLinks.connect.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-serif-display text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  {link.label}
                  <ArrowUpRight 
                    weight="bold" 
                    className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" 
                  />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-sans-ui text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hailey Adkins. All rights reserved.
          </p>
          <p className="font-serif-display text-sm text-muted-foreground/70">
            Made with care & a little magic
          </p>
        </div>
      </div>
    </footer>
  );
}
