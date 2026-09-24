-- ==============================================================================
-- tests/004_daily_closing.sql
-- Test Suite 4: Daily Register Closing and Closed Day Transaction Guardrail
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    v_account_id UUID;
    v_close_id UUID;
    v_failed BOOLEAN := false;
BEGIN
    SELECT id INTO v_account_id FROM public.payment_accounts LIMIT 1;

    -- 1. Close register for today
    v_close_id := public.close_business_day(
        v_account_id,
        CURRENT_DATE,
        50000.00,
        'Shift close test',
        NULL
    );

    ASSERT (SELECT status FROM public.daily_closings WHERE id = v_close_id) = 'closed',
        'FAIL: Daily register must be marked closed.';

    -- 2. Verify that attempting to create a transaction on closed date fails
    BEGIN
        PERFORM public.create_financial_transaction(
            'income',
            CURRENT_DATE,
            'Attempted transaction on closed day',
            1000.00,
            v_account_id,
            NULL,
            NULL,
            NULL,
            'FAIL-01',
            NULL
        );
    EXCEPTION WHEN others THEN
        v_failed := true;
    END;

    ASSERT v_failed = true,
        'FAIL: Financial transaction on closed business date must be blocked.';

    -- 3. Reopen business day
    PERFORM public.reopen_business_day(
        v_close_id,
        'Operational audit inspection requires adjustments',
        NULL
    );

    ASSERT (SELECT status FROM public.daily_closings WHERE id = v_close_id) = 'reopened',
        'FAIL: Closing must be updated to reopened status.';
END $$;

ROLLBACK;
