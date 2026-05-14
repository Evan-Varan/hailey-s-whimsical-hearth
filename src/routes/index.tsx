import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Moon, Sun, Search, Sparkles, Heart, MessageCircle, ArrowRight,
  Mail, Instagram, BookOpen, Feather, Stars, Sprout,
} from "lucide-react";

import heroImg from "@/assets/hero-cozy.jpg";
import aboutImg from "@/assets/about-hailey.jpg";
import gCrochet from "@/assets/gallery-crochet.jpg";
import gTarot from "@/assets/gallery-tarot.jpg";
import gHorse from "@/assets/gallery-horse.jpg";
import gCat from "@/assets/gallery-cat.jpg";
import gJournal from "@/assets/gallery-journal.jpg";
import gMoon from "@/assets/gallery-moon.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hailey Adkins — Cozy Tales from a Stardust Cottage" },
      { name: "description", content: "A whimsical journal of tarot, crochet, dnd, horses, cats, astrology and slow magical living by Hailey Adkins." },
      { property: "og:title", content: "Hailey Adkins — Cozy Tales from a Stardust Cottage" },
      { property: "og:description", content: "A whimsical journal of tarot, crochet, dnd, horses, cats and slow magical living." },
    ],
  }),
  component: Home,
});

const featured = [
  {
    title: "On Brewing Bergamot Tea Beneath the Waxing Moon",
    excerpt: "A slow Sunday ritual: steam, citrus peel, and a small spell for clarity. What I learned about beginnings from the High Priestess this week…",
    tag: "Tarot",
    chip: "rose",
    image: gTarot,
    date: "Nov 12",
    read: "6 min",
  },
  {
    title: "The Sage Granny Square Blanket — Pattern + Notes",
    excerpt: "After three months and a very opinionated cat, my mossy heirloom is finished. Free pattern, yarn weight notes, and the playlist that got me there.",
    tag: "Crochet",
    chip: "",
    image: gCrochet,
    date: "Nov 09",
    read: "9 min",
  },
  {
    title: "Building a Druid Who Talks to Horses (DnD Session 14)",
    excerpt: "We met a creature in the Hollowmere who only spoke in lullabies. Notes on roleplaying gentleness and a rough sketch of the new mount.",
    tag: "DnD",
    chip: "gold",
    image: gJournal,
    date: "Nov 05",
    read: "11 min",
  },
];

const categories = [
  { name: "Crochet", icon: Sprout, count: 24 },
  { name: "Tarot", icon: Sparkles, count: 31 },
  { name: "DnD", icon: BookOpen, count: 18 },
  { name: "Horses", icon: Feather, count: 12 },
  { name: "Cats", icon: Heart, count: 27 },
  { name: "Astrology", icon: Stars, count: 22 },
  { name: "Lifestyle", icon: Moon, count: 19 },
];

const galleryItems = [
  { src: gCrochet, span: "row-span-2", alt: "Crochet doily and yarn" },
  { src: gMoon, span: "", alt: "Moon and constellations" },
  { src: gCat, span: "row-span-2", alt: "Sleeping cat" },
  { src: gTarot, span: "", alt: "Tarot spread" },
  { src: gHorse, span: "row-span-2", alt: "Chestnut horse at dusk" },
  { src: gJournal, span: "", alt: "Open journal" },
];

const recentJournal = [
  { date: "Nov 14", title: "A small list of things that did not go wrong today" },
  { date: "Nov 11", title: "Letter to my future self, written by candlelight" },
  { date: "Nov 07", title: "On the soft discipline of finishing what you start" },
  { date: "Nov 02", title: "The barn cat and her seven small ghosts" },
];

