import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";

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

const signOrder = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const trackedPlanets = new Set([
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
]);

type FreeAstrologyPlanet = {
  planet?: { en?: string };
  normDegree?: number;
  isRetro?: string | boolean;
  zodiac_sign?: {
    name?: { en?: string };
  };
};

type FreeAstrologyResponse = {
  statusCode?: number;
  output?: FreeAstrologyPlanet[];
};

export const Route = createFileRoute("/api/astrology-transits")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const selectedSign = (url.searchParams.get("sign") ?? "aries").toLowerCase();

        if (!validSigns.has(selectedSign)) {
          return json(
            {
              configured: false,
              error: "Invalid zodiac sign.",
              validSigns: Array.from(validSigns),
            },
            400,
          );
        }

        const apiKey = getEnv("FREE_ASTROLOGY_API_KEY");
        const latitude = Number(url.searchParams.get("lat"));
        const longitude = Number(url.searchParams.get("lon"));
        const timezone = Number(url.searchParams.get("tz"));

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(timezone)) {
          return json(
            {
              configured: false,
              source: "freeastrologyapi.com",
              placements: [],
              error:
                "Browser location is required for current planetary placements.",
            },
            200,
          );
        }

        if (!apiKey) {
          return json(
            {
              configured: false,
              source: "freeastrologyapi.com",
              placements: [],
              error: "FREE_ASTROLOGY_API_KEY is required for the current planetary-position provider.",
            },
            200,
          );
        }

        const now = new Date();

        try {
          const response = await fetch("https://json.freeastrologyapi.com/western/planets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              Accept: "application/json",
            },
            body: JSON.stringify({
              year: now.getUTCFullYear(),
              month: now.getUTCMonth() + 1,
              date: now.getUTCDate(),
              hours: now.getUTCHours(),
              minutes: now.getUTCMinutes(),
              seconds: now.getUTCSeconds(),
              latitude,
              longitude,
              timezone,
              config: {
                observation_point: "geocentric",
                ayanamsha: "tropical",
                language: "en",
              },
            }),
          });
          const payload = (await response.json()) as FreeAstrologyResponse;

          if (!response.ok || !Array.isArray(payload.output)) {
            throw new Error(`Free Astrology API returned ${response.status}`);
          }

          const selected = titleCase(selectedSign);
          const placements = payload.output
            .map(mapPlanet)
            .filter((planet) => planet && trackedPlanets.has(planet.planet))
            .map((planet) => {
              const house = houseFromSelectedSign(selected, planet.sign);
              return {
                ...planet,
                house,
                houseLabel: ordinal(house),
                meaning: composeMeaning(planet.planet, planet.sign, house, planet.retrograde),
              };
            });
          const overview = composeOverview(selected, placements);

          return json(
            {
              configured: true,
              source: "freeastrologyapi.com",
              generatedAt: now.toISOString(),
              selectedSign: selected,
              overview,
              placements,
            },
            200,
            {
              "Cache-Control": "public, max-age=900, s-maxage=1800, stale-while-revalidate=900",
            },
          );
        } catch (error) {
          console.error(error);
          return json(
            {
              configured: true,
              source: "freeastrologyapi.com",
              placements: [],
              error: "Current planetary placements are unavailable right now.",
            },
            502,
          );
        }
      },
    },
  },
});

function mapPlanet(item: FreeAstrologyPlanet) {
  const planet = item.planet?.en;
  const sign = item.zodiac_sign?.name?.en;

  if (!planet || !sign || typeof item.normDegree !== "number") return null;

  return {
    planet,
    sign,
    degree: Number(item.normDegree.toFixed(1)),
    retrograde: item.isRetro === true || String(item.isRetro).toLowerCase() === "true",
  };
}

function houseFromSelectedSign(selectedSign: string, transitSign: string) {
  const selectedIndex = signOrder.indexOf(selectedSign);
  const transitIndex = signOrder.indexOf(transitSign);

  if (selectedIndex < 0 || transitIndex < 0) return 1;

  return ((transitIndex - selectedIndex + 12) % 12) + 1;
}

function composeMeaning(planet: string, sign: string, house: number, retrograde: boolean) {
  const planetTheme = planetThemes[planet] ?? "asks for attention";
  const houseTheme = houseThemes[house] ?? "the shape of the day";
  const retrogradeNote = retrograde ? " Retrograde motion makes this more reflective than outward-facing." : "";

  return `${planet} in ${sign} ${planetTheme} through your ${ordinal(house)} house of ${houseTheme}.${retrogradeNote}`;
}

type Placement = {
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
  house: number;
  houseLabel: string;
  meaning: string;
};

