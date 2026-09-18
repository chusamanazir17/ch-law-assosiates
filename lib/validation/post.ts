import type { Post } from "@/types/cms";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_STATUSES = new Set<Post["status"]>(["draft", "published"]);

export interface ValidatedPostInput {
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string;
  author_name: string;
  status: Post["status"];
  views_count?: number;
  published_at?: string | null;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function validatePostInput(input: unknown): ValidatedPostInput {
  if (!input || typeof input !== "object") {
    throw new Error("A valid post payload is required.");
  }

  const value = input as Record<string, unknown>;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  if (title.length < 3 || title.length > 180) {
    throw new Error("Post title must be between 3 and 180 characters.");
  }

  const requestedSlug = typeof value.slug === "string" ? value.slug : "";
  const slug = slugify(requestedSlug || title);
  if (!slug || !SLUG_RE.test(slug)) {
    throw new Error("Post slug is invalid.");
  }

  const content = typeof value.content === "string" ? value.content.trim() : "";
  if (!content) {
    throw new Error("Post content is required.");
  }

  const status = value.status === "published" ? "published" : "draft";
  if (!ALLOWED_STATUSES.has(status)) {
    throw new Error("Post status is invalid.");
  }

  const excerpt = typeof value.excerpt === "string" ? value.excerpt.trim().slice(0, 500) : null;
  const category =
    typeof value.category === "string" && value.category.trim()
      ? value.category.trim().slice(0, 100)
      : "Guides";
  const authorName =
    typeof value.author_name === "string" && value.author_name.trim()
      ? value.author_name.trim().slice(0, 100)
      : "Admin";

  const coverImage = typeof value.cover_image_url === "string" ? value.cover_image_url.trim() : "";
  let cover_image_url: string | null = null;
  if (coverImage) {
    try {
      const parsed = new URL(coverImage);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error();
      }
      cover_image_url = parsed.toString();
    } catch {
      throw new Error("Cover image URL must be a valid HTTP or HTTPS URL.");
    }
  }

  const id = typeof value.id === "string" && value.id.trim() ? value.id.trim() : undefined;
  const viewsCount =
    typeof value.views_count === "number" && Number.isFinite(value.views_count)
      ? Math.max(0, Math.floor(value.views_count))
      : undefined;

  return {
    ...(id ? { id } : {}),
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    category,
    author_name: authorName,
    status,
    ...(viewsCount !== undefined ? { views_count: viewsCount } : {}),
    published_at: typeof value.published_at === "string" ? value.published_at : null,
  };
}
