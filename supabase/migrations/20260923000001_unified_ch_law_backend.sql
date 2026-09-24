-- ==============================================================================
-- 20260923000001_unified_ch_law_backend.sql
-- Project: CH Law Associates & Chamber 121 Sahiwal
-- Description: Unified Database Architecture supporting:
--   A. Public Website & CMS (Posts, Media, Categories, Services, Settings)
--   B. Website Administration Dashboard
--   C. Office Management System (Clients, Cases, Hearings, Documents, 
--      Appointments, Staff, Attendance, Invoicing, Stamps, Cash Ledger, Audit Logs)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. GLOBAL TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ENUMS
DO $$ BEGIN
  CREATE TYPE public.app_user_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_client_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_client_type AS ENUM ('individual', 'sole_proprietor', 'partnership', 'company', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_case_status AS ENUM ('active', 'pending', 'decided', 'disposed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_hearing_status AS ENUM ('scheduled', 'adjourned', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_invoice_status AS ENUM ('draft', 'unpaid', 'partial', 'paid', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.app_attendance_status AS ENUM ('present', 'absent', 'late', 'half_day', 'leave');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. ROLES & PERMISSIONS ARCHITECTURE
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed standard roles
INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'Full access to both Website CMS and Office Management System'),
  ('website_admin', 'Access to Website CMS, Posts, Announcements, Media, Inquiries'),
  ('office_admin', 'Full operational control over Office Management System'),
  ('lawyer', 'Chamber advocate: Cases, Hearings, Notes, Documents, Tasks'),
  ('staff', 'Composing operator and general front-desk assistant'),
  ('accountant', 'Chamber cashier and double-entry ledger bookkeeper'),
  ('receptionist', 'Front-desk client intake, appointments, and visitor inquiries')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 5. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'staff' REFERENCES public.roles(name) ON UPDATE CASCADE,
  designation TEXT,
  department TEXT,
  bar_license_no TEXT,
  status public.app_user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- 6. SECURITY HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_user_id AND p.role = 'super_admin' AND p.status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id AND r.name = 'super_admin'
  ) OR EXISTS (
    SELECT 1 FROM public.admin_memberships
    WHERE user_id = p_user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, VARIADIC p_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN FALSE; END IF;
  IF public.is_super_admin(p_user_id) THEN RETURN TRUE; END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_user_id AND p.status = 'active' AND p.role = ANY(p_roles)
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id AND r.name = ANY(p_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_access_website_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_role(p_user_id, 'super_admin', 'website_admin', 'office_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_access_office(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_role(p_user_id, 'super_admin', 'office_admin', 'lawyer', 'accountant', 'staff', 'receptionist');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7. CLIENTS DIRECTORY
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  business_name TEXT,
  client_type public.app_client_type NOT NULL DEFAULT 'individual',
  cnic TEXT,
  ntn TEXT,
  mobile TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  city TEXT NOT NULL DEFAULT 'Sahiwal',
  address TEXT,
  status public.app_client_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(full_name);
CREATE INDEX IF NOT EXISTS idx_clients_mobile ON public.clients(mobile);
CREATE INDEX IF NOT EXISTS idx_clients_cnic ON public.clients(cnic);
CREATE INDEX IF NOT EXISTS idx_clients_ntn ON public.clients(ntn);

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto client_code sequence
CREATE SEQUENCE IF NOT EXISTS client_code_seq START 1001;
CREATE OR REPLACE FUNCTION public.set_client_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_code IS NULL OR NEW.client_code = '' THEN
    NEW.client_code := 'CL-' || nextval('client_code_seq')::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_client_code
  BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_client_code();

-- Client contacts, notes, documents
CREATE TABLE IF NOT EXISTS public.client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. COURT LITIGATION CASES
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  court_name TEXT NOT NULL DEFAULT 'District Court Sahiwal',
  judge_name TEXT,
  case_type TEXT NOT NULL DEFAULT 'Civil',
  case_category TEXT,
  stage TEXT NOT NULL DEFAULT 'filing',
  status public.app_case_status NOT NULL DEFAULT 'active',
  filing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  decision_date DATE,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_number ON public.cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_court ON public.cases(court_name);

CREATE TRIGGER set_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Case-Client Relationship
CREATE TABLE IF NOT EXISTS public.case_clients (
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_role TEXT NOT NULL DEFAULT 'petitioner',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_case_clients_case ON public.case_clients(case_id);
CREATE INDEX IF NOT EXISTS idx_case_clients_client ON public.case_clients(client_id);

-- Assigned Lawyers
CREATE TABLE IF NOT EXISTS public.case_lawyers (
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'lead',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, lawyer_id)
);

CREATE INDEX IF NOT EXISTS idx_case_lawyers_lawyer ON public.case_lawyers(lawyer_id);

-- Check if user is assigned lawyer
CREATE OR REPLACE FUNCTION public.is_assigned_lawyer(p_user_id UUID, p_case_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NULL OR p_case_id IS NULL THEN RETURN FALSE; END IF;
  IF public.has_role(p_user_id, 'super_admin', 'office_admin') THEN RETURN TRUE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.case_lawyers
    WHERE lawyer_id = p_user_id AND case_id = p_case_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. CASE HEARINGS & COURT DIARY
CREATE TABLE IF NOT EXISTS public.hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  hearing_date DATE NOT NULL,
  court_room TEXT,
  judge_name TEXT,
  purpose TEXT NOT NULL,
  proceedings_summary TEXT,
  next_hearing_date DATE,
  next_purpose TEXT,
  status public.app_hearing_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hearings_case ON public.hearings(case_id);
CREATE INDEX IF NOT EXISTS idx_hearings_date ON public.hearings(hearing_date);
CREATE INDEX IF NOT EXISTS idx_hearings_next_date ON public.hearings(next_hearing_date);

CREATE TRIGGER set_hearings_updated_at
  BEFORE UPDATE ON public.hearings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. CASE NOTES & DOCUMENTS
CREATE TABLE IF NOT EXISTS public.case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'observation',
  content TEXT NOT NULL,
  is_confidential BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'Pleading',
  file_url TEXT NOT NULL,
  storage_path TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_requested TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  source TEXT NOT NULL CHECK (source IN ('website', 'office_counter', 'phone')) DEFAULT 'office_counter',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

CREATE TRIGGER set_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 12. TASKS & DEADLINES
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  priority public.app_task_priority NOT NULL DEFAULT 'medium',
  status public.app_task_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 13. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  status public.app_attendance_status NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- 14. INVOICES, ITEMS & PAYMENTS
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status public.app_invoice_status NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0.00
);

-- 15. PAYMENT ACCOUNTS & METHODS
CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'bank', 'jazzcash', 'easypaisa', 'other')),
  account_number TEXT,
  bank_name TEXT,
  opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  current_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Payments against invoices / clients
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  amount NUMERIC(12,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_account_id UUID REFERENCES public.payment_accounts(id) ON DELETE SET NULL,
  receipt_number TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: Update invoice paid_amount and status when payment is recorded
CREATE OR REPLACE FUNCTION public.handle_payment_applied()
RETURNS TRIGGER AS $$
DECLARE
  v_total NUMERIC(12,2);
  v_paid NUMERIC(12,2);
BEGIN
  IF NEW.invoice_id IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_paid
    FROM public.payments
    WHERE invoice_id = NEW.invoice_id;

    SELECT total_amount INTO v_total
    FROM public.invoices
    WHERE id = NEW.invoice_id;

    UPDATE public.invoices
    SET paid_amount = v_paid,
        status = CASE 
          WHEN v_paid >= v_total THEN 'paid'::public.app_invoice_status
          WHEN v_paid > 0 THEN 'partial'::public.app_invoice_status
          ELSE 'unpaid'::public.app_invoice_status
        END,
        updated_at = now()
    WHERE id = NEW.invoice_id;
  END IF;

  -- Update payment account balance
  IF NEW.payment_account_id IS NOT NULL THEN
    UPDATE public.payment_accounts
    SET current_balance = current_balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.payment_account_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_created
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_payment_applied();

-- 16. FINANCIAL LEDGER (Double-entry journal)
CREATE TABLE IF NOT EXISTS public.financial_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT UNIQUE,
  account_id UUID NOT NULL REFERENCES public.payment_accounts(id) ON DELETE RESTRICT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('debit', 'credit')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  category TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_account ON public.financial_ledger(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created ON public.financial_ledger(created_at DESC);

-- 17. EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.payment_accounts(id) ON DELETE RESTRICT,
  category TEXT NOT NULL,
  payee TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  receipt_url TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: Expense deducts account balance
CREATE OR REPLACE FUNCTION public.handle_expense_created()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_id IS NOT NULL THEN
    UPDATE public.payment_accounts
    SET current_balance = current_balance - NEW.amount,
        updated_at = now()
    WHERE id = NEW.account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_expense_created
  AFTER INSERT ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_expense_created();

-- 18. E-STAMP PRODUCTS & STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS public.stamp_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  denomination INT NOT NULL UNIQUE CHECK (denomination > 0),
  purchase_price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2) NOT NULL,
  current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock INT NOT NULL DEFAULT 20,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stamp_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stamp_product_id UUID NOT NULL REFERENCES public.stamp_products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('opening', 'purchase', 'sale', 'adjustment_in', 'adjustment_out', 'reversal')),
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2),
  reference_type TEXT,
  reference_id UUID,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: Automatically adjust stamp current_stock on movement
