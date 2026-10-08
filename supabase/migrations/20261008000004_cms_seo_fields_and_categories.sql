-- Forward migration for audit findings CMS-001 (SEO fields missing on posts
-- and services) and the category-management requirement.
--
-- 1) Adds SEO columns to `public.posts` and `public.cms_services`:
--    seo_title, meta_description, canonical_url, og_image (all nullable).
-- 2) Adds canonical_url / og_image to `public.cms_pages` (it already has
--    meta_title / meta_description).
-- 3) Creates `public.categories` with its own SEO columns, so article
--    categories become a real managed content type (add/edit/delete +
--    activate/deactivate) instead of a free-text field on posts.
--
-- This migration only ADDS objects; it never edits earlier migrations.

-- ---------------------------------------------------------------------------
-- 1) SEO columns on posts, cms_services, cms_pages
-- ---------------------------------------------------------------------------
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT;

ALTER TABLE public.cms_services
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT;

ALTER TABLE public.cms_pages
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT;

-- ---------------------------------------------------------------------------
-- 2) categories table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 100,
  seo_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view active categories" ON public.categories;
CREATE POLICY "Public view active categories" ON public.categories
  FOR SELECT TO public
  USING (active = true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.can_access_website_admin(auth.uid()))
  WITH CHECK (public.can_access_website_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON public.categories (sort_order);
CREATE INDEX IF NOT EXISTS categories_active_idx ON public.categories (active) WHERE active = true;

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;

-- ---------------------------------------------------------------------------
-- 3) Seed the distinct post categories already in use so the new manager
--    starts from the site's real data (inserted only when the slug is new).
-- ---------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description, active, sort_order)
SELECT DISTINCT ON (lower(trim(category)))
  trim(category) AS name,
  lower(regexp_replace(trim(category), '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
  '' AS description,
  true AS active,
  100 AS sort_order
FROM public.posts
WHERE category IS NOT NULL AND trim(category) <> ''
  AND lower(regexp_replace(trim(category), '[^a-zA-Z0-9]+', '-', 'g')) <> ''
ORDER BY lower(trim(category))
ON CONFLICT (slug) DO NOTHING;
