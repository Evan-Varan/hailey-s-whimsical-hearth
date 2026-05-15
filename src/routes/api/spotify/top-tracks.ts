import { createFileRoute } from "@tanstack/react-router";

type SpotifyTokenResponse = {
  access_token?: string;
  error?: string;
};

type SpotifyTrack = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  external_urls: {
    spotify: string;
  };
};

type SpotifyTopTracksResponse = {
  items?: SpotifyTrack[];
};

export const Route = createFileRoute("/api/spotify/top-tracks")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const accessToken = await getSpotifyAccessToken();

          if (!accessToken) {
            return json(
              {
                configured: false,
                items: [],
                error: "Spotify credentials are not configured.",
              },
              200,
            );
          }

          const url = new URL(request.url);
          const timeRange = normalizeTimeRange(url.searchParams.get("time_range"));
          const limit = normalizeLimit(url.searchParams.get("limit"));
          const response = await fetch(
            `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
              },
            },
          );
          const payload = (await response.json()) as SpotifyTopTracksResponse;

          if (!response.ok) {
            throw new Error(`Spotify returned ${response.status}`);
          }

          return json(
            {
              configured: true,
              source: "spotify",
              items: (payload.items ?? []).map(mapTrack),
            },
            200,
            {
              "Cache-Control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=1800",
            },
          );
        } catch (error) {
          console.error(error);
          return json(
            {
              configured: true,
              items: [],
              error: "Spotify top tracks are unavailable right now.",
            },
            502,
          );
        }
      },
    },
  },
});

async function getSpotifyAccessToken() {
  const clientId = getEnv("SPOTIFY_CLIENT_ID");
  const clientSecret = getEnv("SPOTIFY_CLIENT_SECRET");
  const refreshToken = getEnv("SPOTIFY_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) return null;

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const payload = (await response.json()) as SpotifyTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error ?? `Spotify token refresh returned ${response.status}`);
  }

  return payload.access_token;
}

function mapTrack(track: SpotifyTrack) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    album: track.album.name,
    imageUrl: track.album.images[0]?.url,
    spotifyUrl: track.external_urls.spotify,
  };
}

function normalizeTimeRange(value: string | null) {
  if (value === "short_term" || value === "medium_term" || value === "long_term") return value;
  return "short_term";
}

function normalizeLimit(value: string | null) {
  const limit = Number(value);
  if (!Number.isFinite(limit)) return 6;
  return Math.min(Math.max(Math.trunc(limit), 1), 10);
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function getEnv(name: string) {
  return typeof process !== "undefined" ? process.env[name] : undefined;
}
