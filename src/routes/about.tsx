import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenText, Envelope, InstagramLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

type InstagramFeed = {
  configured: boolean;
  items: Array<{
    id: string;
    caption: string;
    imageUrl?: string;
    timestamp: string;
    media?: InstagramHeroImage[];
  }>;
};

type InstagramHeroImage = {
  id: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: string;
  caption?: string;
  timestamp?: string;
};

type ContactResponse = {
  ok: boolean;
  configured?: boolean;
  error?: string;
  mailto?: string;
};

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Hailey Adkins" },
      {
        name: "description",
        content:
          "Meet Hailey, the quiet maker behind the stardust cottage journal, and send her a note.",
      },
      { property: "og:title", content: "About — Hailey Adkins" },
      {
        property: "og:description",
        content: "Meet Hailey, see what she's sharing lately, and send a note.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const [instagramImages, setInstagramImages] = useState<InstagramHeroImage[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageQueue, setImageQueue] = useState<number[]>([]);
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "draft">("idle");
  const [contactError, setContactError] = useState<string>();
  const heroImage = instagramImages[imageIndex];

  useEffect(() => {
    const controller = new AbortController();

    async function loadInstagramImages() {
      try {
        const feed = await fetchJson<InstagramFeed>(
          "/api/instagram?view=carousel",
          controller.signal,
        );
        const images = getInstagramHeroImages(feed);
        const queue = getShuffledImageQueue(images.length);
        setInstagramImages(images);
        setImageQueue(queue.slice(1));
        setImageIndex(queue[0] ?? 0);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
      }
    }

    void loadInstagramImages();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (instagramImages.length < 2) return;

    const interval = window.setInterval(() => {
      setImageQueue((currentQueue) => {
        const queue = currentQueue.length
          ? currentQueue
          : getShuffledImageQueue(instagramImages.length);
        const [nextIndex, ...remainingQueue] = queue;

        setImageIndex(nextIndex ?? 0);
        return remainingQueue;
      });
    }, 6000);

    return () => window.clearInterval(interval);
  }, [instagramImages.length]);

  async function submitContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setContactStatus("sending");
    setContactError(undefined);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const payload = (await response.json()) as ContactResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Your note could not be sent right now.");
      }

      if (payload.mailto) {
        window.location.href = payload.mailto;
        setContactStatus("draft");
        return;
      }

      form.reset();
      setContactStatus("sent");
    } catch (error) {
      setContactStatus("idle");
      setContactError(error instanceof Error ? error.message : "Your note could not be sent.");
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-14">
      <section className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 items-center">
        <div>
          <span className="tag-chip rose">hello, friend</span>
          <h1 className="font-hand text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] mt-5">
            A quiet maker of small magical things
          </h1>
          <div className="font-serif-display text-lg text-foreground/85 leading-relaxed space-y-4 mt-8 max-w-2xl">
            <p>
              I'm Hailey: perpetually mid-project, fond of slow mornings, and happiest when a week
              has room for a tarot pull, a crochet row, a horse visit, a long D&amp;D session, and a
              cat interrupting the whole thing.
            </p>
            <p>
              This site is a little paper-and-ink place for the things that make life softer:
              journal notes, daily astrology, visual scraps, music, projects, and the tiny rituals
              that hold a day together.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/journal" className="btn-primary">
              <BookOpenText weight="duotone" className="w-4 h-4" /> read the journal{" "}
              <ArrowRight weight="bold" className="w-4 h-4" />
            </Link>
            <a href="#contact" className="btn-ghost">
              <Envelope weight="duotone" className="w-4 h-4" /> send a note
            </a>
          </div>
        </div>

        <div className="relative">
          {/* Stacked card effect */}
          <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl bg-muted/50 border border-border/50" />
          <div className="absolute -bottom-1.5 -right-1.5 w-full h-full rounded-2xl bg-card/80 border border-border/70" />
          
          {/* Main image container */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-[var(--shadow-soft)]">
            {heroImage?.imageUrl ? (
              <div className="relative group">
                <img
                  src={heroImage.imageUrl}
                  alt={heroImage.caption ?? "Instagram post"}
                  width={900}
                  height={900}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Caption on hover */}
                {heroImage.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <p className="font-serif-display text-sm text-white/90 line-clamp-2">
                      {heroImage.caption}
                    </p>
                  </div>
                )}
                
                {/* Instagram badge - top corner */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/80 shadow-sm hover:bg-card transition-colors"
                >
                  <InstagramLogo weight="duotone" className="h-4 w-4 text-primary" />
                  <span className="font-sans-ui text-xs font-medium text-foreground">Follow</span>
                </a>
                
                {/* Image indicator dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {instagramImages.slice(0, 5).map((_, idx) => (
                    <span 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === imageIndex % 5 
                          ? 'bg-white w-4' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Skeleton className="aspect-[4/5] w-full rounded-none" />
            )}
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 mt-12">
        <Fact label="currently making" value="crochet, notes, small rituals" />
        <Fact label="favorite themes" value="tarot, cats, horses, astrology" />
        <Fact label="best reached for" value="kind notes and collaborations" />
      </section>

      <section id="contact" className="mt-20 mb-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
            {/* Left side - Header content */}
            <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12 bg-gradient-to-br from-card via-card to-muted/30">
              <span className="tag-chip rose">send a note</span>
              <h2 className="font-hand text-4xl md:text-5xl text-foreground mt-5 leading-tight">
                Mail Hailey
              </h2>
              <p className="font-serif-display text-muted-foreground mt-4 leading-relaxed text-balance">
                A quiet place for questions, kind replies, project notes, and collaboration ideas.
              </p>
              
              <div className="mt-8 pt-6 border-t border-border/60">
                <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 mb-3">
                  You can also find me on
                </p>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors"
                >
                  <InstagramLogo weight="duotone" className="w-4 h-4" />
                  <span className="font-serif-display">Instagram</span>
                </a>
              </div>
            </div>

            {/* Right side - Form */}
            <form className="p-8 md:p-10 lg:p-12 bg-card/50" onSubmit={submitContact}>
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your name">
                    <input
                      name="name"
                      required
                      className="contact-input-minimal"
                      placeholder="Jane Reader"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      name="email"
                      type="email"
                      required
                      className="contact-input-minimal"
                      placeholder="jane@example.com"
                    />
                  </Field>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Topic">
                    <select name="topic" className="contact-input-minimal">
                      <option>general note</option>
                      <option>crochet</option>
                      <option>tarot or astrology</option>
                      <option>collaboration</option>
                      <option>website issue</option>
                    </select>
                  </Field>
                  <Field label="Subject">
                    <input
                      name="subject"
                      required
                      className="contact-input-minimal"
                      placeholder="A small note..."
                    />
                  </Field>
                </div>
                
                <Field label="Message">
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="contact-input-minimal resize-none"
                    placeholder="Write your note here..."
                  />
                </Field>
              </div>

              <div className="mt-6 pt-5 border-t border-border/40">
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-h-[20px]">
                    {contactError ? (
                      <p className="font-serif-display italic text-sm text-destructive">
                        {contactError}
                      </p>
                    ) : null}
                    {contactStatus === "sent" ? (
                      <p className="font-serif-display italic text-sm text-primary">
                        Your note was sent. Thank you for writing.
                      </p>
                    ) : null}
                    {contactStatus === "draft" ? (
                      <p className="font-serif-display italic text-sm text-primary">
                        Your email draft is open. Send it from your mail app to finish.
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-sans-ui text-sm font-medium tracking-wide transition-all hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
                    disabled={contactStatus === "sending"}
                  >
                    <Envelope weight="duotone" className="w-4 h-4" />
                    {contactStatus === "sending" ? "Sending..." : "Send note"}
                    <ArrowRight weight="bold" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-sans-ui text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="paper-card p-5 text-center">
      <p className="font-serif-display italic text-xs text-muted-foreground">{label}</p>
      <p className="font-hand text-2xl text-foreground mt-1">{value}</p>
    </div>
  );
}

function getInstagramHeroImages(feed: InstagramFeed) {
  if (!feed.configured) return [];

  return feed.items.flatMap((post) => {
    const media = post.media?.length
      ? post.media
      : [
          {
            id: post.id,
            imageUrl: post.imageUrl,
            mediaUrl: post.imageUrl,
            mediaType: "IMAGE",
          },
        ];

    return media
      .filter((item) => item.mediaType !== "VIDEO" && (item.imageUrl || item.mediaUrl))
      .map((item) => ({
        ...item,
        imageUrl: item.imageUrl ?? item.mediaUrl,
        caption: post.caption,
        timestamp: post.timestamp,
      }));
  });
}

function getShuffledImageQueue(length: number) {
  const indexes = Array.from({ length }, (_, index) => index);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  return indexes;
}

async function fetchJson<T>(url: string, signal: AbortSignal) {
  const response = await fetch(url, { cache: "no-store", signal });
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed with ${response.status}`);
  }

  return payload as T;
}
