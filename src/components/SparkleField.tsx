export function SparkleField() {
  const pinpoints = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {pinpoints.map((_, i) => {
        const top = `${(i * 37) % 95}%`;
        const left = `${(i * 53) % 95}%`;
        const delay = `${(i % 5) * 0.6}s`;
        const size = 4 + (i % 3) * 2;
        return (
          <span
            key={i}
            className="absolute animate-twinkle rounded-full bg-accent/45 shadow-[0_0_8px_hsl(var(--accent)/0.35)]"
            style={{ top, left, animationDelay: delay, width: size, height: size }}
          />
        );
      })}
    </div>
  );
}

export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="font-serif-display italic text-sm text-muted-foreground tracking-wide">
        · {eyebrow} ·
      </p>
      <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-2">{title}</h2>
    </div>
  );
}
