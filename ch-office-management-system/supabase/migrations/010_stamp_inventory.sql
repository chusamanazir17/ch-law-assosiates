-- ==============================================================================
-- 010_stamp_inventory.sql
-- Project: CH Office Management System
-- Step 10: E-Stamp & Physical Stamp Paper Inventory Management
-- Note: stamp_stock_movements is the single canonical source of truth for stock levels.
-- ==============================================================================

-- 1. Stamp Products (Denominations)
CREATE TABLE IF NOT EXISTS public.stamp_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    denomination INTEGER NOT NULL UNIQUE CHECK (denomination > 0),
    purchase_price NUMERIC(12,2) NOT NULL CHECK (purchase_price >= 0),
    sale_price NUMERIC(12,2) NOT NULL CHECK (sale_price >= 0),
    minimum_stock INTEGER NOT NULL DEFAULT 10 CHECK (minimum_stock >= 0),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Stamp Stock Movements (Canonical Ledger of Physical Stock)
CREATE TABLE IF NOT EXISTS public.stamp_stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stamp_product_id UUID NOT NULL REFERENCES public.stamp_products(id) ON DELETE RESTRICT,
    movement_type stamp_movement_type NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity != 0), -- positive for additions, negative for reductions
    reference_type TEXT NOT NULL CHECK (reference_type IN ('opening', 'purchase', 'sale', 'adjustment', 'reversal')),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Stamp Purchases (from State Bank / Treasury)
CREATE TABLE IF NOT EXISTS public.stamp_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_number TEXT UNIQUE NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    supplier_name TEXT NOT NULL,
    total_cost NUMERIC(14,2) NOT NULL CHECK (total_cost >= 0),
    transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE RESTRICT,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Stamp Purchase Line Items
CREATE TABLE IF NOT EXISTS public.stamp_purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES public.stamp_purchases(id) ON DELETE CASCADE,
    stamp_product_id UUID NOT NULL REFERENCES public.stamp_products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
    total_cost NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED
);

-- 5. Stamp Sales (Counter Issue to Litigants / Citizens)
CREATE TABLE IF NOT EXISTS public.stamp_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    cnic TEXT,
    purpose TEXT,
    total_amount NUMERIC(14,2) NOT NULL CHECK (total_amount >= 0),
    transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE RESTRICT,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'completed',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Stamp Sale Line Items
CREATE TABLE IF NOT EXISTS public.stamp_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.stamp_sales(id) ON DELETE CASCADE,
    stamp_product_id UUID NOT NULL REFERENCES public.stamp_products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- 7. Stamp Physical Inventory Adjustments (Audits)
CREATE TABLE IF NOT EXISTS public.stamp_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stamp_product_id UUID NOT NULL REFERENCES public.stamp_products(id) ON DELETE RESTRICT,
    previous_stock INTEGER NOT NULL,
    adjusted_stock INTEGER NOT NULL,
    difference INTEGER GENERATED ALWAYS AS (adjusted_stock - previous_stock) STORED,
    reason TEXT NOT NULL,
    adjusted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link financial_transactions.stamp_sale_id to stamp_sales(id)
DO $$ BEGIN
    ALTER TABLE public.financial_transactions 
    ADD CONSTRAINT fk_fin_tx_stamp_sale FOREIGN KEY (stamp_sale_id) REFERENCES public.stamp_sales(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_stamp_products_denom ON public.stamp_products(denomination);
CREATE INDEX IF NOT EXISTS idx_stamp_movements_prod ON public.stamp_stock_movements(stamp_product_id);
CREATE INDEX IF NOT EXISTS idx_stamp_movements_date ON public.stamp_stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stamp_movements_ref ON public.stamp_stock_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stamp_purchases_date ON public.stamp_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_stamp_sales_date ON public.stamp_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_stamp_sales_client ON public.stamp_sales(client_id);
