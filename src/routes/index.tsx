import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  Coffee,
  Feather,
  Images,
  Mailbox,
  MoonStars,
  Notebook,
  PinterestLogo,
  Planet,
  Sparkle,
  SunDim,
  UserCircle,
  VinylRecord,
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
  const [spotifyNowPlaying, setSpotifyNowPlaying] = useState<SpotifyNowPlaying>();
  const [spotifyTopTracks, setSpotifyTopTracks] = useState<SpotifyTopTracks>();
  const [pinterest, setPinterest] = useState<PinterestFeed>();
  const [animalFact, setAnimalFact] = useState<DailyAnimalFact>();
  const [funFact, setFunFact] = useState<DailyFunFact>();
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [heroImageQueue, setHeroImageQueue] = useState<number[]>([]);
  const liveFeatured = substack?.items.slice(0, 3) ?? [];
  const substackLoading = substack === undefined && !substackError;
  const heroImage = instagramImages[heroImageIndex];

  useEffect(() => {
    const controller = new AbortController();

    async function loadHomeFeeds() {
      try {
        const [
          substackResult,
          instagramResult,
          spotifyNowPlayingResult,
          spotifyTopTracksResult,
          pinterestResult,
          animalFactResult,
          funFactResult,
        ] = await Promise.allSettled([
          fetchJson<SubstackFeed>("/api/substack", controller.signal),
          fetchJson<InstagramFeed>("/api/instagram?view=carousel", controller.signal),
          fetchJson<SpotifyNowPlaying>("/api/spotify/now-playing", controller.signal),
          fetchJson<SpotifyTopTracks>("/api/spotify/top-tracks?limit=1", controller.signal),
          fetchJson<PinterestFeed>("/api/pinterest?limit=6", controller.signal),
          fetchJson<DailyAnimalFact>("/api/animal-fact", controller.signal),
          fetchJson<DailyFunFact>("/api/fun-fact", controller.signal),
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

        if (spotifyNowPlayingResult.status === "fulfilled") {
          setSpotifyNowPlaying(spotifyNowPlayingResult.value);
        }
        if (spotifyTopTracksResult.status === "fulfilled") {
          setSpotifyTopTracks(spotifyTopTracksResult.value);
        }
        if (pinterestResult.status === "fulfilled") setPinterest(pinterestResult.value);
        if (animalFactResult.status === "fulfilled") setAnimalFact(animalFactResult.value);
        if (funFactResult.status === "fulfilled") setFunFact(funFactResult.value);
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
        const queue = currentQueue.length
          ? currentQueue
          : getShuffledImageQueue(instagramImages.length);
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

      {/* Dashboard preview */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <SectionHeader eyebrow="dashboard" title="what's alive here" />
        <div className="grid lg:grid-cols-6 gap-4 mt-10">
          <SpotifyMiniPreview nowPlaying={spotifyNowPlaying} topTracks={spotifyTopTracks} />
          <PinterestMiniPreview pinterest={pinterest} />
          <FactsMiniPreview animalFact={animalFact} funFact={funFact} />
        </div>
      </section>

      {/* Newsletter teaser */}
      <section className="mt-28 mb-20 relative overflow-hidden px-6">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-accent/5 blur-[120px] -z-10"
          aria-hidden
        />

        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <span className="tag-chip rose">stay in touch</span>
            <h2 className="font-hand text-6xl md:text-7xl text-foreground leading-[0.9]">
              Letters from the <span className="text-primary italic">cottage</span>
            </h2>
            <div className="font-serif-display text-lg text-muted-foreground space-y-4 max-w-md">
              <p>
                One slow letter a month — tarot pulls, free patterns, what I'm reading, and small
                notes from the woods. No noise, just a little magic in your inbox.
              </p>
            </div>

            <div className="flex items-center gap-2 text-accent/60 pt-2">
              <Sparkle weight="fill" className="w-3 h-3 animate-twinkle" />
              <Sparkle
                weight="fill"
                className="w-2 h-2 animate-twinkle"
                style={{ animationDelay: "1s" }}
              />
              <Sparkle
                weight="fill"
                className="w-3 h-3 animate-twinkle"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          </div>

          <div className="paper-card p-1 relative overflow-hidden">
            <div className="bg-card/50 p-8 md:p-12 rounded-[calc(var(--radius-2xl)-4px)] text-center sm:text-left">
              <form
                className="flex flex-col sm:flex-row gap-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="flex-1">
                  <label className="block text-left mb-2">
                    <span className="font-sans-ui text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                      Email address
                    </span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your email, gentle reader"
                    className="contact-input w-full"
                  />
                </div>
                <div className="sm:pt-6">
                  <button type="submit" className="btn-primary w-full sm:w-auto px-8 py-3.5 group">
                    Subscribe
                    <Feather
                      weight="duotone"
                      className="w-4 h-4 transition-transform group-hover:rotate-12"
                    />
                  </button>
                </div>
              </form>
              <p className="mt-4 font-serif-display italic text-sm text-muted-foreground">
                Join 4.2k readers. Unsubscribe anytime.
              </p>
            </div>
          </div>
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
  const reading = getHomeAstrologyPreview();

  return (
    <Link to="/astrology" className="paper-card group overflow-hidden p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="tag-chip gold">astrology</span>
          <h3 className="font-hand text-4xl text-foreground mt-3">Daily astrology</h3>
          <p className="font-serif-display italic text-sm text-muted-foreground mt-2">
            {reading.date}
          </p>
        </div>
        <Planet weight="duotone" className="h-8 w-8 text-primary" />
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        <AstrologyStat
          icon={<SunDim weight="duotone" />}
          label="today's sign"
          value={reading.sign}
          note={reading.tone}
        />
        <AstrologyStat
          icon={<MoonStars weight="duotone" />}
          label="moon"
          value={reading.moonPhase}
          note={reading.focus}
        />
        <AstrologyStat
          icon={<Sparkle weight="duotone" />}
          label="ritual"
          value={reading.ritualTitle}
          note={reading.ritual}
        />
      </div>

      <p className="font-serif-display italic text-muted-foreground mt-6">
        Today's quick read leans toward <em>{reading.focus}</em>. The full page expands this into
        your sign, live transits, a horoscope, and a longer ritual.
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm group-hover:gap-3 transition-all">
        read the forecast <ArrowRight weight="bold" className="w-3 h-3" />
      </span>
    </Link>
  );
}

function AstrologyStat({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-3">
      <div className="flex items-center gap-2 text-primary [&_svg]:h-4 [&_svg]:w-4">{icon}</div>
      <p className="font-sans-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-3">
        {label}
      </p>
      <p className="font-hand text-2xl leading-none text-foreground mt-1">{value}</p>
      <p className="line-clamp-2 font-serif-display italic text-xs text-muted-foreground mt-2">
        {note}
      </p>
    </div>
  );
}

function getHomeAstrologyPreview() {
  const signs = [
    { name: "Aries", tone: "begin again" },
    { name: "Taurus", tone: "tend the body" },
    { name: "Gemini", tone: "say the true thing" },
    { name: "Cancer", tone: "come home to yourself" },
    { name: "Leo", tone: "let warmth lead" },
    { name: "Virgo", tone: "make one small order" },
    { name: "Libra", tone: "choose harmony" },
    { name: "Scorpio", tone: "trust the deep knowing" },
    { name: "Sagittarius", tone: "follow the far light" },
    { name: "Capricorn", tone: "build with patience" },
    { name: "Aquarius", tone: "think wider" },
    { name: "Pisces", tone: "soften the edges" },
  ] as const;
  const moonPhases = [
    "new moon",
    "waxing crescent",
    "first quarter",
    "waxing gibbous",
    "full moon",
    "waning gibbous",
    "last quarter",
    "waning crescent",
  ];
  const focuses = [
    "home and roots",
    "daily rituals",
    "creative courage",
    "friendship and belonging",
    "work worth doing",
    "rest and repair",
    "clear agreements",
    "care and enoughness",
  ];
  const rituals = [
    { title: "candle note", text: "write one sentence before lighting a candle" },
    { title: "clear surface", text: "reset one small table, shelf, or corner" },
    { title: "tea pause", text: "let the first sip be the whole ceremony" },
    { title: "soft yes", text: "choose one honest yes and one kind no" },
    { title: "hands on earth", text: "touch yarn, soil, paper, or warm water" },
    { title: "moon list", text: "name what can be released by evening" },
  ];
  const today = new Date();
  const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const seed = Array.from(key).reduce((total, char) => total + char.charCodeAt(0), 0);
  const sign = signs[seed % signs.length];
  const formatter = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const ritual = rituals[(seed + 3) % rituals.length];

  return {
    date: formatter.format(today),
    sign: sign.name,
    tone: sign.tone,
    moonPhase: moonPhases[(seed + 2) % moonPhases.length],
    focus: focuses[(seed + 4) % focuses.length],
    ritualTitle: ritual.title,
    ritual: ritual.text,
  };
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

type SpotifyTrack = {
  name: string;
  artists: string[];
  album: string;
  imageUrl?: string;
  spotifyUrl: string;
  isPlaying?: boolean;
};

type SpotifyTopTracks = {
  configured: boolean;
  items: SpotifyTrack[];
  error?: string;
};

type SpotifyNowPlaying = {
  configured: boolean;
  playing: SpotifyTrack | null;
  error?: string;
};

type PinterestFeed = {
  configured: boolean;
  items: Array<{
    id: string;
    title: string;
    imageUrl?: string;
    link: string;
  }>;
  error?: string;
};

type DailyAnimalFact = {
  name: string;
  fact: string;
  imageUrl?: string;
};

type DailyFunFact = {
  fact: string;
  imageUrl?: string;
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

function DashboardCard({
  eyebrow,
  title,
  icon,
  to,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  to: "/gallery" | "/astrology" | "/about" | "/animal-facts";
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card/80 p-4 transition-colors hover:border-primary lg:col-span-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>
          <h3 className="font-hand text-3xl leading-none text-foreground mt-1">{title}</h3>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary/40 text-forest transition-colors group-hover:bg-accent/40 dark:text-foreground">
          {icon}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </Link>
  );
}

function SpotifyMiniPreview({
  nowPlaying,
  topTracks,
}: {
  nowPlaying: SpotifyNowPlaying | undefined;
  topTracks: SpotifyTopTracks | undefined;
}) {
  const track = nowPlaying?.playing ?? topTracks?.items[0];
  const title = nowPlaying?.playing?.isPlaying ? "currently listening" : "top song this month";

  return (
    <DashboardCard
      eyebrow="spotify"
      title={title}
      to="/gallery"
      icon={<VinylRecord weight="duotone" className="w-5 h-5" />}
    >
      {track ? (
        <div className="flex items-center gap-3">
          {track.imageUrl ? (
            <img src={track.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-muted">
              <VinylRecord weight="duotone" className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-serif-display italic text-foreground">{track.name}</p>
            <p className="truncate font-serif-display italic text-sm text-muted-foreground">
              {track.artists.join(", ")}
            </p>
          </div>
        </div>
      ) : (
        <p className="font-serif-display italic text-sm text-muted-foreground">
          {nowPlaying?.configured === false || topTracks?.configured === false
            ? "Spotify can be connected here."
            : "Top song is not showing yet."}
        </p>
      )}
    </DashboardCard>
  );
}

function PinterestMiniPreview({ pinterest }: { pinterest: PinterestFeed | undefined }) {
  const pins = pinterest?.items.filter((pin) => pin.imageUrl).slice(0, 3) ?? [];
  const comingSoon = pinterest?.configured === false;

  return (
    <DashboardCard
      eyebrow="coming soon"
      title={comingSoon ? "Pinterest inspiration" : "recent saves"}
      to="/gallery"
      icon={<PinterestLogo weight="duotone" className="w-5 h-5" />}
    >
      {comingSoon ? (
        <p className="font-serif-display italic text-sm text-muted-foreground">
          A peek at Hailey's saved ideas and favorite inspiration is coming soon.
        </p>
      ) : pins.length ? (
        <div className="grid grid-cols-3 gap-1.5">
          {pins.map((pin) => (
            <img
              key={pin.id}
              src={pin.imageUrl}
              alt={pin.title}
              className="aspect-[3/4] rounded-lg object-cover"
              loading="lazy"
            />
          ))}
        </div>
      ) : (
        <p className="font-serif-display italic text-sm text-muted-foreground">
          Recent pins will appear here.
        </p>
      )}
    </DashboardCard>
  );
}

function FactsMiniPreview({
  animalFact,
  funFact,
}: {
  animalFact: DailyAnimalFact | undefined;
  funFact: DailyFunFact | undefined;
}) {
  return (
    <DashboardCard
      eyebrow="facts"
      title={animalFact?.name ?? "daily facts"}
      to="/animal-facts"
      icon={<Sparkle weight="duotone" className="w-5 h-5" />}
    >
      <p className="line-clamp-2 font-serif-display italic text-sm text-muted-foreground">
        {animalFact?.fact ?? funFact?.fact ?? "Animal facts and general trivia load here daily."}
      </p>
    </DashboardCard>
  );
}