CREATE OR REPLACE FUNCTION public.handle_stamp_movement()
RETURNS TRIGGER AS $$
DECLARE
  v_change INT;
BEGIN
  IF NEW.movement_type IN ('opening', 'purchase', 'adjustment_in') THEN
    v_change := ABS(NEW.quantity);
  ELSE
    v_change := -ABS(NEW.quantity);
  END IF;

  UPDATE public.stamp_products
  SET current_stock = current_stock + v_change,
      updated_at = now()
  WHERE id = NEW.stamp_product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_stamp_movement_created
  AFTER INSERT ON public.stamp_stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.handle_stamp_movement();

-- 19. COUNTER RECEIPTS
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'Legal Documentation',
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  balance_due NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  status TEXT NOT NULL CHECK (status IN ('paid', 'partial', 'unpaid', 'cancelled')) DEFAULT 'paid',
  notes TEXT,
  issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. DAILY CLOSING RECONCILIATION
CREATE TABLE IF NOT EXISTS public.daily_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closing_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  opening_cash NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  cash_in NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  cash_out NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  system_cash NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  actual_cash NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  difference NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  bank_wallets_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  stamps_sold_count INT NOT NULL DEFAULT 0,
  stamps_sold_value NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'reopened')) DEFAULT 'open',
  notes TEXT,
  closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. AUDIT & ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- 22. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. DYNAMIC CMS: SITE SETTINGS, TEAM MEMBERS & TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_urdu TEXT,
  role TEXT NOT NULL,
  role_urdu TEXT,
  status TEXT NOT NULL CHECK (status IN ('current', 'late')) DEFAULT 'current',
  badge TEXT,
  image_url TEXT,
  bio TEXT,
  bio_urdu TEXT,
  phone TEXT,
  whatsapp TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_title TEXT,
  comment TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 24. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can view; Super Admins & self can manage