function Home() {
  const [dark, setDark] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  const tarot = {
    name: "The Star",
    keywords: "Hope · Renewal · Quiet faith",
    note: "Pour yourself something warm. Trust the path that's still unfolding.",
  };

  const moonPhases = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  const moonNames = ["New", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Floating decorative SVG sparkles */}
      <SparkleField />

      {/* Nav */}
      <header className="relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="font-hand text-3xl text-primary leading-none">Hailey</span>
            <span className="font-hand text-3xl text-secondary-foreground leading-none">Adkins</span>
            <Sparkles className="w-4 h-4 text-accent animate-twinkle" aria-hidden />
          </a>
          <nav className="hidden md:flex items-center gap-8 font-sans-ui text-sm tracking-wide text-muted-foreground">
            <a href="#journal" className="hover:text-primary transition-colors">Journal</a>
            <a href="#categories" className="hover:text-primary transition-colors">Hobbies</a>
            <a href="#gallery" className="hover:text-primary transition-colors">Gallery</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#newsletter" className="hover:text-primary transition-colors">Letters</a>
          </nav>
          <div className="flex items-center gap-2">
            <button aria-label="Search" className="p-2 rounded-full hover:bg-muted transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-8 pb-20 md:pt-16 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <span className="tag-chip gold mb-6">
              <Sparkles className="w-3 h-3" /> a stardust cottage journal
            </span>
            <h1 className="font-hand text-6xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] mt-6">
              Tea, tarot,<br />
              <span className="text-primary italic">tangled yarn</span><br />
              &amp; <span className="text-secondary-foreground">small magic.</span>
            </h1>
            <p className="font-serif-display text-lg md:text-xl text-muted-foreground mt-8 max-w-lg leading-relaxed">
              Welcome to my corner of the internet — a slow, lamplit place for crochet
              patterns, tarot pulls, dnd campaigns, sleepy cats, and notes on a life
              made by hand.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <a href="#journal" className="btn-primary">
                Read the journal <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#newsletter" className="btn-ghost">
                <Mail className="w-4 h-4" /> Get monthly letters
              </a>
            </div>
            <div className="flex items-center gap-6 mt-12 text-xs font-sans-ui tracking-[0.18em] uppercase text-muted-foreground">
              <span className="flex items-center gap-2"><Stars className="w-3 h-3 text-accent" /> Est. ’24</span>
              <span className="flex items-center gap-2"><BookOpen className="w-3 h-3 text-primary" /> 153 entries</span>
              <span className="flex items-center gap-2"><Heart className="w-3 h-3 text-secondary-foreground" /> 4.2k readers</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-secondary/40 blur-2xl animate-drift" aria-hidden />
            <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-accent/30 blur-3xl animate-drift" aria-hidden />
            <div className="relative paper-card overflow-hidden rotate-1 hover:rotate-0">
              <img
                src={heroImg}
                alt="Cozy cottagecore illustration with cat, books, tarot cards and crescent moon"
                width={1280}
                height={1280}
                className="w-full h-auto"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-hand text-foreground/80">
                <span className="bg-card/80 backdrop-blur px-3 py-1 rounded-full text-sm">
                  ✦ today's altar
                </span>
                <span className="bg-card/80 backdrop-blur px-3 py-1 rounded-full text-sm">
                  Nov 14, MMXXVI
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured posts */}
      <section id="journal" className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader eyebrow="recently written" title="featured journal entries" />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {featured.map((post, i) => (
            <article key={i} className="paper-card overflow-hidden flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={post.image}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <span className={`tag-chip ${post.chip} absolute top-3 left-3`}>{post.tag}</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs font-sans-ui uppercase tracking-wider text-muted-foreground">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.read}</span>
                </div>
                <h3 className="font-hand text-3xl text-foreground mt-3 leading-tight">
                  {post.title}
                </h3>
                <p className="font-serif-display text-muted-foreground mt-3 italic flex-1">
                  {post.excerpt}
                </p>
                <a href="#" className="mt-5 inline-flex items-center gap-2 text-primary font-sans-ui text-sm hover:gap-3 transition-all">
                  read entry <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader eyebrow="wander by hobby" title="things i love to make" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-12">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.name}
                href="#"
                className="paper-card p-5 text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/40 mx-auto flex items-center justify-center group-hover:bg-accent/40 transition-colors">
                  <Icon className="w-5 h-5 text-forest dark:text-foreground" />
                </div>
                <p className="font-hand text-2xl mt-3 text-foreground">{c.name}</p>
                <p className="font-sans-ui text-xs text-muted-foreground mt-1">{c.count} entries</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Tarot + Moon + Currently loving */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tarot card of the day */}
          <div className="paper-card p-8 relative overflow-hidden lg:col-span-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/30 rounded-full -translate-y-12 translate-x-12 blur-2xl" aria-hidden />
            <span className="tag-chip rose">card of the day</span>
            <div className="mt-6 mx-auto w-40 h-60 rounded-xl border-2 border-accent/60 bg-gradient-to-br from-secondary/40 via-card to-accent/30 flex flex-col items-center justify-center relative shadow-inner">
              <Stars className="w-10 h-10 text-accent animate-twinkle" />
              <p className="font-hand text-3xl mt-3 text-foreground">{tarot.name}</p>
              <span className="absolute top-2 left-2 font-hand text-xs text-muted-foreground">XVII</span>
              <span className="absolute bottom-2 right-2 font-hand text-xs text-muted-foreground">✦</span>
            </div>
            <p className="font-sans-ui text-xs uppercase tracking-widest text-muted-foreground text-center mt-5">
              {tarot.keywords}
            </p>
            <p className="font-serif-display italic text-center text-foreground/80 mt-3">
              "{tarot.note}"
            </p>
          </div>

          {/* Moon phase */}
          <div className="paper-card p-8 lg:col-span-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/20" aria-hidden />
            <span className="tag-chip">tonight's sky</span>
            <div className="relative mt-8 flex items-center justify-between gap-2">
              {moonPhases.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setPhase(i)}
                  className={`text-2xl transition-all ${
                    phase === i ? "scale-150 opacity-100" : "opacity-40 hover:opacity-80"
                  }`}
                  aria-label={moonNames[i]}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="font-hand text-4xl mt-10 text-foreground">{moonNames[phase]}</p>
            <p className="font-serif-display text-muted-foreground italic mt-2">
              The moon is in <span className="text-primary font-semibold not-italic">Pisces</span> — soft,
              dreamy, a good night for journaling and rest.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center font-sans-ui text-xs">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-muted-foreground uppercase tracking-wider">Sun</p>
                <p className="font-hand text-xl text-foreground mt-1">Scorpio</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-muted-foreground uppercase tracking-wider">Moon</p>
                <p className="font-hand text-xl text-foreground mt-1">Pisces</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-muted-foreground uppercase tracking-wider">Rising</p>
                <p className="font-hand text-xl text-foreground mt-1">Cancer</p>
              </div>
            </div>
          </div>

          {/* Currently loving */}
          <div className="paper-card p-8 lg:col-span-1">
            <span className="tag-chip gold">currently loving</span>
            <ul className="mt-6 space-y-5 font-serif-display">
              <CurrentlyLoving label="reading" item="The House in the Cerulean Sea" by="TJ Klune" />
              <CurrentlyLoving label="listening" item="Hozier — Unreal Unearth" by="on repeat, again" />
              <CurrentlyLoving label="watching" item="Studio Ghibli marathon" by="with the cat" />
              <CurrentlyLoving label="making" item="A mossy granny square shawl" by="size: enormous" />
              <CurrentlyLoving label="drinking" item="Earl Grey + a little honey" by="always" />
            </ul>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader eyebrow="from the camera roll" title="a little visual scrapbook" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-rows-[200px] auto-rows-[200px] gap-4 mt-12">
          {galleryItems.map((g, i) => (
            <figure
              key={i}
              className={`relative overflow-hidden rounded-2xl paper-card ${g.span}`}
            >
              <img
                src={g.src}
                alt={g.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </figure>
          ))}
        </div>
      </section>

      {/* About + Recent journal */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3 paper-card p-8 md:p-12 relative overflow-hidden">
            <span className="tag-chip rose">hello, friend</span>
            <h2 className="font-hand text-5xl md:text-6xl mt-6 text-foreground leading-tight">
              I'm Hailey — <span className="text-primary italic">a quiet maker of small magical things.</span>
            </h2>
            <div className="grid md:grid-cols-[1fr_auto] gap-8 mt-8 items-start">
              <div className="font-serif-display text-lg text-foreground/85 leading-relaxed space-y-4">
                <p>
                  I'm twenty-four, perpetually mid-project, and very fond of slow mornings.
                  I write about the things that make my world feel softer: tarot pulls and
                  birth charts, half-finished crochet, the rhythm of a long dnd campaign,
                  a horse named Juniper, and a tabby cat who edits everything I write.
                </p>
                <p>
                  This is a journal more than a blog — a paper-and-ink kind of place. I
                  hope you'll wander in often, leave a small note in the margins, and stay
                  for a cup of something warm.
                </p>
                <p className="font-hand text-3xl text-secondary-foreground pt-2">
                  — with love, Hailey ✦
                </p>
              </div>
              <img
                src={aboutImg}
                alt="Illustrated portrait of Hailey holding a tarot card"
                loading="lazy"
                className="rounded-2xl w-44 md:w-56 shadow-lg border border-border -rotate-2"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="paper-card p-6">
              <span className="tag-chip">recent journal</span>
              <ul className="mt-4 divide-y divide-border">
                {recentJournal.map((j, i) => (
                  <li key={i} className="py-3 flex items-start gap-4 group cursor-pointer">
                    <span className="font-hand text-2xl text-accent w-14 shrink-0">{j.date}</span>
                    <span className="font-serif-display text-foreground/85 group-hover:text-primary transition-colors">
                      {j.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="paper-card p-6">
              <span className="tag-chip gold">leave a note</span>
              <p className="font-serif-display italic text-muted-foreground mt-4">
                "your stationery suggestions saved my journaling slump 💌"
              </p>
              <p className="font-hand text-xl text-foreground mt-2">— Marigold W.</p>
              <a href="#" className="mt-6 inline-flex items-center gap-2 text-primary font-sans-ui text-sm">
                <MessageCircle className="w-4 h-4" /> read all comments
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="max-w-5xl mx-auto px-6 py-20">
        <div className="paper-card p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-secondary/40 blur-3xl" aria-hidden />
          <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-accent/30 blur-3xl" aria-hidden />
          <Sparkles className="w-6 h-6 text-accent mx-auto animate-twinkle" />
          <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-4">
            Letters from the cottage
          </h2>
          <p className="font-serif-display italic text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
            One slow letter a month — tarot pulls, free patterns, what I'm reading,
            and small notes from the woods. No noise, ever.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="your email, gentle reader"
              className="flex-1 px-5 py-3 rounded-full bg-card border border-border focus:border-primary focus:outline-none font-serif-display text-foreground placeholder:text-muted-foreground"
            />
            <button type="submit" className="btn-primary justify-center">
              Subscribe <Heart className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-hand text-3xl text-primary">Hailey Adkins</p>
            <p className="font-serif-display italic text-sm text-muted-foreground mt-1">
              made by hand, with tea & moonlight ✦ © {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Instagram" className="p-2 rounded-full hover:bg-muted transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Email" className="p-2 rounded-full hover:bg-muted transition-colors">
              <Mail className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Pinterest" className="p-2 rounded-full hover:bg-muted transition-colors">
              <Heart className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="font-sans-ui text-xs uppercase tracking-[0.3em] text-muted-foreground ornate-border inline-block">
        {eyebrow}
      </p>
      <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-3">{title}</h2>
    </div>
  );
}

function CurrentlyLoving({ label, item, by }: { label: string; item: string; by: string }) {
  return (
    <li className="flex gap-4 items-baseline">
      <span className="font-sans-ui text-[10px] uppercase tracking-widest text-muted-foreground w-20 shrink-0">
        {label}
      </span>
      <div>
        <p className="text-foreground italic">{item}</p>
        <p className="text-xs text-muted-foreground font-sans-ui">{by}</p>
      </div>
    </li>
  );
}

function SparkleField() {
  const stars = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {stars.map((_, i) => {
        const top = `${(i * 37) % 95}%`;
        const left = `${(i * 53) % 95}%`;
        const delay = `${(i % 5) * 0.6}s`;
        const size = 6 + (i % 4) * 3;
        return (
          <svg
            key={i}
            className="absolute animate-twinkle text-accent/60"
            style={{ top, left, animationDelay: delay, width: size, height: size }}
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M12 0l1.8 8.2L22 10l-8.2 1.8L12 20l-1.8-8.2L2 10l8.2-1.8L12 0z" />
          </svg>
        );
      })}
    </div>
  );
}
