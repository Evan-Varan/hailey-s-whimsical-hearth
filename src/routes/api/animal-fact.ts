import { createFileRoute } from "@tanstack/react-router";

type ZooAnimalResponse = {
  name?: string;
  latin_name?: string;
  animal_type?: string;
  active_time?: string;
  lifespan?: string;
  habitat?: string;
  diet?: string;
  geo_range?: string;
  image_link?: string;
};

type SomeRandomAnimalResponse = {
  image?: string;
  fact?: string;
};

type DailyAnimalFact = {
  date: string;
  source: string;
  name: string;
  scientificName?: string;
  imageUrl?: string;
  fact: string;
  details: Array<{
    label: string;
    value: string;
  }>;
};

let dailyCache: { date: string; payload: DailyAnimalFact } | undefined;

export const Route = createFileRoute("/api/animal-fact")({
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
          const payload = await fetchExternalAnimalFact(today, forceRandom);

          if (!forceRandom) {
            dailyCache = { date: today, payload };
          }

          return json(payload, 200, dailyCacheHeaders());
        } catch {
          const payload = getFallbackAnimalFact(today);

          if (!forceRandom) {
            dailyCache = { date: today, payload };
          }

          return json(payload, 200, dailyCacheHeaders());
        }
      },
    },
  },
});

async function fetchExternalAnimalFact(date: string, forceRandom: boolean) {
  const providers = [
    () => fetchSomeRandomAnimalFact(date, forceRandom),
    async () => mapAnimalFact(await fetchZooAnimal(), date),
  ];

  for (const provider of providers) {
    try {
      return await provider(date);
    } catch {
      // Try the next provider. If none work, the caller serves the local daily fallback.
    }
  }

  throw new Error("Animal fact APIs are unavailable.");
}

async function fetchSomeRandomAnimalFact(
  date: string,
  forceRandom: boolean,
): Promise<DailyAnimalFact> {
  const animal = pickSomeRandomAnimal(date, forceRandom);
  const payload = await fetchJson<SomeRandomAnimalResponse>(
    `https://api.some-random-api.com/animal/${animal.slug}`,
  );

  if (!payload.fact) {
    throw new Error("Some Random API returned an empty animal fact response");
  }

  return {
    date,
    source: "Some Random API",
    name: animal.name,
    imageUrl: payload.image,
    fact: payload.fact,
    details: [
      { label: "kind", value: animal.name },
      { label: "source", value: "Random animal endpoint" },
      { label: "daily", value: forceRandom ? "Bonus pull" : "Today's pick" },
    ],
  };
}

function pickSomeRandomAnimal(date: string, forceRandom: boolean) {
  const animals = [
    { slug: "fox", name: "Fox" },
    { slug: "cat", name: "Cat" },
    { slug: "panda", name: "Panda" },
    { slug: "red_panda", name: "Red panda" },
    { slug: "koala", name: "Koala" },
    { slug: "kangaroo", name: "Kangaroo" },
    { slug: "whale", name: "Whale" },
    { slug: "dog", name: "Dog" },
    { slug: "bird", name: "Bird" },
  ];
  const index = forceRandom
    ? Date.now() % animals.length
    : Math.abs(hashString(date)) % animals.length;
  return animals[index];
}

async function fetchJson<T>(endpoint: string) {
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(`${endpoint} returned ${response.status}`);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`${endpoint} returned ${contentType || "unknown content"}`);
  }

  return (await response.json()) as T;
}

async function fetchZooAnimal() {
  const endpoints = [
    "https://zoo-animal-api.herokuapp.com/",
    "https://zoo-animal-api.herokuapp.com/animals/rand/10",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });
      const contentType = response.headers.get("content-type") ?? "";

      if (!response.ok) {
        throw new Error(`Zoo Animals API returned ${response.status}`);
      }

      if (!contentType.includes("application/json")) {
        const preview = (await response.text()).slice(0, 80);
        throw new Error(`Zoo Animals API returned ${contentType || "unknown content"}: ${preview}`);
      }

      const payload = (await response.json()) as ZooAnimalResponse | ZooAnimalResponse[];
      const animal = Array.isArray(payload) ? payload[0] : payload;

      if (!animal?.name) {
        throw new Error("Zoo Animals API returned an empty animal response");
      }

      return animal;
    } catch {
      // Try the next known endpoint. If none work, the caller serves the local daily fallback.
    }
  }

  throw new Error("Zoo Animals API is unavailable.");
}

function mapAnimalFact(animal: ZooAnimalResponse, date: string): DailyAnimalFact {
  const details = [
    { label: "habitat", value: animal.habitat },
    { label: "diet", value: animal.diet },
    { label: "range", value: animal.geo_range },
    { label: "rhythm", value: animal.active_time },
    { label: "lifespan", value: formatYears(animal.lifespan) },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  const factParts = [
    animal.name,
    animal.habitat ? `is often found in ${animal.habitat.toLowerCase()}` : undefined,
    animal.diet ? `and follows a ${animal.diet.toLowerCase()} diet` : undefined,
  ].filter(Boolean);

  return {
    date,
    source: "Zoo Animals API",
    name: animal.name ?? "Mystery animal",
    scientificName: animal.latin_name,
    imageUrl: animal.image_link,
    fact: `${factParts.join(" ")}.`,
    details,
  };
}

function getFallbackAnimalFact(date: string): DailyAnimalFact {
  const fallbacks: DailyAnimalFact[] = [
    {
      date,
      source: "local fallback",
      name: "Red fox",
      scientificName: "Vulpes vulpes",
      fact: "Red foxes use their tails for balance, warmth, and quiet communication.",
      details: [
        { label: "habitat", value: "Forests, grasslands, mountains, and towns" },
        { label: "diet", value: "Omnivore" },
        { label: "rhythm", value: "Mostly nocturnal" },
      ],
    },
    {
      date,
      source: "local fallback",
      name: "Barn owl",
      scientificName: "Tyto alba",
      fact: "Barn owls can hunt by sound, using their heart-shaped facial disc to focus tiny noises.",
      details: [
        { label: "habitat", value: "Open fields, barns, and grasslands" },
        { label: "diet", value: "Carnivore" },
        { label: "rhythm", value: "Nocturnal" },
      ],
    },
    {
      date,
      source: "local fallback",
      name: "Seahorse",
      scientificName: "Hippocampus",
      fact: "Seahorses wrap their tails around seagrass and coral to stay anchored in moving water.",
      details: [
        { label: "habitat", value: "Shallow tropical and temperate seas" },
        { label: "diet", value: "Tiny crustaceans" },
        { label: "rhythm", value: "Diurnal" },
      ],
    },
  ];
  const index = Math.abs(hashString(date)) % fallbacks.length;
  return fallbacks[index];
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

function formatYears(value?: string) {
  if (!value) return undefined;
  return value.toLowerCase().includes("year") ? value : `${value} years`;
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
