import { createFileRoute } from "@tanstack/react-router";

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
};

type InstagramResponse = {
  data?: InstagramMedia[];
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
          "media_type",
          "media_url",
          "permalink",
          "thumbnail_url",
          "timestamp",
        ].join(",");

        try {
          const response = await fetch(
            `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${accessToken}`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );
          const payload = (await response.json()) as InstagramResponse;

          if (!response.ok || payload.error) {
            throw new Error(payload.error?.message ?? `Instagram returned ${response.status}`);
          }

          return json(
            {
              configured: true,
              source: "instagram",
              items: (payload.data ?? []).map((item) => ({
                id: item.id,
                caption: item.caption ?? "Instagram post",
                imageUrl: item.thumbnail_url ?? item.media_url,
                mediaType: item.media_type,
                permalink: item.permalink,
                timestamp: item.timestamp,
              })),
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
