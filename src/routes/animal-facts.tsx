import { createFileRoute } from "@tanstack/react-router";
import { ArrowClockwise, Binoculars, PawPrint, Sparkle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

type DailyAnimalFact = {
  date: string;
  source: string;
  name: string;
  scientificName?: string;
  imageUrl?: string;
  fact: string;
  details: Array<{
    label: string;
    value: string;
  }>;
};

type DailyFunFact = {
  date: string;
  source: string;
  fact: string;
  imageUrl?: string;
  imageAlt?: string;
  sourceUrl?: string;
};

export const Route = createFileRoute("/animal-facts")({
  head: () => ({
    meta: [
      { title: "Facts — Hailey Adkins" },
      {
        name: "description",
        content: "A daily animal fact from Hailey's cozy corner of the internet.",
      },
      { property: "og:title", content: "Facts — Hailey Adkins" },
      {
        property: "og:description",
        content: "A soft little animal fact that changes every day.",
      },
    ],
  }),
  component: AnimalFactsPage,
});

function AnimalFactsPage() {
  const [dailyFact, setDailyFact] = useState<DailyAnimalFact>();
  const [funFact, setFunFact] = useState<DailyFunFact>();
  const [loading, setLoading] = useState(true);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [loadingFunFact, setLoadingFunFact] = useState(true);
  const [error, setError] = useState<string>();
  const [funFactError, setFunFactError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    void loadAnimalFact(controller.signal);
    void loadFunFact(controller.signal);

    return () => controller.abort();
  }, []);

  async function loadAnimalFact(signal?: AbortSignal, random = false) {
    try {
      if (random) setLoadingRandom(true);
      else setLoading(true);
      setError(undefined);

      const response = await fetch(`/api/animal-fact${random ? "?random=1" : ""}`, {
        cache: "no-store",
        signal,
      });
      const payload = (await response.json()) as DailyAnimalFact;

      if (!response.ok) {
        throw new Error("Animal facts are unavailable right now.");
      }

      setDailyFact(payload);
    } catch (caughtError) {
      if (signal?.aborted) return;
      console.error(caughtError);
      setError("Animal facts are unavailable right now.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setLoadingRandom(false);
      }
    }
  }

  async function loadFunFact(signal?: AbortSignal, random = false) {
    try {
      setLoadingFunFact(true);
      setFunFactError(undefined);

      const response = await fetch(`/api/fun-fact${random ? "?random=1" : ""}`, {
        cache: "no-store",
        signal,
      });
      const payload = (await response.json()) as DailyFunFact;

      if (!response.ok) {
        throw new Error("Fun facts are unavailable right now.");
      }

      setFunFact(payload);
    } catch (caughtError) {
      if (signal?.aborted) return;
      console.error(caughtError);
      setFunFactError("Fun facts are unavailable right now.");
    } finally {
      if (!signal?.aborted) {
        setLoadingFunFact(false);
      }
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 pt-28 pb-14 md:pt-32">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="tag-chip gold">daily field note</span>
          <h1 className="font-hand text-6xl md:text-7xl text-foreground mt-4">Facts</h1>
          <p className="font-serif-display italic text-lg text-muted-foreground mt-4">
            A daily animal note with a little room for wandering.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary justify-center md:mb-2"
          onClick={() => void loadAnimalFact(undefined, true)}
          disabled={loadingRandom}
        >
          <ArrowClockwise
            weight="bold"
            className={`h-4 w-4 ${loadingRandom ? "animate-spin" : ""}`}
          />
          {loadingRandom ? "Looking..." : "New fact"}
        </button>
      </div>

      <section className="mt-12">
        <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-soft)]">
          {loading ? (
            <AnimalFactSkeleton />
          ) : dailyFact ? (
            <div className="grid lg:grid-cols-[minmax(320px,0.9fr)_1fr]">
              <div className="relative min-h-[420px] bg-muted">
                {dailyFact.imageUrl ? (
                  <img
                    src={dailyFact.imageUrl}
                    alt={dailyFact.name}
                    className="h-full min-h-[420px] w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full min-h-[420px] place-items-center bg-secondary/30">
                    <PawPrint weight="duotone" className="h-20 w-20 text-primary/60" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/55 to-transparent p-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 font-serif-display italic text-sm text-foreground backdrop-blur">
                    <Binoculars weight="duotone" className="h-4 w-4 text-primary" />
                    {formatDisplayDate(dailyFact.date)}
                  </span>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <span className="tag-chip rose">fact of the day</span>
                <h2 className="font-hand text-6xl md:text-7xl text-foreground mt-4 leading-none">
                  {dailyFact.name}
                </h2>
                {dailyFact.scientificName ? (
                  <p className="font-serif-display italic text-muted-foreground mt-3">
                    {dailyFact.scientificName}
                  </p>
                ) : null}

                <p className="font-serif-display italic text-2xl text-foreground/85 leading-relaxed mt-9">
                  {dailyFact.fact}
                </p>

                {dailyFact.details.length ? (
                  <div className="grid sm:grid-cols-3 gap-3 mt-10">
                    {dailyFact.details.slice(0, 3).map((detail) => (
                      <FactDetail key={detail.label} label={detail.label} value={detail.value} />
                    ))}
                  </div>
                ) : null}

                <div className="mt-10 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-serif-display italic text-xs text-muted-foreground">
                    Source: {dailyFact.source}
                  </p>
                  <button
                    type="button"
                    className="btn-ghost justify-center"
                    onClick={() => void loadAnimalFact(undefined, true)}
                    disabled={loadingRandom}
                  >
                    <ArrowClockwise
                      weight="bold"
                      className={`h-4 w-4 ${loadingRandom ? "animate-spin" : ""}`}
                    />
                    {loadingRandom ? "Looking..." : "Another"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="font-serif-display italic text-muted-foreground">
                {error ?? "No animal fact is available right now."}
              </p>
            </div>
          )}
        </article>
      </section>

      <section className="mt-8">
        <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[var(--shadow-soft)]">
          {loadingFunFact && !funFact ? (
            <FunFactSkeleton />
          ) : funFact ? (
            <div className="grid lg:grid-cols-[minmax(320px,0.9fr)_1fr]">
              <div className="relative min-h-[420px] bg-muted">
                {funFact.imageUrl ? (
                  <img
                    src={funFact.imageUrl}
                    alt={funFact.imageAlt ?? ""}
                    className="h-full min-h-[420px] w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full min-h-[420px] place-items-center bg-secondary/30">
                    <Sparkle weight="duotone" className="h-20 w-20 text-accent/70" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/55 to-transparent p-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 font-serif-display italic text-sm text-foreground backdrop-blur">
                    <Sparkle weight="duotone" className="h-4 w-4 text-accent" />
                    {formatDisplayDate(funFact.date)}
                  </span>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <span className="tag-chip gold">general trivia</span>
                <h2 className="font-hand text-6xl md:text-7xl text-foreground mt-4 leading-none">
                  Fun fact
                </h2>

                <p className="font-serif-display italic text-2xl text-foreground/85 leading-relaxed mt-9">
                  {funFact.fact}
                </p>

                <div className="mt-10 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-serif-display italic text-xs text-muted-foreground">
                    Source:{" "}
                    {funFact.sourceUrl ? (
                      <a
                        href={funFact.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary"
                      >
                        {funFact.source}
                      </a>
                    ) : (
                      funFact.source
                    )}
                  </p>
                  <button
                    type="button"
                    className="btn-ghost justify-center"
                    onClick={() => void loadFunFact(undefined, true)}
                    disabled={loadingFunFact}
                  >
                    <ArrowClockwise
                      weight="bold"
                      className={`h-4 w-4 ${loadingFunFact ? "animate-spin" : ""}`}
                    />
                    {loadingFunFact ? "Looking..." : "Another"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="font-serif-display italic text-muted-foreground">
                {funFactError ?? "No fun fact is available right now."}
              </p>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

function FactDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4">
      <p className="font-sans-ui text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p className="font-serif-display italic text-foreground mt-1">{value}</p>
    </div>
  );
}

function AnimalFactSkeleton() {
  return (
    <div className="grid lg:grid-cols-[minmax(320px,0.9fr)_1fr]">
      <Skeleton className="h-[420px] lg:h-full min-h-[420px] rounded-none" />
      <div className="p-8 md:p-12">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-16 w-3/4 mt-5" />
        <Skeleton className="h-5 w-36 mt-3" />
        <Skeleton className="h-8 w-full mt-10" />
        <Skeleton className="h-8 w-4/5 mt-3" />
        <div className="grid sm:grid-cols-3 gap-3 mt-10">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function FunFactSkeleton() {
  return (
    <div className="grid lg:grid-cols-[minmax(320px,0.9fr)_1fr]">
      <Skeleton className="h-[420px] lg:h-full min-h-[420px] rounded-none" />
      <div className="p-8 md:p-12">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-16 w-48 mt-5" />
        <Skeleton className="h-8 w-full mt-10" />
        <Skeleton className="h-8 w-5/6 mt-3" />
        <Skeleton className="h-8 w-2/3 mt-3" />
        <div className="mt-10 border-t border-border pt-5">
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </div>
  );
}

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}