CREATE POLICY "View profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage own or admin profiles" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id OR public.is_super_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_super_admin(auth.uid()));

-- Clients: Office staff and lawyers can view and manage
CREATE POLICY "Office access clients" ON public.clients FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

CREATE POLICY "Office access client contacts" ON public.client_contacts FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

CREATE POLICY "Office access client notes" ON public.client_notes FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

-- Cases: Office admins see all; Lawyers see assigned cases
CREATE POLICY "Admins full access cases" ON public.cases FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin', 'office_admin'));

CREATE POLICY "Lawyers and staff view assigned cases" ON public.cases FOR SELECT TO authenticated
  USING (public.is_assigned_lawyer(auth.uid(), id) OR public.has_role(auth.uid(), 'staff', 'receptionist'));

-- Case relationships
CREATE POLICY "Office access case clients" ON public.case_clients FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

CREATE POLICY "Office access case lawyers" ON public.case_lawyers FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

-- Hearings
CREATE POLICY "Office access hearings" ON public.hearings FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

-- Case Notes & Documents
CREATE POLICY "Office access case notes" ON public.case_notes FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

CREATE POLICY "Office access case documents" ON public.case_documents FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

-- Appointments: Public can insert (from website); Office users have full access
CREATE POLICY "Public can book appointments" ON public.appointments FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Office full access appointments" ON public.appointments FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

