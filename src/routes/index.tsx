import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  Images,
  MoonStars,
  PinterestLogo,
  Planet,
  Sparkle,
  SunDim,
  VinylRecord,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

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
    <main className="pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="container-wide section-gap">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <span className="tag-chip gold">Welcome to my corner of the internet</span>
            <h1 className="mt-6 font-hand text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.05]">
              Hi, I&apos;m Hailey.
              <br />
              <span className="text-primary">This is my</span>
              <br />
              <span className="text-muted-foreground">digital hearth.</span>
            </h1>
            <p className="mt-8 font-serif-display text-lg text-muted-foreground leading-relaxed max-w-lg">
              A cozy space where I share what I&apos;m making, writing, and loving lately — crochet, 
              tarot, D&amp;D adventures, cats, horses, and everyday magic.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/journal" className="btn-primary">
                Read the journal
                <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
              <Link to="/about" className="btn-ghost">
                About me
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center gap-8">
              <Stat label="Journal entries" value="153" />
              <Stat label="Readers" value="4.2k" />
              <Stat label="Since" value="2024" />
            </div>
          </div>

          {/* Hero Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                {heroImage?.imageUrl ? (
                  <img
                    src={heroImage.imageUrl}
                    alt={heroImage.caption ?? "A glimpse of my life"}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                ) : (
                  <Skeleton className="w-full h-full rounded-none" />
                )}
                
                {/* Floating badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 font-sans-ui text-xs font-medium text-foreground">
                    From Instagram
                  </span>
                  {heroImage?.timestamp && (
                    <span className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 font-sans-ui text-xs font-medium text-muted-foreground">
                      {formatHeroImageDate(heroImage.timestamp)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 -top-4 -right-4 w-full h-full rounded-2xl border border-border bg-muted/50" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Journal Section */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container-wide section-gap">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <span className="tag-chip sage">Recently written</span>
              <h2 className="mt-3 font-hand text-4xl md:text-5xl text-foreground">
                Featured journal entries
              </h2>
            </div>
            <Link to="/journal" className="btn-link">
              View all entries
              <ArrowRight weight="bold" className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {substackLoading
              ? Array.from({ length: 3 }, (_, index) => <JournalCardSkeleton key={index} />)
              : liveFeatured.map((post) => <FeaturedJournalCard key={post.id} post={post} />)}
          </div>

          {!substackLoading && !liveFeatured.length && (
            <p className="text-center font-serif-display text-muted-foreground mt-8">
              {substackError ?? "No journal posts are available right now."}
            </p>
          )}
        </div>
      </section>

      {/* Explore Section */}
      <section className="container-wide section-gap">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="tag-chip rose">Explore more</span>
            <h2 className="mt-3 font-hand text-4xl md:text-5xl text-foreground">
              Gallery & Astrology
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <GalleryPreviewCard images={instagramImages} />
          <AstrologyPreviewCard />
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container-wide section-gap">
          <div className="mb-10">
            <span className="tag-chip gold">Dashboard</span>
            <h2 className="mt-3 font-hand text-4xl md:text-5xl text-foreground">
              What&apos;s happening
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SpotifyMiniPreview nowPlaying={spotifyNowPlaying} topTracks={spotifyTopTracks} />
            <PinterestMiniPreview pinterest={pinterest} />
            <FactsMiniPreview animalFact={animalFact} funFact={funFact} />
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container-narrow section-gap">
        <div className="text-center">
          <span className="tag-chip sage">Stay connected</span>
          <h2 className="mt-4 font-hand text-4xl md:text-5xl text-foreground">
            Letters from the cottage
          </h2>
          <p className="mt-4 font-serif-display text-lg text-muted-foreground max-w-md mx-auto">
            One slow letter a month — tarot pulls, free patterns, and small notes from my world.
          </p>

          <form
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-5 py-3 rounded-full bg-card border border-border focus:border-primary focus:outline-none font-serif-display text-foreground placeholder:text-muted-foreground"
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Components                                  */
/* -------------------------------------------------------------------------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-hand text-2xl text-foreground">{value}</p>
      <p className="font-sans-ui text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function FeaturedJournalCard({ post }: { post: SubstackPost }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <BookOpenText weight="duotone" className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        <span className="absolute top-3 left-3 cat-stamp">
          <span className="dot" />
          {getJournalTagLabel(post.title, post.tags[0] ?? "Journal")}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-xs font-sans-ui text-muted-foreground">
          <span>{formatJournalDate(post.publishedAt, false)}</span>
          <span className="text-border">·</span>
          <span>{post.read}</span>
        </div>

        <h3 className="mt-3 font-hand text-2xl text-foreground leading-tight group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        <p className="mt-2 font-serif-display text-muted-foreground line-clamp-2 flex-1">
          {post.excerpt}
        </p>

        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 btn-link text-sm"
        >
          Read on Substack
          <ArrowRight weight="bold" className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}

function JournalCardSkeleton() {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-28 mt-2" />
      </div>
    </article>
  );
}

function GalleryPreviewCard({ images }: { images: InstagramHeroImage[] }) {
  const previewImages = useMemo(() => getShuffledImages(images).slice(0, 4), [images]);

  return (
    <Link 
      to="/gallery" 
      className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="grid grid-cols-2 gap-0.5 bg-border">
        {previewImages.length
          ? previewImages.map((image) => (
              <div key={image.id} className="aspect-square overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.caption ?? ""}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))
          : Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="aspect-square rounded-none" />
            ))}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Images weight="duotone" className="w-4 h-4" />
          <span className="font-sans-ui text-xs uppercase tracking-wider">Gallery</span>
        </div>
        <h3 className="font-hand text-2xl text-foreground group-hover:text-primary transition-colors">
          Lately from Hailey
        </h3>
        <p className="mt-2 font-serif-display text-sm text-muted-foreground">
          Recent photos, projects, and tiny moments from Instagram.
        </p>
        <span className="mt-4 btn-link text-sm">
          Open gallery
          <ArrowRight weight="bold" className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}

function AstrologyPreviewCard() {
  const reading = getHomeAstrologyPreview();

  return (
    <Link 
      to="/astrology" 
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden p-5 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Planet weight="duotone" className="w-4 h-4" />
            <span className="font-sans-ui text-xs uppercase tracking-wider">Astrology</span>
          </div>
          <h3 className="font-hand text-2xl text-foreground group-hover:text-primary transition-colors">
            Daily forecast
          </h3>
          <p className="mt-1 font-sans-ui text-xs text-muted-foreground">
            {reading.date}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <AstrologyStat
          icon={<SunDim weight="duotone" className="w-4 h-4" />}
          label="Sign"
          value={reading.sign}
        />
        <AstrologyStat
          icon={<MoonStars weight="duotone" className="w-4 h-4" />}
          label="Moon"
          value={reading.moonPhase}
        />
        <AstrologyStat
          icon={<Sparkle weight="duotone" className="w-4 h-4" />}
          label="Focus"
          value={reading.focus}
        />
      </div>

      <p className="mt-5 font-serif-display text-sm text-muted-foreground flex-1">
        Today&apos;s energy leans toward <em>{reading.tone}</em>. Check the full forecast for 
        your sign, transits, and a daily ritual.
      </p>

      <span className="mt-4 btn-link text-sm">
        Read forecast
        <ArrowRight weight="bold" className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}

function AstrologyStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="text-primary">{icon}</div>
      <p className="mt-2 font-sans-ui text-[0.625rem] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-hand text-lg text-foreground leading-tight truncate">
        {value}
      </p>
    </div>
  );
}

function DashboardCard({
  icon,
  label,
  title,
  to,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  to: "/gallery" | "/astrology" | "/about" | "/animal-facts";
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        {icon}
        <span className="font-sans-ui text-xs uppercase tracking-wider">{label}</span>
      </div>
      <h3 className="font-hand text-xl text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <div className="mt-3 flex-1">{children}</div>
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
  const title = nowPlaying?.playing?.isPlaying ? "Now playing" : "Top track";

  return (
    <DashboardCard
      icon={<VinylRecord weight="duotone" className="w-4 h-4" />}
      label="Spotify"
      title={title}
      to="/gallery"
    >
      {track ? (
        <div className="flex items-center gap-3">
          {track.imageUrl ? (
            <img 
              src={track.imageUrl} 
              alt="" 
              className="h-12 w-12 rounded-lg object-cover flex-shrink-0" 
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <VinylRecord weight="duotone" className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-serif-display text-foreground truncate">{track.name}</p>
            <p className="font-serif-display text-sm text-muted-foreground truncate">
              {track.artists.join(", ")}
            </p>
          </div>
        </div>
      ) : (
        <p className="font-serif-display text-sm text-muted-foreground">
          {nowPlaying?.configured === false || topTracks?.configured === false
            ? "Spotify can be connected here."
            : "Loading music..."}
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
      icon={<PinterestLogo weight="duotone" className="w-4 h-4" />}
      label="Pinterest"
      title={comingSoon ? "Coming soon" : "Recent saves"}
      to="/gallery"
    >
      {comingSoon ? (
        <p className="font-serif-display text-sm text-muted-foreground">
          A peek at saved ideas and inspiration is coming soon.
        </p>
      ) : pins.length ? (
        <div className="grid grid-cols-3 gap-1.5">
          {pins.map((pin) => (
            <img
              key={pin.id}
              src={pin.imageUrl}
              alt={pin.title}
              className="aspect-square rounded-lg object-cover"
              loading="lazy"
            />
          ))}
        </div>
      ) : (
        <p className="font-serif-display text-sm text-muted-foreground">
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
      icon={<Sparkle weight="duotone" className="w-4 h-4" />}
      label="Daily fact"
      title={animalFact?.name ?? "Animal facts"}
      to="/animal-facts"
    >
      <p className="font-serif-display text-sm text-muted-foreground line-clamp-3">
        {animalFact?.fact ?? funFact?.fact ?? "Animal facts and trivia load here daily."}
      </p>
    </DashboardCard>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                    */
/* -------------------------------------------------------------------------- */

function getHomeAstrologyPreview() {
  const signs = [
    { name: "Aries", tone: "beginning again" },
    { name: "Taurus", tone: "tending the body" },
    { name: "Gemini", tone: "speaking truth" },
    { name: "Cancer", tone: "coming home" },
    { name: "Leo", tone: "letting warmth lead" },
    { name: "Virgo", tone: "making order" },
    { name: "Libra", tone: "choosing harmony" },
    { name: "Scorpio", tone: "trusting intuition" },
    { name: "Sagittarius", tone: "following light" },
    { name: "Capricorn", tone: "building patience" },
    { name: "Aquarius", tone: "thinking wider" },
    { name: "Pisces", tone: "softening edges" },
  ] as const;

  const moonPhases = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ];

  const focuses = [
    "Home",
    "Rituals",
    "Creativity",
    "Community",
    "Work",
    "Rest",
    "Clarity",
    "Care",
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

  return {
    date: formatter.format(today),
    sign: sign.name,
    tone: sign.tone,
    moonPhase: moonPhases[(seed + 2) % moonPhases.length],
    focus: focuses[(seed + 4) % focuses.length],
  };
}

function getShuffledImages<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getShuffledImageQueue(length: number) {
  const indexes = Array.from({ length }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
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

function getInstagramHeroImages(feed: InstagramFeed) {
  if (!feed.configured) return [];
  return feed.items.flatMap((post) => {
    const media = post.media?.length
      ? post.media
      : [{ id: post.id, imageUrl: post.imageUrl, mediaUrl: post.imageUrl, mediaType: "IMAGE" }];
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

async function fetchJson<T>(url: string, signal: AbortSignal) {
  const response = await fetch(url, { cache: "no-store", signal });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed with ${response.status}`);
  }
  return payload as T;
}

/* -------------------------------------------------------------------------- */
/*                                   Types                                     */
/* -------------------------------------------------------------------------- */

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
