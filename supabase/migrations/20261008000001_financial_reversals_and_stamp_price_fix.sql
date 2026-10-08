-- Forward fix for audit findings C2 (double-applied money math) and H7
-- (wrong Rs. 1000 stamp seed price).
--
-- 1) Corrects the Rs. 1000 stamp sale_price that was seeded as 100.00.
-- 2) Adds reversal triggers for UPDATE/DELETE on payments, expenses and
--    stamp_stock_movements. The insert-time triggers in
--    20260923000001_unified_ch_law_backend.sql only fire on INSERT, so without
--    these, editing or deleting a financial record would leave balances and
--    stock permanently wrong. (No app UI deletes these records today; these
--    triggers are defensive so the invariant holds regardless of caller.)
--
-- This migration only ADDS objects; it does not modify the earlier migration.

-- ---------------------------------------------------------------------------
-- 1) Stamp seed price correction
-- ---------------------------------------------------------------------------
UPDATE public.stamp_products
SET sale_price = 1000.00,
    updated_at = now()
WHERE denomination = 1000
  AND sale_price = 100.00;

-- ---------------------------------------------------------------------------
-- 2) Payment reversals (UPDATE / DELETE)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refresh_invoice_payment_status(p_invoice_id UUID)
RETURNS VOID AS $$
DECLARE
  v_paid NUMERIC(12,2);
  v_total NUMERIC(12,2);
BEGIN
  IF p_invoice_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_paid
  FROM public.payments
  WHERE invoice_id = p_invoice_id;

  SELECT total_amount INTO v_total
  FROM public.invoices
  WHERE id = p_invoice_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.invoices
  SET paid_amount = v_paid,
      status = CASE
        WHEN v_paid >= v_total THEN 'paid'::public.app_invoice_status
        WHEN v_paid > 0 THEN 'partial'::public.app_invoice_status
        ELSE 'unpaid'::public.app_invoice_status
      END,
      updated_at = now()
  WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_payment_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Take the payment back out of the account balance.
    IF OLD.payment_account_id IS NOT NULL THEN
      UPDATE public.payment_accounts
      SET current_balance = current_balance - OLD.amount,
          updated_at = now()
      WHERE id = OLD.payment_account_id;
    END IF;
    PERFORM public.refresh_invoice_payment_status(OLD.invoice_id);
    RETURN OLD;
  END IF;

  -- UPDATE: move the delta between accounts, or adjust within one account.
  IF OLD.payment_account_id IS DISTINCT FROM NEW.payment_account_id THEN
    IF OLD.payment_account_id IS NOT NULL THEN
      UPDATE public.payment_accounts
      SET current_balance = current_balance - OLD.amount,
          updated_at = now()
      WHERE id = OLD.payment_account_id;
    END IF;
    IF NEW.payment_account_id IS NOT NULL THEN
      UPDATE public.payment_accounts
      SET current_balance = current_balance + NEW.amount,
          updated_at = now()
      WHERE id = NEW.payment_account_id;
    END IF;
  ELSIF NEW.payment_account_id IS NOT NULL AND NEW.amount IS DISTINCT FROM OLD.amount THEN
    UPDATE public.payment_accounts
    SET current_balance = current_balance + (NEW.amount - OLD.amount),
        updated_at = now()
    WHERE id = NEW.payment_account_id;
  END IF;

  PERFORM public.refresh_invoice_payment_status(OLD.invoice_id);
  IF NEW.invoice_id IS DISTINCT FROM OLD.invoice_id THEN
    PERFORM public.refresh_invoice_payment_status(NEW.invoice_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_payment_changed ON public.payments;
CREATE TRIGGER on_payment_changed
  AFTER UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_payment_changed();

-- ---------------------------------------------------------------------------
-- 3) Expense reversals (UPDATE / DELETE)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_expense_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Give the spent money back to the account.
    IF OLD.account_id IS NOT NULL THEN
      UPDATE public.payment_accounts
      SET current_balance = current_balance + OLD.amount,
          updated_at = now()
      WHERE id = OLD.account_id;
    END IF;
    RETURN OLD;
  END IF;

  -- UPDATE: move the delta between accounts, or adjust within one account.
  IF OLD.account_id IS DISTINCT FROM NEW.account_id THEN
    IF OLD.account_id IS NOT NULL THEN
      UPDATE public.payment_accounts
      SET current_balance = current_balance + OLD.amount,
          updated_at = now()
      WHERE id = OLD.account_id;
    END IF;
    IF NEW.account_id IS NOT NULL THEN
      UPDATE public.payment_accounts
      SET current_balance = current_balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.account_id;
    END IF;
  ELSIF NEW.account_id IS NOT NULL AND NEW.amount IS DISTINCT FROM OLD.amount THEN
    UPDATE public.payment_accounts
    SET current_balance = current_balance - (NEW.amount - OLD.amount),
        updated_at = now()
    WHERE id = NEW.account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_expense_changed ON public.expenses;
CREATE TRIGGER on_expense_changed
  AFTER UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_expense_changed();

-- ---------------------------------------------------------------------------
-- 4) Stamp stock movement reversals (UPDATE / DELETE)
-- ---------------------------------------------------------------------------
-- Signed stock delta for one movement row. Mirrors the sign convention of
-- handle_stamp_movement() in 20260923000001 (kept as a helper so the reversal
-- triggers cannot drift from it).
CREATE OR REPLACE FUNCTION public.stamp_movement_delta(p_movement_type TEXT, p_quantity INT)
RETURNS INT AS $$
BEGIN
  IF p_movement_type IN ('opening', 'purchase', 'adjustment_in') THEN
    RETURN ABS(p_quantity);
  END IF;
  RETURN -ABS(p_quantity);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.handle_stamp_movement_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.stamp_products
    SET current_stock = current_stock - public.stamp_movement_delta(OLD.movement_type, OLD.quantity),
        updated_at = now()
    WHERE id = OLD.stamp_product_id;
    RETURN OLD;
  END IF;

  IF OLD.stamp_product_id IS DISTINCT FROM NEW.stamp_product_id THEN
    -- Movement reassigned to another product: reverse on the old, apply on the new.
    UPDATE public.stamp_products
    SET current_stock = current_stock - public.stamp_movement_delta(OLD.movement_type, OLD.quantity),
        updated_at = now()
    WHERE id = OLD.stamp_product_id;
    UPDATE public.stamp_products
    SET current_stock = current_stock + public.stamp_movement_delta(NEW.movement_type, NEW.quantity),
        updated_at = now()
    WHERE id = NEW.stamp_product_id;
    RETURN NEW;
  END IF;

  UPDATE public.stamp_products
  SET current_stock = current_stock
        + public.stamp_movement_delta(NEW.movement_type, NEW.quantity)
        - public.stamp_movement_delta(OLD.movement_type, OLD.quantity),
      updated_at = now()
  WHERE id = NEW.stamp_product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_stamp_movement_changed ON public.stamp_stock_movements;
CREATE TRIGGER on_stamp_movement_changed
  AFTER UPDATE OR DELETE ON public.stamp_stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.handle_stamp_movement_changed();
