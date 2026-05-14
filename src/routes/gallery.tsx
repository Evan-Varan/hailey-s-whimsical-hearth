import { createFileRoute } from "@tanstack/react-router";
import { galleryItems } from "@/lib/blog-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Hailey Adkins" },
      { name: "description", content: "A little visual scrapbook — cottagecore moments, crochet, cats, horses, and moonlit skies." },
      { property: "og:title", content: "Gallery — Hailey Adkins" },
      { property: "og:description", content: "From the camera roll: a cozy visual scrapbook." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="tag-chip gold">from the camera roll</span>
        <h1 className="font-hand text-6xl md:text-7xl text-foreground mt-4">A little visual scrapbook</h1>
        <p className="font-serif-display italic text-lg text-muted-foreground mt-4">
          Soft afternoons, finished projects, the cat being unhelpful — saved for later.
        </p>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 mt-16 [column-fill:_balance]">
        {galleryItems.map((g, i) => (
          <figure key={i} className="mb-4 break-inside-avoid paper-card overflow-hidden">
            <img
              src={g.src}
              alt={g.alt}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
            />
            <figcaption className="px-4 py-3 font-serif-display italic text-sm text-muted-foreground">
              ✦ {g.alt}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
