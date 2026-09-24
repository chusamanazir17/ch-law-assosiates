-- ==============================================================================
-- 013_daily_closing.sql
-- Project: CH Office Management System
-- Step 13: Daily Financial Register Closing and Reconciliation
-- Note: When closed, transactions for that date are locked against modifications.
-- ==============================================================================

-- Daily Register Closings per Payment Account
CREATE TABLE IF NOT EXISTS public.daily_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_date DATE NOT NULL,
    account_id UUID NOT NULL REFERENCES public.payment_accounts(id) ON DELETE RESTRICT,
    opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    cash_in NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    cash_out NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    expected_balance NUMERIC(14,2) GENERATED ALWAYS AS (opening_balance + cash_in - cash_out) STORED,
    actual_balance NUMERIC(14,2) NOT NULL,
    difference NUMERIC(14,2) GENERATED ALWAYS AS (actual_balance - (opening_balance + cash_in - cash_out)) STORED,
    difference_reason TEXT,
    status daily_closing_status NOT NULL DEFAULT 'closed',
    closed_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    closed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reopened_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reopened_at TIMESTAMPTZ,
    reopen_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_daily_closing_account_date UNIQUE (business_date, account_id),
    CONSTRAINT chk_reopen_reason CHECK (
        (status != 'reopened') OR 
        (reopened_by IS NOT NULL AND reopened_at IS NOT NULL AND reopen_reason IS NOT NULL)
    )
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_daily_closing_date ON public.daily_closings(business_date);
CREATE INDEX IF NOT EXISTS idx_daily_closing_account ON public.daily_closings(account_id);
CREATE INDEX IF NOT EXISTS idx_daily_closing_status ON public.daily_closings(status);
