import { createFileRoute } from "@tanstack/react-router";
import { CalendarDots, CompassRose, MoonStars, Planet, SunDim } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/astrology")({
  head: () => ({
    meta: [
      { title: "Daily Astrology — Hailey Adkins" },
      {
        name: "description",
        content:
          "A daily astrology page with a moonlit forecast, zodiac focus, and small ritual for the day.",
      },
      { property: "og:title", content: "Daily Astrology — Hailey Adkins" },
      {
        property: "og:description",
        content: "A cozy daily astrology forecast from the stardust cottage.",
      },
    ],
  }),
  component: AstrologyPage,
});

const signs = [
  { name: "Aries", tone: "begin again" },
  { name: "Taurus", tone: "tend the body" },
  { name: "Gemini", tone: "say the true thing" },
  { name: "Cancer", tone: "come home to yourself" },
  { name: "Leo", tone: "let warmth lead" },
  { name: "Virgo", tone: "make one small order" },
  { name: "Libra", tone: "choose harmony" },
  { name: "Scorpio", tone: "trust the deep knowing" },
  { name: "Sagittarius", tone: "follow the far light" },
  { name: "Capricorn", tone: "build with patience" },
  { name: "Aquarius", tone: "think wider" },
  { name: "Pisces", tone: "soften the edges" },
] as const;

type ZodiacSign = (typeof signs)[number]["name"];

const moonPhases = [
  "new moon",
  "waxing crescent",
  "first quarter",
  "waxing gibbous",
  "full moon",
  "waning gibbous",
  "last quarter",
  "waning crescent",
];

const houses = [
  "home and roots",
  "daily rituals",
  "creative courage",
  "friendship and belonging",
  "work worth doing",
  "rest, dreams, and repair",
  "love and clear agreements",
  "money, care, and enoughness",
];

const openings = [
  "The sky is asking for a quieter kind of bravery today.",
  "Today carries a soft lantern energy: practical, tender, and a little uncanny.",
  "The stars are less interested in speed than sincerity right now.",
  "A small threshold opens today, especially where you have been overthinking.",
  "The day wants a slower rhythm and one honest choice.",
  "There is medicine in returning to the task you almost abandoned.",
];

const invitations = [
  "Write down the thing you keep circling, then choose the next gentle step.",
  "Give your attention to one beautiful detail before you answer the world.",
  "Clear a small surface, light a candle, and let that be enough ceremony.",
  "Let an old plan change shape without calling it failure.",
  "Make your yes smaller and your no kinder.",
  "Put your hands on something real: yarn, soil, paper, warm tea.",
];

const cautions = [
  "Do not mistake urgency for intuition.",
  "Leave room for a message to arrive late.",
  "Avoid polishing the same thought until it loses its meaning.",
  "Protect the morning from other people's weather.",
  "A pause will tell you more than a performance.",
  "Keep one boundary simple enough to actually keep.",
];

type HoroscopeApiResponse = {
  source?: string;
  date?: string;
  period?: string;
  sign?: string;
  horoscope?: string;
  error?: string;
};

type TransitPlacement = {
  planet: string;
  sign: ZodiacSign;
  degree: number;
  retrograde: boolean;
  house: number;
  houseLabel: string;
  meaning: string;
};

type TransitApiResponse = {
  configured: boolean;
  source?: string;
  generatedAt?: string;
  selectedSign?: ZodiacSign;
  overview?: {
    headline: string;
    summary: string;
    focusAreas: string[];
    advice: string;
    watchFor: string;
    keyTransits: Array<{
      planet: string;
      sign: ZodiacSign;
      houseLabel: string;
      text: string;
    }>;
  };
  placements: TransitPlacement[];
  error?: string;
};

type UserLocation = {
  latitude: number;
  longitude: number;
  timezone: number;
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function hash(value: string) {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length];
}

function buildReading(selectedSign?: string) {
  const today = new Date();
  const seed = hash(dateKey(today));
  const sign = signs.find((item) => item.name === selectedSign) ?? pick(signs, seed);
  const supportingSign = pick(signs, seed, 5);
  const moonPhase = pick(moonPhases, seed, 2);
  const house = pick(houses, seed, 4);
  const formatter = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return {
    date: formatter.format(today),
    sign,
    supportingSign,
    moonPhase,
    house,
    opening: pick(openings, seed, 1),
    invitation: pick(invitations, seed, 3),
    caution: pick(cautions, seed, 6),
    luckyNumber: (seed % 9) + 1,
  };
}

