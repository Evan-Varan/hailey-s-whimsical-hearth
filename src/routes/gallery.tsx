import { createFileRoute } from "@tanstack/react-router";
import {
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
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="tag-chip gold">from the camera roll</span>
        <h1 className="font-hand text-6xl md:text-7xl text-foreground mt-4">
          A little visual scrapbook
        </h1>
        <p className="font-serif-display italic text-lg text-muted-foreground mt-4">
          Soft afternoons, finished projects, the cat being unhelpful — saved for later.
        </p>
      </div>

      <section className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 mt-14 items-start">
        <InstagramSection
          items={instagramItems}
          loading={instagramLoading}
          configured={instagram?.configured}
          error={instagram?.error}
          showInstagram={showInstagram}
        />

        <SpotifyPanel nowPlaying={nowPlaying} topTracks={topTracks} />
      </section>

      <PinterestPanel pinterest={pinterest} />
    </main>
  );
}

function getVisibleMedia(item: InstagramFeed["items"][number]) {
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
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="tag-chip rose">instagram</span>
          <h2 className="font-hand mt-3 text-4xl text-foreground md:text-5xl">
            lately from Hailey
          </h2>
          <p className="mt-2 max-w-md font-serif-display text-sm text-muted-foreground">
            A cleaner feed view for recent posts, carousels, and tiny camera-roll moments.
          </p>
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:border-primary transition-colors"
        >
          <InstagramLogo weight="duotone" className="h-4 w-4 text-primary" />
          <span className="font-sans-ui text-xs font-medium text-foreground">Follow</span>
        </a>
      </div>

      {loading ? (
        <InstagramGridSkeleton />
      ) : showInstagram ? (
        <>
          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {items.slice(0, 9).map((item, index) => (
              <InstagramGridItem
                key={item.id}
                item={item}
                index={index}
                active={index === activePostIndex}
                onSelect={() => setActivePostIndex(index)}
              />
            ))}
          </div>

          {/* Expanded post detail */}
          {activePost && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <InstagramPostDetail item={activePost} />
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <InstagramLogo weight="duotone" className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
          <p className="font-serif-display text-muted-foreground">
            {!configured
              ? "Add an Instagram token to show Hailey's live feed here."
              : (error ?? "No Instagram posts are available right now.")}
          </p>
        </div>
      )}
    </section>
  );
}

