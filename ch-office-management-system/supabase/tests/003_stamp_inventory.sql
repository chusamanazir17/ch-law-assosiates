-- ==============================================================================
-- tests/003_stamp_inventory.sql
-- Test Suite 3: Stamp Stock Movements and Non-Negative Inventory Guardrail
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    v_prod_id UUID;
    v_stock_before INT;
    v_stock_after INT;
    v_failed BOOLEAN := false;
BEGIN
    SELECT id INTO v_prod_id FROM public.stamp_products LIMIT 1;
    v_stock_before := public.calculate_stamp_stock(v_prod_id);

    -- 1. Add Stock Movement
    INSERT INTO public.stamp_stock_movements (stamp_product_id, movement_type, quantity, reference_type, notes)
    VALUES (v_prod_id, 'purchase', 20, 'purchase', 'Test stock intake');

    v_stock_after := public.calculate_stamp_stock(v_prod_id);
    ASSERT v_stock_after = (v_stock_before + 20),
        'FAIL: Stock must increase by 20 after purchase movement.';

    -- 2. Verify Negative Stock Prevention Trigger
    BEGIN
        INSERT INTO public.stamp_stock_movements (stamp_product_id, movement_type, quantity, reference_type, notes)
        VALUES (v_prod_id, 'sale', -(v_stock_after + 9999), 'sale', 'Invalid oversale test');
    EXCEPTION WHEN others THEN
        v_failed := true;
    END;

    ASSERT v_failed = true,
        'FAIL: Database trigger must reject movement that would drive stock below 0.';
END $$;

ROLLBACK;
