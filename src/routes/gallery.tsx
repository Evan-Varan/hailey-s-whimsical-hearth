import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowSquareOut,
  InstagramLogo,
  MusicNotes,
  PinterestLogo,
  VinylRecord,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Hailey Adkins" },
      {
        name: "description",
        content:
          "A little visual scrapbook — cottagecore moments, crochet, cats, horses, and moonlit skies.",
      },
      { property: "og:title", content: "Gallery — Hailey Adkins" },
      { property: "og:description", content: "From the camera roll: a cozy visual scrapbook." },
    ],
  }),
  component: GalleryPage,
});

type InstagramFeed = {
  configured: boolean;
  items: Array<{
    id: string;
    caption: string;
    imageUrl?: string;
    mediaType: string;
    media?: InstagramPostMedia[];
    permalink: string;
    timestamp: string;
  }>;
  error?: string;
};

type InstagramPostMedia = {
  id: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType: string;
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
  const [pinterest, setPinterest] = useState<PinterestFeed>();

  useEffect(() => {
    const controller = new AbortController();

    async function loadSocialFeeds() {
      const [instagramResult, nowPlayingResult, topTracksResult, pinterestResult] =
        await Promise.allSettled([
          fetchJson<InstagramFeed>("/api/instagram?view=carousel", controller.signal),
          fetchJson<SpotifyNowPlaying>("/api/spotify/now-playing", controller.signal),
          fetchJson<SpotifyTopTracks>("/api/spotify/top-tracks?limit=5", controller.signal),
          fetchJson<PinterestFeed>("/api/pinterest?limit=8", controller.signal),
        ]);

      if (controller.signal.aborted) return;

      if (instagramResult.status === "fulfilled") setInstagram(instagramResult.value);
      else {
        setInstagram({
          configured: true,
          items: [],
          error: "Instagram feed is unavailable right now.",
        });
      }

      if (nowPlayingResult.status === "fulfilled") setNowPlaying(nowPlayingResult.value);
      else {
        setNowPlaying({
          configured: true,
          playing: null,
          error: "Spotify is unavailable right now.",
        });
      }

      if (topTracksResult.status === "fulfilled") setTopTracks(topTracksResult.value);
      else {
        setTopTracks({
          configured: true,
          items: [],
          error: "Spotify tracks are unavailable right now.",
        });
      }

      if (pinterestResult.status === "fulfilled") setPinterest(pinterestResult.value);
      else {
        setPinterest({
          configured: true,
          items: [],
          error: "Pinterest pins are unavailable right now.",
        });
      }
    }

    void loadSocialFeeds();

    return () => controller.abort();
  }, []);

  const instagramItems =
    instagram?.items.filter(
      (item) =>
        item.imageUrl || item.media?.some((mediaItem) => mediaItem.imageUrl || mediaItem.mediaUrl),
    ) ?? [];
  const showInstagram = Boolean(instagram?.configured && instagramItems.length);
  const instagramLoading = instagram === undefined;

  return (
    <main className="pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="container-content section-gap pb-0">
        <div className="text-center">
          <span className="tag-chip gold">From the camera roll</span>
          <h1 className="mt-4 font-hand text-5xl md:text-6xl lg:text-7xl text-foreground">
            A visual scrapbook
          </h1>
          <p className="mt-4 font-serif-display text-lg text-muted-foreground max-w-xl mx-auto">
            Soft afternoons, finished projects, the cat being unhelpful — saved for later.
          </p>
        </div>
      </section>

      {/* Instagram + Spotify Section */}
      <section className="container-wide section-gap">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <InstagramSection
            items={instagramItems}
            loading={instagramLoading}
            configured={instagram?.configured}
            error={instagram?.error}
            showInstagram={showInstagram}
          />
          <SpotifyPanel nowPlaying={nowPlaying} topTracks={topTracks} />
        </div>
      </section>

      {/* Pinterest Section */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container-wide section-gap">
          <PinterestSection pinterest={pinterest} />
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Instagram Section                              */
/* -------------------------------------------------------------------------- */

function getVisibleMedia(item: InstagramFeed["items"][number]) {
  const media = (item.media?.length ? item.media : undefined) ?? [
    { id: item.id, imageUrl: item.imageUrl, mediaUrl: item.imageUrl, mediaType: item.mediaType },
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
  items: InstagramFeed["items"];
  loading: boolean;
  configured: boolean | undefined;
  error: string | undefined;
  showInstagram: boolean;
}) {
  const [activePostIndex, setActivePostIndex] = useState(0);
  const activePost = items[activePostIndex] ?? items[0];

  useEffect(() => {
    setActivePostIndex(0);
  }, [items.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="tag-chip rose">Instagram</span>
          <h2 className="mt-3 font-hand text-3xl md:text-4xl text-foreground">
            Lately from Hailey
          </h2>
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-sm"
        >
          <InstagramLogo weight="duotone" className="w-4 h-4" />
          Follow on Instagram
        </a>
      </div>

      {loading ? (
        <InstagramGridSkeleton />
      ) : showInstagram ? (
        <>
          {/* Grid */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {items.slice(0, 9).map((item, index) => (
              <InstagramGridItem
                key={item.id}
                item={item}
                active={index === activePostIndex}
                onSelect={() => setActivePostIndex(index)}
              />
            ))}
          </div>

          {/* Detail Panel */}
          {activePost && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <InstagramPostDetail item={activePost} />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<InstagramLogo weight="duotone" className="w-10 h-10" />}
          message={
            !configured
              ? "Add an Instagram token to show the live feed here."
              : (error ?? "No Instagram posts are available right now.")
          }
        />
      )}
    </div>
  );
}

function InstagramGridItem({
  item,
  active,
  onSelect,
}: {
  item: InstagramFeed["items"][number];
  active: boolean;
  onSelect: () => void;
}) {
  const media = getVisibleMedia(item)[0];
  if (!media) return null;

  return (
    <button
      type="button"
      className={`group relative aspect-square overflow-hidden rounded-xl transition-all ${
        active 
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
          : "hover:opacity-90"
      }`}
      onClick={onSelect}
      aria-label={`Show Instagram post from ${formatPostDate(item.timestamp)}`}
    >
      <InstagramMedia media={media} caption={item.caption} />
      
      {/* Carousel indicator */}
      {getVisibleMedia(item).length > 1 && (
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm font-sans-ui text-[10px] text-white/90">
          {getVisibleMedia(item).length}
        </span>
      )}
    </button>
  );
}

function InstagramPostDetail({ item }: { item: InstagramFeed["items"][number] }) {
  const visibleMedia = getVisibleMedia(item);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = visibleMedia[activeIndex] ?? visibleMedia[0];
  const hasMultipleMedia = visibleMedia.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [item.id]);

  if (!activeMedia) return null;

  return (
    <div className="grid md:grid-cols-2">
      {/* Media */}
      <div className="relative aspect-square md:aspect-auto bg-muted">
        <InstagramMedia media={activeMedia} caption={item.caption} fit="contain" />
        
        {hasMultipleMedia && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
            {visibleMedia.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`rounded-full transition-all ${
                  idx === activeIndex 
                    ? "w-4 h-1.5 bg-white" 
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Show image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 flex flex-col">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
          <p className="font-sans-ui text-xs uppercase tracking-wider text-muted-foreground">
            {formatPostDate(item.timestamp)}
          </p>
          {hasMultipleMedia && (
            <p className="font-sans-ui text-xs text-muted-foreground">
              {activeIndex + 1} / {visibleMedia.length}
            </p>
          )}
        </div>

        <div className="flex-1 py-5">
          <p className="font-serif-display text-foreground leading-relaxed">{item.caption}</p>
        </div>

        {hasMultipleMedia && (
          <div className="grid grid-cols-6 gap-1.5 pb-5">
            {visibleMedia.map((mediaItem, index) => (
              <button
                key={mediaItem.id}
                type="button"
                className={`aspect-square overflow-hidden rounded-lg transition-all ${
                  index === activeIndex ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <InstagramMedia media={mediaItem} caption={item.caption} />
              </button>
            ))}
          </div>
        )}

        <a href={item.permalink} target="_blank" rel="noreferrer" className="btn-primary justify-center">
          <InstagramLogo weight="duotone" className="w-4 h-4" />
          View on Instagram
          <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

function InstagramMedia({
  media,
  caption,
  fit = "cover",
}: {
  media: InstagramPostMedia;
  caption: string;
  fit?: "cover" | "contain";
}) {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  if (media.mediaType === "VIDEO" && media.mediaUrl) {
    return (
      <video
        src={media.mediaUrl}
        poster={media.imageUrl}
        controls
        preload="metadata"
        className={`h-full w-full ${fitClass}`}
      />
    );
  }

  return (
    <img
      src={media.imageUrl ?? media.mediaUrl}
      alt={caption}
      loading="lazy"
      className={`h-full w-full ${fitClass} transition-transform duration-500 group-hover:scale-105`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                               Spotify Panel                                 */
/* -------------------------------------------------------------------------- */

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
    <aside className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <MusicNotes weight="duotone" className="w-4 h-4" />
        <span className="font-sans-ui text-xs uppercase tracking-wider">Spotify</span>
      </div>
      
      <h2 className="font-hand text-2xl text-foreground">On repeat</h2>
      <p className="mt-1 font-serif-display text-sm text-muted-foreground">
        Top tracks from the last 4 weeks
      </p>

      {/* Now Playing */}
      {nowPlayingLoading ? (
        <NowPlayingSkeleton />
      ) : nowPlaying?.playing ? (
        <a
          href={nowPlaying.playing.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex items-center gap-4 p-3 rounded-xl bg-muted/50 transition-colors hover:bg-muted"
        >
          {nowPlaying.playing.imageUrl ? (
            <img
              src={nowPlaying.playing.imageUrl}
              alt=""
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <VinylRecord weight="duotone" className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-sans-ui text-[0.625rem] uppercase tracking-wider text-primary">
              {nowPlaying.playing.isPlaying ? "Now playing" : "Last played"}
            </p>
            <p className="font-serif-display text-foreground truncate">{nowPlaying.playing.name}</p>
            <p className="font-serif-display text-sm text-muted-foreground truncate">
              {nowPlaying.playing.artists.join(", ")}
            </p>
          </div>
        </a>
      ) : (
        <div className="mt-5 p-3 rounded-xl bg-muted/50">
          <p className="font-serif-display text-sm text-muted-foreground">
            {nowPlaying?.error ??
              (nowPlaying?.configured
                ? "Nothing is playing right now."
                : "Connect Spotify to see what's playing.")}
          </p>
        </div>
      )}

      {/* Top Tracks */}
      {topTracksLoading ? (
        <TopTracksSkeleton />
      ) : tracks.length ? (
        <ol className="mt-5 space-y-1">
          {tracks.map((track, index) => (
            <li key={track.id ?? track.spotifyUrl}>
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50"
              >
                <span className="font-hand text-lg text-muted-foreground w-5 text-center">
                  {index + 1}
                </span>
                {track.imageUrl && (
                  <img src={track.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-serif-display text-sm text-foreground truncate">{track.name}</p>
                  <p className="font-serif-display text-xs text-muted-foreground truncate">
                    {track.artists.join(", ")}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ol>
      ) : topTracks?.error ? (
        <p className="mt-5 font-serif-display text-sm text-muted-foreground">{topTracks.error}</p>
      ) : null}
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Pinterest Section                              */
/* -------------------------------------------------------------------------- */

function PinterestSection({ pinterest }: { pinterest: PinterestFeed | undefined }) {
  const loading = pinterest === undefined;
  const pins = pinterest?.items.filter((pin) => pin.imageUrl) ?? [];
  const comingSoon = !loading && !pinterest?.configured;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="tag-chip sage">Pinterest</span>
          <h2 className="mt-3 font-hand text-3xl md:text-4xl text-foreground">
            {comingSoon ? "Inspiration board" : "Saved ideas"}
          </h2>
          <p className="mt-1 font-serif-display text-muted-foreground">
            {comingSoon
              ? "A cozy board of saved ideas is on the way."
              : "Favorite pins, projects, and home inspiration."}
          </p>
        </div>
        {!comingSoon && (
          <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="btn-link">
            View on Pinterest
            <ArrowRight weight="bold" className="w-4 h-4" />
          </a>
        )}
      </div>

      {comingSoon ? (
        <EmptyState
          icon={<PinterestLogo weight="duotone" className="w-10 h-10" />}
          message="Hailey's favorite pins, projects, and inspiration will live here soon."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }, (_, index) => <PinterestPinSkeleton key={index} />)
            : pins.map((pin) => (
                <a
                  key={pin.id}
                  href={pin.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl overflow-hidden border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={pin.imageUrl}
                      alt={pin.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-serif-display text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {pin.title}
                    </p>
                  </div>
                </a>
              ))}
        </div>
      )}

      {!loading && pinterest?.configured && !pins.length && (
        <p className="font-serif-display text-sm text-muted-foreground mt-5 text-center">
          {pinterest.error ?? "No Pinterest pins are available right now."}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                  */
/* -------------------------------------------------------------------------- */

function formatPostDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Recent";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

async function fetchJson<T>(url: string, signal: AbortSignal) {
  const response = await fetch(url, { cache: "no-store", signal });
  return (await response.json()) as T;
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="text-muted-foreground/40 mx-auto mb-4 w-fit">{icon}</div>
      <p className="font-serif-display text-muted-foreground">{message}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Skeletons                                  */
/* -------------------------------------------------------------------------- */

function InstagramGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {Array.from({ length: 9 }, (_, index) => (
          <Skeleton key={index} className="aspect-square rounded-xl" />
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid md:grid-cols-2">
          <Skeleton className="aspect-square rounded-none" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-10 w-full rounded-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NowPlayingSkeleton() {
  return (
    <div className="mt-5 flex items-center gap-4 p-3 rounded-xl bg-muted/50">
      <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

function TopTracksSkeleton() {
  return (
    <ol className="mt-5 space-y-1">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="flex items-center gap-3 p-2">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-2 w-2/3" />
          </div>
        </li>
      ))}
    </ol>
  );
}

function PinterestPinSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <Skeleton className="aspect-[3/4] rounded-none" />
      <div className="p-3 space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
