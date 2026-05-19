import { createFileRoute } from "@tanstack/react-router";

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  children?: {
    data?: InstagramChildMedia[];
  };
};

type InstagramChildMedia = {
  id: string;
  media_type: "IMAGE" | "VIDEO";
  media_url?: string;
  thumbnail_url?: string;
};

export const Route = createFileRoute("/api/instagram")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const accessToken = getEnv("INSTAGRAM_ACCESS_TOKEN");

        if (!accessToken) {
          return json(
            {
              configured: false,
              items: [],
              error: "Instagram access token is not configured.",
            },
            200,
          );
        }

        const url = new URL(request.url);
        const cursor = url.searchParams.get("cursor");
        const limit = normalizeLimit(url.searchParams.get("limit"));

        const fields = [
          "id",
          "caption",
          "children{media_type,media_url,thumbnail_url,id}",
          "media_type",
          "media_url",
          "permalink",
          "thumbnail_url",
          "timestamp",
        ].join(",");

        const baseUrl = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;
        const fetchUrl = cursor ? `${baseUrl}&after=${cursor}` : baseUrl;

        try {
          const response = await fetch(fetchUrl, {
            headers: {
              Accept: "application/json",
            },
          });
          const payload = (await response.json()) as InstagramResponse;

          if (!response.ok || payload.error) {
            throw new Error(payload.error?.message ?? `Instagram returned ${response.status}`);
          }

          return json(
            {
              configured: true,
              source: "instagram",
              items: (payload.data ?? []).map(mapInstagramMedia),
              nextCursor: payload.paging?.cursors?.after ?? null,
              hasMore: Boolean(payload.paging?.next),
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
              error: "Instagram feed is unavailable right now.",
            },
            502,
          );
        }
      },
    },
  },
});

type InstagramResponse = {
  data?: InstagramMedia[];
  paging?: {
    next?: string;
    cursors?: {
      before?: string;
      after?: string;
    };
  };
  error?: {
    message?: string;
  };
};

function mapInstagramMedia(item: InstagramMedia) {
  const childMedia =
    item.children?.data?.map((child) =>
      mapMediaItem({
        id: child.id,
        mediaType: child.media_type,
        mediaUrl: child.media_url,
        thumbnailUrl: child.thumbnail_url,
      }),
    ) ?? [];
  const fallbackMedia = {
    id: item.id,
    imageUrl: getOptimizedImageUrl(item.thumbnail_url ?? item.media_url, 900),
    mediaType: item.media_type,
    thumbnailUrl: getOptimizedImageUrl(item.thumbnail_url ?? item.media_url, 180, 64),
  };
  const media = childMedia.length ? childMedia : [fallbackMedia];

  return {
    id: item.id,
    caption: item.caption ?? "Instagram post",
    imageUrl: getOptimizedImageUrl(item.thumbnail_url ?? item.media_url, 900),
    mediaType: item.media_type,
    media,
    permalink: item.permalink,
    timestamp: item.timestamp,
  };
}

function mapMediaItem({
  id,
  mediaType,
  mediaUrl,
  thumbnailUrl,
}: {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl?: string;
  thumbnailUrl?: string;
}) {
  const posterUrl = thumbnailUrl ?? mediaUrl;

  return {
    id,
    imageUrl: getOptimizedImageUrl(posterUrl, 900),
    mediaType,
    thumbnailUrl: getOptimizedImageUrl(posterUrl, 180, 64),
  };
}

function getOptimizedImageUrl(source: string | undefined, width: number, quality = 72) {
  if (!source) return undefined;

  const params = new URLSearchParams({
    q: String(quality),
    src: source,
    w: String(width),
  });

  return `/api/image?${params.toString()}`;
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

function normalizeLimit(value: string | null) {
  const limit = Number(value);
  if (!Number.isFinite(limit)) return 12;
  return Math.min(Math.max(Math.trunc(limit), 1), 24);
}

function getEnv(name: string) {
  return typeof process !== "undefined" ? process.env[name] : undefined;
}
