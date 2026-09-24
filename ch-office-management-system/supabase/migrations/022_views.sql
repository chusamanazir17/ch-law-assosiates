-- ==============================================================================
-- 022_views.sql
-- Project: CH Office Management System
-- Step 22: High-Performance Reporting & Dashboard Database Views
-- Note: Central single-source-of-truth calculations for the UI without client re-computation.
-- ==============================================================================

-- 1. Account Balances View (Derives directly from ledger entries)
CREATE OR REPLACE VIEW public.v_account_balances AS
SELECT
    pa.id AS account_id,
    pa.name AS account_name,
    pa.account_type,
    pa.opening_balance,
    COALESCE(SUM(CASE WHEN te.entry_type = 'debit' THEN te.amount ELSE 0 END), 0.00) AS total_debits,
    COALESCE(SUM(CASE WHEN te.entry_type = 'credit' THEN te.amount ELSE 0 END), 0.00) AS total_credits,
    (
        pa.opening_balance + 
        COALESCE(SUM(CASE WHEN te.entry_type = 'debit' THEN te.amount ELSE -te.amount END), 0.00)
    ) AS current_balance,
    pa.active
FROM public.payment_accounts pa
LEFT JOIN public.transaction_entries te ON te.account_id = pa.id
LEFT JOIN public.financial_transactions ft ON ft.id = te.transaction_id AND ft.status = 'completed'
GROUP BY pa.id, pa.name, pa.account_type, pa.opening_balance, pa.active;

-- 2. Client Balances View (Orders vs. Active Payments)
CREATE OR REPLACE VIEW public.v_client_balances AS
SELECT
    c.id AS client_id,
    c.client_code,
    c.full_name,
    c.mobile,
    c.business_name,
    c.status AS client_status,
    COALESCE(orders.total_billed, 0.00) AS total_billed,
    COALESCE(payments.total_paid, 0.00) AS total_paid,
    GREATEST(0.00, COALESCE(orders.total_billed, 0.00) - COALESCE(payments.total_paid, 0.00)) AS outstanding_balance
FROM public.clients c
LEFT JOIN (
    SELECT client_id, SUM(net_amount) AS total_billed
    FROM public.service_orders
    WHERE status != 'cancelled'
    GROUP BY client_id
) orders ON orders.client_id = c.id
LEFT JOIN (
    SELECT ft.client_id, SUM(te.amount) AS total_paid
    FROM public.financial_transactions ft
    JOIN public.transaction_entries te ON te.transaction_id = ft.id
    WHERE ft.transaction_type = 'income'
      AND ft.status = 'completed'
      AND te.entry_type = 'debit'
      AND ft.client_id IS NOT NULL
    GROUP BY ft.client_id
) payments ON payments.client_id = c.id;

-- 3. Outstanding Clients List View
CREATE OR REPLACE VIEW public.v_outstanding_clients AS
SELECT * FROM public.v_client_balances
WHERE outstanding_balance > 0;

-- 4. Daily Cash Summary View
CREATE OR REPLACE VIEW public.v_daily_cash_summary AS
SELECT
    ft.business_date,
    COALESCE(SUM(CASE WHEN ft.transaction_type = 'income' AND te.entry_type = 'debit' THEN te.amount ELSE 0 END), 0.00) AS total_income,
    COALESCE(SUM(CASE WHEN ft.transaction_type = 'expense' AND te.entry_type = 'credit' THEN te.amount ELSE 0 END), 0.00) AS total_expense,
    (
        COALESCE(SUM(CASE WHEN ft.transaction_type = 'income' AND te.entry_type = 'debit' THEN te.amount ELSE 0 END), 0.00) -
        COALESCE(SUM(CASE WHEN ft.transaction_type = 'expense' AND te.entry_type = 'credit' THEN te.amount ELSE 0 END), 0.00)
    ) AS net_cash_flow,
    COUNT(DISTINCT ft.id) AS transaction_count
FROM public.financial_transactions ft
JOIN public.transaction_entries te ON te.transaction_id = ft.id
WHERE ft.status = 'completed'
GROUP BY ft.business_date;

-- 5. Monthly Income View
CREATE OR REPLACE VIEW public.v_monthly_income AS
SELECT
    to_char(ft.business_date, 'YYYY') AS year,
    to_char(ft.business_date, 'MM') AS month,
    to_char(ft.business_date, 'Month') AS month_name,
    COALESCE(SUM(te.amount), 0.00) AS total_income,
    COUNT(DISTINCT ft.id) AS income_count
FROM public.financial_transactions ft
JOIN public.transaction_entries te ON te.transaction_id = ft.id
WHERE ft.transaction_type = 'income'
  AND ft.status = 'completed'
  AND te.entry_type = 'debit'
GROUP BY to_char(ft.business_date, 'YYYY'), to_char(ft.business_date, 'MM'), to_char(ft.business_date, 'Month');

-- 6. Monthly Expenses View
CREATE OR REPLACE VIEW public.v_monthly_expenses AS
SELECT
    to_char(ft.business_date, 'YYYY') AS year,
    to_char(ft.business_date, 'MM') AS month,
    to_char(ft.business_date, 'Month') AS month_name,
    COALESCE(SUM(te.amount), 0.00) AS total_expense,
    COUNT(DISTINCT ft.id) AS expense_count
