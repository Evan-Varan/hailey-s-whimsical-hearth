import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ChatText, MagnifyingGlass, PencilLine } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { journalPosts, recentJournal } from "@/lib/blog-data";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Hailey Adkins" },
      {
        name: "description",
        content: "Long-form notes on tarot, crochet, dnd, horses, cats, astrology and slow living.",
      },
      { property: "og:title", content: "Journal — Hailey Adkins" },
      {
        property: "og:description",
        content: "All recent journal entries from Hailey's stardust cottage.",
      },
    ],
  }),
  component: JournalPage,
});

type SubstackFeed = {
  configured: boolean;
  publication: {
    name: string;
    subdomain: string;
    heroText?: string;
    authorPhotoUrl?: string;
  } | null;
  items: Array<{
    id: string;
    title: string;
    slug: string;
    url: string;
    excerpt: string;
    imageUrl?: string;
    publishedAt: string;
    read: string;
    tags: string[];
    reactionCount: number;
    commentCount: number;
  }>;
  error?: string;
};

function JournalPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [substack, setSubstack] = useState<SubstackFeed | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSubstackPosts() {
      try {
        const response = await fetch("/api/substack", { signal: controller.signal });
        const payload = (await response.json()) as SubstackFeed;

        if (!response.ok) {
          throw new Error(payload.error ?? "Substack posts are unavailable.");
        }

        setSubstack(payload);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setSubstack(null);
      }
    }

    void loadSubstackPosts();

    return () => controller.abort();
  }, []);

  const livePosts = substack?.items ?? [];
  const posts = livePosts.length ? livePosts : null;
  const sidebarItems = useMemo(() => posts?.slice(0, 4) ?? null, [posts]);

  if (pathname !== "/journal") {
    return <Outlet />;
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="tag-chip">the journal</span>
        <h1 className="font-hand text-6xl md:text-7xl text-foreground mt-4">
          Notes from the cottage
        </h1>
        <p className="font-serif-display italic text-lg text-muted-foreground mt-4">
          Long letters, short ones, recipes for tea and rituals for difficult Tuesdays. Wander in.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mt-10 relative">
        <MagnifyingGlass className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="search the journal…"
          className="w-full pl-11 pr-5 py-3 rounded-full bg-card border border-border focus:border-primary focus:outline-none font-serif-display italic"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10 mt-16">
        {/* Posts list */}
        <div className="lg:col-span-2 space-y-8">
          {posts
            ? posts.map((post) => (
                <article
                  key={post.id}
                  className="paper-card overflow-hidden grid sm:grid-cols-[200px_1fr]"
                >
                  <div className="relative h-48 sm:h-full overflow-hidden">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <div className="p-6 flex flex-col">
                    <span className="tag-chip rose">
                      {post.tags[0] ?? substack?.publication?.name ?? "Substack"}
                    </span>
                    <h2 className="font-hand text-3xl text-foreground mt-2 leading-tight">
                      {post.title}
                    </h2>
                    <p className="font-serif-display italic text-muted-foreground mt-2 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-serif-display italic text-sm text-muted-foreground">
                        {formatDate(post.publishedAt)} · {post.read}
                      </span>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-serif-display italic text-sm hover:gap-3 transition-all"
                      >
                        read on Substack <PencilLine weight="duotone" className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </article>
              ))
            : journalPosts.map((post) => (
                <article
                  key={post.slug}
                  className="paper-card overflow-hidden grid sm:grid-cols-[200px_1fr]"
                >
                  <div className="relative h-48 sm:h-full overflow-hidden">
                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col">
                    <span className={`tag-chip ${post.chip}`}>{post.tag}</span>
                    <h2 className="font-hand text-3xl text-foreground mt-2 leading-tight">
                      {post.title}
                    </h2>
                    <p className="font-serif-display italic text-muted-foreground mt-2 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-serif-display italic text-sm text-muted-foreground">
                        {post.date} · {post.read}
                      </span>
                      <Link
                        to="/journal/$slug"
                        params={{ slug: post.slug }}
                        className="inline-flex items-center gap-2 text-primary font-serif-display italic text-sm hover:gap-3 transition-all"
                      >
                        read entry <PencilLine weight="duotone" className="w-3 h-3" />
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
              {sidebarItems
                ? sidebarItems.map((j) => (
                    <li key={j.id} className="py-3">
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-4 group"
                      >
                        <span className="font-hand text-2xl text-accent w-14 shrink-0">
                          {formatShortDate(j.publishedAt)}
                        </span>
                        <span className="font-serif-display text-foreground/85 group-hover:text-primary transition-colors">
                          {j.title}
                        </span>
                      </a>
                    </li>
                  ))
                : recentJournal.map((j, i) => (
                    <li key={i} className="py-3">
                      <Link
                        to="/journal/$slug"
                        params={{ slug: j.slug }}
                        className="flex items-start gap-4 group"
                      >
                        <span className="font-hand text-2xl text-accent w-14 shrink-0">
                          {j.date}
                        </span>
                        <span className="font-serif-display text-foreground/85 group-hover:text-primary transition-colors">
                          {j.title}
                        </span>
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>

          <div className="paper-card p-6">
            <span className="tag-chip gold">currently loving</span>
            <ul className="mt-4 space-y-4 font-serif-display">
              <CurrentlyLoving label="reading" item="The House in the Cerulean Sea" by="TJ Klune" />
              <CurrentlyLoving
                label="listening"
                item="Hozier — Unreal Unearth"
                by="on repeat, again"
              />
              <CurrentlyLoving label="watching" item="Studio Ghibli marathon" by="with the cat" />
              <CurrentlyLoving
                label="making"
                item="A mossy granny square shawl"
                by="size: enormous"
              />
              <CurrentlyLoving label="drinking" item="Earl Grey + a little honey" by="always" />
            </ul>
          </div>

          <div className="paper-card p-6">
            <span className="tag-chip rose">leave a note</span>
            <p className="font-serif-display italic text-muted-foreground mt-4">
              "your stationery suggestions saved my journaling slump 💌"
            </p>
            <p className="font-hand text-xl text-foreground mt-2">— Marigold W.</p>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 text-primary font-serif-display italic text-sm"
            >
              <ChatText weight="duotone" className="w-4 h-4" /> read all comments
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function CurrentlyLoving({ label, item, by }: { label: string; item: string; by: string }) {
  return (
    <li className="flex gap-4 items-baseline">
      <span className="font-serif-display italic text-xs text-muted-foreground w-20 shrink-0">
        {label}
      </span>
      <div>
        <p className="text-foreground italic">{item}</p>
        <p className="text-xs text-muted-foreground font-serif-display italic">{by}</p>
      </div>
    </li>
  );
}
