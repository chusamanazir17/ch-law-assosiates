-- ============================================================================
-- Backend integrity & RBAC remediation (Worker 1)
-- Forward-only migration. Safe to re-run (IF NOT EXISTS / OR REPLACE guards).
--
-- Contents:
--  1. Collision-safe document-number sequences + next_document_number()
--  2. Atomic financial RPCs (SECURITY DEFINER): record_ledger_entry,
--     transfer_funds, create_invoice_with_items, record_expense_atomic,
--     record_payment_atomic  (DB-03, DB-16)
--  3. Soft-delete columns (deleted_at) on 9 office tables
--  4. Money CHECK backstops (DB-01)
--  5. admin_sessions registry for revocable admin tokens (AUTH-3)
--  6. Remove forgeable audit_logs INSERT policy (FIN-03 / H10 app-side)
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Document-number sequences (FIN-12 / M10: replace Date.now() numbers)
-- Start values are above any plausible legacy count; legacy numbers used a
-- different text shape (INV-<time6>-<rand>), so no collision is possible.
-- --------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 10001;
CREATE SEQUENCE IF NOT EXISTS public.payment_receipt_seq START 10001;
CREATE SEQUENCE IF NOT EXISTS public.ledger_txn_seq START 10001;
CREATE SEQUENCE IF NOT EXISTS public.receipt_number_seq START 10001;
CREATE SEQUENCE IF NOT EXISTS public.tax_case_number_seq START 10001;
CREATE SEQUENCE IF NOT EXISTS public.service_order_number_seq START 10001;

