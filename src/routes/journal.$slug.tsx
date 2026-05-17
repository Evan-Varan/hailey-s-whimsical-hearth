import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpenText, ChatText, Feather } from "@phosphor-icons/react";

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
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <span className="tag-chip rose">missing page</span>
        <h1 className="font-hand text-6xl text-foreground mt-4">This page slipped out of the journal.</h1>
        <p className="font-serif-display italic text-lg text-muted-foreground mt-4">
          The entry may have moved, or the link may be unfinished.
        </p>
        <Link to="/journal" className="btn-ghost mt-8">
          <ArrowLeft weight="bold" className="w-4 h-4" /> back to the journal
        </Link>
      </main>
    );
  }

  return (
    <main>
      <article className="max-w-4xl mx-auto px-6 py-14 md:py-20">
        <Link to="/journal" className="inline-flex items-center gap-2 text-primary font-serif-display italic text-sm hover:gap-3 transition-all">
          <ArrowLeft weight="bold" className="w-4 h-4" /> back to all entries
        </Link>

        <header className="mt-10">
          <span className={`tag-chip ${post.chip}`}>{post.tag}</span>
          <h1 className="font-hand text-6xl md:text-7xl text-foreground leading-[0.95] mt-5">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-6 font-serif-display italic text-sm text-muted-foreground">
            <span>{post.date}</span>
            <span>{post.read}</span>
            <span className="inline-flex items-center gap-2">
              <BookOpenText weight="duotone" className="w-4 h-4 text-primary" /> Hailey's journal
            </span>
          </div>
        </header>

        <div className="paper-card overflow-hidden mt-10">
          <img src={post.image} alt="" className="w-full aspect-[16/9] object-cover" />
        </div>

        <div className="grid lg:grid-cols-[1fr_220px] gap-10 mt-12 items-start">
          <div className="font-serif-display text-xl leading-relaxed text-foreground/85 space-y-6">
            <p className="italic text-2xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
            {post.body.map((paragraph: string) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <aside className="paper-card p-6 lg:sticky lg:top-28">
            <Feather weight="duotone" className="w-5 h-5 text-accent" />
            <p className="font-sans-ui text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-4">field note</p>
            <p className="font-serif-display italic text-muted-foreground mt-3">{post.deckNote}</p>
          </aside>
        </div>
      </article>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-hand text-5xl text-foreground">Keep reading</h2>
          <Link to="/journal" className="hidden sm:inline-flex items-center gap-2 text-primary font-serif-display italic text-sm">
            all entries <BookOpenText weight="duotone" className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {related.map((entry: (typeof journalPosts)[number]) => (
            <Link key={entry.slug} to="/journal/$slug" params={{ slug: entry.slug }} className="paper-card overflow-hidden group">
              <img src={entry.image} alt="" loading="lazy" className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="p-5">
                <span className={`tag-chip ${entry.chip}`}>{entry.tag}</span>
                <p className="font-hand text-3xl text-foreground leading-tight mt-3">{entry.title}</p>
                <p className="font-serif-display italic text-sm text-muted-foreground mt-3">
                  {entry.date} · {entry.read}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-14">
        <div className="paper-card p-8 text-center">
          <ChatText weight="duotone" className="w-5 h-5 text-accent mx-auto" />
          <h2 className="font-hand text-4xl text-foreground mt-4">Leave a note in the margin</h2>
          <p className="font-serif-display italic text-muted-foreground mt-3">
            Comments are still handwritten for now, but this is where the conversation will live.
          </p>
        </div>
      </section>
    </main>
  );
}
