-- ==============================================================================
-- 009_receipts.sql
-- Project: CH Office Management System
-- Step 9: Receipts and Line Items
-- Note: Receipts are immutable and never deleted; cancellation requires an audit reason.
-- ==============================================================================

-- 1. Official Receipts Header
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
    transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE RESTRICT,
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
    status receipt_status NOT NULL DEFAULT 'paid',
    remarks TEXT,
    issued_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cancelled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_receipt_cancellation CHECK (
        (status != 'cancelled') OR 
        (cancelled_by IS NOT NULL AND cancelled_at IS NOT NULL AND cancellation_reason IS NOT NULL)
    )
);

-- 2. Receipt Items
CREATE TABLE IF NOT EXISTS public.receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_receipts_number ON public.receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_client ON public.receipts(client_id);
CREATE INDEX IF NOT EXISTS idx_receipts_tx ON public.receipts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_issued_at ON public.receipts(issued_at);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt ON public.receipt_items(receipt_id);
