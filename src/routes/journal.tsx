import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowRight, BookOpenText, MagnifyingGlass } from "@phosphor-icons/react";
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

  const livePosts = substack?.items ?? [];
  const sidebarItems = useMemo(() => livePosts.slice(0, 5), [livePosts]);
  const substackLoading = substack === undefined && !substackError;

  if (pathname !== "/journal") {
    return <Outlet />;
  }

  return (
    <main className="pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="container-content section-gap pb-0">
        <div className="text-center">
          <span className="tag-chip sage">The Journal</span>
          <h1 className="mt-4 font-hand text-5xl md:text-6xl lg:text-7xl text-foreground">
            Notes from the cottage
          </h1>
          <p className="mt-4 font-serif-display text-lg text-muted-foreground max-w-xl mx-auto">
            Long letters, short ones, recipes for tea and rituals for difficult Tuesdays. 
            Wander in and stay awhile.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto mt-8 relative">
            <MagnifyingGlass className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search the journal..."
              className="w-full pl-11 pr-5 py-3 rounded-full bg-card border border-border focus:border-primary focus:outline-none font-serif-display text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-wide section-gap">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12">
          {/* Posts List */}
          <div className="space-y-6">
            {substackLoading ? (
              Array.from({ length: 5 }, (_, index) => <JournalPostSkeleton key={index} />)
            ) : livePosts.length ? (
              livePosts.map((post, index) => (
                <JournalPostCard
                  key={post.id}
                  post={post}
                  featured={index === 0}
                  publicationName={substack?.publication?.name}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <BookOpenText weight="duotone" className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-serif-display text-muted-foreground">
                  {substackError ?? "No journal posts are available right now."}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Recent Posts */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-sans-ui text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
                Recent entries
              </h3>
              <ul className="space-y-4">
                {substackLoading
                  ? Array.from({ length: 5 }, (_, index) => <RecentJournalSkeleton key={index} />)
                  : sidebarItems.map((post) => (
                      <li key={post.id}>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group block"
                        >
                          <p className="font-serif-display text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </p>
                          <p className="mt-1 font-sans-ui text-xs text-muted-foreground">
                            {formatJournalDate(post.publishedAt, false)}
                          </p>
                        </a>
                      </li>
                    ))}
              </ul>
            </div>

            {/* Currently Loving */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-sans-ui text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
                Currently loving
              </h3>
              <ul className="space-y-4">
                <CurrentlyLoving 
                  label="Reading" 
                  item="The House in the Cerulean Sea" 
                  by="TJ Klune" 
                />
                <CurrentlyLoving 
                  label="Listening" 
                  item="Hozier — Unreal Unearth" 
                  by="On repeat" 
                />
                <CurrentlyLoving 
                  label="Making" 
                  item="A mossy granny square shawl" 
                  by="Size: enormous" 
                />
                <CurrentlyLoving 
                  label="Drinking" 
                  item="Earl Grey + honey" 
                  by="Always" 
                />
              </ul>
            </div>

            {/* Newsletter CTA */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h3 className="font-hand text-xl text-foreground">
                Subscribe to the journal
              </h3>
              <p className="mt-2 font-serif-display text-sm text-muted-foreground">
                Get new entries delivered to your inbox — no spam, just cozy notes.
              </p>
              <Link to="/about#contact" className="mt-4 btn-primary w-full justify-center text-sm">
                Subscribe
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Components                                  */
/* -------------------------------------------------------------------------- */

function JournalPostCard({
  post,
  featured,
  publicationName,
}: {
  post: SubstackFeed["items"][number];
  featured?: boolean;
  publicationName?: string;
}) {
  if (featured) {
    return (
      <article className="group rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-muted">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <BookOpenText weight="duotone" className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
            <span className="absolute top-4 left-4 cat-stamp">
              <span className="dot" />
              {getJournalTagLabel(post.title, post.tags[0] ?? publicationName ?? "Journal")}
            </span>
          </div>

          <div className="p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-sans-ui text-muted-foreground">
              <span>{formatJournalDate(post.publishedAt)}</span>
              <span className="text-border">·</span>
              <span>{post.read}</span>
            </div>

            <h2 className="mt-3 font-hand text-3xl md:text-4xl text-foreground leading-tight group-hover:text-primary transition-colors">
              {post.title}
            </h2>

            <p className="mt-4 font-serif-display text-muted-foreground leading-relaxed flex-1">
              {post.excerpt}
            </p>

            <a
              href={post.url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 btn-link"
            >
              Read on Substack
              <ArrowRight weight="bold" className="w-4 h-4" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50">
      <div className="grid sm:grid-cols-[180px_1fr] md:grid-cols-[220px_1fr]">
        <div className="relative aspect-video sm:aspect-auto overflow-hidden bg-muted">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <BookOpenText weight="duotone" className="w-10 h-10 text-muted-foreground/20" />
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sans-ui text-[0.625rem] font-semibold uppercase tracking-wider text-primary">
              {getJournalTagLabel(post.title, post.tags[0] ?? publicationName ?? "Journal")}
            </span>
            <span className="text-border">·</span>
            <span className="font-sans-ui text-xs text-muted-foreground">
              {formatJournalDate(post.publishedAt, false)}
            </span>
            <span className="text-border">·</span>
            <span className="font-sans-ui text-xs text-muted-foreground">
              {post.read}
            </span>
          </div>

          <h2 className="mt-2 font-hand text-2xl text-foreground leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="mt-2 font-serif-display text-sm text-muted-foreground line-clamp-2 flex-1">
            {post.excerpt}
          </p>

          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 btn-link text-sm"
          >
            Read more
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

function JournalPostSkeleton() {
  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="grid sm:grid-cols-[180px_1fr] md:grid-cols-[220px_1fr]">
        <Skeleton className="aspect-video sm:aspect-auto sm:min-h-[180px] rounded-none" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
      </div>
    </article>
  );
}

function RecentJournalSkeleton() {
  return (
    <li className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-20" />
    </li>
  );
}

function CurrentlyLoving({ label, item, by }: { label: string; item: string; by: string }) {
  return (
    <li>
      <p className="font-sans-ui text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-serif-display text-foreground">{item}</p>
      <p className="font-serif-display text-sm text-muted-foreground">{by}</p>
    </li>
  );
}
