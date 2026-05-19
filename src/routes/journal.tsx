import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { MagnifyingGlass, PencilLine } from "@phosphor-icons/react";
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
          {substackLoading
            ? Array.from({ length: 5 }, (_, index) => <JournalPostSkeleton key={index} />)
            : livePosts.map((post) => (
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
                      {getJournalTagLabel(
                        post.title,
                        post.tags[0] ?? substack?.publication?.name ?? "Substack",
                      )}
                    </span>
                    <h2 className="font-hand text-3xl text-foreground mt-2 leading-tight">
                      {post.title}
                    </h2>
                    <p className="font-serif-display italic text-muted-foreground mt-2 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-serif-display italic text-sm text-muted-foreground">
                        {formatJournalDate(post.publishedAt)} · {post.read}
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
              ))}
          {!substackLoading && !livePosts.length ? (
            <div className="paper-card p-8 text-center">
              <p className="font-serif-display italic text-muted-foreground">
                {substackError ?? "No journal posts are available right now."}
              </p>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="paper-card overflow-hidden">
            <div className="border-b border-border p-6">
              <span className="tag-chip">recent journal</span>
              <h2 className="font-hand text-4xl text-foreground mt-3">Fresh from Substack</h2>
              <p className="font-serif-display italic text-sm text-muted-foreground mt-2">
                The newest notes, pulled in live.
              </p>
            </div>
            <div className="divide-y divide-border">
              {substackLoading
                ? Array.from({ length: 4 }, (_, index) => <RecentJournalSkeleton key={index} />)
                : sidebarItems.map((j) => (
                    <article key={j.id} className="p-4">
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group grid grid-cols-[76px_1fr] gap-4"
                      >
                        <span className="relative overflow-hidden rounded-xl bg-muted">
                          {j.imageUrl ? (
                            <img
                              src={j.imageUrl}
                              alt=""
                              loading="lazy"
                              className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <span className="block aspect-square" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="font-serif-display italic text-xs text-muted-foreground">
                            {formatJournalDate(j.publishedAt, false)} · {j.read}
                          </span>
                          <span className="mt-1 line-clamp-2 font-serif-display text-foreground/90 transition-colors group-hover:text-primary">
                            {j.title}
                          </span>
                          <span className="mt-1 line-clamp-2 font-serif-display italic text-xs text-muted-foreground">
                            {j.excerpt}
                          </span>
                        </span>
                      </a>
                    </article>
                  ))}
            </div>
            <div className="border-t border-border p-5">
              <a
                href={substack?.publication?.url ?? "https://substack.com"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-primary font-serif-display italic text-sm hover:gap-3 transition-all"
              >
                open Substack <PencilLine weight="duotone" className="w-3 h-3" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function JournalPostSkeleton() {
  return (
    <article className="paper-card overflow-hidden grid sm:grid-cols-[200px_1fr]">
      <Skeleton className="h-48 sm:h-full min-h-48 rounded-none" />
      <div className="p-6 flex flex-col">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-4/5 mt-4" />
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-2/3 mt-2" />
        <div className="flex items-center justify-between gap-4 mt-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </article>
  );
}

function RecentJournalSkeleton() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-[76px_1fr] gap-4">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </div>
  );
}
