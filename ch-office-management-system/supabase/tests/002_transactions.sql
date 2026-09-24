-- ==============================================================================
-- tests/002_transactions.sql
-- Test Suite 2: Double-Entry Financial Ledger, Atomic Transactions & Reversals
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    v_account_id UUID;
    v_tx_id UUID;
    v_rev_id UUID;
    v_initial_bal NUMERIC;
    v_after_bal NUMERIC;
    v_reversal_bal NUMERIC;
BEGIN
    SELECT id INTO v_account_id FROM public.payment_accounts LIMIT 1;
    v_initial_bal := public.calculate_account_balance(v_account_id);

    -- 1. Create Income Transaction
    v_tx_id := public.create_financial_transaction(
        'income',
        CURRENT_DATE,
        'Test Income Entry',
        5000.00,
        v_account_id,
        NULL,
        NULL,
        NULL,
        'TEST-001',
        NULL
    );

    v_after_bal := public.calculate_account_balance(v_account_id);
    ASSERT v_after_bal = (v_initial_bal + 5000.00),
        'FAIL: Income transaction must increase account balance by 5000.';

    -- 2. Reverse Transaction
    v_rev_id := public.reverse_financial_transaction(
        v_tx_id,
        'Testing automated non-destructive reversal',
        NULL
    );

    v_reversal_bal := public.calculate_account_balance(v_account_id);
    ASSERT v_reversal_bal = v_initial_bal,
        'FAIL: Reversal transaction must restore original account balance.';
    
    ASSERT (SELECT status FROM public.financial_transactions WHERE id = v_tx_id) = 'reversed',
        'FAIL: Original transaction status must be marked reversed.';
END $$;

ROLLBACK;