CREATE OR REPLACE FUNCTION public.next_document_number(p_kind TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_num BIGINT;
BEGIN
  CASE p_kind
    WHEN 'invoice' THEN
      v_num := nextval('public.invoice_number_seq');
      RETURN 'INV-' || v_num::TEXT;
    WHEN 'payment_receipt' THEN
      v_num := nextval('public.payment_receipt_seq');
      RETURN 'REC-' || v_num::TEXT;
    WHEN 'ledger' THEN
      v_num := nextval('public.ledger_txn_seq');
      RETURN 'TXN-' || v_num::TEXT;
    WHEN 'receipt' THEN
      v_num := nextval('public.receipt_number_seq');
      RETURN 'REC-' || v_num::TEXT;
    WHEN 'tax_case' THEN
      v_num := nextval('public.tax_case_number_seq');
      RETURN 'TX-' || v_num::TEXT;
    WHEN 'service_order' THEN
      v_num := nextval('public.service_order_number_seq');
      RETURN 'SO-' || v_num::TEXT;
    ELSE
      RAISE EXCEPTION 'Unknown document kind: %', p_kind;
  END CASE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_document_number(TEXT) TO authenticated;

-- --------------------------------------------------------------------------
-- 2. Atomic financial RPCs
-- Each runs its writes in a single transaction; any failure rolls back the
-- whole flow (no more debit-without-credit, invoice-without-items, or
-- payment-without-ledger orphans). Row locks are taken in a deterministic
-- order to avoid deadlocks. All functions pin search_path (DB-14).
-- --------------------------------------------------------------------------

-- Single ledger entry with SELECT ... FOR UPDATE on the account (DB-16).
CREATE OR REPLACE FUNCTION public.record_ledger_entry(
  p_account_id UUID,
  p_entry_type TEXT,
  p_amount NUMERIC,
  p_category TEXT,
  p_description TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_client_id UUID DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_balance NUMERIC(12,2);
  v_new NUMERIC(12,2);
  v_txno TEXT;
  v_row JSONB;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;
  IF p_entry_type NOT IN ('debit', 'credit') THEN
    RAISE EXCEPTION 'Invalid entry type: %', p_entry_type;
  END IF;
  IF p_category IS NULL OR btrim(p_category) = '' THEN
    RAISE EXCEPTION 'Category is required';
  END IF;
  IF p_description IS NULL OR btrim(p_description) = '' THEN
    RAISE EXCEPTION 'Description is required';
  END IF;

  SELECT current_balance INTO v_balance
  FROM public.payment_accounts
  WHERE id = p_account_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment account not found';
  END IF;

  v_new := CASE
    WHEN p_entry_type = 'credit' THEN v_balance + p_amount
    ELSE v_balance - p_amount
  END;

  v_txno := public.next_document_number('ledger');

  INSERT INTO public.financial_ledger (
    transaction_number, account_id, entry_type, amount, balance_after,
    category, description, reference_type, reference_id, client_id, created_by
  ) VALUES (
    v_txno, p_account_id, p_entry_type, p_amount, v_new,
    btrim(p_category), btrim(p_description), p_reference_type, p_reference_id,
    p_client_id, p_created_by
  );

  UPDATE public.payment_accounts
  SET current_balance = v_new, updated_at = pg_catalog.now()
  WHERE id = p_account_id;

  SELECT to_jsonb(l) INTO v_row
  FROM public.financial_ledger l
  WHERE l.transaction_number = v_txno;

  RETURN v_row;
END;
$$;

-- Fund transfer: debit + credit atomically (DB-03).
CREATE OR REPLACE FUNCTION public.transfer_funds(
  p_from_account UUID,
  p_to_account UUID,
  p_amount NUMERIC,
  p_description TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_debit JSONB;
  v_credit JSONB;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Transfer amount must be greater than zero';
  END IF;
  IF p_from_account = p_to_account THEN
    RAISE EXCEPTION 'Source and destination accounts must differ';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.payment_accounts WHERE id = p_from_account) THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.payment_accounts WHERE id = p_to_account) THEN
    RAISE EXCEPTION 'Destination account not found';
  END IF;

  v_debit := public.record_ledger_entry(
    p_from_account, 'debit', p_amount, 'Transfer',
    COALESCE(NULLIF(btrim(p_description), ''), 'Fund transfer (debit)'),
    'transfer', NULL, NULL, p_created_by
  );
  v_credit := public.record_ledger_entry(
    p_to_account, 'credit', p_amount, 'Transfer',
    COALESCE(NULLIF(btrim(p_description), ''), 'Fund transfer (credit)'),
    'transfer', NULL, NULL, p_created_by
  );

  RETURN jsonb_build_object('debit', v_debit, 'credit', v_credit);
END;
$$;

-- Invoice + line items in one transaction; totals computed in SQL (DB-03, DB-12).
CREATE OR REPLACE FUNCTION public.create_invoice_with_items(
  p_client_id UUID,
  p_case_id UUID,
  p_due_date DATE,
  p_tax_amount NUMERIC,
  p_discount_amount NUMERIC,
  p_notes TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_subtotal NUMERIC(12,2) := 0;
  v_total NUMERIC(12,2);
  v_inv_no TEXT;
  v_inv_id UUID;
  v_item JSONB;
  v_qty INT;
  v_price NUMERIC;
BEGIN
  IF p_client_id IS NULL THEN
    RAISE EXCEPTION 'A valid client is required to create an invoice';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.clients WHERE id = p_client_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Client not found';
  END IF;
  IF p_case_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.cases WHERE id = p_case_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Case not found';
  END IF;
  IF p_due_date IS NULL THEN
    RAISE EXCEPTION 'Due date is required';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) != 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one line item is required';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := COALESCE((v_item ->> 'quantity')::INT, 0);
    v_price := COALESCE((v_item ->> 'unit_price')::NUMERIC, -1);
    IF v_item ->> 'description' IS NULL OR btrim(v_item ->> 'description') = '' THEN
      RAISE EXCEPTION 'Line item description is required';
    END IF;
    IF v_qty < 1 THEN
      RAISE EXCEPTION 'Line item quantity must be at least 1';
    END IF;
    IF v_price < 0 THEN
      RAISE EXCEPTION 'Line item unit price cannot be negative';
    END IF;
    v_subtotal := v_subtotal + round(v_qty * v_price, 2);
  END LOOP;

  v_total := greatest(
    0,
    round(v_subtotal + COALESCE(p_tax_amount, 0) - COALESCE(p_discount_amount, 0), 2)
  );
  IF v_total <= 0 THEN
    RAISE EXCEPTION 'Invoice total must be greater than zero';
  END IF;

  v_inv_no := public.next_document_number('invoice');

  INSERT INTO public.invoices (
    invoice_number, client_id, case_id, due_date,
    subtotal, tax_amount, discount_amount, total_amount,
    paid_amount, status, notes
  ) VALUES (
    v_inv_no, p_client_id, p_case_id, p_due_date,
    v_subtotal, COALESCE(p_tax_amount, 0), COALESCE(p_discount_amount, 0), v_total,
    0, 'unpaid', NULLIF(btrim(COALESCE(p_notes, '')), '')
  )
  RETURNING id INTO v_inv_id;

  INSERT INTO public.invoice_items (
    invoice_id, description, quantity, unit_price, total_price
  )
  SELECT
    v_inv_id,
    btrim(elem ->> 'description'),
    (elem ->> 'quantity')::INT,
    (elem ->> 'unit_price')::NUMERIC,
    round((elem ->> 'quantity')::INT * (elem ->> 'unit_price')::NUMERIC, 2)
  FROM jsonb_array_elements(p_items) AS elem;

  RETURN (SELECT to_jsonb(i) FROM public.invoices i WHERE i.id = v_inv_id);
END;
$$;

-- Expense insert (the AFTER INSERT trigger debits the balance) + the
-- companion ledger row, atomically (DB-03).
CREATE OR REPLACE FUNCTION public.record_expense_atomic(
  p_account_id UUID,
  p_category TEXT,
  p_payee TEXT,
  p_amount NUMERIC,
  p_expense_date DATE,
  p_description TEXT,
  p_receipt_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_exp_id UUID;
  v_bal NUMERIC(12,2);
  v_txno TEXT;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Expense amount must be greater than zero';
  END IF;
  IF p_account_id IS NULL THEN
    RAISE EXCEPTION 'A payment account is required';
  END IF;
  IF p_category IS NULL OR btrim(p_category) = '' THEN
    RAISE EXCEPTION 'Expense category is required';
  END IF;
  IF p_payee IS NULL OR btrim(p_payee) = '' THEN
    RAISE EXCEPTION 'Payee is required';
  END IF;

  INSERT INTO public.expenses (
    account_id, category, payee, amount, expense_date, description, receipt_url
  ) VALUES (
    p_account_id, btrim(p_category), btrim(p_payee), p_amount,
    COALESCE(p_expense_date, CURRENT_DATE),
    NULLIF(btrim(COALESCE(p_description, '')), ''),
    NULLIF(btrim(COALESCE(p_receipt_url, '')), '')
  )
  RETURNING id INTO v_exp_id;

  -- The on_expense_created trigger has already debited the balance in this
  -- same transaction; re-read it under lock for the ledger row.
  SELECT current_balance INTO v_bal
  FROM public.payment_accounts
  WHERE id = p_account_id
  FOR UPDATE;

  v_txno := public.next_document_number('ledger');

  INSERT INTO public.financial_ledger (
    transaction_number, account_id, entry_type, amount, balance_after,
    category, description, reference_type, reference_id
  ) VALUES (
    v_txno, p_account_id, 'debit', p_amount, COALESCE(v_bal, 0),
    btrim(p_category),
    COALESCE(NULLIF(btrim(p_description), ''), 'Expense paid to ' || btrim(p_payee)),
    'expense', v_exp_id
  );

  RETURN (SELECT to_jsonb(e) FROM public.expenses e WHERE e.id = v_exp_id);
END;
$$;

-- Payment insert (trigger credits account + refreshes invoice) + companion
-- ledger row, atomically, with an overpayment cap (DB-03, DB-05, FIN-01).
CREATE OR REPLACE FUNCTION public.record_payment_atomic(
  p_invoice_id UUID,
  p_client_id UUID,
  p_amount NUMERIC,
  p_payment_method TEXT,
  p_account_id UUID,
  p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_total NUMERIC(12,2);
  v_paid NUMERIC(12,2);
  v_remaining NUMERIC(12,2);
  v_receipt_no TEXT;
  v_pay_id UUID;
  v_bal NUMERIC(12,2);
  v_txno TEXT;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;
  IF p_client_id IS NULL THEN
    RAISE EXCEPTION 'A valid client is required to record a payment';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.clients WHERE id = p_client_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Client not found';
  END IF;

  IF p_invoice_id IS NOT NULL THEN
    SELECT total_amount, paid_amount INTO v_total, v_paid
    FROM public.invoices
    WHERE id = p_invoice_id AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invoice not found';
    END IF;

    v_remaining := v_total - v_paid;
    IF p_amount > v_remaining THEN
      RAISE EXCEPTION 'Payment amount % exceeds the remaining invoice balance %',
        p_amount, v_remaining;
    END IF;
  END IF;

  v_receipt_no := public.next_document_number('payment_receipt');

  INSERT INTO public.payments (
    invoice_id, client_id, amount, payment_method,
    payment_account_id, receipt_number, notes
  ) VALUES (
    p_invoice_id, p_client_id, p_amount,
    COALESCE(NULLIF(btrim(p_payment_method), ''), 'cash'),
    p_account_id, v_receipt_no,
    NULLIF(btrim(COALESCE(p_notes, '')), '')
  )
  RETURNING id INTO v_pay_id;

  -- The on_payment_created trigger has already credited the account in this
  -- same transaction; re-read it under lock for the ledger row.
  IF p_account_id IS NOT NULL THEN
    SELECT current_balance INTO v_bal
    FROM public.payment_accounts
    WHERE id = p_account_id
    FOR UPDATE;

    v_txno := public.next_document_number('ledger');

    INSERT INTO public.financial_ledger (
      transaction_number, entry_type, account_id, amount, balance_after,
      category, description, client_id, reference_type, reference_id
    ) VALUES (
      v_txno, 'credit', p_account_id, p_amount, COALESCE(v_bal, 0),
      'Legal Fee', 'Payment ' || v_receipt_no, p_client_id, 'payment', v_pay_id
    );
  END IF;

  RETURN (SELECT to_jsonb(p) FROM public.payments p WHERE p.id = v_pay_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_ledger_entry(UUID, TEXT, NUMERIC, TEXT, TEXT, TEXT, UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.transfer_funds(UUID, UUID, NUMERIC, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_invoice_with_items(UUID, UUID, DATE, NUMERIC, NUMERIC, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_expense_atomic(UUID, TEXT, TEXT, NUMERIC, DATE, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_payment_atomic(UUID, UUID, NUMERIC, TEXT, UUID, TEXT) TO authenticated;

-- --------------------------------------------------------------------------
-- 3. Soft delete: deleted_at on office tables (replaces hard deletes)
-- --------------------------------------------------------------------------
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.stamp_products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.stamp_stock_movements ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.hearings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.tax_cases ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.service_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Partial indexes so "not deleted" list queries stay fast.
CREATE INDEX IF NOT EXISTS idx_clients_live ON public.clients (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cases_live ON public.cases (filing_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_live ON public.invoices (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_live ON public.payments (payment_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_live ON public.expenses (expense_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_live ON public.tasks (due_date ASC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hearings_live ON public.hearings (hearing_date ASC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stamp_products_live ON public.stamp_products (denomination ASC) WHERE deleted_at IS NULL;

-- --------------------------------------------------------------------------
-- 4. Money CHECK backstops (DB-01; app layer validates first)
-- Added only when existing data is clean, so the migration never fails on
-- legacy rows — the application guards remain the primary control.
-- --------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_amount_positive') THEN
    IF NOT EXISTS (SELECT 1 FROM public.payments WHERE amount <= 0) THEN
      ALTER TABLE public.payments
        ADD CONSTRAINT payments_amount_positive CHECK (amount > 0);
    ELSE
      RAISE NOTICE 'Skipping payments_amount_positive: legacy rows with amount <= 0 exist; clean them manually.';
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_total_nonnegative') THEN
    IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE total_amount < 0) THEN
      ALTER TABLE public.invoices
        ADD CONSTRAINT invoices_total_nonnegative CHECK (total_amount >= 0);
    ELSE
      RAISE NOTICE 'Skipping invoices_total_nonnegative: legacy rows with total_amount < 0 exist.';
    END IF;
  END IF;
END
$$;

-- --------------------------------------------------------------------------
-- 5. Admin session registry (AUTH-3): revocable, TTL-bounded admin tokens.
-- RLS enabled with no policies: only service_role (server code) can read it.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_admin_sessions_session_id
  ON public.admin_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires
  ON public.admin_sessions (expires_at) WHERE revoked_at IS NULL;

-- --------------------------------------------------------------------------
-- 6. Audit-log integrity (FIN-03 / H10): drop the permissive INSERT policy so
-- only service_role (server code paths) can write audit rows. The app already
-- writes exclusively through lib/services/audit.service.ts (service-role).
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Insert audit logs" ON public.audit_logs;
