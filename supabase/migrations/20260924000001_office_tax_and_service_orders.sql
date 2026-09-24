-- ==============================================================================
-- 20260924000001_office_tax_and_service_orders.sql
-- Project: CH Law Associates & Chamber 121 Sahiwal
-- Description: Incremental migration for Tax Cases, Composing Service Orders,
--              and Secure Storage Buckets for Legal and Office Documents.
-- ==============================================================================

-- 1. TAX CASES TABLE
CREATE TABLE IF NOT EXISTS public.tax_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  tax_year TEXT NOT NULL,
  return_type TEXT NOT NULL DEFAULT 'Income Tax Return',
  fee NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  filing_date DATE,
  cpr_number TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_cases_client ON public.tax_cases(client_id);
CREATE INDEX IF NOT EXISTS idx_tax_cases_status ON public.tax_cases(status);
CREATE INDEX IF NOT EXISTS idx_tax_cases_year ON public.tax_cases(tax_year);

CREATE TRIGGER set_tax_cases_updated_at
  BEFORE UPDATE ON public.tax_cases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. SERVICE ORDERS TABLE (Legal Drafting, Affidavits, Deeds, Composing)
CREATE TABLE IF NOT EXISTS public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Legal Drafting',
  pages INT NOT NULL DEFAULT 1 CHECK (pages >= 1),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
  payment_status TEXT NOT NULL DEFAULT 'Unpaid',
  delivery_date TEXT,
  file_reference TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_orders_client ON public.service_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_number ON public.service_orders(order_number);

CREATE TRIGGER set_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. ROW LEVEL SECURITY (RLS) FOR NEW TABLES
ALTER TABLE public.tax_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Office staff access tax cases" ON public.tax_cases;
CREATE POLICY "Office staff access tax cases"
  ON public.tax_cases FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

DROP POLICY IF EXISTS "Office staff access service orders" ON public.service_orders;
CREATE POLICY "Office staff access service orders"
  ON public.service_orders FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

-- 4. PRIVATE SUPABASE STORAGE BUCKETS FOR OFFICE DOCUMENTS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('client-documents', 'client-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('case-documents', 'case-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('tax-documents', 'tax-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('expense-receipts', 'expense-receipts', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('service-files', 'service-files', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Authenticated Office users can view private documents
DROP POLICY IF EXISTS "Office staff view private docs" ON storage.objects;
CREATE POLICY "Office staff view private docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id IN ('client-documents', 'case-documents', 'tax-documents', 'expense-receipts', 'service-files')
    AND public.can_access_office(auth.uid())
  );

-- Storage RLS: Authenticated Office users can upload private documents
DROP POLICY IF EXISTS "Office staff upload private docs" ON storage.objects;
CREATE POLICY "Office staff upload private docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('client-documents', 'case-documents', 'tax-documents', 'expense-receipts', 'service-files')
    AND public.can_access_office(auth.uid())
  );

-- Storage RLS: Admin or document owner can delete documents
DROP POLICY IF EXISTS "Office staff delete private docs" ON storage.objects;
CREATE POLICY "Office staff delete private docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id IN ('client-documents', 'case-documents', 'tax-documents', 'expense-receipts', 'service-files')
    AND (auth.uid() = owner OR public.has_role(auth.uid(), 'super_admin', 'office_admin'))
  );
