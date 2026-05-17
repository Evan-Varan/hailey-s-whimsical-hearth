import { createFileRoute } from "@tanstack/react-router";

type UselessFactResponse = {
  id?: string;
  text?: string;
  source?: string;
  source_url?: string;
  permalink?: string;
};

type DailyFunFact = {
  date: string;
  source: string;
  fact: string;
  imageUrl: string;
  imageAlt: string;
  sourceUrl?: string;
};

type CommonsSearchResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        imageinfo?: Array<{
          thumburl?: string;
          url?: string;
          mime?: string;
        }>;
      }
    >;
  };
};

type WikipediaImageResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        thumbnail?: {
          source?: string;
        };
      }
    >;
  };
};

let dailyCache: { date: string; payload: DailyFunFact } | undefined;

export const Route = createFileRoute("/api/fun-fact")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const forceRandom = url.searchParams.get("random") === "1";
        const today = getCentralDateKey();

        if (!forceRandom && dailyCache?.date === today) {
          return json(dailyCache.payload, 200, dailyCacheHeaders());
        }

        try {
          const payload = await fetchFunFact(today, forceRandom);

          if (!forceRandom) {
            dailyCache = { date: today, payload };
          }

          return json(payload, 200, dailyCacheHeaders());
        } catch {
          const payload = getFallbackFunFact(today);

          if (!forceRandom) {
            dailyCache = { date: today, payload };
          }

          return json(payload, 200, dailyCacheHeaders());
        }
      },
    },
  },
});

async function fetchFunFact(date: string, forceRandom: boolean): Promise<DailyFunFact> {
  const response = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en", {
    headers: { Accept: "application/json" },
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(`Random Useless Facts returned ${response.status}`);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Random Useless Facts returned ${contentType || "unknown content"}`);
  }

  const payload = (await response.json()) as UselessFactResponse;

  if (!payload.text) {
    throw new Error("Random Useless Facts returned an empty response");
  }

  const image = await findRelatedImage(payload.text, date, forceRandom);

  return {
    date,
    source: payload.source ?? "Random Useless Facts",
    fact: payload.text,
    imageUrl: image.url,
    imageAlt: image.alt,
    sourceUrl: payload.source_url ?? payload.permalink,
  };
}

function getFallbackFunFact(date: string): DailyFunFact {
  const facts = [
    "The first oranges were not orange; early varieties were green or yellow-green.",
    "A group of flamingos is called a flamboyance.",
    "The Eiffel Tower can be more than six inches taller in hot weather.",
  ];
  const index = Math.abs(hashString(date)) % facts.length;

  return {
    date,
    source: "local fallback",
    fact: facts[index],
    imageUrl: getFallbackImageUrl(date, false),
    imageAlt: "Abstract photo for a fun fact",
  };
}

async function findRelatedImage(fact: string, date: string, forceRandom: boolean) {
  const query = getImageSearchQuery(fact);
  const wikipediaImage = await findWikipediaImage(query);

  if (wikipediaImage) {
    return wikipediaImage;
  }

  const endpoint = new URL("https://commons.wikimedia.org/w/api.php");
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|mime",
    iiurlwidth: "900",
  }).toString();

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
    });
    const payload = (await response.json()) as CommonsSearchResponse;
    const pages = Object.values(payload.query?.pages ?? {});
    const match = pages
      .map((page) => ({
        title: page.title?.replace(/^File:/, "") ?? query,
        image: page.imageinfo?.[0],
      }))
      .find(({ image }) => image?.thumburl && image.mime?.startsWith("image/"));

    if (match?.image?.thumburl) {
      return {
        url: match.image.thumburl,
        alt: match.title,
      };
    }
  } catch {
    // If image search fails, return a stable decorative fallback image.
  }

  return {
    url: getFallbackImageUrl(date, forceRandom),
    alt: "Abstract photo for a fun fact",
  };
}

async function findWikipediaImage(query: string) {
  const endpoint = new URL("https://en.wikipedia.org/w/api.php");
  endpoint.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "5",
    prop: "pageimages",
    pithumbsize: "900",
    pilicense: "any",
  }).toString();

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
    });
    const payload = (await response.json()) as WikipediaImageResponse;
    const match = Object.values(payload.query?.pages ?? {}).find((page) => page.thumbnail?.source);

    if (match?.thumbnail?.source) {
      return {
        url: match.thumbnail.source,
        alt: match.title ?? query,
      };
    }
  } catch {
    // Fall through to Commons image search.
  }

  return undefined;
}

function getImageSearchQuery(fact: string) {
  const quotedPhrase = fact.match(/["“]([^"”]{4,80})["”]/)?.[1];
  if (quotedPhrase) return quotedPhrase;

  const capitalizedPhrase = fact.match(
    /\b([A-Z][a-z0-9]+(?:\s+(?:of|the|and|in|[A-Z][a-z0-9]+)){0,4})\b/,
  )?.[1];
  if (capitalizedPhrase && !["The", "This", "There"].includes(capitalizedPhrase)) {
    return capitalizedPhrase;
  }

  const subject = fact
    .replace(/^[Aa]n?\s+|^[Tt]he\s+/, "")
    .split(
      /\s+(?:is|are|was|were|can|could|has|have|had|will|would|may|might|must|uses?|contains?|weighs?|grows?)\b/,
    )[0]
    ?.trim();

  if (subject && subject.length >= 4 && subject.length <= 80) {
    return subject;
  }

  const stopWords = new Set([
    "about",
    "after",
    "also",
    "because",
    "before",
    "being",
    "called",
    "could",
    "every",
    "first",
    "from",
    "have",
    "into",
    "more",
    "most",
    "only",
    "over",
    "than",
    "that",
    "their",
    "there",
    "they",
    "this",
    "were",
    "when",
    "with",
    "would",
  ]);
  const words = fact
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  return words.slice(0, 6).join(" ") || "curiosity";
}

function getFallbackImageUrl(date: string, forceRandom: boolean) {
  const seed = forceRandom ? `fun-fact-${Date.now()}` : `fun-fact-${date}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/640`;
}

function getCentralDateKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return `${year}-${month}-${day}`;
}

function hashString(value: string) {
  return value.split("").reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 0);
}

function dailyCacheHeaders() {
  return {
    "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200",
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
