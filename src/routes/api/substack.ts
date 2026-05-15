import { createFileRoute } from "@tanstack/react-router";

const defaultProfileUserId = "480937874";

type SubstackProfilePostsResponse = {
  posts?: Array<{
    id: number;
    title: string;
    slug: string;
    post_date: string;
    canonical_url: string;
    subtitle?: string | null;
    cover_image?: string | null;
    description?: string | null;
    truncated_body_text?: string | null;
    wordcount?: number | null;
    reaction_count?: number;
    comment_count?: number;
    postTags?: Array<{
      name: string;
      slug: string;
    }>;
    publishedBylines?: Array<{
      name: string;
      handle: string;
      photo_url?: string;
      bio?: string;
    }>;
  }>;
  publications?: Array<{
    name: string;
    subdomain: string;
    hero_text?: string;
    author_photo_url?: string;
  }>;
};

export const Route = createFileRoute("/api/substack")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const profileUserId =
          getEnv("SUBSTACK_PROFILE_USER_ID") ??
          url.searchParams.get("profile_user_id") ??
          defaultProfileUserId;

        try {
          const response = await fetch(
            `https://substack.com/api/v1/profile/posts?profile_user_id=${profileUserId}`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );
          const payload = (await response.json()) as SubstackProfilePostsResponse;

          if (!response.ok || !payload.posts) {
            throw new Error(`Substack returned ${response.status}`);
          }

          return json(
            {
              configured: true,
              source: "substack",
              profileUserId,
              publication: payload.publications?.[0]
                ? {
                    name: payload.publications[0].name,
                    subdomain: payload.publications[0].subdomain,
                    heroText: payload.publications[0].hero_text,
                    authorPhotoUrl: payload.publications[0].author_photo_url,
                  }
                : null,
              items: payload.posts.map((post) => ({
                id: String(post.id),
                title: post.title,
                slug: post.slug,
                url: post.canonical_url,
                excerpt: post.description ?? post.truncated_body_text ?? post.subtitle ?? "",
                imageUrl: post.cover_image,
                publishedAt: post.post_date,
                read: estimateReadTime(post.wordcount),
                tags: post.postTags?.map((tag) => tag.name) ?? [],
                reactionCount: post.reaction_count ?? 0,
                commentCount: post.comment_count ?? 0,
                author: post.publishedBylines?.[0]
                  ? {
                      name: post.publishedBylines[0].name,
                      handle: post.publishedBylines[0].handle,
                      photoUrl: post.publishedBylines[0].photo_url,
                      bio: post.publishedBylines[0].bio,
                    }
                  : null,
              })),
            },
            200,
            {
              "Cache-Control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=1800",
            },
          );
        } catch (error) {
          console.error(error);
          return json(
            {
              configured: false,
              source: "substack",
              items: [],
              error: "Substack posts are unavailable right now.",
            },
            502,
          );
        }
      },
    },
  },
});

function estimateReadTime(wordcount?: number | null) {
  if (!wordcount) return "read on Substack";
  return `${Math.max(1, Math.ceil(wordcount / 220))} min`;
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function getEnv(name: string) {
  return typeof process !== "undefined" ? process.env[name] : undefined;
}
