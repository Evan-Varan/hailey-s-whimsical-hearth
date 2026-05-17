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

type InstagramResponse = {
  data?: InstagramMedia[];
  paging?: {
    next?: string;
  };
  error?: {
    message?: string;
  };
};

export const Route = createFileRoute("/api/instagram")({
  server: {
    handlers: {
      GET: async () => {
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

        try {
          const media = await fetchInstagramMedia(
            `https://graph.instagram.com/me/media?fields=${fields}&limit=25&access_token=${accessToken}`,
          );

          return json(
            {
              configured: true,
              source: "instagram",
              items: media.map(mapInstagramMedia),
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

async function fetchInstagramMedia(firstUrl: string) {
  const items: InstagramMedia[] = [];
  let nextUrl: string | undefined = firstUrl;
  let pageCount = 0;

  while (nextUrl && pageCount < 10) {
    const response = await fetch(nextUrl, {
      headers: {
        Accept: "application/json",
      },
    });
    const payload = (await response.json()) as InstagramResponse;

    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message ?? `Instagram returned ${response.status}`);
    }

    items.push(...(payload.data ?? []));
    nextUrl = payload.paging?.next;
    pageCount += 1;
  }

  return items;
}

function mapInstagramMedia(item: InstagramMedia) {
  const childMedia =
    item.children?.data?.map((child) => ({
      id: child.id,
      imageUrl: child.thumbnail_url ?? child.media_url,
      mediaUrl: child.media_url,
      mediaType: child.media_type,
    })) ?? [];
  const fallbackMedia = {
    id: item.id,
    imageUrl: item.thumbnail_url ?? item.media_url,
    mediaUrl: item.media_url,
    mediaType: item.media_type,
  };
  const media = childMedia.length ? childMedia : [fallbackMedia];

  return {
    id: item.id,
    caption: item.caption ?? "Instagram post",
    imageUrl: item.thumbnail_url ?? item.media_url,
    mediaType: item.media_type,
    media,
    permalink: item.permalink,
    timestamp: item.timestamp,
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
