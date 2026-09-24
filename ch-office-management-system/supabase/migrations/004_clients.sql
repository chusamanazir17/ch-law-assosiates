-- ==============================================================================
-- 004_clients.sql
-- Project: CH Office Management System
-- Step 4: Clients, Contacts, Notes, and Document Records
-- ==============================================================================

-- 1. Master Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    cnic TEXT,
    ntn TEXT,
    mobile TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    business_name TEXT,
    business_type TEXT,
    client_type client_type NOT NULL DEFAULT 'individual',
    tax_status tax_status NOT NULL DEFAULT 'non_filer',
    status client_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Client Contacts (Authorized Representatives, Partners, Managers)
CREATE TABLE IF NOT EXISTS public.client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Client Notes Timeline
CREATE TABLE IF NOT EXISTS public.client_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Client Stored Documents Metadata
CREATE TABLE IF NOT EXISTS public.client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Basic performance indices
CREATE INDEX IF NOT EXISTS idx_clients_code ON public.clients(client_code);
CREATE INDEX IF NOT EXISTS idx_clients_mobile ON public.clients(mobile);
CREATE INDEX IF NOT EXISTS idx_clients_cnic ON public.clients(cnic) WHERE cnic IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_ntn ON public.clients(ntn) WHERE ntn IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_contacts_client ON public.client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client ON public.client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_client ON public.client_documents(client_id);
