-- ============================================================================
-- Migration-drift backfill (Worker 1)
-- The 20260926000001 migration (public.faqs, public.contact_submissions) was
-- never applied on some projects. This forward migration recreates those
-- tables idempotently so the app never silently degrades when they are
-- absent. Safe to re-run: every statement is guarded with IF NOT EXISTS /
-- CREATE OR REPLACE / ON CONFLICT DO NOTHING / pg_catalog existence checks.
--
-- Also seeds the 8 stamp denominations idempotently (live DBs that never ran
-- the original seed have 0 stamp_products) with CORRECT prices
-- (Rs. 1000 -> 1000.00), plus a guarded correction for the known-bad legacy
-- seed value (sale_price = 100.00 on denomination 1000).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. public.faqs — shape matches lib/db/faqsStore.ts expectations
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
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_updated_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'faqs_updated_at'
  ) THEN
    CREATE TRIGGER faqs_updated_at
      BEFORE UPDATE ON public.faqs
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

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

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'can_access_website_admin'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'faqs' AND policyname = 'Admins manage faqs'
  ) THEN
    CREATE POLICY "Admins manage faqs" ON public.faqs
      FOR ALL TO authenticated
      USING (public.can_access_website_admin(auth.uid()))
      WITH CHECK (public.can_access_website_admin(auth.uid()));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON public.faqs (display_order ASC);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON public.faqs (is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs (category);
CREATE INDEX IF NOT EXISTS idx_faqs_page ON public.faqs (page);

-- Seed the default FAQs (same content as the original migration).
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
-- 2. public.contact_submissions — website inquiry intake store
-- (No application code reads it today; created for schema completeness so a
-- future intake path does not hit a missing table.)
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
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_updated_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'contact_submissions_updated_at'
  ) THEN
    CREATE TRIGGER contact_submissions_updated_at
      BEFORE UPDATE ON public.contact_submissions
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

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

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'can_access_website_admin'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Admins manage contact inquiries'
  ) THEN
    CREATE POLICY "Admins manage contact inquiries" ON public.contact_submissions
      FOR ALL TO authenticated
      USING (public.can_access_website_admin(auth.uid()))
      WITH CHECK (public.can_access_website_admin(auth.uid()));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions (status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions (created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. Stamp product seed — 8 denominations with CORRECT prices.
-- Idempotent: existing rows (matched on the denomination UNIQUE) are left
-- untouched. The guarded UPDATE below repairs the one known-bad legacy seed
-- value (Rs. 1000 seeded at 100.00) without clobbering intentional repricing.
-- ----------------------------------------------------------------------------
INSERT INTO public.stamp_products (denomination, name, purchase_price, sale_price, current_stock, minimum_stock, active)
VALUES
  (50, 'Stamp Paper Rs. 50', 48.00, 50.00, 150, 50, true),
  (100, 'Stamp Paper Rs. 100', 96.00, 100.00, 200, 50, true),
  (200, 'Stamp Paper Rs. 200', 192.00, 200.00, 80, 30, true),
  (500, 'Stamp Paper Rs. 500', 480.00, 500.00, 60, 25, true),
  (1000, 'Stamp Paper Rs. 1000', 960.00, 1000.00, 40, 20, true),
  (1200, 'Stamp Paper Rs. 1200', 1150.00, 1200.00, 25, 15, true),
  (1500, 'Stamp Paper Rs. 1500', 1440.00, 1500.00, 20, 15, true),
  (2000, 'Stamp Paper Rs. 2000', 1920.00, 2000.00, 15, 10, true)
ON CONFLICT (denomination) DO NOTHING;

UPDATE public.stamp_products
SET sale_price = 1000.00, updated_at = now()
WHERE denomination = 1000 AND sale_price = 100.00;

-- ----------------------------------------------------------------------------
-- 4. Defensive: profiles.status (the H14 suspended-user gate in
-- getUnifiedSession / requireOfficeAccess reads it). If the profiles table
-- predates the status column, add it idempotently.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_status') THEN
    CREATE TYPE public.app_user_status AS ENUM ('active', 'inactive', 'suspended');
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN status public.app_user_status NOT NULL DEFAULT 'active';
  END IF;
END
$$;
