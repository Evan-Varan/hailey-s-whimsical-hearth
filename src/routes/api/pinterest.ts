import { createFileRoute } from "@tanstack/react-router";

type PinterestTokenResponse = {
  access_token?: string;
  error?: string;
};

type PinterestPin = {
  id: string;
  title?: string;
  description?: string;
  link?: string;
  url?: string;
  media?: unknown;
  created_at?: string;
};

type PinterestPinsResponse = {
  items?: PinterestPin[];
  bookmark?: string | null;
  code?: number;
  message?: string;
};

export const Route = createFileRoute("/api/pinterest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const accessToken = await getPinterestAccessToken();

          if (!accessToken) {
            return json(
              {
                configured: false,
                items: [],
                error: "Pinterest credentials are not configured.",
              },
              200,
            );
          }

          const url = new URL(request.url);
          const limit = normalizeLimit(url.searchParams.get("limit"));
          const response = await fetch(`https://api.pinterest.com/v5/pins?page_size=${limit}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          });
          const payload = (await response.json()) as PinterestPinsResponse;

          if (!response.ok) {
            throw new Error(payload.message ?? `Pinterest returned ${response.status}`);
          }

          return json(
            {
              configured: true,
              source: "pinterest",
              items: (payload.items ?? []).map(mapPin).filter((pin) => pin.imageUrl),
              bookmark: payload.bookmark ?? null,
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
              error: "Pinterest pins are unavailable right now.",
            },
            502,
          );
        }
      },
    },
  },
});

async function getPinterestAccessToken() {
  const accessToken = getEnv("PINTEREST_ACCESS_TOKEN");
  if (accessToken) return accessToken;

  const clientId = getEnv("PINTEREST_CLIENT_ID");
  const clientSecret = getEnv("PINTEREST_CLIENT_SECRET");
  const refreshToken = getEnv("PINTEREST_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) return null;

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: "pins:read,boards:read",
    }),
  });
  const payload = (await response.json()) as PinterestTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error ?? `Pinterest token refresh returned ${response.status}`);
  }

  return payload.access_token;
}

function mapPin(pin: PinterestPin) {
  return {
    id: pin.id,
    title: pin.title || "Pinterest pin",
    description: pin.description ?? "",
    imageUrl: findImageUrl(pin.media),
    link: pin.link || pin.url || `https://www.pinterest.com/pin/${pin.id}/`,
    createdAt: pin.created_at,
  };
}

function findImageUrl(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = findImageUrl(item);
      if (url) return url;
    }
    return undefined;
  }

  const fields = value as Record<string, unknown>;
  const directUrl = fields.url;

  if (typeof directUrl === "string" && isLikelyImageUrl(directUrl)) {
    return directUrl;
  }

  for (const nestedValue of Object.values(fields)) {
    const url = findImageUrl(nestedValue);
    if (url) return url;
  }

  return undefined;
}

function isLikelyImageUrl(value: string) {
  return /^https?:\/\//.test(value) && /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(value);
}

function normalizeLimit(value: string | null) {
  const limit = Number(value);
  if (!Number.isFinite(limit)) return 8;
  return Math.min(Math.max(Math.trunc(limit), 1), 25);
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
