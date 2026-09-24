-- ==============================================================================
-- 017_business_settings.sql
-- Project: CH Office Management System
-- Step 17: Business Credentials and Chamber 121 System Configurations
-- Default Currency: PKR | Timezone: Asia/Karachi
-- ==============================================================================

-- 1. Business Profile Settings
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL DEFAULT 'CH Composing E-Stamp & Tax Advisor',
    legal_name TEXT NOT NULL DEFAULT 'CH Composing E-Stamp & Tax Consultancy',
    chamber_address TEXT NOT NULL DEFAULT 'Chamber No. 121, District Courts (Kachahri), Sahiwal',
    phone TEXT NOT NULL DEFAULT '0300-6925121',
    whatsapp TEXT NOT NULL DEFAULT '0300-6925121',
    email TEXT NOT NULL DEFAULT 'ch.tax.advisor@gmail.com',
    ntn_number TEXT DEFAULT '2938471-5',
    logo_url TEXT,
    receipt_header TEXT NOT NULL DEFAULT 'CH COMPOSING E-STAMP & TAX ADVISOR',
    receipt_footer TEXT NOT NULL DEFAULT 'Computerized Chamber Receipt • Chamber No. 121, Kachahri Sahiwal',
    currency TEXT NOT NULL DEFAULT 'PKR',
    timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
    financial_year TEXT NOT NULL DEFAULT '2024-2025',
    receipt_prefix TEXT NOT NULL DEFAULT 'REC',
    transaction_prefix TEXT NOT NULL DEFAULT 'TXN',
    service_order_prefix TEXT NOT NULL DEFAULT 'ORD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. System Settings Key-Value Store
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
