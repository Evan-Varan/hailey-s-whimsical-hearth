import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Heart, BookOpen, Stars, Sparkles } from "lucide-react";

import heroImg from "@/assets/hero-cozy.jpg";
import { SectionHeader } from "@/components/SparkleField";
import { featured } from "@/lib/blog-data";

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

function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-10 pb-20 md:pt-16 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <span className="tag-chip gold">a stardust cottage journal</span>
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
              <Link to="/journal" className="btn-primary">
                Read the journal <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className="btn-ghost">
                <Mail className="w-4 h-4" /> About Hailey
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-12 text-xs font-serif-display italic text-muted-foreground">
              <span className="flex items-center gap-2"><Stars className="w-3 h-3 text-accent" /> Est. ’24</span>
              <span className="flex items-center gap-2"><BookOpen className="w-3 h-3 text-primary" /> 153 entries</span>
              <span className="flex items-center gap-2"><Heart className="w-3 h-3 text-secondary-foreground" /> 4.2k readers</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-secondary/40 blur-2xl animate-drift" aria-hidden />
            <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-accent/30 blur-3xl animate-drift" aria-hidden />
            <div className="relative paper-card overflow-hidden rotate-1 hover:rotate-0">
              <img src={heroImg} alt="Cozy cottagecore illustration" width={1280} height={1280} className="w-full h-auto" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-hand text-foreground/80">
                <span className="bg-card/80 backdrop-blur px-3 py-1 rounded-full text-sm">✦ today's altar</span>
                <span className="bg-card/80 backdrop-blur px-3 py-1 rounded-full text-sm">Nov 14, MMXXVI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader eyebrow="recently written" title="featured journal entries" />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {featured.map((post, i) => (
            <article key={i} className="paper-card overflow-hidden flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img src={post.image} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                <span className="cat-stamp absolute top-3 left-3"><span className="dot" /> {post.tag}</span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs font-serif-display italic text-muted-foreground">
                  <span>{post.date}</span><span>·</span><span>{post.read}</span>
                </div>
                <h3 className="font-hand text-3xl text-foreground mt-3 leading-tight">{post.title}</h3>
                <p className="font-serif-display text-muted-foreground mt-3 italic flex-1">{post.excerpt}</p>
                <Link to="/journal" className="mt-5 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm hover:gap-3 transition-all">
                  read entry <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/journal" className="btn-ghost">browse the full journal <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>

      {/* Quick wander */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <SectionHeader eyebrow="wander a little" title="where to next?" />
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          <WanderCard to="/hobbies" title="Hobbies" note="crochet, tarot, dnd, horses, cats, astrology" icon={<Sparkles className="w-5 h-5" />} />
          <WanderCard to="/gallery" title="Gallery" note="a little visual scrapbook" icon={<Heart className="w-5 h-5" />} />
          <WanderCard to="/about" title="About Hailey" note="hello, friend — come in, sit by the fire" icon={<BookOpen className="w-5 h-5" />} />
        </div>
      </section>

      {/* Newsletter teaser */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="paper-card p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-secondary/40 blur-3xl" aria-hidden />
          <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-accent/30 blur-3xl" aria-hidden />
          <Sparkles className="w-6 h-6 text-accent mx-auto animate-twinkle" />
          <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-4">Letters from the cottage</h2>
          <p className="font-serif-display italic text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
            One slow letter a month — tarot pulls, free patterns, what I'm reading, and small notes from the woods.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="your email, gentle reader" className="flex-1 px-5 py-3 rounded-full bg-card border border-border focus:border-primary focus:outline-none font-serif-display text-foreground placeholder:text-muted-foreground" />
            <button type="submit" className="btn-primary justify-center">Subscribe <Heart className="w-4 h-4" /></button>
          </form>
        </div>
      </section>
    </main>
  );
}

function WanderCard({ to, title, note, icon }: { to: "/hobbies" | "/gallery" | "/about"; title: string; note: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="paper-card p-8 group">
      <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center text-forest dark:text-foreground group-hover:bg-accent/40 transition-colors">{icon}</div>
      <p className="font-hand text-4xl mt-4 text-foreground">{title}</p>
      <p className="font-serif-display italic text-muted-foreground mt-2">{note}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm group-hover:gap-3 transition-all">
        wander in <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}
