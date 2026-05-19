import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { MagnifyingGlass, PencilLine, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatJournalDate, getJournalTagLabel, type SubstackFeed } from "@/lib/substack";

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

function JournalPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [substack, setSubstack] = useState<SubstackFeed>();
  const [substackError, setSubstackError] = useState<string>();

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
        setSubstackError("Journal posts are unavailable right now.");
      }
    }

    void loadSubstackPosts();

    return () => controller.abort();
  }, []);

  const livePosts = useMemo(() => substack?.items ?? [], [substack?.items]);
  const sidebarItems = useMemo(() => livePosts.slice(0, 4), [livePosts]);
  const substackLoading = substack === undefined && !substackError;

  if (pathname !== "/journal") {
    return <Outlet />;
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center max-w-2xl mx-auto mb-20">
        <span className="tag-chip rose">the archive</span>
        <h1 className="font-display italic text-6xl md:text-8xl text-foreground mt-4 leading-tight">
          Notes from <span className="text-primary">the cottage</span>
        </h1>
        <div className="marginalia text-primary/60 text-xl mt-4">
          long letters, tea recipes, and rituals for difficult Tuesdays
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-16">
        {/* Posts list */}
        <div className="space-y-16">
          {/* Search bar - refined */}
          <div className="max-w-md relative group">
            <MagnifyingGlass className="w-5 h-5 absolute left-0 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              placeholder="search the archive..."
              className="w-full pl-8 pr-4 py-3 bg-transparent border-b border-border/40 focus:border-primary focus:outline-none font-serif italic text-lg transition-all"
            />
          </div>

          <div className="space-y-12">
            {substackLoading
              ? Array.from({ length: 4 }, (_, index) => <JournalPostSkeleton key={index} />)
              : livePosts.map((post, i) => (
                  <article
                    key={post.id}
                    className="group relative transition-transform duration-700 hover:scale-[1.01]"
                    style={{ transform: `rotate(${(i % 2 === 0 ? 0.5 : -0.5)}deg)` }}
                  >
                    <div className="paper-card grid md:grid-cols-[240px_1fr] overflow-hidden bg-card/60">
                      <div className="relative h-60 md:h-full overflow-hidden">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted/20" />
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="cat-stamp text-xs backdrop-blur-sm">
                            {getJournalTagLabel(post.title, post.tags[0] ?? "Journal")}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 md:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 font-marginalia text-lg text-primary/60 mb-3">
                           <span>{formatJournalDate(post.publishedAt)}</span>
                           <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                           <span>{post.read}</span>
                        </div>
                        <h2 className="font-display italic text-4xl text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                          {post.title}
                        </h2>
                        <p className="font-serif italic text-muted-foreground line-clamp-3 leading-relaxed mb-8 text-lg">
                          {post.excerpt}
                        </p>
                        <div className="mt-auto">
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-3 text-primary font-display italic text-xl hover:gap-5 transition-all"
                          >
                            read entry <ArrowRight className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
            {!substackLoading && !livePosts.length ? (
              <div className="paper-card p-16 text-center bg-card/30 border-dashed">
                <p className="font-serif italic text-xl text-muted-foreground">
                  {substackError ?? "The journal is resting. No notes found."}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-12">
          <div className="paper-card p-8 bg-card/50">
            <span className="tag-chip rose mb-6">Pinned notes</span>
            <h2 className="font-display italic text-4xl text-foreground mb-4">Latest releases</h2>
            <div className="space-y-8 mt-8">
              {substackLoading
                ? Array.from({ length: 4 }, (_, index) => <RecentJournalSkeleton key={index} />)
                : sidebarItems.map((j) => (
                    <article key={j.id} className="group">
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex gap-4 items-start"
                      >
                        <div className="relative shrink-0 w-20 aspect-square paper-card p-0.5 overflow-hidden group-hover:-translate-y-1 transition-transform">
                          {j.imageUrl ? (
                            <img
                              src={j.imageUrl}
                              alt=""
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted/20" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-marginalia text-primary/50 text-sm mb-1">
                            {formatJournalDate(j.publishedAt, false)}
                          </div>
                          <h3 className="font-serif italic text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {j.title}
                          </h3>
                        </div>
                      </a>
                    </article>
                  ))}
            </div>
            <div className="mt-10 pt-8 border-t border-border/40">
              <a
                href={substack?.publication?.url ?? "https://substack.com"}
                target="_blank"
                rel="noreferrer"
                className="font-marginalia text-2xl text-primary hover:text-secondary transition-colors block"
              >
                browse all on Substack →
              </a>
            </div>
          </div>

          <div className="paper-card p-8 bg-primary/5 border-primary/10 -rotate-1">
            <div className="marginalia text-lg text-primary/70 mb-4 italic">a note from Hailey:</div>
            <p className="font-serif italic text-foreground/80 leading-relaxed">
              If you enjoy these long-form notes, consider subscribing to the monthly newsletter for pattern previews and ritual guides.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function JournalPostSkeleton() {
  return (
    <div className="paper-card overflow-hidden grid md:grid-cols-[240px_1fr] bg-card/40">
      <Skeleton className="h-60 md:h-full min-h-60 rounded-none" />
      <div className="p-10 space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-4/5" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-6 w-24 mt-4" />
      </div>
    </div>
  );
}

function RecentJournalSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="w-20 aspect-square rounded" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
