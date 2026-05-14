export function SparkleField() {
  const stars = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {stars.map((_, i) => {
        const top = `${(i * 37) % 95}%`;
        const left = `${(i * 53) % 95}%`;
        const delay = `${(i % 5) * 0.6}s`;
        const size = 6 + (i % 4) * 3;
        return (
          <svg
            key={i}
            className="absolute animate-twinkle text-accent/60"
            style={{ top, left, animationDelay: delay, width: size, height: size }}
            viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M12 0l1.8 8.2L22 10l-8.2 1.8L12 20l-1.8-8.2L2 10l8.2-1.8L12 0z" />
          </svg>
        );
      })}
    </div>
  );
}

export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="font-serif-display italic text-sm text-muted-foreground tracking-wide">
        ✦ {eyebrow} ✦
      </p>
      <h2 className="font-hand text-5xl md:text-6xl text-foreground mt-2">{title}</h2>
    </div>
  );
}