function InstagramGridItem({
  item,
  index,
  active,
  onSelect,
}: {
  item: InstagramFeed["items"][number];
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const media = getVisibleMedia(item)[0];
  if (!media) return null;

  // Create visual variety with different aspect ratios
  const isLarge = index === 0 || index === 4;
  const aspectClass = isLarge ? "aspect-[4/5]" : "aspect-square";

  return (
    <button
      type="button"
      className={`group relative overflow-hidden rounded-xl md:rounded-2xl text-left transition-all duration-300 ${
        active 
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
          : "hover:ring-1 hover:ring-border"
      } ${isLarge ? "md:row-span-2" : ""}`}
      onClick={onSelect}
      aria-label={`Show Instagram post from ${formatPostDate(item.timestamp)}`}
    >
      <div className={`relative ${aspectClass} overflow-hidden bg-muted`}>
        <InstagramMedia media={media} caption={item.caption} />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="font-serif-display text-xs md:text-sm text-white/90 line-clamp-2">
            {item.caption}
          </p>
        </div>

        {/* Carousel indicator */}
        {getVisibleMedia(item).length > 1 && (
          <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-1">
            <span className="font-sans-ui text-[10px] text-white/90">{getVisibleMedia(item).length}</span>
          </span>
        )}

        {/* Date badge */}
        <span className="absolute top-2 left-2 rounded-full bg-card/90 backdrop-blur-sm px-2.5 py-1 font-sans-ui text-[10px] uppercase tracking-wider text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {formatPostDate(item.timestamp)}
        </span>
      </div>
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
    <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[1.2fr_0.8fr]">
      {/* Media side */}
      <div className="relative bg-muted">
        <div className="aspect-square md:aspect-auto md:h-full overflow-hidden">
          <InstagramMedia media={activeMedia} caption={item.caption} fit="contain" />
        </div>
        
        {/* Media navigation dots */}
        {hasMultipleMedia && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/40 backdrop-blur-sm">
            {visibleMedia.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === activeIndex 
                    ? 'w-5 h-1.5 bg-white' 
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Show image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content side */}
      <div className="flex flex-col p-5 md:p-6 lg:p-8">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border">
          <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {formatPostDate(item.timestamp)}
          </p>
          {hasMultipleMedia && (
            <p className="font-sans-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {activeIndex + 1} / {visibleMedia.length}
            </p>
          )}
        </div>

        <div className="flex-1 py-5">
          <p className="font-serif-display text-foreground leading-relaxed">
            {item.caption}
          </p>
        </div>

        {/* Carousel thumbnails */}
        {hasMultipleMedia && (
          <div className="grid grid-cols-6 gap-2 pb-5">
            {visibleMedia.map((mediaItem, index) => (
              <button
                key={mediaItem.id}
                type="button"
                className={`overflow-hidden rounded-lg transition-all duration-200 ${
                  index === activeIndex 
                    ? "ring-2 ring-primary" 
                    : "opacity-60 hover:opacity-100"
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1}`}
              >
                <span className="block aspect-square">
                  <InstagramMedia media={mediaItem} caption={item.caption} />
                </span>
              </button>
            ))}
          </div>
        )}

        <a
          href={item.permalink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-sans-ui text-sm font-medium transition-all hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5"
        >
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
      className={`h-full w-full ${fitClass} transition-transform duration-700 group-hover:scale-105`}
    />
  );
}

function formatPostDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "recent post";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

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
    <aside className="paper-card p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="tag-chip gold">spotify</span>
          <h2 className="font-hand text-4xl md:text-5xl text-foreground mt-2">on repeat</h2>
          <p className="font-serif-display italic text-sm text-muted-foreground mt-1">
            top tracks from the last 4 weeks
          </p>
        </div>
        <MusicNotes weight="duotone" className="w-6 h-6 text-primary" aria-hidden />
      </div>

      {nowPlayingLoading ? (
        <NowPlayingSkeleton />
      ) : nowPlaying?.playing ? (
        <a
          href={nowPlaying.playing.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex gap-4 rounded-2xl border border-border bg-card/70 p-4 transition-colors hover:border-primary"
        >
          {nowPlaying.playing.imageUrl ? (
            <img
              src={nowPlaying.playing.imageUrl}
              alt=""
              className="h-20 w-20 rounded-xl object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-muted grid place-items-center">
              <VinylRecord weight="duotone" className="h-7 w-7 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-sans-ui text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {nowPlaying.playing.isPlaying ? "now playing" : "last playing"}
            </p>
            <p className="font-serif-display italic text-foreground mt-1">
              {nowPlaying.playing.name}
            </p>
            <p className="font-serif-display italic text-sm text-muted-foreground">
              {nowPlaying.playing.artists.join(", ")}
            </p>
          </div>
        </a>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-card/70 p-4">
          <p className="font-serif-display italic text-muted-foreground">
            {nowPlaying?.error ??
              (nowPlaying?.configured
                ? "Nothing is playing right now."
                : "Add Spotify credentials to show Hailey's listening here.")}
          </p>
        </div>
      )}

      {topTracksLoading ? (
        <TopTracksSkeleton />
      ) : tracks.length ? (
        <ol className="mt-6 space-y-3">
          {tracks.map((track, index) => (
            <li key={track.id ?? track.spotifyUrl}>
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
              >
                <span className="font-hand text-2xl text-accent w-7 shrink-0">{index + 1}</span>
                {track.imageUrl ? (
                  <img
                    src={track.imageUrl}
                    alt=""
                    className="h-11 w-11 rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : null}
                <span className="min-w-0">
                  <span className="block truncate font-serif-display italic text-foreground">
                    {track.name}
                  </span>
                  <span className="block truncate font-serif-display italic text-sm text-muted-foreground">
                    {track.artists.join(", ")}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      ) : topTracks?.error ? (
        <p className="font-serif-display italic text-sm text-muted-foreground mt-5">
          {topTracks.error}
        </p>
      ) : null}
    </aside>
  );
}

function PinterestPanel({ pinterest }: { pinterest: PinterestFeed | undefined }) {
  const loading = pinterest === undefined;
  const pins = pinterest?.items.filter((pin) => pin.imageUrl) ?? [];
  const comingSoon = !loading && !pinterest?.configured;

  return (
    <section className="paper-card p-6 md:p-8 mt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="tag-chip rose">coming soon</span>
          <h2 className="font-hand text-4xl md:text-5xl text-foreground mt-2">
            Pinterest inspiration
          </h2>
          <p className="font-serif-display italic text-sm text-muted-foreground mt-1">
            a cozy board of saved ideas is on the way
          </p>
        </div>
        <PinterestLogo weight="duotone" className="w-6 h-6 text-primary" aria-hidden />
      </div>

      {comingSoon ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/70 p-6">
          <p className="font-serif-display italic text-muted-foreground">
            Hailey's favorite pins, projects, outfits, and home inspiration will live here soon.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {loading
            ? Array.from({ length: 8 }, (_, index) => <PinterestPinSkeleton key={index} />)
            : pins.map((pin) => (
                <a
                  key={pin.id}
                  href={pin.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-2xl border border-border bg-card/70"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={pin.imageUrl}
                      alt={pin.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute right-2 top-2 rounded-full bg-card/85 p-2 text-foreground backdrop-blur">
                      <ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 font-serif-display italic text-foreground">
                      {pin.title}
                    </p>
                    {pin.description ? (
                      <p className="line-clamp-2 font-serif-display italic text-sm text-muted-foreground mt-2">
                        {pin.description}
                      </p>
                    ) : null}
                  </div>
                </a>
              ))}
        </div>
      )}

      {!loading && pinterest?.configured && !pins.length ? (
        <p className="font-serif-display italic text-sm text-muted-foreground mt-5">
          {pinterest.error ?? "No Pinterest pins are available right now."}
        </p>
      ) : null}
    </section>
  );
}

function PinterestPinSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/70">
      <Skeleton className="aspect-[3/4] rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function InstagramGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" aria-hidden>
        {Array.from({ length: 9 }, (_, index) => {
          const isLarge = index === 0 || index === 4;
          return (
            <div 
              key={index} 
              className={`overflow-hidden rounded-xl md:rounded-2xl bg-muted ${isLarge ? "md:row-span-2" : ""}`}
            >
              <Skeleton className={`${isLarge ? "aspect-[4/5]" : "aspect-square"} rounded-none`} />
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid md:grid-cols-2">
          <Skeleton className="aspect-square rounded-none" />
          <div className="p-6 lg:p-8 space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
            <div className="pt-4">
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NowPlayingSkeleton() {
  return (
    <div className="mt-6 flex gap-4 rounded-2xl border border-border bg-card/70 p-4">
      <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-3 py-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function TopTracksSkeleton() {
  return (
    <ol className="mt-6 space-y-3" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="flex items-center gap-3 rounded-xl p-2">
          <Skeleton className="h-8 w-7 shrink-0" />
          <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
          <span className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </span>
        </li>
      ))}
    </ol>
  );
}

async function fetchJson<T>(url: string, signal: AbortSignal) {
  const response = await fetch(url, { cache: "no-store", signal });
  return (await response.json()) as T;
}
