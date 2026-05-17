import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
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
        item.imageUrl ||
        item.media?.some((mediaItem) => mediaItem.imageUrl || mediaItem.mediaUrl),
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
        <div className="paper-card p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="tag-chip rose">instagram</span>
              <h2 className="font-hand text-4xl md:text-5xl text-foreground mt-2">
                lately from Hailey
              </h2>
            </div>
            <InstagramLogo weight="duotone" className="w-6 h-6 text-primary" aria-hidden />
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
            {instagramLoading ? <InstagramSkeleton /> : null}
            {showInstagram
              ? instagramItems.map((item) => <InstagramPostCard key={item.id} item={item} />)
              : null}
          </div>
          {!instagramLoading && !instagram?.configured ? (
            <p className="font-serif-display italic text-sm text-muted-foreground mt-5">
              Add an Instagram token to show Hailey's live feed here.
            </p>
          ) : null}
          {!instagramLoading && instagram?.configured && !instagramItems.length ? (
            <p className="font-serif-display italic text-sm text-muted-foreground mt-5">
              {instagram.error ?? "No Instagram posts are available right now."}
            </p>
          ) : null}
        </div>

        <SpotifyPanel nowPlaying={nowPlaying} topTracks={topTracks} />
      </section>

      <PinterestPanel pinterest={pinterest} />
    </main>
  );
}

function getVisibleMedia(item: InstagramFeed["items"][number]) {
  const media =
    (item.media?.length ? item.media : undefined) ?? [
      {
        id: item.id,
        imageUrl: item.imageUrl,
        mediaUrl: item.imageUrl,
        mediaType: item.mediaType,
      },
    ];

  return media.filter((mediaItem) => mediaItem.imageUrl || mediaItem.mediaUrl);
}

function InstagramPostCard({ item }: { item: InstagramFeed["items"][number] }) {
  const visibleMedia = getVisibleMedia(item);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = visibleMedia[activeIndex] ?? visibleMedia[0];
  const hasMultipleMedia = visibleMedia.length > 1;

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? visibleMedia.length - 1 : current - 1));
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % visibleMedia.length);
  }

  if (!activeMedia) return null;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card/70">
      <div className="group relative aspect-square overflow-hidden bg-muted">
        <InstagramMedia media={activeMedia} caption={item.caption} />

        {hasMultipleMedia ? (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-card/85 text-foreground opacity-90 shadow-sm backdrop-blur transition-opacity hover:bg-card group-hover:opacity-100 sm:opacity-0 focus-visible:opacity-100"
              onClick={showPrevious}
              aria-label="Previous Instagram image"
            >
              <CaretLeft weight="bold" className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-card/85 text-foreground opacity-90 shadow-sm backdrop-blur transition-opacity hover:bg-card group-hover:opacity-100 sm:opacity-0 focus-visible:opacity-100"
              onClick={showNext}
              aria-label="Next Instagram image"
            >
              <CaretRight weight="bold" className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-card/80 px-2 py-1 backdrop-blur">
              {visibleMedia.map((mediaItem, index) => (
                <button
                  key={mediaItem.id}
                  type="button"
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === activeIndex ? "bg-primary" : "bg-muted-foreground/35"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show Instagram image ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}

        <a
          href={item.permalink}
          target="_blank"
          rel="noreferrer"
          className="absolute right-2 top-2 rounded-full bg-card/85 p-2 text-foreground backdrop-blur transition-colors hover:bg-card"
          aria-label="Open Instagram post"
        >
          <ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="space-y-2 p-4">
        <p className="line-clamp-3 font-serif-display italic text-sm text-muted-foreground">
          {item.caption}
        </p>
        {hasMultipleMedia ? (
          <p className="font-sans-ui text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {activeIndex + 1} / {visibleMedia.length}
          </p>
        ) : null}
      </div>
    </article>
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

  return (
    <section className="paper-card p-6 md:p-8 mt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="tag-chip rose">pinterest</span>
          <h2 className="font-hand text-4xl md:text-5xl text-foreground mt-2">
            saved inspiration
          </h2>
          <p className="font-serif-display italic text-sm text-muted-foreground mt-1">
            recent pins from Hailey's Pinterest
          </p>
        </div>
        <PinterestLogo weight="duotone" className="w-6 h-6 text-primary" aria-hidden />
      </div>

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

      {!loading && !pinterest?.configured ? (
        <p className="font-serif-display italic text-sm text-muted-foreground mt-5">
          Add Pinterest credentials to show recent pins here.
        </p>
      ) : null}
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

function InstagramSkeleton() {
  return Array.from({ length: 9 }, (_, index) => (
    <div key={index} className="overflow-hidden rounded-2xl border border-border bg-card/70">
      <Skeleton className="aspect-square rounded-none bg-muted/70" aria-hidden />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ));
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
