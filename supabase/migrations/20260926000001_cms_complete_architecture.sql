-- ============================================================================
-- Migration: CMS Complete Architecture (FAQs, Inquiries, Team, Reviews)
-- Date: 2026-09-26
--
-- Completes the full Supabase backend integration for CH Law Associates:
--   1. public.faqs               : Manageable FAQ knowledgebase with page/category targeting
--   2. public.contact_submissions: Website inquiry & consultation intake store
--   3. public.team_members       : Verification and hardening of team / lawyer records
--   4. public.testimonials       : Verification and hardening of client review records
--   5. Storage Policies          : Media assets public read + admin management
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FAQ Knowledgebase
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  page TEXT NOT NULL DEFAULT 'home',
  display_order INTEGER NOT NULL DEFAULT 100,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'faqs_updated_at'
  ) THEN
    CREATE TRIGGER faqs_updated_at
      BEFORE UPDATE ON public.faqs
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'faqs' AND policyname = 'Public view published faqs'
  ) THEN
    CREATE POLICY "Public view published faqs" ON public.faqs
      FOR SELECT TO public
      USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'faqs' AND policyname = 'Admins manage faqs'
  ) THEN
    CREATE POLICY "Admins manage faqs" ON public.faqs
      FOR ALL TO authenticated
      USING (public.can_access_website_admin(auth.uid()))
      WITH CHECK (public.can_access_website_admin(auth.uid()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON public.faqs (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON public.faqs (is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs (category);
CREATE INDEX IF NOT EXISTS idx_faqs_page ON public.faqs (page);

-- Seed Initial FAQs if none exist
INSERT INTO public.faqs (id, question, answer, category, page, display_order, is_published)
VALUES
  (
    'faq-1',
    'What documents are required to generate an e-Stamp Challan 32-A?',
    'You need clear CNIC copies of all buyer/seller parties, property description or plot details, and Challan Form 32-A payment voucher. Our Chamber generates and verifies digital e-stamps within 15–30 minutes.',
    'E-Stamping',
    'home',
    1,
    true
  ),
  (
    'faq-2',
    'How long does property registry verification take at Chamber 121?',
    'Standard Fard Malkiat verification and Baya-Nama drafting take same-day processing. Final Sub-Registrar execution and endorsement are typically scheduled within 1 to 3 business days.',
    'Property & Land',
    'home',
    2,
    true
  ),
  (
    'faq-3',
    'Can you help with FBR Active Taxpayer List (ATL) restoration?',
    'Yes, we file current and past annual income tax returns, reconcile wealth statements, and pay necessary ATL surcharges to restore Active status on the FBR portal within 24 to 48 hours.',
    'Tax Advisory',
    'home',
    3,
    true
  ),
  (
    'faq-4',
    'What is required for private limited company registration with SECP?',
    'Three proposed company names, CNIC copies and contact numbers of at least two directors, company business address, and registered capital details. Name reservation and incorporation take 3 to 5 business days.',
    'Corporate & SECP',
    'home',
    4,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Contact & Consultation Submissions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT,
  service_needed TEXT NOT NULL DEFAULT 'General Legal Consultation',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'replied', 'closed', 'archived')),
  admin_notes TEXT,
  source_page TEXT DEFAULT '/',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'contact_submissions_updated_at'
  ) THEN
    CREATE TRIGGER contact_submissions_updated_at
      BEFORE UPDATE ON public.contact_submissions
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Public insert contact inquiries'
  ) THEN
    CREATE POLICY "Public insert contact inquiries" ON public.contact_submissions
      FOR INSERT TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Admins manage contact inquiries'
  ) THEN
    CREATE POLICY "Admins manage contact inquiries" ON public.contact_submissions
      FOR ALL TO authenticated
      USING (public.can_access_website_admin(auth.uid()))
      WITH CHECK (public.can_access_website_admin(auth.uid()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions (status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions (created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. Hardening Team Members & Testimonials RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Public view team members'
  ) THEN
    CREATE POLICY "Public view team members" ON public.team_members
      FOR SELECT TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Admins manage team members'
  ) THEN
    CREATE POLICY "Admins manage team members" ON public.team_members
      FOR ALL TO authenticated
      USING (public.can_access_website_admin(auth.uid()))
      WITH CHECK (public.can_access_website_admin(auth.uid()));
  END IF;
END $$;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Public view testimonials'
  ) THEN
    CREATE POLICY "Public view testimonials" ON public.testimonials
      FOR SELECT TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'Admins manage testimonials'
  ) THEN
    CREATE POLICY "Admins manage testimonials" ON public.testimonials
      FOR ALL TO authenticated
      USING (public.can_access_website_admin(auth.uid()))
      WITH CHECK (public.can_access_website_admin(auth.uid()));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. Storage Bucket Configuration
-- ----------------------------------------------------------------------------
-- Ensure media storage bucket exists and is public for image delivery
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Storage RLS: Public can view assets in media bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public read media objects'
  ) THEN
    CREATE POLICY "Public read media objects" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admins upload media objects'
  ) THEN
    CREATE POLICY "Admins upload media objects" ON storage.objects
      FOR ALL TO authenticated
      USING (bucket_id = 'media' AND public.can_access_website_admin(auth.uid()))
      WITH CHECK (bucket_id = 'media' AND public.can_access_website_admin(auth.uid()));
  END IF;
END $$;
