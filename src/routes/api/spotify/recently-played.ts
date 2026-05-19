import { createFileRoute } from "@tanstack/react-router";

type SpotifyTokenResponse = {
  access_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type SpotifyRecentTrack = {
  track: {
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
  played_at: string;
};

type SpotifyRecentlyPlayedResponse = {
  items?: SpotifyRecentTrack[];
  error?: {
    status?: number;
    message?: string;
  };
};

export const Route = createFileRoute("/api/spotify/recently-played")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const token = await getSpotifyAccessToken();

          if (!token) {
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
          const limit = normalizeLimit(url.searchParams.get("limit"));
          const response = await fetch(
            `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
            {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
                Accept: "application/json",
              },
            },
          );
          const payload = (await response.json()) as SpotifyRecentlyPlayedResponse;

          if (response.status === 401) {
            return json({
              configured: false,
              items: [],
              error: "Spotify authentication expired. Regenerate the refresh token.",
              status: response.status,
            });
          }

          if (response.status === 403) {
            return json({
              configured: true,
              items: [],
              error:
                "Spotify recent spins need a refresh token authorized with user-read-recently-played.",
              status: response.status,
              spotifyMessage: payload.error?.message,
              scope: token.scope,
            });
          }

          if (!response.ok) {
            throw new Error(payload.error?.message ?? `Spotify returned ${response.status}`);
          }

          // Deduplicate by track ID
          const seen = new Set<string>();
          const items = (payload.items ?? [])
            .filter((item) => {
              if (seen.has(item.track.id)) return false;
              seen.add(item.track.id);
              return true;
            })
            .map(mapRecentTrack);

          return json(
            {
              configured: true,
              source: "spotify",
              items,
            },
            200,
            {
              "Cache-Control": "public, max-age=300, s-maxage=600",
            },
          );
        } catch (error) {
          console.error(error);
          return json(
            {
              configured: true,
              items: [],
              error: "Spotify recently played tracks are unavailable right now.",
            },
            200,
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
    throw new Error(
      payload.error_description ??
        payload.error ??
        `Spotify token refresh returned ${response.status}`,
    );
  }

  return {
    accessToken: payload.access_token,
    scope: payload.scope,
  };
}

function mapRecentTrack(item: SpotifyRecentTrack) {
  const { track } = item;
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    album: track.album.name,
    imageUrl: track.album.images[0]?.url,
    spotifyUrl: track.external_urls.spotify,
    playedAt: item.played_at,
  };
}

function normalizeLimit(value: string | null) {
  const limit = Number(value);
  if (!Number.isFinite(limit)) return 5;
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
