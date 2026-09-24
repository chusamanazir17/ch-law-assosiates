-- ==============================================================================
-- 021_triggers.sql
-- Project: CH Office Management System
-- Step 21: Database Triggers, Constraints & Guardrails
-- ==============================================================================

-- 1. Standard updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply updated_at to relevant tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_service_orders_updated_at ON public.service_orders;
CREATE TRIGGER trg_service_orders_updated_at
BEFORE UPDATE ON public.service_orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_payment_accounts_updated_at ON public.payment_accounts;
CREATE TRIGGER trg_payment_accounts_updated_at
BEFORE UPDATE ON public.payment_accounts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_expenses_updated_at ON public.expenses;
CREATE TRIGGER trg_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_stamp_products_updated_at ON public.stamp_products;
CREATE TRIGGER trg_stamp_products_updated_at
BEFORE UPDATE ON public.stamp_products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tax_cases_updated_at ON public.tax_cases;
CREATE TRIGGER trg_tax_cases_updated_at
BEFORE UPDATE ON public.tax_cases
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. New User Registration Trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, avatar, status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Chamber Staff'),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'avatar',
        'active'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Automatic Code & Number Generation Triggers
CREATE OR REPLACE FUNCTION public.auto_client_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.client_code IS NULL OR trim(NEW.client_code) = '' THEN
        NEW.client_code := public.generate_client_code();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clients_auto_code ON public.clients;
CREATE TRIGGER trg_clients_auto_code
BEFORE INSERT ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.auto_client_code();

CREATE OR REPLACE FUNCTION public.auto_receipt_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.receipt_number IS NULL OR trim(NEW.receipt_number) = '' THEN
        NEW.receipt_number := public.generate_receipt_number();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_receipts_auto_number ON public.receipts;
CREATE TRIGGER trg_receipts_auto_number
BEFORE INSERT ON public.receipts
FOR EACH ROW EXECUTE FUNCTION public.auto_receipt_number();

CREATE OR REPLACE FUNCTION public.auto_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.order_number IS NULL OR trim(NEW.order_number) = '' THEN
        NEW.order_number := public.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_auto_number ON public.service_orders;
CREATE TRIGGER trg_orders_auto_number
BEFORE INSERT ON public.service_orders
FOR EACH ROW EXECUTE FUNCTION public.auto_order_number();

-- 4. Protection Guardrail: Prevent Modifying Closed Day Financial Transactions
CREATE OR REPLACE FUNCTION public.check_closed_day_protection()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_date DATE;
    v_closed BOOLEAN;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_date := OLD.business_date;
    ELSE
        v_date := NEW.business_date;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.daily_closings
        WHERE business_date = v_date
          AND status = 'closed'
    ) INTO v_closed;

    IF v_closed THEN
        RAISE EXCEPTION 'Financial operation forbidden: Business register for % is closed and locked.', v_date;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_closed_days ON public.financial_transactions;
CREATE TRIGGER trg_protect_closed_days
BEFORE INSERT OR UPDATE OR DELETE ON public.financial_transactions
FOR EACH ROW EXECUTE FUNCTION public.check_closed_day_protection();

-- 5. Physical Stamp Stock Non-Negative Guardrail
CREATE OR REPLACE FUNCTION public.validate_stamp_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    IF NEW.quantity < 0 THEN
        SELECT COALESCE(SUM(quantity), 0) INTO v_current_stock
        FROM public.stamp_stock_movements
        WHERE stamp_product_id = NEW.stamp_product_id;

        IF (v_current_stock + NEW.quantity) < 0 THEN
            RAISE EXCEPTION 'Insufficient stamp inventory. Current stock: %, Requested: %', v_current_stock, abs(NEW.quantity);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_stamp_movement ON public.stamp_stock_movements;
CREATE TRIGGER trg_validate_stamp_movement
BEFORE INSERT ON public.stamp_stock_movements
FOR EACH ROW EXECUTE FUNCTION public.validate_stamp_movement();
