-- ==============================================================================
-- 007_financial_ledger.sql
-- Project: CH Office Management System
-- Step 7: Central Financial Ledger (Double-entry / Canonical Source of Truth)
-- Note: All account balances and financial reports derive strictly from here.
-- ==============================================================================

-- 1. Financial Transactions Header
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number TEXT UNIQUE NOT NULL,
    transaction_type transaction_type NOT NULL,
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
    expense_id UUID, -- Will have FK added in 008_expenses.sql once expenses table exists
    stamp_sale_id UUID, -- Will have FK added in 010_stamp_inventory.sql once stamp_sales exists
    reference_number TEXT,
    description TEXT NOT NULL,
    status transaction_status NOT NULL DEFAULT 'completed',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cancelled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    CONSTRAINT chk_cancellation_reason CHECK (
        (status != 'cancelled' AND status != 'reversed') OR 
        (cancellation_reason IS NOT NULL AND cancelled_by IS NOT NULL AND cancelled_at IS NOT NULL)
    )
);

-- 2. Transaction Entries (Debits & Credits to Payment Accounts)
CREATE TABLE IF NOT EXISTS public.transaction_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.financial_transactions(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES public.payment_accounts(id) ON DELETE RESTRICT,
    entry_type entry_type NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Transaction Adjustments and Audit History
CREATE TABLE IF NOT EXISTS public.transaction_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_transaction_id UUID NOT NULL REFERENCES public.financial_transactions(id) ON DELETE RESTRICT,
    reversal_transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    adjusted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Critical Performance Indices for Financial Ledger Queries
CREATE INDEX IF NOT EXISTS idx_fin_tx_number ON public.financial_transactions(transaction_number);
CREATE INDEX IF NOT EXISTS idx_fin_tx_date ON public.financial_transactions(business_date);
CREATE INDEX IF NOT EXISTS idx_fin_tx_type ON public.financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_fin_tx_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_fin_tx_client ON public.financial_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_fin_tx_service_order ON public.financial_transactions(service_order_id);
CREATE INDEX IF NOT EXISTS idx_tx_entries_tx ON public.transaction_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_tx_entries_account ON public.transaction_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_tx_entries_type ON public.transaction_entries(entry_type);
