import { createFileRoute } from "@tanstack/react-router";
import { ArrowSquareOut, InstagramLogo, MusicNotes, VinylRecord } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { galleryItems } from "@/lib/blog-data";

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
    permalink: string;
    timestamp: string;
  }>;
  error?: string;
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

function GalleryPage() {
  const [instagram, setInstagram] = useState<InstagramFeed | null>(null);
  const [nowPlaying, setNowPlaying] = useState<SpotifyNowPlaying | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTopTracks | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSocialFeeds() {
      const [instagramResult, nowPlayingResult, topTracksResult] = await Promise.allSettled([
        fetchJson<InstagramFeed>("/api/instagram", controller.signal),
        fetchJson<SpotifyNowPlaying>("/api/spotify/now-playing", controller.signal),
        fetchJson<SpotifyTopTracks>("/api/spotify/top-tracks?limit=5", controller.signal),
      ]);

      if (controller.signal.aborted) return;

      if (instagramResult.status === "fulfilled") setInstagram(instagramResult.value);
      if (nowPlayingResult.status === "fulfilled") setNowPlaying(nowPlayingResult.value);
      if (topTracksResult.status === "fulfilled") setTopTracks(topTracksResult.value);
    }

    void loadSocialFeeds();

    return () => controller.abort();
  }, []);

  const instagramItems = instagram?.items.filter((item) => item.imageUrl) ?? [];
  const showInstagram = Boolean(instagram?.configured && instagramItems.length);

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

      <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 mt-14">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {showInstagram
              ? instagramItems.slice(0, 6).map((item) => (
                  <a
                    key={item.id}
                    href={item.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.caption}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute right-2 top-2 rounded-full bg-card/80 p-2 text-foreground backdrop-blur">
                      <ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))
              : galleryItems.slice(0, 6).map((item, index) => (
                  <div
                    key={`${item.alt}-${index}`}
                    className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
          </div>
          {!instagram?.configured ? (
            <p className="font-serif-display italic text-sm text-muted-foreground mt-5">
              Add an Instagram token to show Hailey's live feed here.
            </p>
          ) : null}
        </div>

        <SpotifyPanel nowPlaying={nowPlaying} topTracks={topTracks} />
      </section>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 mt-16 [column-fill:_balance]">
        {galleryItems.map((g, i) => (
          <figure key={i} className="mb-4 break-inside-avoid paper-card overflow-hidden">
            <img
              src={g.src}
              alt={g.alt}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
            />
            <figcaption className="px-4 py-3 font-serif-display italic text-sm text-muted-foreground">
              ✦ {g.alt}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}

function SpotifyPanel({
  nowPlaying,
  topTracks,
}: {
  nowPlaying: SpotifyNowPlaying | null;
  topTracks: SpotifyTopTracks | null;
}) {
  const tracks = topTracks?.items ?? [];

  return (
    <aside className="paper-card p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="tag-chip gold">spotify</span>
          <h2 className="font-hand text-4xl md:text-5xl text-foreground mt-2">on repeat</h2>
        </div>
        <MusicNotes weight="duotone" className="w-6 h-6 text-primary" aria-hidden />
      </div>

      {nowPlaying?.playing ? (
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
            {nowPlaying?.configured
              ? "Nothing is playing right now."
              : "Add Spotify credentials to show Hailey's listening here."}
          </p>
        </div>
      )}

      {tracks.length ? (
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
      ) : null}
    </aside>
  );
}

async function fetchJson<T>(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  return (await response.json()) as T;
}