function AstrologyPage() {
  const fallbackReading = useMemo(() => buildReading(), []);
  const [selectedSign, setSelectedSign] = useState(fallbackReading.sign.name);
  const [horoscope, setHoroscope] = useState<HoroscopeApiResponse | null>(null);
  const [transits, setTransits] = useState<TransitApiResponse | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [locationStatus, setLocationStatus] = useState<"loading" | "ready" | "error">("loading");
  const [transitStatus, setTransitStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const reading = useMemo(() => buildReading(selectedSign), [selectedSign]);
  const dailyText = horoscope?.horoscope ?? reading.opening;

  useEffect(() => {
    const controller = new AbortController();

    async function loadHoroscope() {
      setStatus("loading");

      try {
        const response = await fetch(`/api/horoscope?sign=${selectedSign.toLowerCase()}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as HoroscopeApiResponse;

        if (!response.ok || !payload.horoscope) {
          throw new Error(payload.error ?? "Daily horoscope is unavailable.");
        }

        setHoroscope(payload);
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setHoroscope(null);
        setStatus("error");
      }
    }

    void loadHoroscope();

    return () => controller.abort();
  }, [selectedSign]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone: -new Date().getTimezoneOffset() / 60,
        });
        setLocationStatus("ready");
      },
      (error) => {
        console.error(error);
        setLocationStatus("error");
      },
      {
        enableHighAccuracy: false,
        maximumAge: 1000 * 60 * 60,
        timeout: 10000,
      },
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTransits() {
      if (!userLocation) {
        setTransitStatus("idle");
        return;
      }

      setTransitStatus("loading");

      try {
        const params = new URLSearchParams({
          sign: selectedSign.toLowerCase(),
          lat: String(userLocation.latitude),
          lon: String(userLocation.longitude),
          tz: String(userLocation.timezone),
        });
        const response = await fetch(`/api/astrology-transits?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as TransitApiResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Current planetary placements are unavailable.");
        }

        setTransits(payload);
        setTransitStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setTransits(null);
        setTransitStatus("error");
      }
    }

    void loadTransits();

    return () => controller.abort();
  }, [selectedSign, userLocation]);

  return (
    <main className="overflow-hidden">
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16">
        <ConstellationBackdrop />

        <div className="grid lg:grid-cols-[1fr_440px] gap-12 items-center">
          <div>
            <span className="tag-chip gold">daily astrology</span>
            <h1 className="font-hand text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] mt-5">
              A little map
              <br />
              for <span className="text-primary italic">today's sky.</span>
            </h1>
            <p className="font-serif-display text-lg md:text-xl text-muted-foreground mt-8 max-w-2xl leading-relaxed">
              Updated each day from a server-side horoscope feed, with a moon mood and small ritual
              to carry with you.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-10">
              <SkyStat
                icon={<CalendarDots weight="duotone" className="w-4 h-4" />}
                label="date"
                value={formatApiDate(horoscope?.date) ?? reading.date}
              />
              <SkyStat
                icon={<MoonStars weight="duotone" className="w-4 h-4" />}
                label="moon mood"
                value={reading.moonPhase}
              />
              <SkyStat
                icon={<SunDim weight="duotone" className="w-4 h-4" />}
                label="focus"
                value={reading.sign.name}
              />
            </div>

            <div className="mt-8 max-w-2xl">
              <MoonPhaseStrip current={reading.moonPhase} />
            </div>
          </div>

          <div className="relative min-h-[460px] flex items-center justify-center rounded-[2rem] border border-border/70 bg-card/35 shadow-[var(--shadow-soft)] overflow-hidden">
            <div className="absolute inset-0 opacity-60" aria-hidden>
              <div className="absolute left-10 top-8 h-1.5 w-1.5 rounded-full bg-accent" />
              <div className="absolute right-16 top-20 h-1 w-1 rounded-full bg-primary" />
              <div className="absolute bottom-16 left-16 h-1 w-1 rounded-full bg-secondary-foreground" />
              <div className="absolute bottom-10 right-24 h-1.5 w-1.5 rounded-full bg-accent" />
              <div className="absolute left-12 top-10 h-px w-32 rotate-[24deg] bg-border" />
              <div className="absolute right-16 top-20 h-px w-28 -rotate-[34deg] bg-border" />
              <div className="absolute bottom-16 left-16 h-px w-44 rotate-[10deg] bg-border" />
            </div>
            <div
              className="absolute inset-5 rounded-full border border-border/80 animate-orbit-slower"
              aria-hidden
            />
            <div
              className="absolute inset-16 rounded-full border border-accent/50 animate-orbit-slow"
              aria-hidden
            />
            <div
              className="absolute inset-28 rounded-full border border-dashed border-primary/35"
              aria-hidden
            />
            <div className="absolute inset-0 animate-float">
              {signs.map((sign, index) => {
                const angle = (index / signs.length) * 360;
                return (
                  <span
                    key={sign.name}
                    className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card/85 border border-border shadow-sm text-foreground"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-178px) rotate(-${angle}deg)`,
                    }}
                    aria-label={sign.name}
                  >
                    <ZodiacIcon sign={sign.name} className="h-6 w-6" />
                  </span>
                );
              })}
            </div>
            <div className="paper-card relative z-10 w-56 h-56 rounded-full grid place-items-center text-center p-8">
              <Planet weight="duotone" className="w-7 h-7 text-accent" />
              <ZodiacIcon sign={reading.sign.name} className="mt-3 h-12 w-12 text-foreground" />
              <p className="font-hand text-4xl text-foreground mt-1">{reading.sign.name}</p>
              <p className="font-serif-display italic text-muted-foreground mt-1">
                {reading.sign.tone}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <article className="paper-card p-8 md:p-12 relative overflow-hidden">
            <div
              className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-accent/20 blur-3xl"
              aria-hidden
            />
            <div className="absolute right-8 top-8 hidden md:grid h-24 w-24 place-items-center rounded-full border border-border/80 text-primary/70" aria-hidden>
              <ZodiacIcon sign={reading.sign.name} className="h-10 w-10" />
            </div>
            <span className="tag-chip rose">today's reading</span>
            <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-4">
              {reading.sign.name} leads the lantern.
            </h2>
            <div className="grid sm:grid-cols-3 gap-3 mt-7">
              <ReadingDetail label="house" value={reading.house} />
              <ReadingDetail label="companion" value={reading.supportingSign.name} />
              <ReadingDetail label="number" value={String(reading.luckyNumber)} />
            </div>
            <div className="font-serif-display text-lg text-foreground/85 leading-relaxed space-y-5 mt-6 relative z-10">
              {status === "loading" ? (
                <p className="italic text-muted-foreground">Reading the sky...</p>
              ) : null}
              {status === "error" ? (
                <p className="italic text-muted-foreground">
                  The live horoscope feed is resting, so this fallback reading is here for today.
                </p>
              ) : null}
              <p>{dailyText}</p>
              <p>
                With the {reading.moonPhase} moving through themes of {reading.house}, the day
                favors {reading.sign.tone}. Let {reading.supportingSign.name} offer a companion
                note: {reading.supportingSign.tone}.
              </p>
              <p className="italic text-muted-foreground">{reading.invitation}</p>
              {horoscope?.source ? (
                <p className="font-sans-ui text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Source: {horoscope.source}
                </p>
              ) : null}
            </div>
          </article>

          <aside className="space-y-6">
            <div className="paper-card p-6">
              <span className="tag-chip gold">small ritual</span>
              <div className="mt-5 flex gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary/45 flex items-center justify-center text-forest dark:text-foreground shrink-0">
                  <CompassRose weight="duotone" className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-hand text-3xl text-foreground">
                    Lucky number {reading.luckyNumber}
                  </p>
                  <p className="font-serif-display italic text-muted-foreground mt-1">
                    {reading.invitation}
                  </p>
                </div>
              </div>
            </div>

            <div className="paper-card p-6">
              <span className="tag-chip">watch for</span>
              <p className="font-serif-display italic text-lg text-muted-foreground mt-5">
                {reading.caution}
              </p>
            </div>

            <div className="paper-card p-6">
              <span className="tag-chip rose">choose your sign</span>
              <div className="grid grid-cols-3 gap-2 mt-5">
                {signs.map((sign) => (
                  <button
                    type="button"
                    key={sign.name}
                    onClick={() => setSelectedSign(sign.name)}
                    aria-pressed={sign.name === selectedSign}
                    className={`min-h-20 rounded-xl border grid place-items-center gap-1 py-3 transition-transform duration-300 hover:-translate-y-1 ${
                      sign.name === selectedSign
                        ? "bg-accent/25 border-accent text-accent-foreground"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                    title={sign.name}
                    aria-label={sign.name}
                  >
                    <ZodiacIcon sign={sign.name} className="h-6 w-6" />
                    <span className="font-sans-ui text-[10px] uppercase tracking-[0.14em]">
                      {sign.name.slice(0, 3)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <TransitSection
          selectedSign={reading.sign.name}
          response={transits}
          status={transitStatus}
          locationStatus={locationStatus}
        />
      </section>
    </main>
  );
}

function ConstellationBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute left-8 top-24 w-20 h-20 rounded-full border border-accent/40 animate-orbit-slow" />
      <div className="absolute right-10 top-12 w-28 h-28 rounded-full border border-secondary/50 animate-orbit-slower" />
      <div className="absolute left-1/2 top-10 h-px w-52 -translate-x-1/2 rotate-12 bg-border/80" />
      <div className="absolute left-[18%] top-28 h-2 w-2 rounded-full bg-accent/70 shadow-lg" />
      <div className="absolute left-[32%] top-16 h-1.5 w-1.5 rounded-full bg-primary/60" />
      <div className="absolute right-[24%] top-32 h-2 w-2 rounded-full bg-secondary-foreground/50" />
      <div className="absolute right-[16%] top-56 h-1.5 w-1.5 rounded-full bg-accent/60" />
    </div>
  );
}

function MoonPhaseStrip({ current }: { current: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/55 p-4">
      <div className="flex items-center justify-between gap-3">
        {moonPhases.map((phase) => {
          const active = phase === current;

          return (
            <div key={phase} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full border ${
                  active ? "border-accent bg-accent shadow-lg" : "border-border bg-muted"
                }`}
                aria-hidden
              />
              <span
                className={`hidden text-center font-sans-ui text-[9px] uppercase tracking-[0.12em] sm:block ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {phase.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReadingDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4">
      <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="font-serif-display italic text-foreground mt-2 capitalize">{value}</p>
    </div>
  );
}

function TransitSection({
  selectedSign,
  response,
  status,
  locationStatus,
}: {
  selectedSign: ZodiacSign;
  response: TransitApiResponse | null;
  status: "idle" | "loading" | "ready" | "error";
  locationStatus: "loading" | "ready" | "error";
}) {
  const placements = response?.placements ?? [];
  const overview = response?.overview;

  return (
    <div className="paper-card overflow-hidden">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-border bg-card/70">
          <div className="absolute right-8 top-8 text-accent/50" aria-hidden>
            <Planet weight="duotone" className="h-16 w-16" />
          </div>
          <span className="tag-chip gold">current sky</span>
          <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-4">
            Planetary weather for {selectedSign}
          </h2>
          <p className="font-serif-display italic text-muted-foreground mt-5 leading-relaxed">
            This section is supplied by the server API. Planet positions, signs, degrees, houses,
            and selected-sign meanings come from `/api/astrology-transits`.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-background/45 p-5">
            <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              source
            </p>
            <p className="font-serif-display italic text-foreground mt-2">
              {response?.source ?? "waiting for provider"}
            </p>
            {response?.generatedAt ? (
              <p className="font-serif-display italic text-xs text-muted-foreground mt-2">
                Updated {new Date(response.generatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {locationStatus === "loading" ? (
            <p className="font-serif-display italic text-muted-foreground">
              Waiting for browser location to calculate the local sky...
            </p>
          ) : null}

          {locationStatus === "error" ? (
            <div className="rounded-2xl border border-border bg-muted/50 p-5">
              <p className="font-serif-display italic text-muted-foreground">
                Browser location is needed to calculate the current local sky. Allow location access
                to show planetary placements for your area.
              </p>
            </div>
          ) : null}

          {status === "loading" ? (
            <p className="font-serif-display italic text-muted-foreground">
              Asking the ephemeris for the current placements...
            </p>
          ) : null}

          {status === "error" ? (
            <p className="font-serif-display italic text-muted-foreground">
              The planetary API is unavailable right now.
            </p>
          ) : null}

          {status === "ready" && response && !response.configured ? (
            <div className="rounded-2xl border border-border bg-muted/50 p-5">
              <p className="font-serif-display italic text-muted-foreground">
                {response.error}
              </p>
            </div>
          ) : null}

          {overview ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-border bg-background/45 p-6">
                <span className="tag-chip rose">right now</span>
                <h3 className="font-hand text-4xl text-foreground mt-3">{overview.headline}</h3>
                <p className="font-serif-display italic text-lg leading-relaxed text-foreground/85 mt-4">
                  {overview.summary}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card/70 p-5">
                  <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    advice
                  </p>
                  <p className="font-serif-display italic text-foreground/85 leading-relaxed mt-3">
                    {overview.advice}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card/70 p-5">
                  <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    watch for
                  </p>
                  <p className="font-serif-display italic text-foreground/85 leading-relaxed mt-3">
                    {overview.watchFor}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-5">
                <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  main themes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {overview.focusAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-border bg-background/50 px-3 py-1 font-serif-display italic text-sm text-muted-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {placements.length ? (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {placements.map((placement) => (
                <article key={placement.planet} className="rounded-2xl border border-border bg-card/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-hand text-3xl text-foreground">{placement.planet}</p>
                      <p className="font-serif-display italic text-muted-foreground mt-1">
                        {placement.degree} deg {placement.sign}
                        {placement.retrograde ? " retrograde" : ""}
                      </p>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary/35 text-forest dark:text-foreground">
                      <ZodiacIcon sign={placement.sign} className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full border border-border px-3 py-1 font-sans-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {placement.houseLabel} house
                    </span>
                  </div>
                  <p className="font-serif-display italic text-foreground/85 leading-relaxed mt-4">
                    {placement.meaning}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatApiDate(value?: string) {
  if (!value) return null;

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function ZodiacIcon({
  sign,
  className,
}: {
  sign: ZodiacSign;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {zodiacPaths[sign]}
    </svg>
  );
}

const zodiacPaths: Record<ZodiacSign, ReactNode> = {
  Aries: (
    <>
      <path d="M16 25V14" />
      <path d="M16 14C13 5 6 6 6 13c0 3 2 5 5 5" />
      <path d="M16 14c3-9 10-8 10-1 0 3-2 5-5 5" />
    </>
  ),
  Taurus: (
    <>
      <circle cx="16" cy="19" r="6" />
      <path d="M11 13C7 9 8 5 12 5" />
      <path d="M21 13c4-4 3-8-1-8" />
    </>
  ),
  Gemini: (
    <>
      <path d="M10 6c4 2 8 2 12 0" />
      <path d="M10 26c4-2 8-2 12 0" />
      <path d="M12 8v16" />
      <path d="M20 8v16" />
    </>
  ),
  Cancer: (
    <>
      <path d="M7 13c3-4 9-5 14-2" />
      <path d="M25 19c-3 4-9 5-14 2" />
      <circle cx="11" cy="13" r="3" />
      <circle cx="21" cy="19" r="3" />
    </>
  ),
  Leo: (
    <>
      <circle cx="11" cy="20" r="4" />
      <path d="M15 20c4-1 4-6 2-9-2-4 2-7 6-5 4 2 4 8-1 10" />
      <path d="M22 16c-4 2-3 7 2 8" />
    </>
  ),
  Virgo: (
    <>
      <path d="M8 8v16" />
      <path d="M13 8v16" />
      <path d="M18 8v16" />
      <path d="M8 12c2-4 5-4 5 0" />
      <path d="M13 12c2-4 5-4 5 0" />
      <path d="M18 24c7-3 7-10 1-10" />
    </>
  ),
  Libra: (
    <>
      <path d="M5 22h22" />
      <path d="M7 17h18" />
      <path d="M11 17c0-5 10-5 10 0" />
    </>
  ),
  Scorpio: (
    <>
      <path d="M7 8v16" />
      <path d="M12 8v16" />
      <path d="M17 8v12c0 4 4 6 8 3" />
      <path d="M7 12c2-4 5-4 5 0" />
      <path d="M12 12c2-4 5-4 5 0" />
      <path d="M25 23l-1-5" />
      <path d="M25 23l-5-1" />
    </>
  ),
  Sagittarius: (
    <>
      <path d="M8 24 24 8" />
      <path d="M15 8h9v9" />
      <path d="M12 14l6 6" />
    </>
  ),
  Capricorn: (
    <>
      <path d="M7 8v16" />
      <path d="M7 12c2-4 6-4 6 1v7" />
      <path d="M13 20c0-5 9-5 9 1 0 5-8 6-8 0" />
      <path d="M22 21c2 3 4 3 5 1" />
    </>
  ),
  Aquarius: (
    <>
      <path d="M5 12c3-3 5 3 8 0s5 3 8 0 4 1 6 0" />
      <path d="M5 20c3-3 5 3 8 0s5 3 8 0 4 1 6 0" />
    </>
  ),
  Pisces: (
    <>
      <path d="M10 6c-4 5-4 15 0 20" />
      <path d="M22 6c4 5 4 15 0 20" />
      <path d="M7 16h18" />
    </>
  ),
};

function SkyStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="paper-card p-5">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="font-sans-ui text-[11px] uppercase tracking-[0.22em]">{label}</span>
      </div>
      <p className="font-serif-display italic text-lg text-foreground mt-3 capitalize">{value}</p>
    </div>
  );
}
