import { createFileRoute } from "@tanstack/react-router";
import { CalendarDots, MoonStars, Planet, SunDim, Sparkle, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  { name: "Aries", tone: "begin again", dates: "Mar 21 – Apr 19", element: "fire" },
  { name: "Taurus", tone: "tend the body", dates: "Apr 20 – May 20", element: "earth" },
  { name: "Gemini", tone: "say the true thing", dates: "May 21 – Jun 20", element: "air" },
  { name: "Cancer", tone: "come home to yourself", dates: "Jun 21 – Jul 22", element: "water" },
  { name: "Leo", tone: "let warmth lead", dates: "Jul 23 – Aug 22", element: "fire" },
  { name: "Virgo", tone: "make one small order", dates: "Aug 23 – Sep 22", element: "earth" },
  { name: "Libra", tone: "choose harmony", dates: "Sep 23 – Oct 22", element: "air" },
  { name: "Scorpio", tone: "trust the deep knowing", dates: "Oct 23 – Nov 21", element: "water" },
  { name: "Sagittarius", tone: "follow the far light", dates: "Nov 22 – Dec 21", element: "fire" },
  { name: "Capricorn", tone: "build with patience", dates: "Dec 22 – Jan 19", element: "earth" },
  { name: "Aquarius", tone: "think wider", dates: "Jan 20 – Feb 18", element: "air" },
  { name: "Pisces", tone: "soften the edges", dates: "Feb 19 – Mar 20", element: "water" },
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
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(fallbackReading.sign.name);
  const [horoscope, setHoroscope] = useState<HoroscopeApiResponse | null>(null);
  const [transits, setTransits] = useState<TransitApiResponse | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [locationStatus, setLocationStatus] = useState<"loading" | "ready" | "error">("loading");
  const [transitStatus, setTransitStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const readingRef = useRef<HTMLDivElement>(null);
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

  function handleSelectSign(name: ZodiacSign) {
    setSelectedSign(name);
    requestAnimationFrame(() => {
      readingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className="overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-10 md:pt-24 md:pb-14 text-center">
        <ConstellationBackdrop />
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5">
          <Sparkle weight="fill" className="w-3.5 h-3.5 text-accent" />
          <span className="font-sans-ui text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {formatApiDate(horoscope?.date) ?? reading.date}
          </span>
        </div>
        <h1 className="font-hand text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] mt-6">
          Today's sky,
          <br />
          <span className="text-primary italic">read gently.</span>
        </h1>
        <p className="font-serif-display text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
          Choose your sign below for a daily horoscope, a small ritual, and the live planetary
          weather above your sky.
        </p>

        <div className="mt-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-6 text-sm">
            <HeroStat icon={<MoonStars weight="duotone" />} label="moon" value={reading.moonPhase} />
            <span className="h-8 w-px bg-border" aria-hidden />
            <HeroStat icon={<SunDim weight="duotone" />} label="focus" value={reading.house} />
            <span className="h-8 w-px bg-border hidden sm:block" aria-hidden />
            <HeroStat
              icon={<CalendarDots weight="duotone" />}
              label="number"
              value={String(reading.luckyNumber)}
              className="hidden sm:flex"
            />
          </div>
        </div>
      </section>

      {/* ── Sign Selector (primary control) ───────────────── */}
      <section className="sticky top-[64px] z-30 bg-background/85 backdrop-blur-md border-y border-border/70">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-3 px-2">
            <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              choose your sign
            </p>
            <p className="font-serif-display italic text-sm text-muted-foreground hidden sm:block">
              showing <span className="text-foreground">{selectedSign}</span>
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-thin">
            {signs.map((sign) => {
              const active = sign.name === selectedSign;
              return (
                <button
                  type="button"
                  key={sign.name}
                  onClick={() => handleSelectSign(sign.name)}
                  aria-pressed={active}
                  className={`group flex-shrink-0 snap-start flex flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 min-w-[88px] transition-all duration-300 ${
                    active
                      ? "border-primary bg-primary/10 shadow-[var(--shadow-soft)] -translate-y-0.5"
                      : "border-border bg-card/50 hover:border-primary/50 hover:bg-card hover:-translate-y-0.5"
                  }`}
                >
                  <ZodiacIcon
                    sign={sign.name}
                    className={`h-7 w-7 transition-colors ${
                      active ? "text-primary" : "text-foreground/70 group-hover:text-foreground"
                    }`}
                  />
                  <span
                    className={`font-serif-display text-sm ${
                      active ? "text-foreground italic" : "text-muted-foreground"
                    }`}
                  >
                    {sign.name}
                  </span>
                  <span className="font-sans-ui text-[9px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    {sign.dates.split(" – ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Reading ───────────────────────────────────────── */}
      <section ref={readingRef} className="max-w-6xl mx-auto px-6 py-16 scroll-mt-32">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
          {/* Main reading */}
          <article className="paper-card p-8 md:p-12 relative overflow-hidden">
            <div
              className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl"
              aria-hidden
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    daily reading
                  </p>
                  <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-2">
                    {reading.sign.name}
                  </h2>
                  <p className="font-serif-display italic text-muted-foreground mt-1">
                    {reading.sign.dates} · {reading.sign.element}
                  </p>
                </div>
                <div className="grid place-items-center h-20 w-20 rounded-full border border-border bg-background/60 text-primary">
                  <ZodiacIcon sign={reading.sign.name} className="h-10 w-10" />
                </div>
              </div>

              <div className="h-px bg-border my-8" />

              <div className="font-serif-display text-lg text-foreground/85 leading-relaxed space-y-5">
                {status === "loading" ? (
                  <p className="italic text-muted-foreground">Reading the sky…</p>
                ) : null}
                {status === "error" ? (
                  <p className="italic text-muted-foreground text-sm">
                    The live feed is resting — here's today's fallback reading.
                  </p>
                ) : null}
                <p className="text-xl">{dailyText}</p>
                <p>
                  With the <em>{reading.moonPhase}</em> moving through themes of {reading.house},
                  the day favors <em>{reading.sign.tone}</em>. Let{" "}
                  {reading.supportingSign.name} offer a companion note:{" "}
                  <em>{reading.supportingSign.tone}</em>.
                </p>
              </div>

              {horoscope?.source ? (
                <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-8 pt-6 border-t border-border">
                  Source · {horoscope.source}
                </p>
              ) : null}
            </div>
          </article>

          {/* Side: ritual + caution + moon */}
          <aside className="space-y-6">
            <div className="paper-card p-6 bg-gradient-to-br from-accent/15 to-transparent">
              <div className="flex items-center gap-2 text-accent-foreground/80">
                <Sparkle weight="duotone" className="w-4 h-4" />
                <span className="font-sans-ui text-[10px] uppercase tracking-[0.22em]">
                  small ritual
                </span>
              </div>
              <p className="font-hand text-4xl text-foreground mt-3">
                Lucky #{reading.luckyNumber}
              </p>
              <p className="font-serif-display italic text-foreground/80 mt-3 leading-relaxed">
                {reading.invitation}
              </p>
            </div>

            <div className="paper-card p-6">
              <span className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                watch for
              </span>
              <p className="font-serif-display italic text-lg text-foreground/85 mt-3 leading-relaxed">
                {reading.caution}
              </p>
            </div>

            <div className="paper-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  moon phase
                </span>
                <span className="font-serif-display italic text-sm text-foreground capitalize">
                  {reading.moonPhase}
                </span>
              </div>
              <div className="mt-4">
                <MoonPhaseStrip current={reading.moonPhase} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Planetary Weather ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
          <div>
            <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              live transits
            </p>
            <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-2">
              Planetary weather
            </h2>
            <p className="font-serif-display italic text-muted-foreground mt-2">
              How the current sky is touching <span className="text-foreground">{selectedSign}</span>.
            </p>
          </div>
          {transits?.generatedAt ? (
            <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              updated {new Date(transits.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          ) : null}
        </div>

        <TransitSection
          response={transits}
          status={transitStatus}
          locationStatus={locationStatus}
        />
      </section>
    </main>
  );
}

function HeroStat({
  icon,
  label,
  value,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="text-accent">{icon}</span>
      <div className="text-left">
        <p className="font-sans-ui text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        <p className="font-serif-display italic text-foreground capitalize text-sm leading-tight">
          {value}
        </p>
      </div>
    </div>
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
    <div className="flex items-center justify-between gap-2">
      {moonPhases.map((phase) => {
        const active = phase === current;
        return (
          <span
            key={phase}
            title={phase}
            className={`h-2.5 flex-1 rounded-full transition-all ${
              active ? "bg-accent shadow-lg h-3" : "bg-border"
            }`}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

function TransitSection({
  response,
  status,
  locationStatus,
}: {
  response: TransitApiResponse | null;
  status: "idle" | "loading" | "ready" | "error";
  locationStatus: "loading" | "ready" | "error";
}) {
  const placements = response?.placements ?? [];
  const overview = response?.overview;

  const message =
    locationStatus === "loading"
      ? "Waiting for browser location to calculate the local sky…"
      : locationStatus === "error"
      ? "Allow browser location to show planetary placements for your area."
      : status === "loading"
      ? "Asking the ephemeris for current placements…"
      : status === "error"
      ? "The planetary API is unavailable right now."
      : status === "ready" && response && !response.configured
      ? response.error
      : null;

  if (message) {
    return (
      <div className="paper-card p-8 text-center">
        <Planet weight="duotone" className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
        <p className="font-serif-display italic text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {overview ? (
        <div className="paper-card p-8 md:p-10 relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />
          <div className="relative z-10 grid md:grid-cols-[1.3fr_1fr] gap-8">
            <div>
              <span className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                right now
              </span>
              <h3 className="font-hand text-4xl md:text-5xl text-foreground mt-2">
                {overview.headline}
              </h3>
              <p className="font-serif-display italic text-lg leading-relaxed text-foreground/85 mt-5">
                {overview.summary}
              </p>
            </div>
            <div className="space-y-4">
              <OverviewBlock label="advice" body={overview.advice} accent />
              <OverviewBlock label="watch for" body={overview.watchFor} />
            </div>
          </div>

          {overview.focusAreas.length ? (
            <div className="relative z-10 mt-8 pt-6 border-t border-border flex flex-wrap items-center gap-3">
              <span className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                themes
              </span>
              {overview.focusAreas.map((area) => (
                <span
                  key={area}
                  className="font-serif-display italic text-sm text-foreground/80 inline-flex items-center gap-1.5"
                >
                  <ArrowRight weight="bold" className="w-3 h-3 text-accent" />
                  {area}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {placements.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {placements.map((placement) => (
            <article
              key={placement.planet}
              className="paper-card p-5 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-hand text-2xl text-foreground">{placement.planet}</p>
                  <p className="font-serif-display italic text-sm text-muted-foreground mt-0.5">
                    {placement.degree}° {placement.sign}
                    {placement.retrograde ? " ℞" : ""}
                  </p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary/40 text-forest dark:text-foreground shrink-0">
                  <ZodiacIcon sign={placement.sign} className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-block font-sans-ui text-[9px] uppercase tracking-[0.18em] text-muted-foreground border border-border rounded-full px-2.5 py-0.5">
                  {placement.houseLabel} house
                </span>
              </div>
              <p className="font-serif-display italic text-sm text-foreground/80 leading-relaxed mt-4">
                {placement.meaning}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      {response?.source ? (
        <p className="text-center font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground pt-4">
          Source · {response.source}
        </p>
      ) : null}
    </div>
  );
}

function OverviewBlock({ label, body, accent = false }: { label: string; body: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent ? "border-accent/40 bg-accent/10" : "border-border bg-card/60"
      }`}
    >
      <p className="font-sans-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="font-serif-display italic text-foreground/85 leading-relaxed mt-2 text-sm">
        {body}
      </p>
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
