import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  Coffee,
  Feather,
  Images,
  Mailbox,
  MoonStars,
  MusicNotes,
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
  const liveFeatured = substack?.items?.slice(0, 3) ?? [];
  const substackLoading = substack === undefined && !substackError;
  const heroImage = instagramImages[heroImageIndex];
  
  const latestEntry = substack?.items?.[0];
  const activeTrack = spotifyNowPlaying?.playing ?? spotifyTopTracks?.items?.[0];

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
    <main className="overflow-hidden">
      {/* Hero: The Desk Scene */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 md:pt-36 md:pb-48">
        <div className="relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
          <div className="space-y-8 animate-ink">
            <div className="inline-block">
              <span className="tag-chip gold">welcome to my cottage</span>
            </div>
            <h1 className="font-display italic text-7xl md:text-8xl lg:text-9xl text-foreground leading-[0.85] tracking-tight">
              Hi, I'm
              <br />
              <span className="text-primary italic">Hailey.</span>
              <br />
              Welcome to my <span className="text-secondary-foreground">website.</span>
            </h1>
            <p className="font-serif italic text-xl md:text-2xl text-muted-foreground max-w-lg leading-relaxed">
              Sharing slow mornings, journal notes, and the tiny rituals that hold a day together.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/journal" className="btn-primary">
                Read the journal
              </Link>
              <Link to="/about" className="btn-ghost">
                About me
              </Link>
            </div>

            <div className="flex flex-col gap-6 pt-8 font-marginalia text-lg text-primary/60 border-t border-primary/10">
              <div className="flex items-center gap-3">
                 <span className="text-xs uppercase tracking-[0.2em] font-sans-ui opacity-50">Live from the cottage</span>
              </div>
              <div className="flex flex-wrap gap-x-12 gap-y-4">
                {latestEntry && (
                  <div className="flex items-center gap-3 group">
                    <Feather weight="duotone" className="w-5 h-5 text-accent" />
                    <span className="group-hover:text-primary transition-colors">Latest note: {latestEntry.title}</span>
                  </div>
                )}
                {activeTrack && (
                  <div className="flex items-center gap-3 group">
                    <MusicNotes weight="duotone" className="w-5 h-5 text-secondary" />
                    <span className="group-hover:text-primary transition-colors">Spinning: {activeTrack.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Layered collage elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] -z-10 animate-drift" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 blur-[100px] -z-10 animate-drift" style={{ animationDelay: "2s" }} />
            
            <div className="relative w-full max-w-md aspect-[4/5] paper-card p-2 rotate-2 hover:rotate-0 transition-transform duration-700 group">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-8 bg-primary/10 border border-primary/5 backdrop-blur-sm shadow-sm -rotate-1 z-20 opacity-80" aria-hidden />
              
              {heroImage?.imageUrl ? (
                <div className="w-full h-full overflow-hidden relative">
                  <img
                    src={heroImage.imageUrl}
                    alt={heroImage?.caption ?? "Instagram post"}
                    className="w-full h-full object-cover animate-ink"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="rounded-full border border-border/20 bg-card/80 backdrop-blur-md px-3 py-1 font-marginalia text-sm text-foreground shadow-sm">
                      from Instagram
                    </span>
                    <span className="rounded-full border border-border/20 bg-card/80 backdrop-blur-md px-3 py-1 font-marginalia text-sm text-foreground shadow-sm">
                      {heroImage?.timestamp ? formatHeroImageDate(heroImage.timestamp) : ""}
                    </span>
                  </div>
                </div>
              ) : (
                <Skeleton className="w-full h-full" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured: The Archive */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <SectionHeader eyebrow="Freshly written" title="Journal entries" />
        <div className="grid md:grid-cols-3 gap-12 mt-20">
          {substackLoading
            ? Array.from({ length: 3 }, (_, index) => <JournalCardSkeleton key={index} />)
            : liveFeatured.map((post, i) => (
                <div 
                  key={post.id} 
                  className="transition-transform duration-500 hover:scale-[1.02]"
                  style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 1.5}deg)` }}
                >
                  <FeaturedSubstackCard post={post} />
                </div>
              ))}
        </div>
        <div className="text-center mt-20">
          <Link to="/journal" className="marginalia text-2xl text-primary hover:text-secondary transition-colors inline-flex items-center gap-3 group">
            browse the full archive
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Look Around: Interactive Previews */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-y border-border/20 bg-card/30">
        <SectionHeader eyebrow="Step inside" title="Gallery & Astrology" />
        <div className="grid lg:grid-cols-2 gap-12 mt-20">
          <GalleryPreviewCard images={instagramImages} />
          <AstrologyPreviewCard />
        </div>
      </section>

      {/* The Hearth Dashboard */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="mb-16">
          <h2 className="font-display italic text-5xl text-foreground text-center">On the mantle</h2>
          <div className="marginalia text-primary/60 text-center text-xl mt-2">what's alive in the cottage right now</div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-8">
             <SpotifyMiniPreview nowPlaying={spotifyNowPlaying} topTracks={spotifyTopTracks} />
          </div>
          <div className="lg:mt-12 space-y-8">
            <PinterestMiniPreview pinterest={pinterest} />
          </div>
          <div className="space-y-8">
            <FactsMiniPreview animalFact={animalFact} funFact={funFact} />
          </div>
        </div>
      </section>

      {/* Newsletter: The Final Note */}
      <section className="relative py-32 bg-primary/5">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-block mb-6">
            <span className="tag-chip rose">Stay in touch</span>
          </div>
          <h2 className="font-display italic text-6xl md:text-7xl text-foreground leading-tight">
            Letters from the <span className="text-secondary">cottage</span>
          </h2>
          <p className="font-serif italic text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            One slow letter a month — tarot pulls, free patterns, what I'm reading, and small notes from the woods. No noise, just magic.
          </p>
          
          <form 
            className="mt-12 max-w-md mx-auto flex flex-col sm:flex-row items-end gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex-1 w-full text-left">
              <label className="font-marginalia text-lg text-primary/70 ml-1">your email address</label>
              <input 
                type="email" 
                required 
                placeholder="reader@example.com" 
                className="contact-input w-full mt-1"
              />
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto h-[50px]">
              Subscribe
            </button>
          </form>
          
          {/* <div className="mt-12 flex justify-center items-center gap-4">
            <Sparkle weight="fill" className="w-4 h-4 text-accent animate-twinkle" />
            <div className="font-marginalia text-xl text-primary/40">Join 4.2k gentle readers</div>
            <Sparkle weight="fill" className="w-4 h-4 text-accent animate-twinkle" style={{ animationDelay: "1.5s" }} />
          </div> */}
        </div>
      </section>
    </main>
  );
}

function GalleryPreviewCard({ images }: { images: InstagramHeroImage[] }) {
  const previewImages = useMemo(() => getShuffledImages(images).slice(0, 3), [images]);

  return (
    <Link to="/gallery" className="group block relative h-full">
      <div className="paper-card h-full p-8 flex flex-col gap-8 hover:bg-card transition-colors">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="tag-chip rose">Gallery</span>
            <h3 className="font-display italic text-4xl text-foreground">Lately from Hailey</h3>
          </div>
          <Images weight="duotone" className="w-8 h-8 text-primary/40" />
        </div>
        
        <div className="grid grid-cols-3 gap-3 flex-1 min-h-[200px]">
          {previewImages.length ? (
            previewImages.map((image, i) => (
              <div 
                key={image.id} 
                className="relative aspect-[3/4] overflow-hidden paper-card p-1 shadow-sm"
                style={{ transform: `rotate(${(i - 1) * 3}deg) translateY(${i === 1 ? -12 : 0}px)` }}
              >
                <img
                  src={image.imageUrl}
                  alt=""
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            ))
          ) : (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-full w-full" />)
          )}
        </div>
        
        <div className="flex items-center gap-2 text-primary font-marginalia text-xl group-hover:gap-4 transition-all">
          step into the visual scrapbook
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

function AstrologyPreviewCard() {
  const reading = getHomeAstrologyPreview();

  return (
    <Link to="/astrology" className="group block h-full">
      <div className="paper-card h-full p-8 flex flex-col gap-8 hover:bg-card transition-colors">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="tag-chip gold">Celestial</span>
            <h3 className="font-display italic text-4xl text-foreground">Daily Astrology</h3>
          </div>
          <Planet weight="duotone" className="w-8 h-8 text-primary/40" />
        </div>

        <div className="flex-1 flex flex-col justify-center text-center py-4 relative">
          {/* Decorative circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-primary/5 animate-orbit-slow" />
            <div className="w-64 h-64 rounded-full border border-primary/5 animate-orbit-slower" />
          </div>

          <div className="marginalia text-2xl text-primary">{reading.date}</div>
          <div className="font-display italic text-5xl text-foreground mt-4">{reading.sign}</div>
          <div className="font-serif italic text-muted-foreground mt-2">focus on: {reading.focus}</div>
        </div>

        <div className="flex items-center gap-2 text-primary font-marginalia text-xl group-hover:gap-4 transition-all">
          consult the celestial map
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

function FeaturedSubstackCard({ post }: { post: SubstackPost }) {
  return (
    <article className="paper-card group flex flex-col h-full bg-card/50">
      <div className="relative h-64 overflow-hidden">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted/30" />
        )}
        <div className="absolute top-4 left-4">
           <span className="cat-stamp">
            {getJournalTagLabel(post.title, post.tags[0] ?? "Substack")}
          </span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1 gap-4">
        <div className="flex items-center justify-between font-marginalia text-primary/60 text-lg">
          <span>{formatJournalDate(post.publishedAt, false)}</span>
          <span>{post.read}</span>
        </div>
        <h3 className="font-display italic text-3xl text-foreground leading-tight group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="font-serif italic text-muted-foreground line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="pt-4 mt-auto">
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-primary font-display italic text-lg hover:gap-4 transition-all"
          >
            read entry <ArrowRight className="w-4 h-4" />
          </a>
        </div>
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
  className = "",
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  to: "/gallery" | "/astrology" | "/about" | "/animal-facts";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`group block paper-card p-8 hover:bg-card transition-all ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="tag-chip rose">{eyebrow}</span>
        <span className="text-primary/30 group-hover:text-primary transition-colors">
          {icon}
        </span>
      </div>
      <h3 className="font-display italic text-3xl text-foreground mb-6">{title}</h3>
      <div>{children}</div>
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
  const title = nowPlaying?.playing?.isPlaying ? "Currently spinning" : "Favorite this month";

  return (
    <DashboardCard
      eyebrow="Spotify"
      title={title}
      to="/gallery"
      icon={<VinylRecord weight="duotone" className="w-8 h-8" />}
    >
      {track ? (
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-square paper-card p-1">
             {track.imageUrl ? (
              <img src={track.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center bg-muted">
                <VinylRecord weight="duotone" className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {nowPlaying?.playing?.isPlaying && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg animate-float">
                <MusicNotes weight="fill" className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="font-display italic text-2xl text-foreground truncate">{track.name}</p>
            <p className="font-marginalia text-lg text-primary/60 truncate">{track.artists.join(", ")}</p>
          </div>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center border border-dashed border-border rounded">
           <p className="font-serif italic text-muted-foreground text-center px-4">
            Connect Spotify to see what's playing in the cottage.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}

function PinterestMiniPreview({ pinterest }: { pinterest: PinterestFeed | undefined }) {
  const pins = pinterest?.items.filter((pin) => pin.imageUrl).slice(0, 4) ?? [];
  const comingSoon = true; // pinterest?.configured === false;

  return (
    <DashboardCard
      eyebrow="Coming Soon"
      title="Under Construction"
      to="/gallery"
      icon={<PinterestLogo weight="duotone" className="w-8 h-8" />}
    >
      {comingSoon ? (
        <div className="space-y-4">
          <p className="font-serif italic text-muted-foreground leading-relaxed text-center">
            A messy, beautiful board of saved ideas, patterns, and home inspiration is currently under construction.
          </p>
          <div className="grid grid-cols-2 gap-2 opacity-10">
             {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted rounded" />)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {pins.map((pin, i) => (
            <div 
              key={pin.id} 
              className="aspect-[3/4] overflow-hidden paper-card p-0.5 shadow-sm"
              style={{ transform: `rotate(${(i % 2 === 0 ? 2 : -2)}deg)` }}
            >
              <img
                src={pin.imageUrl}
                alt={pin.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
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
      eyebrow="Daily Facts"
      title={animalFact?.name ?? "Curiosities"}
      to="/animal-facts"
      icon={<Sparkle weight="duotone" className="w-8 h-8" />}
    >
      <div className="space-y-6">
        <div className="relative py-8 px-6 bg-primary/5 border-x border-primary/10 italic font-serif text-lg text-foreground/80 leading-relaxed text-center">
          <div className="absolute top-0 left-0 marginalia text-4xl text-primary/20">“</div>
          {animalFact?.fact ?? funFact?.fact ?? "Quiet curiosities and animal secrets load here every morning."}
          <div className="absolute bottom-0 right-0 marginalia text-4xl text-primary/20 rotate-180">“</div>
        </div>
        <div className="marginalia text-primary text-center">
          updated daily at dawn
        </div>
      </div>
    </DashboardCard>
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

function JournalCardSkeleton() {
  return (
    <article className="paper-card overflow-hidden flex flex-col bg-card/40">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="p-8 space-y-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-4/5 mt-4" />
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-2/3 mt-2" />
        <Skeleton className="h-4 w-24 mt-6" />
      </div>
    </article>
  );
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
