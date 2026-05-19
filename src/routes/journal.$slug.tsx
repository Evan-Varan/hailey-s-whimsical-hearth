import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpenText, ChatText, Feather, ArrowRight } from "@phosphor-icons/react";

import { getJournalPost, journalPosts } from "@/lib/blog-data";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const post = getJournalPost(params.slug);

    if (!post) {
      return { post: null };
    }

    return {
      post,
      related: journalPosts
        .filter((entry) => entry.slug !== post.slug && entry.tag === post.tag)
        .concat(journalPosts.filter((entry) => entry.slug !== post.slug && entry.tag !== post.tag))
        .slice(0, 3),
    };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;

    return {
      meta: [
        { title: post ? `${post.title} — Hailey Adkins` : "Journal entry not found — Hailey Adkins" },
        {
          name: "description",
          content: post?.excerpt ?? "This journal entry could not be found.",
        },
        { property: "og:title", content: post ? `${post.title} — Hailey Adkins` : "Journal entry not found" },
        { property: "og:description", content: post?.excerpt ?? "This journal entry could not be found." },
      ],
    };
  },
  component: JournalEntryPage,
});

function JournalEntryPage() {
  const { post, related } = Route.useLoaderData();

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-32 text-center animate-ink">
        <span className="tag-chip rose">missing page</span>
        <h1 className="font-display italic text-6xl text-foreground mt-8 leading-tight">This page slipped out of the journal.</h1>
        <div className="marginalia text-primary/60 text-xl mt-4">
          the entry may have moved, or the link is still being written
        </div>
        <Link to="/journal" className="btn-ghost mt-12">
          <ArrowLeft weight="bold" className="w-4 h-4" /> back to the archive
        </Link>
      </main>
    );
  }

  return (
    <main className="animate-ink">
      <article className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        <Link to="/journal" className="marginalia text-xl text-primary hover:text-secondary transition-colors inline-flex items-center gap-3 group mb-12">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          back to all entries
        </Link>

        <header className="mb-16">
          <span className={`tag-chip ${post.chip}`}>{post.tag}</span>
          <h1 className="font-display italic text-6xl md:text-8xl text-foreground leading-[0.9] mt-6 tracking-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 mt-8 font-marginalia text-xl text-primary/60">
            <span>{post.date}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
            <span>{post.read}</span>
            <span className="hidden sm:inline-flex items-center gap-2">
              <BookOpenText weight="duotone" className="w-5 h-5 opacity-40" /> from the cottage
            </span>
          </div>
        </header>

        <div className="paper-card p-2 rotate-1 mb-16 shadow-soft">
          <img src={post.image} alt="" className="w-full aspect-[16/9] object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" />
        </div>

        <div className="grid lg:grid-cols-[1fr_240px] gap-16 items-start">
          <div className="font-serif italic text-xl md:text-2xl leading-relaxed text-foreground/90 space-y-8">
            <p className="text-3xl text-primary/80 leading-relaxed mb-12 not-italic font-display border-l-2 border-primary/20 pl-8">
              {post.excerpt}
            </p>
            {post.body.map((paragraph: string, i: number) => (
              <p key={i} className="first-letter:text-5xl first-letter:font-display first-letter:mr-2 first-letter:float-left first-letter:leading-[1]">
                {paragraph}
              </p>
            ))}
          </div>

          <aside className="lg:sticky lg:top-32 space-y-12">
            <div className="paper-card p-8 bg-card/60 -rotate-2">
              <Feather weight="duotone" className="w-6 h-6 text-primary/40 mb-4" />
              <div className="font-marginalia text-sm text-primary/70 uppercase tracking-widest mb-3">field note</div>
              <p className="font-serif italic text-muted-foreground leading-relaxed">{post.deckNote}</p>
            </div>
            
            <div className="flex justify-center text-primary/10">
              <Sparkle weight="fill" className="w-8 h-8 animate-twinkle" />
            </div>
          </aside>
        </div>
      </article>

      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-border/20 bg-card/10">
        <div className="flex items-end justify-between gap-4 mb-16">
          <div className="space-y-2">
             <span className="tag-chip rose">Continue</span>
             <h2 className="font-display italic text-5xl md:text-6xl text-foreground leading-tight">Keep reading</h2>
          </div>
          <Link to="/journal" className="marginalia text-2xl text-primary hover:text-secondary transition-colors hidden sm:flex items-center gap-2">
            all entries <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {related.map((entry: (typeof journalPosts)[number], i: number) => (
            <Link 
              key={entry.slug} 
              to="/journal/$slug" 
              params={{ slug: entry.slug }} 
              className="group"
              style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 1}deg)` }}
            >
              <article className="paper-card h-full flex flex-col bg-card/40 hover:bg-card transition-colors">
                <div className="relative aspect-video overflow-hidden border-b border-border/20">
                  <img src={entry.image} alt="" loading="lazy" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <span className={`tag-chip ${entry.chip} mb-4`}>{entry.tag}</span>
                  <h3 className="font-display italic text-3xl text-foreground leading-tight group-hover:text-primary transition-colors mb-4">{entry.title}</h3>
                  <div className="mt-auto font-marginalia text-lg text-primary/50">
                    {entry.date} · {entry.read}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="paper-card p-12 text-center bg-primary/5 border-primary/10">
          <ChatText weight="duotone" className="w-8 h-8 text-primary/40 mx-auto mb-6" />
          <h2 className="font-display italic text-4xl text-foreground leading-tight">Leave a note in the margin</h2>
          <p className="font-serif italic text-xl text-muted-foreground mt-6 leading-relaxed max-w-lg mx-auto">
            Comments are still handwritten for now, but this is where our conversation will live.
          </p>
          <div className="mt-10 font-marginalia text-2xl text-primary/60">
            stay whimsical, friend
          </div>
        </div>
      </section>
    </main>
  );
}
