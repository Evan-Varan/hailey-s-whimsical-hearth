import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenText, Feather, Mailbox } from "@phosphor-icons/react";
import aboutImg from "@/assets/about-hailey.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Hailey Adkins" },
      { name: "description", content: "Hello, friend. I'm Hailey — a quiet maker of small magical things. Come in, sit by the fire." },
      { property: "og:title", content: "About — Hailey Adkins" },
      { property: "og:description", content: "Meet Hailey, the quiet maker behind the stardust cottage journal." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="tag-chip rose">hello, friend</span>
        <h1 className="font-hand text-6xl md:text-7xl text-foreground mt-4">A quiet maker of small magical things</h1>
      </div>

      <div className="paper-card p-8 md:p-12 mt-12 grid md:grid-cols-[1fr_auto] gap-10 items-start">
        <div className="font-serif-display text-lg text-foreground/85 leading-relaxed space-y-4">
          <p>
            I'm Hailey — twenty-four, perpetually mid-project, and very fond of slow mornings.
            I write about the things that make my world feel softer: tarot pulls and birth charts,
            half-finished crochet, the rhythm of a long dnd campaign, a horse named Juniper, and
            a tabby cat named Pippin who edits everything I write whether I asked or not.
          </p>
          <p>
            This is a journal more than a blog — a paper-and-ink kind of place. I share free
            crochet patterns, weekly tarot readings, sketches from the woods behind my house,
            and the quiet little rituals that hold a week together.
          </p>
          <p>
            I hope you'll wander in often, leave a small note in the margins, and stay for a
            cup of something warm.
          </p>
          <p className="font-hand text-3xl text-secondary-foreground pt-2">
            — with love, Hailey ✦
          </p>
        </div>
        <img
          src={aboutImg}
          alt="Illustrated portrait of Hailey holding a tarot card"
          loading="lazy"
          className="rounded-2xl w-48 md:w-60 shadow-lg border border-border -rotate-2"
        />
      </div>

      {/* Little facts */}
      <div className="grid sm:grid-cols-3 gap-4 mt-10">
        <Fact label="lives in" value="a small green valley" />
        <Fact label="zodiac" value="Scorpio sun, Pisces moon" />
        <Fact label="patron saint" value="St. Pippin the cat" />
      </div>

      {/* Newsletter */}
      <div className="paper-card p-10 md:p-14 text-center relative overflow-hidden mt-16">
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-secondary/40 blur-3xl" aria-hidden />
        <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-accent/30 blur-3xl" aria-hidden />
        <Mailbox weight="duotone" className="w-6 h-6 text-accent mx-auto" />
        <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-4">Letters from the cottage</h2>
        <p className="font-serif-display italic text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
          One slow letter a month. Tarot pulls, free patterns, what I'm reading, and small notes from the woods.
        </p>
        <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input type="email" required placeholder="your email, gentle reader" className="flex-1 px-5 py-3 rounded-full bg-card border border-border focus:border-primary focus:outline-none font-serif-display text-foreground placeholder:text-muted-foreground" />
          <button type="submit" className="btn-primary justify-center">Subscribe <Feather weight="duotone" className="w-4 h-4" /></button>
        </form>
      </div>

      <div className="text-center mt-10">
        <Link to="/journal" className="btn-ghost">
          <BookOpenText weight="duotone" className="w-4 h-4" /> read the journal <ArrowRight weight="bold" className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="paper-card p-5 text-center">
      <p className="font-serif-display italic text-xs text-muted-foreground">{label}</p>
      <p className="font-hand text-2xl text-foreground mt-1">{value}</p>
    </div>
  );
}
