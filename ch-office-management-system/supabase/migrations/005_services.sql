-- ==============================================================================
-- 005_services.sql
-- Project: CH Office Management System
-- Step 5: Service Catalog and Service Orders
-- Note: Payments are tracked centrally in financial ledger, NOT duplicated here.
-- ==============================================================================

-- 1. Service Categories
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Master Services Catalog
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    standard_fee NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (standard_fee >= 0),
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Service Orders (Deeds, Petitions, Tax Consultancy, NTN, Composing)
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
    reference_number TEXT,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    discount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0 AND discount <= total_amount),
    net_amount NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - discount) STORED,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE,
    status service_order_status NOT NULL DEFAULT 'pending',
    instructions TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Service Order Line Items (Pages, Copies, Drafts)
CREATE TABLE IF NOT EXISTS public.service_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_client ON public.service_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_service ON public.service_orders(service_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_assigned ON public.service_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_service_order_items_order ON public.service_order_items(order_id);
