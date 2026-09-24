-- ============================================================================
-- Migration: CMS content tables (services catalog + page content)
-- Date: 2026-09-25
--
-- Moves the website CMS off the local JSON-file stores (data/*.json) into
-- Supabase so every piece of public content is persisted server-side.
--
--   cms_services  : the 9-item services catalog shown on / and /services/*
--   cms_pages     : per-route hero/meta/CTA content for public pages
--   site_settings : (already exists from 20260923000001) JSONB key-value store;
--                   the application stores the whole SiteSettings document
--                   under key 'site' and the HomeSectionsData document under
--                   key 'home_sections'.
--
-- Access model:
--   - Anonymous: SELECT active services / published pages only.
--   - Website admins (supabase auth + can_access_website_admin): full CRUD.
--   - Server API routes use the service-role key, which bypasses RLS, so the
--     env-credential admin session can also manage content.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Services catalog
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_services (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_urdu TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General Legal Services',
  description TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  hero_image TEXT NOT NULL DEFAULT '',
  turnaround_time TEXT NOT NULL DEFAULT '',
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  government_fee_info TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER cms_services_updated_at
  BEFORE UPDATE ON public.cms_services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.cms_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view active services" ON public.cms_services
  FOR SELECT TO public
  USING (active = true);

CREATE POLICY "Admins manage services" ON public.cms_services
  FOR ALL TO authenticated
  USING (public.can_access_website_admin(auth.uid()))
  WITH CHECK (public.can_access_website_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 2. Page content
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id TEXT PRIMARY KEY,
  route TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  hero_badge TEXT NOT NULL DEFAULT '',
  hero_headline TEXT NOT NULL DEFAULT '',
  hero_subtitle TEXT NOT NULL DEFAULT '',
  hero_image TEXT NOT NULL DEFAULT '',
  primary_cta_text TEXT NOT NULL DEFAULT '',
  primary_cta_href TEXT NOT NULL DEFAULT '',
  secondary_cta_text TEXT NOT NULL DEFAULT '',
  secondary_cta_href TEXT NOT NULL DEFAULT '',
  lead_content TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view published pages" ON public.cms_pages
  FOR SELECT TO public
  USING (status = 'published');

CREATE POLICY "Admins manage pages" ON public.cms_pages
  FOR ALL TO authenticated
  USING (public.can_access_website_admin(auth.uid()))
  WITH CHECK (public.can_access_website_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- 3. Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS cms_services_sort_order_idx ON public.cms_services (sort_order);
CREATE INDEX IF NOT EXISTS cms_services_active_idx ON public.cms_services (active) WHERE active = true;
CREATE INDEX IF NOT EXISTS cms_pages_status_idx ON public.cms_pages (status) WHERE status = 'published';

-- ----------------------------------------------------------------------------
-- 4. Grant execution (RLS policies above govern row access; grants make the
--    tables reachable by the anon/authenticated roles at all).
-- ----------------------------------------------------------------------------
GRANT SELECT ON public.cms_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_services TO authenticated;
GRANT SELECT ON public.cms_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_pages TO authenticated;
