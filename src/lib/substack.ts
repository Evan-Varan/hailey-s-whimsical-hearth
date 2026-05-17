export type SubstackFeed = {
  configured: boolean;
  publication: {
    name: string;
    subdomain: string;
    heroText?: string;
    authorPhotoUrl?: string;
  } | null;
  items: SubstackPost[];
  error?: string;
};

export type SubstackPost = {
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
};

export function formatJournalDate(value: string, includeYear = true) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return includeYear ? value : "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date);
}

export function getJournalTagLabel(title: string, fallback = "Substack") {
  if (title.toLowerCase().includes("creation")) return "family";

  return fallback;
}
