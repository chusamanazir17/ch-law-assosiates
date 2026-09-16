-- ==============================================================================
-- Ch Composing Estamp & Tax Advisor: Automated Tax Reminder & Admin System
-- Migration: 20240916000001_tax_reminder_system.sql
-- ==============================================================================

-- 1. Required Extensions
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Generic updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Tax Categories Table
CREATE TABLE IF NOT EXISTS public.tax_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_tax_categories_updated_at
  BEFORE UPDATE ON public.tax_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'unsubscribed', 'suppressed')) DEFAULT 'pending',
  consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_text_version TEXT NOT NULL DEFAULT 'v1.0',
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);

CREATE TRIGGER set_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Subscriber Categories (Join Table for Multiple Categories per Subscriber)
CREATE TABLE IF NOT EXISTS public.subscriber_categories (
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.tax_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (subscriber_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriber_categories_cat ON public.subscriber_categories(category_id);

-- 6. Subscription Tokens (Hashed Token Storage for Double Opt-in and Unsubscribe)
CREATE TABLE IF NOT EXISTS public.subscription_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('confirmation', 'unsubscribe', 'category_update')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_tokens_hash ON public.subscription_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_subscription_tokens_sub_purpose ON public.subscription_tokens(subscriber_id, purpose);

-- 7. Tax Deadlines Table
CREATE TABLE IF NOT EXISTS public.tax_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.tax_categories(id) ON DELETE RESTRICT,
  tax_year_or_period TEXT NOT NULL,
  title TEXT NOT NULL,
  filing_deadline DATE NOT NULL,
  official_source_url TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  revision INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_deadlines_active ON public.tax_deadlines(category_id, is_active, filing_deadline);

CREATE TRIGGER set_tax_deadlines_updated_at
  BEFORE UPDATE ON public.tax_deadlines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Reminder Deliveries Table
CREATE TABLE IF NOT EXISTS public.reminder_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  deadline_id UUID NOT NULL REFERENCES public.tax_deadlines(id) ON DELETE CASCADE,
  deadline_revision INT NOT NULL,
  reminder_interval TEXT NOT NULL CHECK (reminder_interval IN ('30_days', '7_days')),
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'sent', 'failed', 'skipped', 'cancelled')) DEFAULT 'queued',
  provider_message_id TEXT,
  idempotency_key TEXT UNIQUE,
  attempt_count INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_reminder_delivery UNIQUE (subscriber_id, deadline_id, deadline_revision, reminder_interval)
);

