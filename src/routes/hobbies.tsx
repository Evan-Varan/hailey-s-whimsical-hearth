import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Sprout, BookOpen, Feather, Heart, Stars, Moon, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/SparkleField";

export const Route = createFileRoute("/hobbies")({
  head: () => ({
    meta: [
      { title: "Hobbies — Hailey Adkins" },
      { name: "description", content: "Wander by hobby — crochet, tarot, dnd, horses, cats, astrology, lifestyle." },
      { property: "og:title", content: "Hobbies — Hailey Adkins" },
      { property: "og:description", content: "All the small magical things I love to make." },
    ],
  }),
  component: HobbiesPage,
});

const categories = [
  { name: "Crochet", icon: Sprout, count: 24, note: "yarn, hooks, slow stitches and free patterns." },
  { name: "Tarot", icon: Sparkles, count: 31, note: "weekly pulls, spreads, and small candlelit rituals." },
  { name: "DnD", icon: BookOpen, count: 18, note: "campaign notes, character art, and homebrew." },
  { name: "Horses", icon: Feather, count: 12, note: "riding journals and barn-life observations." },
  { name: "Cats", icon: Heart, count: 27, note: "the editor-in-chief, and her many neighborhood friends." },
  { name: "Astrology", icon: Stars, count: 22, note: "transits, charts, and moon-soft musings." },
  { name: "Lifestyle", icon: Moon, count: 19, note: "slow days, soft rituals, journaling and tea." },
];

function HobbiesPage() {
  const [phase, setPhase] = useState(4);
  const moonPhases = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  const moonNames = ["New", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="tag-chip rose">wander by hobby</span>
        <h1 className="font-hand text-6xl md:text-7xl text-foreground mt-4">Things I love to make</h1>
        <p className="font-serif-display italic text-lg text-muted-foreground mt-4">
          A little map of the corners of this journal. Pick a thread and pull.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.name} to="/journal" className="paper-card p-7 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center text-forest dark:text-foreground group-hover:bg-accent/40 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-hand text-3xl text-foreground leading-none">{c.name}</p>
                  <p className="font-serif-display italic text-xs text-muted-foreground mt-1">{c.count} entries</p>
                </div>
              </div>
              <p className="font-serif-display italic text-muted-foreground mt-5">{c.note}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm group-hover:gap-3 transition-all">
                browse {c.name.toLowerCase()} <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Tarot + Moon widgets */}
      <div className="mt-20">
        <SectionHeader eyebrow="today, in the sky" title="card & moon of the day" />
        <div className="grid lg:grid-cols-2 gap-6 mt-12">
          {/* Tarot */}
          <div className="paper-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/30 rounded-full -translate-y-12 translate-x-12 blur-2xl" aria-hidden />
            <span className="tag-chip rose">card of the day</span>
            <div className="mt-6 mx-auto w-44 h-64 rounded-xl border-2 border-accent/60 bg-gradient-to-br from-secondary/40 via-card to-accent/30 flex flex-col items-center justify-center relative shadow-inner">
              <Stars className="w-10 h-10 text-accent animate-twinkle" />
              <p className="font-hand text-3xl mt-3 text-foreground">The Star</p>
              <span className="absolute top-2 left-2 font-hand text-xs text-muted-foreground">XVII</span>
              <span className="absolute bottom-2 right-2 font-hand text-xs text-muted-foreground">✦</span>
            </div>
            <p className="font-serif-display italic text-center text-muted-foreground mt-5">
              Hope · Renewal · Quiet faith
            </p>
            <p className="font-serif-display italic text-center text-foreground/80 mt-3 max-w-md mx-auto">
              "Pour yourself something warm. Trust the path that's still unfolding."
            </p>
          </div>

          {/* Moon */}
          <div className="paper-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" aria-hidden />
            <span className="tag-chip">tonight's sky</span>
            <div className="relative mt-8 flex items-center justify-between gap-2">
              {moonPhases.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setPhase(i)}
                  className={`text-2xl transition-all ${phase === i ? "scale-150 opacity-100" : "opacity-40 hover:opacity-80"}`}
                  aria-label={moonNames[i]}
                >{m}</button>
              ))}
            </div>
            <p className="font-hand text-4xl mt-10 text-foreground">{moonNames[phase]}</p>
            <p className="font-serif-display text-muted-foreground italic mt-2">
              The moon is in <span className="text-primary font-semibold not-italic">Pisces</span> — soft, dreamy,
              a good night for journaling and rest.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="font-serif-display italic text-xs text-muted-foreground">sun</p>
                <p className="font-hand text-xl text-foreground mt-1">Scorpio</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="font-serif-display italic text-xs text-muted-foreground">moon</p>
                <p className="font-hand text-xl text-foreground mt-1">Pisces</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="font-serif-display italic text-xs text-muted-foreground">rising</p>
                <p className="font-hand text-xl text-foreground mt-1">Cancer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
