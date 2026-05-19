import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  Envelope,
  EnvelopeOpen,
  InstagramLogo,
  PaperPlaneTilt,
  Sparkle,
} from "@phosphor-icons/react";
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
      { title: "The Maker — Hailey Adkins" },
      {
        name: "description",
        content:
          "Meet Hailey, the quiet maker behind the stardust cottage journal, and send her a note.",
      },
      { property: "og:title", content: "The Maker — Hailey Adkins" },
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
    <main className="max-w-7xl mx-auto px-6 py-24 animate-ink">
      <section className="grid lg:grid-cols-[1fr_480px] gap-20 items-center mb-32">
        <div className="space-y-10">
          <div className="inline-block">
            <span className="tag-chip rose">hello, friend</span>
          </div>
          <h1 className="font-display italic text-7xl md:text-8xl lg:text-9xl text-foreground leading-[0.85] tracking-tight">
            A quiet maker of <span className="text-primary relative">
              magical
               <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary/20" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,5 Q25,0 50,5 T100,5" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span> things
          </h1>
          <div className="font-serif italic text-xl md:text-2xl text-foreground/80 leading-relaxed space-y-6 max-w-2xl border-l-2 border-primary/10 pl-8">
            <p>
              I'm Hailey: perpetually mid-project, fond of slow mornings, and happiest when a week
              has room for a tarot pull, a crochet row, a horse visit, and a cat interrupting the whole thing.
            </p>
            <p>
              This site is a little paper-and-ink place for the things that make life softer:
              journal notes, daily astrology, visual scraps, music, and the tiny rituals that hold a day together.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/journal" className="btn-primary">
              Read the journal
            </Link>
            <a href="#contact" className="btn-ghost">
              Send a note
            </a>
          </div>
        </div>

        <div className="relative">
           {/* Decorative elements */}
           <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent/10 blur-[100px] -z-10 animate-drift" />
           <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/10 blur-[100px] -z-10 animate-drift" style={{ animationDelay: "1.5s" }} />

          <div className="paper-card p-2 rotate-2 hover:rotate-0 transition-transform duration-700 group shadow-soft">
            {heroImage?.imageUrl ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1px]">
                <img
                  src={heroImage.imageUrl}
                  alt={heroImage.caption ?? "Instagram post"}
                  className="w-full h-full object-cover transition-opacity duration-700 grayscale-[0.2] group-hover:grayscale-0"
                />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="cat-stamp text-xs backdrop-blur-md">
                    from Instagram
                  </span>
                  <InstagramLogo weight="duotone" className="h-8 w-8 text-white/80" />
                </div>
              </div>
            ) : (
              <Skeleton className="aspect-[4/5] w-full rounded-none" />
            )}
          </div>
          
          
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-48">
        <Fact label="currently making" value="crochet, notes, small rituals" i={0} />
        <Fact label="favorite themes" value="tarot, cats, horses, astrology" i={1} />
        <Fact label="best reached for" value="kind notes and collaborations" i={2} />
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-32 border-t border-border/20">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-20 items-start">
          <div className="space-y-8 lg:sticky lg:top-48">
            <span className="tag-chip rose">get in touch</span>
            <h2 className="font-display italic text-6xl md:text-8xl text-foreground leading-[0.85] tracking-tight">
              Mail <span className="text-primary">Hailey</span>
            </h2>
            <div className="font-serif italic text-xl text-muted-foreground space-y-6 max-w-md leading-relaxed">
              <p>
                Whether you have a question about a pattern, a thought on a recent tarot
                pull, or just want to share a piece of your day—my inbox is always open.
              </p>
              <div className="marginalia text-primary text-2xl">
                I reply over morning tea.
              </div>
            </div>

            <div className="pt-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/60">
                  <EnvelopeOpen weight="duotone" className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="font-marginalia text-primary/40 text-lg">Prefer direct email?</p>
                  <a
                    href="mailto:haileyliz1130@gmail.com"
                    className="font-display italic text-2xl text-foreground hover:text-primary transition-colors border-b border-primary/20 pb-0.5"
                  >
                    haileyliz1130@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-accent/40 pt-4">
              <Sparkle weight="fill" className="w-4 h-4 animate-twinkle" />
              <Sparkle weight="fill" className="w-3 h-3 animate-twinkle" style={{ animationDelay: "1s" }} />
              <Sparkle weight="fill" className="w-4 h-4 animate-twinkle" style={{ animationDelay: "0.5s" }} />
            </div>
          </div>

          <div className="paper-card p-1 relative overflow-hidden bg-card/60 shadow-soft">
            <div className="p-10 md:p-16">
              {contactStatus === "sent" ? (
                <div className="py-24 text-center animate-ink">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 text-primary mb-8 border border-primary/10 animate-float">
                    <PaperPlaneTilt weight="duotone" className="h-10 w-10" />
                  </div>
                  <h3 className="font-display italic text-5xl text-foreground mb-4">Message sent!</h3>
                  <p className="font-serif italic text-xl text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. I'll read your note with my next cup of tea.
                  </p>
                  <button
                    onClick={() => setContactStatus("idle")}
                    className="marginalia text-2xl text-primary hover:text-secondary transition-colors mt-12 block mx-auto"
                  >
                    ← Send another note
                  </button>
                </div>
              ) : (
                <form className="space-y-10" onSubmit={submitContact}>
                  <div className="grid sm:grid-cols-2 gap-12">
                    <Field label="Your name">
                      <input
                        name="name"
                        required
                        className="contact-input text-lg"
                        placeholder="gentle reader"
                      />
                    </Field>
                    <Field label="Email address">
                      <input
                        name="email"
                        type="email"
                        required
                        className="contact-input text-lg"
                        placeholder="reader@example.com"
                      />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-[0.8fr_1.2fr] gap-12">
                    <Field label="Topic">
                      <select name="topic" className="contact-input appearance-none bg-transparent cursor-pointer italic text-lg">
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
                        className="contact-input text-lg"
                        placeholder="a small note..."
                      />
                    </Field>
                  </div>
                  <Field label="Message">
                    <textarea
                      name="message"
                      required
                      rows={6}
                      className="contact-input resize-none italic text-lg"
                      placeholder="Write your note here..."
                    />
                  </Field>

                  <div className="flex flex-col gap-8 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-h-[1.5rem]">
                      {contactError ? (
                        <p className="font-serif italic text-destructive text-lg">
                          {contactError}
                        </p>
                      ) : contactStatus === "draft" ? (
                        <p className="font-marginalia text-primary text-xl">
                          Email draft opened in your mail app.
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="submit"
                      className="btn-primary px-12 py-4 text-xl group"
                      disabled={contactStatus === "sending"}
                    >
                      {contactStatus === "sending" ? (
                        "Sending..."
                      ) : (
                        <>
                          Send note
                          <PaperPlaneTilt
                            weight="duotone"
                            className="w-5 h-5 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block group">
      <span className="font-marginalia text-lg text-primary/60 transition-colors group-focus-within:text-primary">
        {label}
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function Fact({ label, value, i }: { label: string; value: string; i: number }) {
  return (
    <div 
      className="paper-card p-10 text-center bg-card/40 hover:bg-card transition-all group"
      style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 1}deg)` }}
    >
      <div className="flex justify-center mb-4 text-primary/10 group-hover:text-primary/30 transition-colors">
        <Sparkle weight="fill" className="w-8 h-8 animate-twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
      </div>
      <p className="font-marginalia text-lg text-primary/50 italic">{label}</p>
      <p className="font-display italic text-3xl text-foreground mt-3 leading-tight">{value}</p>
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
