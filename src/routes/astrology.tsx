import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Eclipse, MoonStar, SunMedium, Telescope } from "lucide-react";

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
  { name: "Aries", glyph: "♈", tone: "begin again" },
  { name: "Taurus", glyph: "♉", tone: "tend the body" },
  { name: "Gemini", glyph: "♊", tone: "say the true thing" },
  { name: "Cancer", glyph: "♋", tone: "come home to yourself" },
  { name: "Leo", glyph: "♌", tone: "let warmth lead" },
  { name: "Virgo", glyph: "♍", tone: "make one small order" },
  { name: "Libra", glyph: "♎", tone: "choose harmony" },
  { name: "Scorpio", glyph: "♏", tone: "trust the deep knowing" },
  { name: "Sagittarius", glyph: "♐", tone: "follow the far light" },
  { name: "Capricorn", glyph: "♑", tone: "build with patience" },
  { name: "Aquarius", glyph: "♒", tone: "think wider" },
  { name: "Pisces", glyph: "♓", tone: "soften the edges" },
];

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

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function hash(value: string) {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length];
}

function buildReading() {
  const today = new Date();
  const seed = hash(dateKey(today));
  const sign = pick(signs, seed);
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
  const reading = buildReading();

  return (
    <main className="overflow-hidden">
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16">
        <div
          className="absolute left-8 top-24 w-20 h-20 rounded-full border border-accent/40 animate-orbit-slow"
          aria-hidden
        />
        <div
          className="absolute right-10 top-12 w-28 h-28 rounded-full border border-secondary/50 animate-orbit-slower"
          aria-hidden
        />

        <div className="grid lg:grid-cols-[1fr_440px] gap-12 items-center">
          <div>
            <span className="tag-chip gold">daily astrology</span>
            <h1 className="font-hand text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] mt-5">
              A little map
              <br />
              for <span className="text-primary italic">today's sky.</span>
            </h1>
            <p className="font-serif-display text-lg md:text-xl text-muted-foreground mt-8 max-w-2xl leading-relaxed">
              Updated each day from the date in your browser: a zodiac focus, moon mood, house
              theme, and a small ritual to carry with you.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-10">
              <SkyStat
                icon={<CalendarDays className="w-4 h-4" />}
                label="date"
                value={reading.date}
              />
              <SkyStat
                icon={<MoonStar className="w-4 h-4" />}
                label="moon mood"
                value={reading.moonPhase}
              />
              <SkyStat icon={<SunMedium className="w-4 h-4" />} label="focus" value={reading.sign.name} />
            </div>
          </div>

          <div className="relative min-h-[420px] flex items-center justify-center">
            <div
              className="absolute inset-6 rounded-full border border-border/80 animate-orbit-slower"
              aria-hidden
            />
            <div
              className="absolute inset-16 rounded-full border border-accent/50 animate-orbit-slow"
              aria-hidden
            />
            <div className="absolute inset-0 animate-float">
              {signs.map((sign, index) => {
                const angle = (index / signs.length) * 360;
                return (
                  <span
                    key={sign.name}
                    className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card/85 border border-border shadow-sm font-serif-display text-2xl text-foreground"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-178px) rotate(-${angle}deg)`,
                    }}
                    aria-label={sign.name}
                  >
                    {sign.glyph}
                  </span>
                );
              })}
            </div>
            <div className="paper-card relative z-10 w-56 h-56 rounded-full grid place-items-center text-center p-8">
              <Eclipse className="w-7 h-7 text-accent" />
              <p className="font-hand text-5xl text-foreground mt-2">{reading.sign.glyph}</p>
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
            <span className="tag-chip rose">today's reading</span>
            <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-4">
              {reading.sign.name} leads the lantern.
            </h2>
            <div className="font-serif-display text-lg text-foreground/85 leading-relaxed space-y-5 mt-6 relative z-10">
              <p>{reading.opening}</p>
              <p>
                With the {reading.moonPhase} moving through themes of {reading.house}, the day
                favors {reading.sign.tone}. Let {reading.supportingSign.name} offer a companion
                note: {reading.supportingSign.tone}.
              </p>
              <p className="italic text-muted-foreground">{reading.invitation}</p>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="paper-card p-6">
              <span className="tag-chip gold">small ritual</span>
              <div className="mt-5 flex gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary/45 flex items-center justify-center text-forest dark:text-foreground shrink-0">
                  <Telescope className="w-5 h-5" />
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
              <span className="tag-chip rose">zodiac focus</span>
              <div className="grid grid-cols-4 gap-2 mt-5">
                {signs.map((sign) => (
                  <div
                    key={sign.name}
                    className={`aspect-square rounded-xl border grid place-items-center font-serif-display text-2xl transition-transform duration-300 hover:-translate-y-1 ${
                      sign.name === reading.sign.name
                        ? "bg-accent/25 border-accent text-accent-foreground"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                    title={sign.name}
                    aria-label={sign.name}
                  >
                    {sign.glyph}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

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
