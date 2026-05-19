import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowSquareOut,
  InstagramLogo,
  MusicNotes,
  PinterestLogo,
  VinylRecord,
  Sparkle
} from "@phosphor-icons/react";
import { memo, useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Visual Scrapbook — Hailey Adkins" },
      {
        name: "description",
        content:
          "A little visual scrapbook — cottagecore moments, crochet, cats, horses, and moonlit skies.",
      },
      { property: "og:title", content: "Visual Scrapbook — Hailey Adkins" },
      { property: "og:description", content: "From the camera roll: a cozy visual scrapbook." },
    ],
  }),
  component: GalleryPage,
});

type InstagramFeed = {
  configured: boolean;
  items: InstagramPost[];
  nextCursor?: string | null;
  hasMore?: boolean;
  error?: string;
};

type InstagramPost = {
  id: string;
  caption: string;
  imageUrl?: string;
  mediaType: string;
  media?: InstagramPostMedia[];
  permalink: string;
  timestamp: string;
};

type InstagramPostMedia = {
  id: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType: string;
  thumbnailUrl?: string;
};

type SpotifyTrack = {
  id?: string;
  name: string;
  artists: string[];
  album: string;
  imageUrl?: string;
  spotifyUrl: string;
  isPlaying?: boolean;
};

type SpotifyNowPlaying = {
  configured: boolean;
  playing: SpotifyTrack | null;
  error?: string;
};

type SpotifyTopTracks = {
  configured: boolean;
  items: SpotifyTrack[];
  error?: string;
};

type SpotifyRecentlyPlayed = {
  configured: boolean;
  items: SpotifyTrack[];
  error?: string;
};

type PinterestFeed = {
  configured: boolean;
  items: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    link: string;
    createdAt?: string;
  }>;
  error?: string;
};

