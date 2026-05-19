import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Hailey Adkins" },
      {
        name: "description",
        content:
          "Privacy policy for Hailey Adkins' personal website and connected social media integrations.",
      },
      { property: "og:title", content: "Privacy Policy — Hailey Adkins" },
      {
        property: "og:description",
        content:
          "How this website handles data from Instagram, Spotify, Pinterest, and basic site usage.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-24 animate-ink">
      <div className="space-y-6 mb-16">
        <span className="tag-chip rose">legal notes</span>
        <h1 className="font-display italic text-6xl md:text-8xl text-foreground leading-tight tracking-tight">Privacy Policy</h1>
        <div className="marginalia text-primary/60 text-xl">
          last updated May 19, 2026
        </div>
      </div>

      <div className="paper-card p-10 md:p-16 bg-card/60 font-serif italic text-xl text-foreground/85 leading-relaxed space-y-12">
        <section className="space-y-4">
          <div className="font-marginalia text-primary/60 text-lg uppercase tracking-widest">Overview</div>
          <p>
            This is a personal website operated by Hailey Adkins. The site displays public
            and authorized content from connected services, including Instagram, Spotify,
            Pinterest, and Substack. It does not sell personal information.
          </p>
        </section>

        <section className="space-y-4">
          <div className="font-marginalia text-primary/60 text-lg uppercase tracking-widest">Information This Site Uses</div>
          <p>
            The site may display content retrieved from connected accounts, such as public
            Instagram media, Spotify listening data, Pinterest pins, and journal posts. API
            credentials are stored server-side and are not intentionally exposed to visitors.
          </p>
          <p>
            Basic technical information, such as IP address, browser type, device type, and
            pages visited, may be processed automatically by the hosting provider for security,
            analytics, logging, and site performance.
          </p>
        </section>

        <section className="space-y-4">
           <div className="font-marginalia text-primary/60 text-lg uppercase tracking-widest">Third-Party Services</div>
          <p>
            This site may connect to Instagram, Spotify, Pinterest, Substack, Cloudflare, and
            similar service providers to load content, host the site, or keep the site running.
            Those services may process data under their own privacy policies.
          </p>
        </section>

        <section className="space-y-4">
          <div className="font-marginalia text-primary/60 text-lg uppercase tracking-widest">Contact Forms And Email</div>
          <p>
            If a visitor contacts Hailey directly, any information they choose to send, such as
            a name, email address, or message, may be used to respond to that request.
          </p>
        </section>

        <section className="space-y-4">
           <div className="font-marginalia text-primary/60 text-lg uppercase tracking-widest">Data Requests</div>
          <p>
            Visitors can request information about data they have provided directly, or ask for
            that data to be deleted, by contacting the site owner.
          </p>
        </section>

        <div className="mt-12 pt-12 border-t border-border/20 text-center">
           <div className="marginalia text-primary/40">stay whimsical, stay secure</div>
        </div>
      </div>
    </main>
  );
}