-- Tasks
CREATE POLICY "Office access tasks" ON public.tasks FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

-- Attendance
CREATE POLICY "View attendance" ON public.attendance FOR SELECT TO authenticated
  USING (public.can_access_office(auth.uid()));

CREATE POLICY "Manage attendance" ON public.attendance FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin', 'office_admin'));

-- Invoicing, Ledger, Expenses & Payments: Restricted to Office Admins & Accountants
CREATE POLICY "Finance access invoices" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'));

CREATE POLICY "Finance access invoice items" ON public.invoice_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'));

CREATE POLICY "Finance access accounts" ON public.payment_accounts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'));

CREATE POLICY "Finance access payments" ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant', 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant', 'staff'));

CREATE POLICY "Finance access ledger" ON public.financial_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'));

CREATE POLICY "Finance access expenses" ON public.expenses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'));

-- Stamps & Receipts
CREATE POLICY "Office access stamps" ON public.stamp_products FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

CREATE POLICY "Office access stamp movements" ON public.stamp_stock_movements FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

CREATE POLICY "Office access receipts" ON public.receipts FOR ALL TO authenticated
  USING (public.can_access_office(auth.uid()))
  WITH CHECK (public.can_access_office(auth.uid()));

CREATE POLICY "Office access daily closing" ON public.daily_closings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin', 'office_admin', 'accountant'));

-- Audit Logs: Viewable only by super_admin and office_admin; inserted by server/authenticated
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin', 'office_admin'));

CREATE POLICY "Insert audit logs" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Notifications
CREATE POLICY "View own notifications" ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CMS: Site Settings, Team Members, Testimonials
CREATE POLICY "Public view site settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.can_access_website_admin(auth.uid()))
  WITH CHECK (public.can_access_website_admin(auth.uid()));

CREATE POLICY "Public view team members" ON public.team_members FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage team members" ON public.team_members FOR ALL TO authenticated
  USING (public.can_access_website_admin(auth.uid()))
  WITH CHECK (public.can_access_website_admin(auth.uid()));

CREATE POLICY "Public view testimonials" ON public.testimonials FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.can_access_website_admin(auth.uid()))
  WITH CHECK (public.can_access_website_admin(auth.uid()));

