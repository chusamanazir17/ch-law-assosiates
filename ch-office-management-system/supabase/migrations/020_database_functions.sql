-- ==============================================================================
-- 020_database_functions.sql
-- Project: CH Office Management System
-- Step 20: Core PostgreSQL Transactional Database Functions
-- Note: Financial transactions, reversals, calculations are atomic and server-side.
-- ==============================================================================

-- 1. Number Generation Utilities
CREATE OR REPLACE FUNCTION public.generate_transaction_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
    v_count BIGINT;
    v_number TEXT;
BEGIN
    SELECT count(*) + 1 INTO v_count
    FROM public.financial_transactions
    WHERE to_char(created_at, 'YYYY') = v_year;

    v_number := 'TXN-' || v_year || '-' || lpad(v_count::TEXT, 6, '0');
    RETURN v_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
    v_count BIGINT;
    v_number TEXT;
BEGIN
    SELECT count(*) + 1 INTO v_count
    FROM public.receipts
    WHERE to_char(created_at, 'YYYY') = v_year;

    v_number := 'REC-' || v_year || '-' || lpad(v_count::TEXT, 6, '0');
    RETURN v_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_client_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_count BIGINT;
BEGIN
    SELECT count(*) + 1 INTO v_count FROM public.clients;
    RETURN 'CL-' || lpad(v_count::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_year TEXT := to_char(CURRENT_DATE, 'YYYY');
    v_count BIGINT;
BEGIN
    SELECT count(*) + 1 INTO v_count
    FROM public.service_orders
    WHERE to_char(created_at, 'YYYY') = v_year;

    RETURN 'ORD-' || v_year || '-' || lpad(v_count::TEXT, 5, '0');
END;
$$;

-- 2. Balance & Inventory Derivation Functions (Single Canonical Calculation)
CREATE OR REPLACE FUNCTION public.calculate_account_balance(p_account_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_opening NUMERIC(14,2) := 0.00;
    v_net_entries NUMERIC(14,2) := 0.00;
BEGIN
    SELECT opening_balance INTO v_opening
    FROM public.payment_accounts
    WHERE id = p_account_id;

    IF NOT FOUND THEN
        RETURN 0.00;
    END IF;

    -- In standard treasury/bank accounting:
    -- Debit increases the asset balance (Money received into account)
    -- Credit decreases the asset balance (Money paid out of account)
    SELECT COALESCE(
        SUM(CASE WHEN te.entry_type = 'debit' THEN te.amount ELSE -te.amount END),
        0.00
    ) INTO v_net_entries
    FROM public.transaction_entries te
    JOIN public.financial_transactions ft ON ft.id = te.transaction_id
    WHERE te.account_id = p_account_id
      AND ft.status = 'completed';

    RETURN (v_opening + v_net_entries);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_client_outstanding(p_client_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total_billed NUMERIC(14,2) := 0.00;
    v_total_paid NUMERIC(14,2) := 0.00;
BEGIN
    -- Sum of all service orders
    SELECT COALESCE(SUM(net_amount), 0.00) INTO v_total_billed
    FROM public.service_orders
    WHERE client_id = p_client_id
      AND status != 'cancelled';

    -- Sum of all completed income payments linked to this client
    SELECT COALESCE(SUM(te.amount), 0.00) INTO v_total_paid
    FROM public.financial_transactions ft
    JOIN public.transaction_entries te ON te.transaction_id = ft.id
    WHERE ft.client_id = p_client_id
      AND ft.transaction_type = 'income'
      AND ft.status = 'completed'
      AND te.entry_type = 'debit';

    RETURN GREATEST(0.00, v_total_billed - v_total_paid);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_stamp_stock(p_product_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_total INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(quantity), 0) INTO v_total
    FROM public.stamp_stock_movements
    WHERE stamp_product_id = p_product_id;

    RETURN v_total;
END;
$$;

-- 3. Atomic Transaction Management Function
CREATE OR REPLACE FUNCTION public.create_financial_transaction(
    p_type transaction_type,
    p_business_date DATE,
    p_description TEXT,
    p_amount NUMERIC(14,2),
    p_account_id UUID,
    p_dest_account_id UUID DEFAULT NULL, -- for transfers
    p_client_id UUID DEFAULT NULL,
    p_service_order_id UUID DEFAULT NULL,
    p_reference_number TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tx_id UUID;
    v_tx_num TEXT;
    v_is_closed BOOLEAN;
BEGIN
    -- Validation 1: Prevent operations on closed business days
    SELECT EXISTS (
        SELECT 1 FROM public.daily_closings
        WHERE business_date = p_business_date
          AND account_id = p_account_id
          AND status = 'closed'
    ) INTO v_is_closed;

    IF v_is_closed THEN
        RAISE EXCEPTION 'Financial operation rejected: Business day % is closed for this account.', p_business_date;
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Transaction amount must be strictly greater than 0.';
    END IF;

    v_tx_num := public.generate_transaction_number();

    -- Create Header
    INSERT INTO public.financial_transactions (
        transaction_number,
        transaction_type,
        business_date,
        client_id,
        service_order_id,
        reference_number,
        description,
        status,
        created_by
    ) VALUES (
        v_tx_num,
        p_type,
        p_business_date,
        p_client_id,
        p_service_order_id,
        p_reference_number,
        p_description,
        'completed',
        p_created_by
    ) RETURNING id INTO v_tx_id;

    -- Create Entries based on Transaction Type
    IF p_type = 'income' THEN
        -- Money in to treasury (Debit asset account)
        INSERT INTO public.transaction_entries (transaction_id, account_id, entry_type, amount)
        VALUES (v_tx_id, p_account_id, 'debit', p_amount);

    ELSIF p_type = 'expense' THEN
        -- Money out from treasury (Credit asset account)
        INSERT INTO public.transaction_entries (transaction_id, account_id, entry_type, amount)
        VALUES (v_tx_id, p_account_id, 'credit', p_amount);

    ELSIF p_type = 'transfer' THEN
        IF p_dest_account_id IS NULL OR p_dest_account_id = p_account_id THEN
            RAISE EXCEPTION 'Transfer requires distinct destination account.';
        END IF;

        -- Source account decreased (Credit)
        INSERT INTO public.transaction_entries (transaction_id, account_id, entry_type, amount)
        VALUES (v_tx_id, p_account_id, 'credit', p_amount);

        -- Destination account increased (Debit)
        INSERT INTO public.transaction_entries (transaction_id, account_id, entry_type, amount)
        VALUES (v_tx_id, p_dest_account_id, 'debit', p_amount);

    ELSIF p_type = 'adjustment' THEN
        INSERT INTO public.transaction_entries (transaction_id, account_id, entry_type, amount)
        VALUES (v_tx_id, p_account_id, 'debit', p_amount);
    END IF;

    -- Audit Log
    INSERT INTO public.audit_logs (user_id, action, module, table_name, record_id, new_values, reason)
    VALUES (
        p_created_by,
        'CREATE',
        'Finance',
        'financial_transactions',
        v_tx_id,
        jsonb_build_object(
            'transaction_number', v_tx_num,
            'type', p_type,
            'amount', p_amount,
            'account_id', p_account_id
        ),
        p_description
    );

    RETURN v_tx_id;
END;
$$;

-- 4. Safe Non-Destructive Transaction Reversal
CREATE OR REPLACE FUNCTION public.reverse_financial_transaction(
    p_transaction_id UUID,
    p_reason TEXT,
    p_reversed_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_orig RECORD;
    v_entry RECORD;
    v_rev_tx_id UUID;
    v_rev_tx_num TEXT;
BEGIN
    SELECT * INTO v_orig
    FROM public.financial_transactions
    WHERE id = p_transaction_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction not found: %', p_transaction_id;
    END IF;

    IF v_orig.status != 'completed' THEN
        RAISE EXCEPTION 'Only completed transactions can be reversed. Current status: %', v_orig.status;
    END IF;

    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'A valid cancellation reason is required for reversal.';
    END IF;

    v_rev_tx_num := 'REV-' || v_orig.transaction_number;

    -- Create Reversal Transaction
    INSERT INTO public.financial_transactions (
        transaction_number,
        transaction_type,
        business_date,
        client_id,
        service_order_id,
        reference_number,
        description,
        status,
        created_by
    ) VALUES (
        v_rev_tx_num,
        'reversal',
        CURRENT_DATE,
        v_orig.client_id,
        v_orig.service_order_id,
        v_orig.transaction_number,
        'Reversal of ' || v_orig.transaction_number || ': ' || p_reason,
        'completed',
        p_reversed_by
    ) RETURNING id INTO v_rev_tx_id;

    -- Create Inverted Entries (Debits become Credits; Credits become Debits)
    FOR v_entry IN
        SELECT * FROM public.transaction_entries WHERE transaction_id = p_transaction_id
    LOOP
        INSERT INTO public.transaction_entries (transaction_id, account_id, entry_type, amount)
        VALUES (
            v_rev_tx_id,
            v_entry.account_id,
            CASE WHEN v_entry.entry_type = 'debit' THEN 'credit' ELSE 'debit' END,
            v_entry.amount
        );
    END LOOP;

    -- Mark original as reversed
    UPDATE public.financial_transactions
    SET status = 'reversed',
        cancelled_by = p_reversed_by,
        cancelled_at = now(),
        cancellation_reason = p_reason
    WHERE id = p_transaction_id;

    -- Record in transaction_adjustments
    INSERT INTO public.transaction_adjustments (
        original_transaction_id,
        reversal_transaction_id,
        reason,
        adjusted_by
    ) VALUES (
        p_transaction_id,
        v_rev_tx_id,
        p_reason,
        p_reversed_by
    );

    -- Audit Log
    INSERT INTO public.audit_logs (user_id, action, module, table_name, record_id, new_values, reason)
    VALUES (
        p_reversed_by,
        'REVERSE',
        'Finance',
        'financial_transactions',
        p_transaction_id,
        jsonb_build_object('reversal_tx_id', v_rev_tx_id, 'reason', p_reason),
        p_reason
    );

    RETURN v_rev_tx_id;
END;
$$;

-- 5. Daily Register Closing and Reopening Functions
CREATE OR REPLACE FUNCTION public.close_business_day(
    p_account_id UUID,
    p_business_date DATE,
    p_actual_balance NUMERIC(14,2),
    p_difference_reason TEXT,
    p_closed_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_opening NUMERIC(14,2) := 0.00;
    v_cash_in NUMERIC(14,2) := 0.00;
    v_cash_out NUMERIC(14,2) := 0.00;
    v_closing_id UUID;
BEGIN
    -- Opening balance is either from prior closing or account opening
    SELECT COALESCE(
        (SELECT actual_balance FROM public.daily_closings
         WHERE account_id = p_account_id AND business_date < p_business_date
         ORDER BY business_date DESC LIMIT 1),
        (SELECT opening_balance FROM public.payment_accounts WHERE id = p_account_id),
        0.00
    ) INTO v_opening;

    -- Cash in today (debits)
    SELECT COALESCE(SUM(te.amount), 0.00) INTO v_cash_in
    FROM public.transaction_entries te
    JOIN public.financial_transactions ft ON ft.id = te.transaction_id
    WHERE te.account_id = p_account_id
      AND ft.business_date = p_business_date
      AND ft.status = 'completed'
      AND te.entry_type = 'debit';

    -- Cash out today (credits)
    SELECT COALESCE(SUM(te.amount), 0.00) INTO v_cash_out
    FROM public.transaction_entries te
    JOIN public.financial_transactions ft ON ft.id = te.transaction_id
    WHERE te.account_id = p_account_id
      AND ft.business_date = p_business_date
      AND ft.status = 'completed'
      AND te.entry_type = 'credit';

    INSERT INTO public.daily_closings (
        business_date,
        account_id,
        opening_balance,
        cash_in,
        cash_out,
        actual_balance,
        difference_reason,
        status,
        closed_by,
        closed_at
    ) VALUES (
        p_business_date,
        p_account_id,
        v_opening,
        v_cash_in,
        v_cash_out,
        p_actual_balance,
        p_difference_reason,
        'closed',
        p_closed_by,
        now()
    )
    ON CONFLICT (business_date, account_id) DO UPDATE SET
        opening_balance = EXCLUDED.opening_balance,
        cash_in = EXCLUDED.cash_in,
        cash_out = EXCLUDED.cash_out,
        actual_balance = EXCLUDED.actual_balance,
        difference_reason = EXCLUDED.difference_reason,
        status = 'closed',
        closed_by = EXCLUDED.closed_by,
        closed_at = now()
    RETURNING id INTO v_closing_id;

    -- Audit
    INSERT INTO public.audit_logs (user_id, action, module, table_name, record_id, new_values, reason)
    VALUES (
        p_closed_by,
        'CLOSE_DAY',
        'Daily Closing',
        'daily_closings',
        v_closing_id,
        jsonb_build_object(
            'date', p_business_date,
            'expected', v_opening + v_cash_in - v_cash_out,
            'actual', p_actual_balance
        ),
        p_difference_reason
    );

    RETURN v_closing_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reopen_business_day(
    p_closing_id UUID,
    p_reason TEXT,
    p_reopened_by UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'A legitimate operational reason is required to reopen a closed register.';
    END IF;

    UPDATE public.daily_closings
    SET status = 'reopened',
        reopened_by = p_reopened_by,
        reopened_at = now(),
        reopen_reason = p_reason
    WHERE id = p_closing_id;

    -- Audit
    INSERT INTO public.audit_logs (user_id, action, module, table_name, record_id, new_values, reason)
    VALUES (
        p_reopened_by,
        'REOPEN_DAY',
        'Daily Closing',
        'daily_closings',
        p_closing_id,
        jsonb_build_object('closing_id', p_closing_id, 'reopen_reason', p_reason),
        p_reason
    );
END;
$$;
