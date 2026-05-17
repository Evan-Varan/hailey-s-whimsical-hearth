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
    <main className="max-w-3xl mx-auto px-6 py-16">
      <div className="space-y-4">
        <span className="tag-chip rose">privacy</span>
        <h1 className="font-hand text-6xl md:text-7xl text-foreground">Privacy Policy</h1>
        <p className="font-serif-display italic text-muted-foreground">
          Last updated May 17, 2026
        </p>
      </div>

      <div className="paper-card p-8 md:p-10 mt-10 font-serif-display text-foreground/85 leading-relaxed space-y-7">
        <section className="space-y-3">
          <h2 className="font-sans-ui text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Overview
          </h2>
          <p>
            This is a personal website operated by Hailey Adkins. The site displays public
            and authorized content from connected services, including Instagram, Spotify,
            Pinterest, and Substack. It does not sell personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans-ui text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Information This Site Uses
          </h2>
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

        <section className="space-y-3">
          <h2 className="font-sans-ui text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Third-Party Services
          </h2>
          <p>
            This site may connect to Instagram, Spotify, Pinterest, Substack, Cloudflare, and
            similar service providers to load content, host the site, or keep the site running.
            Those services may process data under their own privacy policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans-ui text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Contact Forms And Email
          </h2>
          <p>
            If a visitor contacts Hailey directly, any information they choose to send, such as
            a name, email address, or message, may be used to respond to that request.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans-ui text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Data Requests
          </h2>
          <p>
            Visitors can request information about data they have provided directly, or ask for
            that data to be deleted, by contacting the site owner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-sans-ui text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Changes
          </h2>
          <p>
            This privacy policy may be updated as the website changes or as connected services
            are added or removed.
          </p>
        </section>
      </div>
    </main>
  );
}
