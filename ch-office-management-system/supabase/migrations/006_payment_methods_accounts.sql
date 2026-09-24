-- ==============================================================================
-- 006_payment_methods_accounts.sql
-- Project: CH Office Management System
-- Step 6: Payment Methods and Financial Accounts
-- Note: Current balances are calculated from ledger entries; not stored here.
-- ==============================================================================

-- 1. Payment Methods (Instruments)
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Payment Accounts (Treasury / Gateways)
CREATE TABLE IF NOT EXISTS public.payment_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'bank', 'mobile_wallet', 'other')),
    account_number TEXT,
    bank_name TEXT,
    opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_payment_accounts_type ON public.payment_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_active ON public.payment_accounts(active);