function GalleryPage() {
  const [instagram, setInstagram] = useState<InstagramFeed>();
  const [nowPlaying, setNowPlaying] = useState<SpotifyNowPlaying>();
  const [topTracks, setTopTracks] = useState<SpotifyTopTracks>();
  const [recentTracks, setRecentTracks] = useState<SpotifyRecentlyPlayed>();
  const [pinterest, setPinterest] = useState<PinterestFeed>();
  
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetchJson<InstagramFeed>("/api/instagram?view=carousel&limit=4", controller.signal)
      .then((payload) => setInstagram(payload))
      .catch(() => {
        if (controller.signal.aborted) return;
        setInstagram({
          configured: true,
          items: [],
          error: "Instagram feed is unavailable right now.",
        });
      });

    const idleTimer = window.setTimeout(() => {
      void fetchJson<SpotifyNowPlaying>("/api/spotify/now-playing", controller.signal)
        .then((payload) => setNowPlaying(payload))
        .catch(() => {
          if (controller.signal.aborted) return;
          setNowPlaying({
            configured: true,
            playing: null,
            error: "Spotify is unavailable right now.",
          });
        });

      void fetchJson<SpotifyTopTracks>("/api/spotify/top-tracks?limit=5", controller.signal)
        .then((payload) => setTopTracks(payload))
        .catch(() => {
          if (controller.signal.aborted) return;
          setTopTracks({
            configured: true,
            items: [],
            error: "Spotify tracks are unavailable right now.",
          });
        });

      void fetchJson<SpotifyRecentlyPlayed>("/api/spotify/recently-played?limit=5", controller.signal)
        .then((payload) => setRecentTracks(payload))
        .catch(() => {
          if (controller.signal.aborted) return;
          setRecentTracks({
            configured: true,
            items: [],
            error: "Recent tracks are unavailable right now.",
          });
        });

      void fetchJson<PinterestFeed>("/api/pinterest?limit=6", controller.signal)
        .then((payload) => setPinterest(payload))
        .catch(() => {
          if (controller.signal.aborted) return;
          setPinterest({
            configured: true,
            items: [],
            error: "Pinterest pins are unavailable right now.",
          });
        });
    }, 350);

    return () => {
      window.clearTimeout(idleTimer);
      controller.abort();
    };
  }, []);

  async function handleLoadMore() {
    if (!instagram?.nextCursor || loadingMore) return;
    
    setLoadingMore(true);
    const controller = new AbortController();
    try {
      const payload = await fetchJson<InstagramFeed>(
        `/api/instagram?cursor=${instagram.nextCursor}&limit=4`,
        controller.signal
      );
      setInstagram(prev => {
        if (!prev) return payload;
        return {
          ...payload,
          items: [...prev.items, ...payload.items]
        };
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("Failed to load more Instagram items:", error);
    } finally {
      setLoadingMore(false);
    }
  }

  const instagramItems = useMemo(() => 
    instagram?.items.filter(
      (item) =>
        item.imageUrl || item.media?.some((mediaItem) => mediaItem.imageUrl || mediaItem.mediaUrl),
    ) ?? [], [instagram?.items]);

  const instagramLoading = instagram === undefined;
  const showInstagram = Boolean(instagram?.configured && (instagramItems.length || instagramLoading));

  return (
    <main className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center max-w-2xl mx-auto mb-24">
        <span className="tag-chip gold">visual scrapbook</span>
        <h1 className="font-display italic text-6xl md:text-9xl text-foreground mt-4 leading-tight">
          From the <span className="text-primary">camera roll</span>
        </h1>
        <div className="marginalia text-primary/60 text-2xl mt-4">
          soft afternoons, finished projects, and fragments of moonlight
        </div>
      </div>

      <section className="grid lg:grid-cols-[1fr_360px] gap-16 items-start">
        <div className="space-y-16">
          <InstagramSection
            items={instagramItems}
            loading={instagramLoading}
            configured={instagram?.configured}
            error={instagram?.error}
            showInstagram={showInstagram}
          />
          
          {instagram?.hasMore && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-ghost px-12 py-4 text-xl group"
              >
                {loadingMore ? "Gathering more moments..." : "Load more fragments"}
                {!loadingMore && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-16 lg:sticky lg:top-32">
          <SpotifyPanel nowPlaying={nowPlaying} topTracks={topTracks} />
          <RecentSpotifyPanel recentTracks={recentTracks} />
        </div>
      </section>

      <PinterestPanel pinterest={pinterest} />
    </main>
  );
}

function getVisibleMedia(item: InstagramPost) {
  const media = (item.media?.length ? item.media : undefined) ?? [
    {
      id: item.id,
      imageUrl: item.imageUrl,
      mediaUrl: item.imageUrl,
      mediaType: item.mediaType,
    },
  ];

  return media.filter((mediaItem) => mediaItem.imageUrl || mediaItem.mediaUrl);
}

function InstagramSection({
  items,
  loading,
  configured,
  error,
  showInstagram,
}: {
  items: InstagramPost[];
  loading: boolean;
  configured: boolean | undefined;
  error: string | undefined;
  showInstagram: boolean;
}) {
  return (
    <div className="space-y-16">
      <div className="flex items-end justify-between gap-4 border-b border-border/20 pb-10">
        <div className="space-y-2">
          <span className="tag-chip rose">lately</span>
          <h2 className="font-display italic text-5xl text-foreground">Scrapbook entries</h2>
        </div>
        <div className="flex items-center gap-3 text-primary/40">
          <InstagramLogo weight="duotone" className="h-12 w-12" aria-hidden />
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <InstagramPostSkeleton key={i} />
          ))}
        </div>
      ) : showInstagram ? (
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {items.map((item, i) => (
            <div 
              key={item.id} 
              className="defer-render relative"
              style={{ transform: `rotate(${(i % 2 === 0 ? 0.5 : -0.5)}deg)` }}
            >
              <InstagramPostCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="paper-card p-24 text-center bg-card/30 border-dashed">
          <p className="font-serif italic text-2xl text-muted-foreground">
            {!configured
              ? "The camera roll is resting for a moment."
              : (error ?? "The visual archive is currently empty.")}
          </p>
        </div>
      )}
    </div>
  );
}

const InstagramPostCard = memo(function InstagramPostCard({ item }: { item: InstagramPost }) {
  const visibleMedia = useMemo(() => getVisibleMedia(item), [item]);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleMedia = visibleMedia.length > 1;
  const activeMedia = visibleMedia[activeIndex] ?? visibleMedia[0];

  return (
    <article className="paper-card p-3 flex flex-col bg-card/40 overflow-hidden shadow-soft group">
      {/* Tape Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-primary/5 border border-primary/5 backdrop-blur-sm z-20" aria-hidden />

      <div className="relative aspect-square bg-muted/20 overflow-hidden rounded-[1px]">
        {activeMedia ? <InstagramMedia media={activeMedia} caption={item.caption} eager={false} /> : null}

        {hasMultipleMedia ? (
          <>
            <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 z-10">
              {visibleMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex ? "w-8 bg-white shadow-sm" : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>
            {activeIndex > 0 && (
              <button
                onClick={() => setActiveIndex(activeIndex - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight weight="bold" className="w-6 h-6 rotate-180" />
              </button>
            )}
            {activeIndex < visibleMedia.length - 1 && (
              <button
                onClick={() => setActiveIndex(activeIndex + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight weight="bold" className="w-6 h-6" />
              </button>
            )}
          </>
        ) : null}
      </div>

      <div className="p-8 md:p-10 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <span className="font-marginalia text-xl text-primary/60">
            {formatPostDate(item.timestamp)}
          </span>
          <a
            href={item.permalink}
            target="_blank"
            rel="noreferrer"
            className="text-primary/40 hover:text-primary transition-colors"
          >
            <ArrowSquareOut weight="bold" className="w-6 h-6" />
          </a>
        </div>
        
        <p className="font-serif italic text-foreground leading-relaxed text-lg line-clamp-3 mb-10">
          {item.caption}
        </p>

        <div className="mt-auto pt-8 border-t border-border/20 flex items-center justify-between">
          <div className="flex gap-2.5">
            {visibleMedia.slice(0, 6).map((media, index) => (
              <button
                key={media.id}
                onClick={() => setActiveIndex(index)}
                className={`w-14 h-14 rounded-sm overflow-hidden border-2 transition-opacity ${
                  index === activeIndex
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-55 hover:opacity-100"
                }`}
                aria-label={`Show image ${index + 1}`}
              >
                <InstagramThumbnail media={media} />
              </button>
            ))}
          </div>
          <Sparkle weight="fill" className="text-primary/10 w-8 h-8 animate-twinkle" />
        </div>
      </div>
    </article>
  );
});

function SpotifyPanel({
  nowPlaying,
  topTracks,
}: {
  nowPlaying: SpotifyNowPlaying | undefined;
  topTracks: SpotifyTopTracks | undefined;
}) {
  const tracks = topTracks?.items ?? [];
  const nowPlayingLoading = nowPlaying === undefined;
  const topTracksLoading = topTracks === undefined;

  return (
    <aside className="paper-card p-12 bg-card/60 relative defer-render">
      <div className="absolute -top-4 -right-4 text-primary/10 -rotate-12 pointer-events-none">
         <MusicNotes weight="fill" size={80} />
      </div>

      <div className="flex items-start justify-between mb-10 relative">
        <div className="space-y-2">
          <span className="tag-chip rose">spotify</span>
          <h2 className="font-display italic text-5xl text-foreground">On repeat</h2>
        </div>
      </div>

      {nowPlayingLoading ? (
        <NowPlayingSkeleton />
      ) : nowPlaying?.playing ? (
        <a
          href={nowPlaying.playing.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="group block mb-12"
        >
          <div className="paper-card p-1 relative mb-8 rotate-1">
            <img src={nowPlaying.playing.imageUrl} alt="" decoding="async" className="w-full aspect-square object-cover" />
            <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-xl animate-float">
               <VinylRecord weight="fill" className="w-8 h-8 animate-spin-slow" />
            </div>
          </div>
          <div className="text-center space-y-2">
             <div className="font-marginalia text-primary text-lg tracking-widest opacity-60 uppercase">now spinning</div>
             <p className="font-display italic text-3xl text-foreground group-hover:text-primary transition-colors leading-tight">{nowPlaying.playing.name}</p>
             <p className="font-serif italic text-muted-foreground text-lg">{nowPlaying.playing.artists.join(", ")}</p>
          </div>
        </a>
      ) : null}

      <div className="space-y-8">
        <div className="font-marginalia text-primary/40 text-xl border-b border-border/20 pb-2">top monthly spins</div>
        {topTracksLoading ? (
          <TopTracksSkeleton />
        ) : tracks.length ? (
          <ol className="space-y-6 mt-6">
            {tracks.map((track, index) => (
              <li key={track.id ?? track.spotifyUrl}>
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-5 group"
                >
                  <span className="font-marginalia text-3xl text-primary/20 w-8 shrink-0">{index + 1}</span>
                  <div className="w-14 h-14 paper-card p-0.5 shrink-0 rotate-1">
                    <img src={track.imageUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-serif italic text-foreground group-hover:text-primary transition-colors leading-tight">{track.name}</p>
                    <p className="truncate font-marginalia text-primary/50 text-sm mt-0.5">{track.artists.join(", ")}</p>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </aside>
  );
}

function RecentSpotifyPanel({
  recentTracks,
}: {
  recentTracks: SpotifyRecentlyPlayed | undefined;
}) {
  const tracks = recentTracks?.items ?? [];
  const loading = recentTracks === undefined;

  return (
    <aside className="paper-card p-12 bg-primary/5 border-primary/10 -rotate-1 defer-render">
      <div className="flex items-start justify-between mb-10">
        <div className="space-y-2">
          <span className="tag-chip rose">lately</span>
          <h2 className="font-display italic text-5xl text-foreground">Recent spins</h2>
        </div>
        <VinylRecord weight="duotone" className="w-10 h-10 text-primary/30" />
      </div>

      {loading ? (
        <TopTracksSkeleton />
      ) : (
        <ol className="space-y-8">
          {tracks.map((track) => (
            <li key={track.id ?? track.spotifyUrl}>
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-5 group"
              >
                <div className="w-14 h-14 paper-card p-0.5 shrink-0 rotate-1">
                  {track.imageUrl ? (
                    <img src={track.imageUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted/20 grid place-items-center">
                      <MusicNotes weight="duotone" className="w-6 h-6 text-primary/20" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-serif italic text-foreground group-hover:text-primary transition-colors leading-tight">{track.name}</p>
                  <p className="truncate font-marginalia text-primary/50 text-sm mt-0.5">{track.artists.join(", ")}</p>
                </div>
              </a>
            </li>
          ))}
        </ol>
      )}
      
      <div className="mt-12 pt-8 border-t border-primary/10 font-marginalia text-primary/40 text-center text-lg italic">
        synced from the cottage player
      </div>
    </aside>
  );
}

function PinterestPanel({ pinterest }: { pinterest: PinterestFeed | undefined }) {
  const loading = pinterest === undefined;
  const pins = pinterest?.items.filter((pin) => pin.imageUrl) ?? [];
  const comingSoon = !loading && !pinterest?.configured;

  return (
    <section className="mt-32 pt-24 border-t border-border/20 defer-render">
      <div className="flex items-end justify-between mb-20 px-4">
        <div className="space-y-2">
          <span className="tag-chip gold">inspiration</span>
          <h2 className="font-display italic text-7xl md:text-8xl text-foreground leading-tight tracking-tight">Pinterest board</h2>
          <div className="marginalia text-primary/60 text-2xl">saved ideas and cozy fragments</div>
        </div>
        <PinterestLogo weight="duotone" className="w-16 h-16 text-primary/20 hidden md:block" />
      </div>

      {comingSoon ? (
        <div className="paper-card p-32 text-center bg-card/30 border-dashed border-2">
          <p className="font-serif italic text-3xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A curated board of pattern ideas, outfits, and home inspiration is currently being pinned to the mantle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16">
          {loading
            ? Array.from({ length: 8 }, (_, index) => <PinterestPinSkeleton key={index} />)
            : pins.map((pin, i) => (
                <a
                  key={pin.id}
                  href={pin.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                  style={{ transform: `rotate(${(i % 2 === 0 ? 1.5 : -1.5)}deg)` }}
                >
                  <div className="paper-card p-2 bg-white shadow-soft">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[1px]">
                      <img
                        src={pin.imageUrl}
                        alt={pin.title}
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-8">
                      <p className="font-serif italic text-foreground text-sm line-clamp-2 leading-relaxed">
                        {pin.title}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
        </div>
      )}
    </section>
  );
}

function PinterestPinSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/70">
      <Skeleton className="aspect-[3/4] rounded-none" />
      <div className="space-y-2 p-6">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function NowPlayingSkeleton() {
  return (
    <div className="mt-6 flex gap-4 rounded-2xl border border-border bg-card/70 p-6">
      <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-4 py-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function TopTracksSkeleton() {
  return (
    <ol className="mt-8 space-y-6" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="flex items-center gap-5">
          <Skeleton className="h-8 w-8 shrink-0" />
          <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
          <span className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </span>
        </li>
      ))}
    </ol>
  );
}

function InstagramPostSkeleton() {
  return (
    <div className="paper-card p-3 bg-card/40">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-10 space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-4/5" />
        <div className="pt-8 border-t border-border/20 flex gap-3">
           <Skeleton className="h-14 w-14 rounded-sm" />
           <Skeleton className="h-14 w-14 rounded-sm" />
           <Skeleton className="h-14 w-14 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

function InstagramMedia({
  media,
  caption,
  fit = "cover",
  eager = false,
}: {
  media: InstagramPostMedia;
  caption: string;
  fit?: "cover" | "contain";
  eager?: boolean;
}) {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  if (media.mediaType === "VIDEO" && media.mediaUrl) {
    return (
      <img
        src={media.imageUrl}
        alt={caption}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
        className={`h-full w-full ${fitClass}`}
      />
    );
  }

  return (
    <img
      src={media.imageUrl ?? media.mediaUrl}
      alt={caption}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
      className={`h-full w-full ${fitClass}`}
    />
  );
}

function InstagramThumbnail({ media }: { media: InstagramPostMedia }) {
  const imageUrl = media.thumbnailUrl ?? media.imageUrl ?? media.mediaUrl;
  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover"
    />
  );
}

function formatPostDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "recent moment";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

async function fetchJson<T>(url: string, signal: AbortSignal) {
  const response = await fetch(url, { cache: "no-store", signal });
  return (await response.json()) as T;
}
