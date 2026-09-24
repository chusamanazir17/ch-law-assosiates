-- ==============================================================================
-- 011_tax_management.sql
-- Project: CH Office Management System
-- Step 11: FBR Income Tax, Sales Tax, Case Files, Documents, and Deadlines
-- ==============================================================================

-- 1. Tax Cases Master
CREATE TABLE IF NOT EXISTS public.tax_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    tax_year TEXT NOT NULL,
    case_type TEXT NOT NULL,
    fee NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    submission_date DATE,
    submission_reference TEXT,
    status tax_case_status NOT NULL DEFAULT 'documents_required',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Official Tax Returns Filing Details (IRIS CPR & Wealth Reconciliation)
CREATE TABLE IF NOT EXISTS public.tax_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_case_id UUID NOT NULL REFERENCES public.tax_cases(id) ON DELETE CASCADE,
    cpr_number TEXT,
    declared_income NUMERIC(14,2),
    tax_payable NUMERIC(14,2) DEFAULT 0.00,
    tax_paid NUMERIC(14,2) DEFAULT 0.00,
    acknowledgement_number TEXT,
    iris_username TEXT,
    filed_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tax Case Uploaded Documents Metadata (Bank Statements, Withholding Slips)
CREATE TABLE IF NOT EXISTS public.tax_case_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_case_id UUID NOT NULL REFERENCES public.tax_cases(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Statutory Tax Deadlines (FBR Calendar for Chamber 121 Clients)
CREATE TABLE IF NOT EXISTS public.tax_deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    tax_year TEXT NOT NULL,
    deadline_date DATE NOT NULL,
    statutory_body TEXT NOT NULL DEFAULT 'FBR',
    description TEXT,
    penalty_details TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tax Case Sub-Tasks
CREATE TABLE IF NOT EXISTS public.tax_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_case_id UUID NOT NULL REFERENCES public.tax_cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_tax_cases_client ON public.tax_cases(client_id);
CREATE INDEX IF NOT EXISTS idx_tax_cases_year ON public.tax_cases(tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_cases_status ON public.tax_cases(status);
CREATE INDEX IF NOT EXISTS idx_tax_cases_due ON public.tax_cases(due_date);
CREATE INDEX IF NOT EXISTS idx_tax_cases_assigned ON public.tax_cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tax_returns_case ON public.tax_returns(tax_case_id);
CREATE INDEX IF NOT EXISTS idx_tax_docs_case ON public.tax_case_documents(tax_case_id);
CREATE INDEX IF NOT EXISTS idx_tax_deadlines_date ON public.tax_deadlines(deadline_date);
