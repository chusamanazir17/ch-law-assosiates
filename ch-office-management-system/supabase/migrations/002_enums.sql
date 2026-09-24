-- ==============================================================================
-- 002_enums.sql
-- Project: CH Office Management System
-- Step 2: Reusable PostgreSQL Enums for Statuses and Types
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE client_type AS ENUM ('individual', 'sole_proprietor', 'partnership', 'private_limited', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tax_status AS ENUM ('active_filer', 'non_filer', 'exempt', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer', 'adjustment', 'reversal');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'reversed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE entry_type AS ENUM ('debit', 'credit');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE receipt_status AS ENUM ('paid', 'partial', 'unpaid', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE service_order_status AS ENUM (
        'pending',
        'in_progress',
        'ready',
        'completed',
        'delivered',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tax_case_status AS ENUM (
        'documents_required',
        'in_progress',
        'ready_to_file',
        'submitted',
        'completed',
        'overdue',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'pending',
        'in_progress',
        'completed',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE stamp_movement_type AS ENUM (
        'opening',
        'purchase',
        'sale',
        'adjustment_in',
        'adjustment_out',
        'reversal'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE daily_closing_status AS ENUM ('open', 'closed', 'reopened');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'outstanding_payment',
        'low_stock',
        'tax_deadline',
        'task_overdue',
        'closing_difference',
        'security_alert',
        'system'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;