function composeOverview(selectedSign: string, placements: Placement[]) {
  const sun = placements.find((item) => item.planet === "Sun");
  const moon = placements.find((item) => item.planet === "Moon");
  const mercury = placements.find((item) => item.planet === "Mercury");
  const venus = placements.find((item) => item.planet === "Venus");
  const mars = placements.find((item) => item.planet === "Mars");
  const saturn = placements.find((item) => item.planet === "Saturn");
  const pluto = placements.find((item) => item.planet === "Pluto");
  const strongestHouses = topHouses(placements);
  const focusAreas = strongestHouses.map((house) => `${ordinal(house)} house: ${houseThemes[house]}`);
  const lead = sun ?? moon ?? placements[0];
  const emotional = moon ?? lead;
  const action = mars ?? mercury ?? lead;
  const pressure = saturn ?? pluto ?? placements.find((item) => item.retrograde) ?? lead;

  return {
    headline: `${selectedSign}, the sky is emphasizing ${focusAreas[0] ?? "your current direction"}.`,
    summary: [
      lead
        ? `${lead.planet} in ${lead.sign} puts the strongest light on your ${lead.houseLabel} house of ${houseThemes[lead.house]}.`
        : `The current sky is asking ${selectedSign} to move carefully and listen for the next clear step.`,
      emotional && emotional !== lead
        ? `${emotional.planet} adds emotional emphasis to ${houseThemes[emotional.house]}, so pay attention to what feels loud or tender there.`
        : null,
      action && action !== lead
        ? `${action.planet} shows where movement is possible now: ${houseThemes[action.house]}.`
        : null,
    ]
      .filter(Boolean)
      .join(" "),
    focusAreas,
    advice: composeAdvice(action, emotional),
    watchFor: composeWatchFor(pressure),
    keyTransits: [sun, moon, mercury, venus, mars, saturn, pluto]
      .filter((item): item is Placement => Boolean(item))
      .slice(0, 4)
      .map((item) => ({
        planet: item.planet,
        sign: item.sign,
        houseLabel: item.houseLabel,
        text: `${item.planet} in ${item.sign} is working through your ${item.houseLabel} house.`,
      })),
  };
}

function topHouses(placements: Placement[]) {
  const counts = new Map<number, number>();

  for (const placement of placements) {
    counts.set(placement.house, (counts.get(placement.house) ?? 0) + weightForPlanet(placement.planet));
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([house]) => house)
    .slice(0, 3);
}

function weightForPlanet(planet: string) {
  if (planet === "Sun" || planet === "Moon") return 3;
  if (planet === "Mercury" || planet === "Venus" || planet === "Mars") return 2;
  return 1;
}

function composeAdvice(action?: Placement, emotional?: Placement) {
  if (!action && !emotional) return "Move slowly enough to notice what the day is asking from you.";

  const actionText = action
    ? `Put your effort into ${houseThemes[action.house]} without trying to solve every thread at once`
    : "Choose one practical next step";
  const emotionalText = emotional
    ? `and let your mood around ${houseThemes[emotional.house]} tell you what needs care`
    : "and leave room for the answer to arrive quietly";

  return `${actionText}, ${emotionalText}.`;
}

function composeWatchFor(pressure?: Placement) {
  if (!pressure) return "Watch for urgency that asks you to move before you are ready.";

  const retrograde = pressure.retrograde ? " Because it is retrograde, review before you react." : "";
  return `Watch for pressure around ${houseThemes[pressure.house]}; ${pressure.planet} may make that area feel heavier than usual.${retrograde}`;
}

const planetThemes: Record<string, string> = {
  Sun: "spotlights energy, confidence, and creative direction",
  Moon: "colors mood, instinct, rest, and emotional weather",
  Mercury: "sharpens messages, timing, choices, and the stories you tell yourself",
  Venus: "softens attention around affection, beauty, money, and pleasure",
  Mars: "activates momentum, desire, courage, and friction",
  Jupiter: "expands faith, growth, teaching, and room to breathe",
  Saturn: "sets structure, limits, responsibility, and long-range patience",
  Uranus: "brings disruption, invention, and the need for more freedom",
  Neptune: "blurs edges around dreams, longing, intuition, and surrender",
  Pluto: "presses on transformation, truth, power, and what is ready to shed",
};

const houseThemes: Record<number, string> = {
  1: "identity and presence",
  2: "money, values, and enoughness",
  3: "communication and daily movement",
  4: "home, roots, and private repair",
  5: "creativity, romance, and play",
  6: "work rhythms, health, and maintenance",
  7: "partnerships and agreements",
  8: "shared resources, trust, and deep change",
  9: "belief, learning, travel, and perspective",
  10: "visibility, vocation, and public work",
  11: "friendship, community, and future plans",
  12: "rest, dreams, endings, and the unseen",
};

function ordinal(value: number) {
  const suffix = value === 1 ? "st" : value === 2 ? "nd" : value === 3 ? "rd" : "th";
  return `${value}${suffix}`;
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  const processValue = typeof process !== "undefined" ? process.env[name] : undefined;
  if (processValue) return processValue;

  if (typeof process === "undefined") return undefined;

  const devVarsPath = path.join(process.cwd(), ".dev.vars");
  if (!fs.existsSync(devVarsPath)) return undefined;

  const lines = fs.readFileSync(devVarsPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    if (key !== name) continue;

    return trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
  }

  return undefined;
}
