import { createFileRoute } from "@tanstack/react-router";

type SpotifyTokenResponse = {
  access_token?: string;
  error?: string;
};

type SpotifyTrack = {
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

type SpotifyNowPlayingResponse = {
  is_playing?: boolean;
  item?: SpotifyTrack;
  currently_playing_type?: string;
  progress_ms?: number;
};

export const Route = createFileRoute("/api/spotify/now-playing")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const accessToken = await getSpotifyAccessToken();

          if (!accessToken) {
            return json(
              {
                configured: false,
                playing: null,
                error: "Spotify credentials are not configured.",
              },
              200,
            );
          }

          const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          });

          if (response.status === 204) {
            return json(
              {
                configured: true,
                playing: null,
              },
              200,
              {
                "Cache-Control": "public, max-age=60, s-maxage=60",
              },
            );
          }

          const payload = (await response.json()) as SpotifyNowPlayingResponse;

          if (!response.ok) {
            throw new Error(`Spotify returned ${response.status}`);
          }

          return json(
            {
              configured: true,
              playing: payload.item ? mapTrack(payload.item, payload.is_playing ?? false) : null,
              progressMs: payload.progress_ms,
              type: payload.currently_playing_type,
            },
            200,
            {
              "Cache-Control": "public, max-age=60, s-maxage=60",
            },
          );
        } catch (error) {
          console.error(error);
          return json(
            {
              configured: true,
              playing: null,
              error: "Spotify now playing is unavailable right now.",
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

function mapTrack(track: SpotifyTrack, isPlaying?: boolean) {
  return {
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    album: track.album.name,
    imageUrl: track.album.images[0]?.url,
    spotifyUrl: track.external_urls.spotify,
    isPlaying,
  };
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
