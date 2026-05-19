import { createFileRoute } from "@tanstack/react-router";
import { CalendarDots, MoonStars, Planet, SunDim, Sparkle, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/astrology")({
  head: () => ({
    meta: [
      { title: "Celestial Map — Hailey Adkins" },
      {
        name: "description",
        content:
          "A daily astrology page with a moonlit forecast, zodiac focus, and small ritual for the day.",
      },
      { property: "og:title", content: "Celestial Map — Hailey Adkins" },
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

function pick<T>(items: readonly T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length] as T;
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
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 text-center animate-ink">
        <ConstellationBackdrop />
        <div className="inline-block mb-8">
           <span className="tag-chip gold">{formatApiDate(horoscope?.date) ?? reading.date}</span>
        </div>
        <h1 className="font-display italic text-7xl md:text-8xl lg:text-9xl text-foreground leading-[0.85] tracking-tight">
          Today's sky,
          <br />
          <span className="text-primary relative">
            read gently
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary/20" viewBox="0 0 100 12" preserveAspectRatio="none">
              <path d="M0,5 Q25,0 50,5 T100,5" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="font-serif italic text-xl md:text-2xl text-muted-foreground mt-8 max-w-2xl mx-auto leading-relaxed">
          Consult the celestial map for your daily horoscope, a small ritual, and the live planetary
          weather above your corner of the earth.
        </p>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 items-start">
            <HeroStat icon={<MoonStars weight="duotone" />} label="Moon phase" value={reading.moonPhase} />
            <HeroStat icon={<SunDim weight="duotone" />} label="Solar focus" value={reading.house} />
            <HeroStat
              icon={<CalendarDots weight="duotone" />}
              label="Lucky number"
              value={String(reading.luckyNumber)}
              className="hidden md:flex"
            />
          </div>
        </div>
      </section>

      {/* ── Sign Selector ─────────────────────────────────── */}
      <section className="sticky top-[64px] z-30 border-y border-border/20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
          <div className="flex items-center justify-center gap-3">
            <span className="font-marginalia text-xl text-primary/70">choose your sign</span>
            <div className="h-px w-8 bg-primary/20 hidden md:block" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {signs.map((sign) => {
              const active = sign.name === selectedSign;
              return (
                <button
                  type="button"
                  key={sign.name}
                  onClick={() => handleSelectSign(sign.name)}
                  aria-pressed={active}
                  className={`group flex min-h-14 items-center justify-center gap-2 rounded-sm border px-3 py-2 transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-foreground shadow-ink"
                      : "border-border/60 bg-card/45 text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <ZodiacIcon
                    sign={sign.name}
                    className={`h-5 w-5 shrink-0 ${active ? "text-primary scale-110" : "text-primary/60"}`}
                  />
                  <span className="font-display italic text-base sm:text-lg leading-none">{sign.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Reading ───────────────────────────────────────── */}
      <section ref={readingRef} className="max-w-6xl mx-auto px-6 py-24 scroll-mt-48">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 items-start">
          {/* Main reading */}
          <article className="paper-card p-12 md:p-16 relative overflow-hidden bg-card/60">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-8 flex-wrap mb-16">
                <div>
                  <span className="tag-chip rose mb-4 text-lg">Daily reading</span>
                  <h2 className="font-display italic text-6xl md:text-8xl text-foreground mt-2 leading-[0.85]">
                    {reading.sign.name}
                  </h2>
                  <div className="marginalia text-primary/60 text-2xl mt-4">
                    {reading.sign.dates} · {reading.sign.element} energy
                  </div>
                </div>
                <div className="grid place-items-center h-24 w-24 rounded-full border border-primary/20 bg-primary/5 text-primary rotate-12">
                  <ZodiacIcon sign={reading.sign.name} className="h-12 w-12" />
                </div>
              </div>

              <div className="font-serif italic text-xl md:text-2xl text-foreground/90 leading-relaxed space-y-8">
                {status === "loading" ? (
                  <p className="font-marginalia text-primary/40 animate-pulse">Reading the sky…</p>
                ) : null}
                
                <p className="text-3xl font-display not-italic border-l-2 border-primary/20 pl-8 mb-12">
                  {dailyText}
                </p>
                
                <p className="leading-relaxed">
                  With the <em>{reading.moonPhase}</em> moving through themes of {reading.house},
                  the day favors <em>{reading.sign.tone}</em>. Let{" "}
                  {reading.supportingSign.name} offer a companion note:{" "}
                  <em>{reading.supportingSign.tone}</em>.
                </p>
              </div>

              {horoscope?.source && (
                <div className="mt-16 pt-8 border-t border-border/20 font-marginalia text-primary/40 text-lg">
                  source · {horoscope.source}
                </div>
              )}
            </div>
          </article>

          {/* Side: Fragments */}
          <aside className="space-y-12 lg:sticky lg:top-48">
            <div className="paper-card p-10 bg-primary/5 border-primary/10 rotate-1 shadow-soft">
              <div className="flex items-center gap-3 text-primary/60 mb-6">
                <Sparkle weight="duotone" className="w-6 h-6" />
                <span className="font-marginalia text-xl">Daily ritual</span>
              </div>
              <p className="font-display italic text-4xl text-foreground leading-tight">
                Lucky #{reading.luckyNumber}
              </p>
              <p className="font-serif italic text-muted-foreground mt-4 leading-relaxed text-lg">
                {reading.invitation}
              </p>
            </div>

            <div className="paper-card p-10 bg-card/60 -rotate-1 shadow-soft">
              <div className="font-marginalia text-primary/60 text-xl mb-6">Watch for</div>
              <p className="font-serif italic text-xl text-foreground/90 leading-relaxed">
                {reading.caution}
              </p>
            </div>

            <div className="paper-card p-10 bg-card/40 shadow-soft">
               <div className="flex items-center justify-between mb-8">
                <span className="font-marginalia text-xl text-primary/60">Moon phase</span>
                <span className="tag-chip rose text-sm">{reading.moonPhase}</span>
              </div>
              <MoonPhaseStrip current={reading.moonPhase} />
            </div>
          </aside>
        </div>
      </section>

      {/* ── Planetary Weather ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
          <div className="space-y-2 text-center md:text-left">
            <span className="tag-chip gold text-lg">Live transits</span>
            <h2 className="font-display italic text-6xl md:text-8xl text-foreground leading-tight">Planetary weather</h2>
            <div className="marginalia text-primary/60 text-2xl">how the current sky is touching your day</div>
          </div>
          {transits?.generatedAt && (
            <div className="font-marginalia text-primary/40 text-xl italic">
              updated {new Date(transits.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        <TransitSection
          response={transits}
          status={transitStatus}
          locationStatus={locationStatus}
          selectedSign={selectedSign}
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
    <div className={`flex min-h-32 flex-col items-center md:items-start gap-2 text-center md:text-left ${className}`}>
      <span className="grid h-7 place-items-center text-primary/40">{icon}</span>
      <p className="min-h-4 font-marginalia text-primary/70 text-sm tracking-widest uppercase leading-none">{label}</p>
      <p className="min-h-14 max-w-48 font-display italic text-2xl text-foreground capitalize leading-tight">
        {value}
      </p>
    </div>
  );
}

function ConstellationBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Interactive-ish background rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-primary/5 animate-orbit-slow" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5 animate-orbit-slower" />
      
      {/* Floating stars */}
      <div className="absolute left-[10%] top-[20%] text-accent/30 animate-twinkle">
         <Sparkle weight="fill" size={12} />
      </div>
      <div className="absolute right-[15%] top-[15%] text-accent/30 animate-twinkle" style={{ animationDelay: "1s" }}>
         <Sparkle weight="fill" size={8} />
      </div>
      <div className="absolute left-[20%] bottom-[30%] text-accent/20 animate-twinkle" style={{ animationDelay: "2s" }}>
         <Sparkle weight="fill" size={16} />
      </div>
    </div>
  );
}

function MoonPhaseStrip({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-8 py-4">
      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-5xl text-primary animate-float shadow-glow">
          <span aria-hidden>{getMoonPhaseGlyph(current)}</span>
        </div>
        <div className="absolute -inset-4 border border-primary/5 rounded-full animate-orbit-slow" />
      </div>
      <div className="space-y-3">
        <div className="font-display italic text-3xl text-foreground capitalize">{current}</div>
        <p className="font-serif italic text-muted-foreground text-sm leading-relaxed">
          Notice what is building, peaking, or ready to be released.
        </p>
      </div>
    </div>
  );
}

function getMoonPhaseGlyph(phase: string) {
  switch (phase) {
    case "new moon": return "●";
    case "waxing crescent": return "☽";
    case "first quarter": return "◐";
    case "waxing gibbous": return "◖";
    case "full moon": return "○";
    case "waning gibbous": return "◗";
    case "last quarter": return "◑";
    case "waning crescent": return "☾";
    default: return "○";
  }
}

function TransitSection({
  response,
  status,
  locationStatus,
  selectedSign,
}: {
  response: TransitApiResponse | null;
  status: "idle" | "loading" | "ready" | "error";
  locationStatus: "loading" | "ready" | "error";
  selectedSign: ZodiacSign;
}) {
  const placements = response?.placements ?? [];
  const overview = response?.overview;

  const message =
    locationStatus === "loading"
      ? "Waiting for location to map your local sky…"
      : locationStatus === "error"
      ? "Enable location to see placements for your area."
      : status === "loading"
      ? "Asking the ephemeris for current positions…"
      : status === "error"
      ? "The planetary API is currently resting."
      : status === "ready" && response && !response.configured
      ? response.error
      : null;

  if (message) {
    return (
      <div className="paper-card p-20 text-center bg-card/30 border-dashed border-2">
        <Planet weight="duotone" className="w-16 h-16 text-primary/20 mx-auto mb-6 animate-float" />
        <p className="font-serif italic text-2xl text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {overview ? (
        <article className="paper-card p-12 md:p-16 relative overflow-hidden bg-primary/5 border-primary/10">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 grid md:grid-cols-[1.5fr_1fr] gap-16">
            <div className="space-y-8">
              <span className="font-marginalia text-primary/60 text-2xl">The current weather</span>
              <h3 className="font-display italic text-5xl md:text-7xl text-foreground leading-tight">
                {overview.headline}
              </h3>
              <p className="font-serif italic text-xl md:text-2xl leading-relaxed text-foreground/80">
                {overview.summary}
              </p>
              
              <div className="pt-8 flex flex-wrap gap-4">
                 {overview.focusAreas.map((area) => (
                  <span key={area} className="cat-stamp text-sm">
                    ✦ {area}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-8">
              <OverviewBlock label="advice for today" body={overview.advice} accent />
              <OverviewBlock label="what to watch for" body={overview.watchFor} />
            </div>
          </div>
        </article>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {placements.map((placement, i) => (
          <article
            key={placement.planet}
            className="paper-card p-10 bg-card/40 hover:bg-card transition-all group"
            style={{ transform: `rotate(${(i % 2 === 0 ? 0.5 : -0.5)}deg)` }}
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="font-display italic text-3xl text-foreground group-hover:text-primary transition-colors">{placement.planet}</p>
                <div className="marginalia text-primary/50 text-lg mt-1">
                  {placement.degree}° {placement.sign}
                  {placement.retrograde ? " ℞" : ""}
                </div>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full border border-primary/10 bg-primary/5 text-primary rotate-6 group-hover:rotate-12 transition-transform">
                <ZodiacIcon sign={placement.sign} className="h-8 w-8" />
              </div>
            </div>
            
            <div className="mb-6">
              <span className="font-marginalia text-primary/70 text-lg border-b border-primary/10 pb-1">
                {placement.houseLabel} house
              </span>
            </div>
            
            <p className="font-serif italic text-muted-foreground leading-relaxed text-lg">
              {placement.meaning}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function OverviewBlock({ label, body, accent = false }: { label: string; body: string; accent?: boolean }) {
  return (
    <div
      className={`paper-card p-8 rotate-1 ${
        accent ? "bg-primary text-primary-foreground border-none shadow-glow" : "bg-card/60"
      }`}
    >
      <div className={`font-marginalia text-lg mb-4 ${accent ? "opacity-80" : "text-primary/60"}`}>
        {label}
      </div>
      <p className={`font-serif italic leading-relaxed text-lg ${accent ? "" : "text-foreground/90"}`}>
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
      strokeWidth="1.5"
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
