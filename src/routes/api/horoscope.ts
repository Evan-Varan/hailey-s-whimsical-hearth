import { createFileRoute } from "@tanstack/react-router";

const validSigns = new Set([
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
]);

type FreeHoroscopeResponse = {
  data?: {
    date?: string;
    period?: string;
    sign?: string;
    horoscope?: string;
  };
};

export const Route = createFileRoute("/api/horoscope")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sign = (url.searchParams.get("sign") ?? "aries").toLowerCase();

        if (!validSigns.has(sign)) {
          return json(
            {
              error: "Invalid zodiac sign.",
              validSigns: Array.from(validSigns),
            },
            400,
          );
        }

        try {
          const upstream = await fetch(
            `https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign}`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!upstream.ok) {
            throw new Error(`Horoscope provider returned ${upstream.status}`);
          }

          const payload = (await upstream.json()) as FreeHoroscopeResponse;
          const horoscope = payload.data?.horoscope;

          if (!horoscope) {
            throw new Error("Horoscope provider response did not include a horoscope.");
          }

          return json(
            {
              source: "freehoroscopeapi.com",
              date: payload.data?.date,
              period: payload.data?.period ?? "daily",
              sign: payload.data?.sign ?? titleCase(sign),
              horoscope,
            },
            200,
            {
              "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600",
            },
          );
        } catch (error) {
          console.error(error);
          return json(
            {
              error: "Daily horoscope is unavailable right now.",
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

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
