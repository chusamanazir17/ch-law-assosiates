-- ==============================================================================
-- Ch Composing Estamp & Tax Advisor: CMS, Posts, Media & Announcements
-- Migration: 20240916000002_cms_and_posts.sql
-- ==============================================================================

-- 1. Posts / Legal Updates & Articles Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Taxation & FBR',
  author_name TEXT NOT NULL DEFAULT 'Usama Nazir Ch',
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  views_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status, published_at);

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Media Assets Table
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  size_bytes BIGINT,
  mime_type TEXT,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_created ON public.media_assets(created_at DESC);

-- 3. Site Announcements / Banners Table
CREATE TABLE IF NOT EXISTS public.site_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('info', 'warning', 'danger', 'dark')) DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  link_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_site_announcements_updated_at
  BEFORE UPDATE ON public.site_announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Consultation Inquiries Table (Client Leads from Contact Forms)
CREATE TABLE IF NOT EXISTS public.consultation_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_needed TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'completed', 'archived')) DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_inquiries_status ON public.consultation_inquiries(status, created_at DESC);

-- 5. Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_inquiries ENABLE ROW LEVEL SECURITY;

-- Posts: Public can read published posts; Admins have full access
CREATE POLICY "Public can view published posts"
  ON public.posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins full access on posts"
  ON public.posts FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Media Assets: Public can view assets; Admins can manage
CREATE POLICY "Public can view media_assets"
  ON public.media_assets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins full access on media_assets"
  ON public.media_assets FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Site Announcements: Public can view active announcements; Admins have full access
CREATE POLICY "Public can view active announcements"
  ON public.site_announcements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins full access on site_announcements"
  ON public.site_announcements FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Consultation Inquiries: Anyone can insert an inquiry; Admins have full access
CREATE POLICY "Public can submit consultation inquiries"
  ON public.consultation_inquiries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins full access on consultation_inquiries"
  ON public.consultation_inquiries FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. Initial Seed Data for CMS
INSERT INTO public.site_announcements (title, message, tone, is_active, link_url, link_text)
VALUES 
  ('FBR Income Tax Filing Alert', 'Annual Income Tax Returns filing is underway. Visit Chamber 121 District Court Sahiwal to avoid late-filing surcharges.', 'warning', true, '#contact', 'Visit Office')
ON CONFLICT DO NOTHING;

INSERT INTO public.posts (title, slug, excerpt, content, cover_image_url, category, author_name, status, published_at)
VALUES 
  (
    'Complete Guide to E-Stamping & Property Registration in Punjab (2024)',
    'complete-guide-e-stamping-property-registration-punjab',
    'Understanding the 32-A Challan generation, e-stamp verification, and required legal documentation at District Court Sahiwal.',
    '# Understanding E-Stamping in Punjab

The Government of Punjab introduced the e-Stamping system to replace traditional paper stamp papers with computer-generated, tamper-proof e-Stamp certificates.

## Key Steps in Generating an E-Stamp Paper:
1. **Assessment of Property Value:** Calculate the DC (Deputy Commissioner) rate or fair market value according to official gazette schedules.
2. **Challan 32-A Form Submission:** Accurate entry of seller, purchaser, and property boundaries (Khasra, Khewat, Khatoni numbers).
3. **Payment of Stamp Duty:** Payment through authorized National Bank of Pakistan (NBP) branches or online banking.
4. **Verification:** Barcode verification via the Punjab E-Stamping portal to ensure authenticity.

## In-Person Assistance at District Court Sahiwal
At **Ch Composing Estamp and Tax Advisor** (Sharki Gate Chamber No 121, District Court Sahiwal), our certified team handles complete e-stamp composing, challan generation, and deed drafting on-site.',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=75',
    'E-Stamping & Property',
    'Usama Nazir Ch',
    'published',
    now()
  ),
  (
    'FBR Active Taxpayer List (ATL): Benefits & Filing Requirements',
    'fbr-active-taxpayer-list-atl-benefits-requirements',
    'Why maintaining Active Taxpayer status on FBR Iris saves you 50% or more on withholding taxes for banking and property transactions.',
    '# Why You Must Be on the FBR Active Taxpayer List (ATL)

In Pakistan, the difference in tax rates between a Filer (Active Taxpayer) and a Non-Filer is substantial. Non-filers face double withholding tax on vehicle registration, bank cash withdrawals, dividend earnings, and immovable property transfers.

## Major Benefits of ATL Status:
- **Reduced Withholding Tax:** Save 50% or more on withholding tax on property purchases under Section 236K.
- **Lower Banking Transaction Fees:** Reduced withholding deductions on banking transfers and prize bonds.
- **Smooth Business Operations:** Necessary for government tenders, corporate contracts, and SECP compliance.

Visit our chamber at District Court Sahiwal for prompt NTN registration, income tax filing, and wealth statement preparation.',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=75',
    'Taxation & FBR',
    'Haji Nazir Ahmad',
    'published',
    now()
  )
ON CONFLICT (slug) DO NOTHING;
