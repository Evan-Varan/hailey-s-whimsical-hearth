import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  Coffee,
  Feather,
  Images,
  Mailbox,
  Notebook,
  Planet,
  UserCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { SectionHeader } from "@/components/SparkleField";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatJournalDate,
  getJournalTagLabel,
  type SubstackFeed,
  type SubstackPost,
} from "@/lib/substack";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hailey Adkins — Cozy Tales from a Stardust Cottage" },
      {
        name: "description",
        content:
          "A whimsical journal of tarot, crochet, dnd, horses, cats, astrology and slow magical living by Hailey Adkins.",
      },
      { property: "og:title", content: "Hailey Adkins — Cozy Tales from a Stardust Cottage" },
      {
        property: "og:description",
        content:
          "A whimsical journal of tarot, crochet, dnd, horses, cats and slow magical living.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [substack, setSubstack] = useState<SubstackFeed>();
  const [substackError, setSubstackError] = useState<string>();
  const [instagramImages, setInstagramImages] = useState<InstagramHeroImage[]>([]);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [heroImageQueue, setHeroImageQueue] = useState<number[]>([]);
  const liveFeatured = substack?.items.slice(0, 3) ?? [];
  const substackLoading = substack === undefined && !substackError;
  const heroImage = instagramImages[heroImageIndex];

  useEffect(() => {
    const controller = new AbortController();

    async function loadHomeFeeds() {
      try {
        const [substackResult, instagramResult] = await Promise.allSettled([
          fetchJson<SubstackFeed>("/api/substack", controller.signal),
          fetchJson<InstagramFeed>("/api/instagram?view=carousel", controller.signal),
        ]);

        if (controller.signal.aborted) return;

        if (substackResult.status === "fulfilled") {
          setSubstack(substackResult.value);
        } else {
          console.error(substackResult.reason);
          setSubstackError("Journal posts are unavailable right now.");
        }

        if (instagramResult.status === "fulfilled") {
          const images = getInstagramHeroImages(instagramResult.value);
          const queue = getShuffledImageQueue(images.length);
          setInstagramImages(images);
          setHeroImageQueue(queue.slice(1));
          setHeroImageIndex(queue[0] ?? 0);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setSubstackError("Journal posts are unavailable right now.");
      }
    }

    void loadHomeFeeds();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (instagramImages.length < 2) return;

    const interval = window.setInterval(() => {
      setHeroImageQueue((currentQueue) => {
        const queue = currentQueue.length ? currentQueue : getShuffledImageQueue(instagramImages.length);
        const [nextIndex, ...remainingQueue] = queue;

        setHeroImageIndex(nextIndex ?? 0);
        return remainingQueue;
      });
    }, 6000);

    return () => window.clearInterval(interval);
  }, [instagramImages.length]);

  return (
    <main>
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-20 md:pt-16 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <span className="tag-chip gold">Hailey's personal website</span>
            <h1 className="font-hand text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] mt-6">
              Hi, I'm
              <br />
              <span className="text-primary italic">Hailey.</span>
              <br />
              Welcome to my <span className="text-secondary-foreground">website.</span>
            </h1>
            <p className="font-serif-display text-lg md:text-xl text-muted-foreground mt-8 max-w-lg leading-relaxed">
              This is where I share what I'm making, writing, listening to, and loving lately:
              crochet, tarot, D&amp;D, cats, horses, and pieces of everyday life.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <Link to="/journal" className="btn-primary">
                Read the journal <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
              <Link to="/about" className="btn-ghost">
                <UserCircle weight="duotone" className="w-4 h-4" /> About Hailey
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-12 text-xs font-serif-display italic text-muted-foreground">
              <span className="flex items-center gap-2">
                <Feather weight="duotone" className="w-3 h-3 text-accent" /> Est. ’24
              </span>
              <span className="flex items-center gap-2">
                <BookOpenText weight="duotone" className="w-3 h-3 text-primary" /> 153 entries
              </span>
              <span className="flex items-center gap-2">
                <Coffee weight="duotone" className="w-3 h-3 text-secondary-foreground" /> 4.2k
                readers
              </span>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-secondary/40 blur-2xl animate-drift"
              aria-hidden
            />
            <div
              className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-accent/30 blur-3xl animate-drift"
              aria-hidden
            />
            <div className="relative paper-card overflow-hidden">
              {heroImage?.imageUrl ? (
                <>
                  <img
                    src={heroImage.imageUrl}
                    alt={heroImage.caption ?? "Instagram post"}
                    width={1280}
                    height={1280}
                    className="aspect-square w-full object-cover transition-opacity duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-hand text-foreground/80">
                    <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm">
                      ✦ from Instagram
                    </span>
                    <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm">
                      {heroImage.timestamp ? formatHeroImageDate(heroImage.timestamp) : ""}
                    </span>
                  </div>
                </>
              ) : (
                <Skeleton className="aspect-square w-full rounded-none" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader eyebrow="recently written" title="featured journal entries" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,384px))] justify-center gap-6 mt-12">
          {substackLoading
            ? Array.from({ length: 3 }, (_, index) => <JournalCardSkeleton key={index} />)
            : liveFeatured.map((post) => <FeaturedSubstackCard key={post.id} post={post} />)}
        </div>
        {!substackLoading && !liveFeatured.length ? (
          <p className="font-serif-display italic text-muted-foreground text-center mt-8">
            {substackError ?? "No journal posts are available right now."}
          </p>
        ) : null}
        <div className="text-center mt-12">
          <Link to="/journal" className="btn-ghost">
            browse the full journal <ArrowRight weight="bold" className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Live previews */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader eyebrow="look around" title="gallery and astrology" />
        <div className="grid lg:grid-cols-2 gap-6 mt-12">
          <GalleryPreviewCard images={instagramImages} />
          <AstrologyPreviewCard />
        </div>
      </section>

      {/* Quick wander */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader eyebrow="wander a little" title="where to next?" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <WanderCard
            to="/journal"
            title="Journal"
            note="recent entries, slow notes, and small magic"
            icon={<Notebook weight="duotone" className="w-5 h-5" />}
          />
          <WanderCard
            to="/gallery"
            title="Gallery"
            note="a little visual scrapbook"
            icon={<Images weight="duotone" className="w-5 h-5" />}
          />
          <WanderCard
            to="/astrology"
            title="Astrology"
            note="a daily map for the mood of the sky"
            icon={<Planet weight="duotone" className="w-5 h-5" />}
          />
          <WanderCard
            to="/about"
            title="About Hailey"
            note="hello, friend — come in, sit by the fire"
            icon={<UserCircle weight="duotone" className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* Newsletter teaser */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="paper-card p-10 md:p-16 text-center relative overflow-hidden">
          <div
            className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-secondary/40 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-accent/30 blur-3xl"
            aria-hidden
          />
          <Mailbox weight="duotone" className="w-6 h-6 text-accent mx-auto" />
          <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-4">
            Letters from the cottage
          </h2>
          <p className="font-serif-display italic text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
            One slow letter a month — tarot pulls, free patterns, what I'm reading, and small notes
            from the woods.
          </p>
          <form
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="your email, gentle reader"
              className="flex-1 px-5 py-3 rounded-full bg-card border border-border focus:border-primary focus:outline-none font-serif-display text-foreground placeholder:text-muted-foreground"
            />
            <button type="submit" className="btn-primary justify-center">
              Subscribe <Feather weight="duotone" className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function GalleryPreviewCard({ images }: { images: InstagramHeroImage[] }) {
  const previewImages = useMemo(() => getShuffledImages(images).slice(0, 4), [images]);

  return (
    <Link to="/gallery" className="paper-card group overflow-hidden">
      <div className="grid grid-cols-2 gap-1 bg-muted">
        {previewImages.length
          ? previewImages.map((image) => (
              <img
                key={image.id}
                src={image.imageUrl}
                alt={image.caption ?? ""}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ))
          : Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="aspect-square rounded-none" />
            ))}
      </div>
      <div className="p-6">
        <span className="tag-chip rose">gallery</span>
        <h3 className="font-hand text-4xl text-foreground mt-3">Lately from Hailey</h3>
        <p className="font-serif-display italic text-muted-foreground mt-2">
          Recent photos, projects, outfits, tiny moments, and whatever made it onto Instagram.
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm group-hover:gap-3 transition-all">
          open the gallery <ArrowRight weight="bold" className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

function getShuffledImages<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function AstrologyPreviewCard() {
  return (
    <Link to="/astrology" className="paper-card group overflow-hidden p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="tag-chip gold">astrology</span>
          <h3 className="font-hand text-4xl text-foreground mt-3">Today's sky</h3>
        </div>
        <Planet weight="duotone" className="h-8 w-8 text-primary" />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {["Sun", "Moon", "Rising", "Venus", "Mars", "Mercury"].map((label) => (
          <div key={label} className="rounded-xl border border-border bg-card/70 p-3 text-center">
            <p className="font-sans-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
            <p className="font-hand text-2xl text-foreground mt-1">✦</p>
          </div>
        ))}
      </div>

      <p className="font-serif-display italic text-muted-foreground mt-6">
        Check the daily mood, transits, and sign notes when you want a quick read on the day.
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm group-hover:gap-3 transition-all">
        read the forecast <ArrowRight weight="bold" className="w-3 h-3" />
      </span>
    </Link>
  );
}

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

function formatHeroImageDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
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

function FeaturedSubstackCard({ post }: { post: SubstackPost }) {
  return (
    <article className="paper-card overflow-hidden flex flex-col">
      <div className="relative h-56 overflow-hidden">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <span className="cat-stamp absolute top-3 left-3">
          <span className="dot" /> {getJournalTagLabel(post.title, post.tags[0] ?? "Substack")}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs font-serif-display italic text-muted-foreground">
          <span>{formatJournalDate(post.publishedAt, false)}</span>
          <span>·</span>
          <span>{post.read}</span>
        </div>
        <h3 className="font-hand text-3xl text-foreground mt-3 leading-tight">{post.title}</h3>
        <p className="font-serif-display text-muted-foreground mt-3 italic flex-1">
          {post.excerpt}
        </p>
        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm hover:gap-3 transition-all"
        >
          read on Substack <ArrowRight weight="bold" className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
}

function JournalCardSkeleton() {
  return (
    <article className="paper-card overflow-hidden flex flex-col">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-6 flex flex-col flex-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-4/5 mt-4" />
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-2/3 mt-2" />
        <Skeleton className="h-4 w-24 mt-6" />
      </div>
    </article>
  );
}

function WanderCard({
  to,
  title,
  note,
  icon,
}: {
  to: "/journal" | "/astrology" | "/gallery" | "/about";
  title: string;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <Link to={to} className="paper-card p-8 group">
      <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center text-forest dark:text-foreground group-hover:bg-accent/40 transition-colors">
        {icon}
      </div>
      <p className="font-hand text-4xl mt-4 text-foreground">{title}</p>
      <p className="font-serif-display italic text-muted-foreground mt-2">{note}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm group-hover:gap-3 transition-all">
        wander in <ArrowRight weight="bold" className="w-3 h-3" />
      </span>
    </Link>
  );
}