FROM public.financial_transactions ft
JOIN public.transaction_entries te ON te.transaction_id = ft.id
WHERE ft.transaction_type = 'expense'
  AND ft.status = 'completed'
  AND te.entry_type = 'credit'
GROUP BY to_char(ft.business_date, 'YYYY'), to_char(ft.business_date, 'MM'), to_char(ft.business_date, 'Month');

-- 7. Monthly Profit & Loss Statement View
CREATE OR REPLACE VIEW public.v_monthly_profit AS
SELECT
    COALESCE(inc.year, exp.year) AS year,
    COALESCE(inc.month, exp.month) AS month,
    COALESCE(inc.month_name, exp.month_name) AS month_name,
    COALESCE(inc.total_income, 0.00) AS total_income,
    COALESCE(exp.total_expense, 0.00) AS total_expense,
    (COALESCE(inc.total_income, 0.00) - COALESCE(exp.total_expense, 0.00)) AS net_profit
FROM public.v_monthly_income inc
FULL OUTER JOIN public.v_monthly_expenses exp 
    ON inc.year = exp.year AND inc.month = exp.month;

-- 8. Stamp Inventory Current Stock View
CREATE OR REPLACE VIEW public.v_stamp_current_stock AS
SELECT
    sp.id AS stamp_product_id,
    sp.name,
    sp.denomination,
    sp.purchase_price,
    sp.sale_price,
    sp.minimum_stock,
    COALESCE(SUM(sm.quantity), 0) AS current_stock,
    (COALESCE(SUM(sm.quantity), 0) * sp.purchase_price) AS stock_value,
    CASE
        WHEN COALESCE(SUM(sm.quantity), 0) <= 0 THEN 'OUT_OF_STOCK'
        WHEN COALESCE(SUM(sm.quantity), 0) <= sp.minimum_stock THEN 'LOW'
        ELSE 'OK'
    END AS stock_status,
    sp.active
FROM public.stamp_products sp
LEFT JOIN public.stamp_stock_movements sm ON sm.stamp_product_id = sp.id
GROUP BY sp.id, sp.name, sp.denomination, sp.purchase_price, sp.sale_price, sp.minimum_stock, sp.active;

-- 9. Service Revenue Distribution View
CREATE OR REPLACE VIEW public.v_service_revenue AS
SELECT
    s.id AS service_id,
    s.name AS service_name,
    sc.name AS category_name,
    COUNT(so.id) AS total_orders,
    COALESCE(SUM(so.net_amount), 0.00) AS total_revenue
FROM public.services s
LEFT JOIN public.service_categories sc ON sc.id = s.category_id
LEFT JOIN public.service_orders so ON so.service_id = s.id AND so.status != 'cancelled'
GROUP BY s.id, s.name, sc.name;

-- 10. Tax Deadlines View with Urgency Status
CREATE OR REPLACE VIEW public.v_tax_deadlines AS
SELECT
    td.id,
    td.title,
    td.tax_year,
    td.deadline_date,
    td.statutory_body,
    td.description,
    (td.deadline_date - CURRENT_DATE) AS days_remaining,
    CASE
        WHEN (td.deadline_date - CURRENT_DATE) < 0 THEN 'OVERDUE'
        WHEN (td.deadline_date - CURRENT_DATE) <= 7 THEN 'CRITICAL'
        WHEN (td.deadline_date - CURRENT_DATE) <= 30 THEN 'UPCOMING'
        ELSE 'FUTURE'
    END AS urgency_status,
    td.active
FROM public.tax_deadlines td
WHERE td.active = true;

-- 11. Complete Executive Dashboard KPI Summary View
CREATE OR REPLACE VIEW public.v_dashboard_summary AS
SELECT
    (SELECT COALESCE(SUM(current_balance), 0.00) FROM public.v_account_balances) AS total_treasury_cash,
    (SELECT COALESCE(SUM(current_balance), 0.00) FROM public.v_account_balances WHERE account_type = 'cash') AS physical_cash_in_drawer,
    (SELECT COALESCE(SUM(current_balance), 0.00) FROM public.v_account_balances WHERE account_type = 'bank') AS bank_reserve,
    (SELECT COALESCE(SUM(total_income), 0.00) FROM public.v_daily_cash_summary WHERE business_date = CURRENT_DATE) AS today_cash_in,
    (SELECT COALESCE(SUM(total_expense), 0.00) FROM public.v_daily_cash_summary WHERE business_date = CURRENT_DATE) AS today_cash_out,
    (SELECT COALESCE(SUM(outstanding_balance), 0.00) FROM public.v_client_balances) AS total_client_receivables,
    (SELECT COALESCE(SUM(stock_value), 0.00) FROM public.v_stamp_current_stock) AS total_stamp_stock_value,
    (SELECT COUNT(*) FROM public.v_stamp_current_stock WHERE stock_status IN ('LOW', 'OUT_OF_STOCK')) AS low_stock_alerts_count,
    (SELECT COUNT(*) FROM public.tax_cases WHERE status IN ('documents_required', 'in_progress', 'ready_to_file')) AS pending_tax_cases_count,
    (SELECT COUNT(*) FROM public.tasks WHERE status != 'completed' AND due_date <= CURRENT_DATE) AS overdue_tasks_count;