-- 25. SEED ESSENTIAL DATA FOR CHAMBER 121
-- Payment Accounts
INSERT INTO public.payment_accounts (id, name, account_type, account_number, bank_name, opening_balance, current_balance, active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Chamber Cash Drawer (Chamber 121)', 'cash', 'CASH-DRW-121', 'Cash in Hand', 50000.00, 50000.00, true),
  ('a0000000-0000-0000-0000-000000000002', 'Meezan Bank - High Street Sahiwal', 'bank', '0281-0104829101', 'Meezan Bank Ltd', 250000.00, 250000.00, true),
  ('a0000000-0000-0000-0000-000000000003', 'JazzCash Business - 03006925121', 'jazzcash', '03006925121', 'Mobilink Microfinance', 35000.00, 35000.00, true),
  ('a0000000-0000-0000-0000-000000000004', 'EasyPaisa Merchant - 03006925121', 'easypaisa', '03006925121', 'Telenor Bank', 20000.00, 20000.00, true)
ON CONFLICT (id) DO NOTHING;

-- Stamp Products
INSERT INTO public.stamp_products (denomination, name, purchase_price, sale_price, current_stock, minimum_stock, active)
VALUES
  (50, 'Stamp Paper Rs. 50', 48.00, 50.00, 150, 50, true),
  (100, 'Stamp Paper Rs. 100', 96.00, 100.00, 200, 50, true),
  (200, 'Stamp Paper Rs. 200', 192.00, 200.00, 80, 30, true),
  (500, 'Stamp Paper Rs. 500', 480.00, 500.00, 60, 25, true),
  (1000, 'Stamp Paper Rs. 1000', 960.00, 100.00, 40, 20, true),
  (1200, 'Stamp Paper Rs. 1200', 1150.00, 1200.00, 25, 15, true),
  (1500, 'Stamp Paper Rs. 1500', 1440.00, 1500.00, 20, 15, true),
  (2000, 'Stamp Paper Rs. 2000', 1920.00, 2000.00, 15, 10, true)
ON CONFLICT (denomination) DO NOTHING;

-- Team Members
INSERT INTO public.team_members (name, name_urdu, role, role_urdu, status, badge, image_url, bio, phone, whatsapp, sort_order)
VALUES
  ('Haji Faqir Muhammad (Late)', 'حاجی فقیر محمد (مرحوم)', 'Founder | Stamp Vendor | Documentation Advisor', 'بانی | اسٹامپ وینڈر | دستاویزی مشیر', 'late', '1988–2014', '/images/owners/haji-faqir-muhammad.jpg', 'Dedicated more than two decades to stamp vending, documentation, consultancy, and client guidance in Sahiwal.', null, null, 1),
  ('Haji Nazir Ahmed', 'حاجی نذیر احمد', 'Stamp Vendor & Senior Consultant', 'اسٹامپ وینڈر و سینئر کنسلٹنٹ', 'current', 'Senior Owner', '/images/owners/haji-nazir-ahmad.jpg', 'Carries forward the tradition of professional legal documentation, stamp vending, and property advisory.', '0301-6922573', '0301-6922573', 2),
  ('Usama Nazir Ch', 'اسامہ نذیر چوہدری', 'Advocate / Tax & E-Stamp Advisor', 'ایڈووکیٹ / ٹیکس و ای سٹامپ ایڈوائزر', 'current', 'Lead Consultant', '/images/owners/usama-nazir-ch.jpg', 'Specialist in FBR tax compliance, Punjab Revenue Authority filing, property conveyancing and civil documentation.', '0305-7902744', '0305-7902744', 3)
ON CONFLICT DO NOTHING;

-- Testimonials
INSERT INTO public.testimonials (client_name, client_title, comment, rating, is_featured, sort_order)
VALUES
  ('Chaudhry Tariq Mehmood', 'Agricultural Property Owner, Sahiwal', 'Chamber 121 made our property transfer and e-stamp generation completely hassle-free. Extremely professional service.', 5, true, 1),
  ('Malik Imran Aslam', 'Managing Director, Sahiwal Cotton Ginners', 'Usama Ch handles all our corporate income tax returns and PRA sales tax filings. Accurate, punctual, and reliable.', 5, true, 2),
  ('Dr. Farooq Tariq', 'Consultant Physician, DHQ Hospital', 'Got my NTN registration and annual wealth statement filed in less than 24 hours. Highest recommendation for Chamber 121.', 5, true, 3)
ON CONFLICT DO NOTHING;
