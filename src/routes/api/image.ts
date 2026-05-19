import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_IMAGE_HOSTS = [
  "cdninstagram.com",
  "fbcdn.net",
  "pinimg.com",
  "scdn.co",
  "spotifycdn.com",
];

export const Route = createFileRoute("/api/image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const source = url.searchParams.get("src");
        const width = normalizeWidth(url.searchParams.get("w"));
        const quality = normalizeQuality(url.searchParams.get("q"));

        if (!source) {
          return new Response("Missing image source.", { status: 400 });
        }

        let imageUrl: URL;
        try {
          imageUrl = new URL(source);
        } catch {
          return new Response("Invalid image source.", { status: 400 });
        }

        if (!isAllowedImageHost(imageUrl.hostname)) {
          return new Response("Image host is not allowed.", { status: 400 });
        }

        const response = await fetch(imageUrl.toString(), {
          headers: {
            Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
          },
          cf: {
            image: {
              fit: "cover",
              format: "webp",
              quality,
              width,
            },
            cacheEverything: true,
            cacheTtl: 60 * 60 * 24 * 7,
          },
        } as RequestInit & {
          cf: {
            image: {
              fit: "cover";
              format: "webp";
              quality: number;
              width: number;
            };
            cacheEverything: boolean;
            cacheTtl: number;
          };
        });

        if (!response.ok || !response.body) {
          return new Response("Image is unavailable.", { status: response.status || 502 });
        }

        return new Response(response.body, {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
            "Content-Type": response.headers.get("Content-Type") ?? "image/webp",
          },
        });
      },
    },
  },
});

function isAllowedImageHost(hostname: string) {
  return ALLOWED_IMAGE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

function normalizeWidth(value: string | null) {
  const width = Number(value);
  if (!Number.isFinite(width)) return 900;
  return Math.min(Math.max(Math.trunc(width), 80), 1600);
}

function normalizeQuality(value: string | null) {
  const quality = Number(value);
  if (!Number.isFinite(quality)) return 72;
  return Math.min(Math.max(Math.trunc(quality), 35), 90);
}