CREATE INDEX IF NOT EXISTS idx_reminder_deliveries_status ON public.reminder_deliveries(status, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reminder_deliveries_sub ON public.reminder_deliveries(subscriber_id);

CREATE TRIGGER set_reminder_deliveries_updated_at
  BEFORE UPDATE ON public.reminder_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Admin Memberships Table (Protected Admin Authorization)
CREATE TABLE IF NOT EXISTS public.admin_memberships (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Rate Limits Table (Server-side Rate Limiting for Public Endpoints)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

-- 11. Helper Functions
-- Rate limit checker
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_max_requests INT,
  p_window_seconds INT
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
  v_reset TIMESTAMPTZ;
  v_now TIMESTAMPTZ := now();
BEGIN
  SELECT count, reset_at INTO v_count, v_reset FROM public.rate_limits WHERE key = p_key FOR UPDATE;

  IF NOT FOUND OR v_reset <= v_now THEN
    INSERT INTO public.rate_limits (key, count, reset_at)
    VALUES (p_key, 1, v_now + (p_window_seconds || ' seconds')::INTERVAL)
    ON CONFLICT (key) DO UPDATE
      SET count = 1, reset_at = v_now + (p_window_seconds || ' seconds')::INTERVAL;
    RETURN TRUE;
  ELSIF v_count < p_max_requests THEN
    UPDATE public.rate_limits SET count = count + 1 WHERE key = p_key;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin authorization verification function
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.admin_memberships WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger: Invalidate deadline verification & increment revision on deadline date modification
CREATE OR REPLACE FUNCTION public.handle_deadline_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.filing_deadline <> OLD.filing_deadline) THEN
    -- Increment revision
    NEW.revision := OLD.revision + 1;
    -- Invalidate verification until re-checked by administrator
    NEW.verified_at := NULL;
    NEW.verified_by := NULL;
    
    -- Cancel unsent deliveries for the old revision
    UPDATE public.reminder_deliveries
    SET status = 'cancelled', updated_at = now()
    WHERE deadline_id = OLD.id
      AND deadline_revision = OLD.revision
      AND status IN ('queued', 'failed');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_deadline_update
  BEFORE UPDATE ON public.tax_deadlines
  FOR EACH ROW EXECUTE FUNCTION public.handle_deadline_change();

-- Atomic Claiming Function for Scheduled Reminder Worker
CREATE OR REPLACE FUNCTION public.claim_reminder_deliveries(
  p_batch_size INT DEFAULT 50
)
RETURNS TABLE (
  delivery_id UUID,
  subscriber_id UUID,
  subscriber_name TEXT,
  subscriber_email CITEXT,
  deadline_id UUID,
  deadline_title TEXT,
  deadline_period TEXT,
  deadline_date DATE,
  category_name TEXT,
  reminder_interval TEXT,
  deadline_revision INT,
  idempotency_key TEXT,
  attempt_count INT
) AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    SELECT r.id
    FROM public.reminder_deliveries r
    JOIN public.subscribers s ON s.id = r.subscriber_id
    JOIN public.tax_deadlines d ON d.id = r.deadline_id
    WHERE r.status = 'queued'
      AND r.scheduled_date <= (now() AT TIME ZONE 'Asia/Karachi')::DATE
      AND s.status = 'active'
      AND d.is_active = true
      AND d.verified_at IS NOT NULL
      AND d.revision = r.deadline_revision
      AND (now() AT TIME ZONE 'Asia/Karachi')::DATE < d.filing_deadline
    ORDER BY r.scheduled_date ASC, r.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE OF r SKIP LOCKED
  )
  UPDATE public.reminder_deliveries rd
  SET status = 'processing',
      attempt_count = rd.attempt_count + 1,
      last_attempt_at = now(),
      updated_at = now()
  FROM claimed c
  JOIN public.reminder_deliveries orig ON orig.id = c.id
  JOIN public.subscribers s ON s.id = orig.subscriber_id
  JOIN public.tax_deadlines d ON d.id = orig.deadline_id
  JOIN public.tax_categories cat ON cat.id = d.category_id
  WHERE rd.id = c.id
  RETURNING
    rd.id AS delivery_id,
    s.id AS subscriber_id,
    s.name AS subscriber_name,
    s.email AS subscriber_email,
    d.id AS deadline_id,
    d.title AS deadline_title,
    d.tax_year_or_period AS deadline_period,
    d.filing_deadline AS deadline_date,
    cat.name AS category_name,
    rd.reminder_interval,
    rd.deadline_revision,
    COALESCE(rd.idempotency_key, 'rem-' || rd.id::text || '-r' || rd.deadline_revision::text) AS idempotency_key,
    rd.attempt_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Row Level Security (RLS)
ALTER TABLE public.tax_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS: tax_categories
-- Anyone (anon & authenticated) can view active tax categories to populate subscription forms
CREATE POLICY "Public can read active tax categories"
  ON public.tax_categories FOR SELECT
  USING (is_active = true);

-- Admins can do everything on tax_categories
CREATE POLICY "Admins full access on tax_categories"
  ON public.tax_categories FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS: subscribers
-- Only admins can read/manage subscribers directly (public operations go through Edge Functions with service role)
CREATE POLICY "Admins full access on subscribers"
  ON public.subscribers FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS: subscriber_categories
CREATE POLICY "Admins full access on subscriber_categories"
  ON public.subscriber_categories FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS: subscription_tokens
CREATE POLICY "Admins full access on subscription_tokens"
  ON public.subscription_tokens FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS: tax_deadlines
-- Anyone can see active verified deadlines (or restrict to admin; admin full access)
CREATE POLICY "Admins full access on tax_deadlines"
  ON public.tax_deadlines FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS: reminder_deliveries
CREATE POLICY "Admins full access on reminder_deliveries"
  ON public.reminder_deliveries FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS: admin_memberships
-- Only super admins or admins can view memberships; no self-elevation
CREATE POLICY "Admins can view admin_memberships"
  ON public.admin_memberships FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS: rate_limits
CREATE POLICY "Admins can view rate_limits"
  ON public.rate_limits FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 13. Seed Initial Realistic Categories (Categories only - NO fake deadlines)
INSERT INTO public.tax_categories (name, slug, description, sort_order)
VALUES 
  ('Income Tax - Individuals & Salaried', 'income-tax-individuals', 'Annual FBR income tax return filing for salaried individuals, self-employed, and freelancers.', 1),
  ('Business & Corporate Tax', 'business-corporate-tax', 'Annual and quarterly tax filing for AOPs, sole proprietorships, and private limited companies.', 2),
  ('Sales Tax (Federal & PRA)', 'sales-tax-pra', 'Monthly sales tax return filings for goods and services with FBR and Punjab Revenue Authority.', 3),
  ('Withholding Tax Statements', 'withholding-tax', 'Periodic withholding income tax statements and annual summaries.', 4),
  ('Property & Capital Value Tax', 'property-tax-stamp-duty', 'E-Stamp duty, CVT, and documentation deadlines for property registry and transfers.', 5)
ON CONFLICT (slug) DO NOTHING;
