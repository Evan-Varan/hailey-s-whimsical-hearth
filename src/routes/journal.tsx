import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/SparkleField";
import { featured, morePosts, recentJournal } from "@/lib/blog-data";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Hailey Adkins" },
      { name: "description", content: "Long-form notes on tarot, crochet, dnd, horses, cats, astrology and slow living." },
      { property: "og:title", content: "Journal — Hailey Adkins" },
      { property: "og:description", content: "All recent journal entries from Hailey's stardust cottage." },
    ],
  }),
  component: JournalPage,
});

const allPosts = [...featured, ...morePosts];

function JournalPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="tag-chip">the journal</span>
        <h1 className="font-hand text-6xl md:text-7xl text-foreground mt-4">Notes from the cottage</h1>
        <p className="font-serif-display italic text-lg text-muted-foreground mt-4">
          Long letters, short ones, recipes for tea and rituals for difficult Tuesdays. Wander in.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mt-10 relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="search the journal…"
          className="w-full pl-11 pr-5 py-3 rounded-full bg-card border border-border focus:border-primary focus:outline-none font-serif-display italic"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10 mt-16">
        {/* Posts list */}
        <div className="lg:col-span-2 space-y-8">
          {allPosts.map((post, i) => (
            <article key={i} className="paper-card overflow-hidden grid sm:grid-cols-[200px_1fr]">
              <div className="relative h-48 sm:h-full overflow-hidden">
                <img src={post.image} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
              <div className="p-6 flex flex-col">
                <span className={`tag-chip ${post.chip}`}>{post.tag}</span>
                <h2 className="font-hand text-3xl text-foreground mt-2 leading-tight">{post.title}</h2>
                <p className="font-serif-display italic text-muted-foreground mt-2 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-serif-display italic text-sm text-muted-foreground">{post.date} · {post.read}</span>
                  <Link to="/journal" className="inline-flex items-center gap-2 text-primary font-serif-display italic text-sm hover:gap-3 transition-all">
                    read entry <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="paper-card p-6">
            <span className="tag-chip">recent journal</span>
            <ul className="mt-4 divide-y divide-border">
              {recentJournal.map((j, i) => (
                <li key={i} className="py-3 flex items-start gap-4 group cursor-pointer">
                  <span className="font-hand text-2xl text-accent w-14 shrink-0">{j.date}</span>
                  <span className="font-serif-display text-foreground/85 group-hover:text-primary transition-colors">{j.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="paper-card p-6">
            <span className="tag-chip gold">currently loving</span>
            <ul className="mt-4 space-y-4 font-serif-display">
              <CurrentlyLoving label="reading" item="The House in the Cerulean Sea" by="TJ Klune" />
              <CurrentlyLoving label="listening" item="Hozier — Unreal Unearth" by="on repeat, again" />
              <CurrentlyLoving label="watching" item="Studio Ghibli marathon" by="with the cat" />
              <CurrentlyLoving label="making" item="A mossy granny square shawl" by="size: enormous" />
              <CurrentlyLoving label="drinking" item="Earl Grey + a little honey" by="always" />
            </ul>
          </div>

          <div className="paper-card p-6">
            <span className="tag-chip rose">leave a note</span>
            <p className="font-serif-display italic text-muted-foreground mt-4">
              "your stationery suggestions saved my journaling slump 💌"
            </p>
            <p className="font-hand text-xl text-foreground mt-2">— Marigold W.</p>
            <a href="#" className="mt-6 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm">
              <MessageCircle className="w-4 h-4" /> read all comments
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CurrentlyLoving({ label, item, by }: { label: string; item: string; by: string }) {
  return (
    <li className="flex gap-4 items-baseline">
      <span className="font-serif-display italic text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div>
        <p className="text-foreground italic">{item}</p>
        <p className="text-xs text-muted-foreground font-serif-display italic">{by}</p>
      </div>
    </li>
  );
}
