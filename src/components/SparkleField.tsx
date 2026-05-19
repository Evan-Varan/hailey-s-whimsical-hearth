import { Sparkle } from "@phosphor-icons/react";

export function SparkleField() {
  const pinpoints = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Faint sketch elements */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {pinpoints.map((_, i) => {
        const top = `${(i * 37) % 95}%`;
        const left = `${(i * 53) % 95}%`;
        const delay = `${(i % 5) * 1.2}s`;
        const size = 3 + (i % 4) * 2;
        const opacity = 0.2 + (i % 3) * 0.15;
        
        return (
          <div
            key={i}
            className="absolute animate-twinkle text-primary/40"
            style={{ top, left, animationDelay: delay }}
          >
            {i % 3 === 0 ? (
              <Sparkle weight="fill" size={size * 2} style={{ opacity }} />
            ) : (
              <span 
                className="block rounded-full bg-accent/40 blur-[1px]" 
                style={{ width: size, height: size, opacity }} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center space-y-2">
      <p className="font-marginalia text-2xl text-primary/70 tracking-wide">
        {eyebrow}
      </p>
      <h2 className="font-display italic text-5xl md:text-7xl text-foreground">
        {title}
      </h2>
      <div className="flex justify-center items-center gap-4 text-border/60">
        <div className="h-px w-12 bg-current" />
        <Sparkle weight="fill" className="w-2 h-2" />
        <div className="h-px w-12 bg-current" />
      </div>
    </div>
  );
}
