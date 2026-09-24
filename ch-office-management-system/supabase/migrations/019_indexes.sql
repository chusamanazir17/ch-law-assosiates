-- ==============================================================================
-- 019_indexes.sql
-- Project: CH Office Management System
-- Step 19: Advanced Query and Trigram Performance Indexes
-- ==============================================================================

-- Trigram Fuzzy Search Indexes for Client Directory
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON public.clients USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_business_trgm ON public.clients USING gin (business_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_mobile_trgm ON public.clients USING gin (mobile gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_cnic_trgm ON public.clients USING gin (cnic gin_trgm_ops) WHERE cnic IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_ntn_trgm ON public.clients USING gin (ntn gin_trgm_ops) WHERE ntn IS NOT NULL;

-- Composite Financial & Accounting Performance Indexes
CREATE INDEX IF NOT EXISTS idx_fin_tx_date_type ON public.financial_transactions(business_date, transaction_type);
CREATE INDEX IF NOT EXISTS idx_fin_tx_status_date ON public.financial_transactions(status, business_date);
CREATE INDEX IF NOT EXISTS idx_tx_entries_account_entry ON public.transaction_entries(account_id, entry_type, amount);

-- Receipt Lookups
CREATE INDEX IF NOT EXISTS idx_receipts_client_date ON public.receipts(client_id, issued_at);
CREATE INDEX IF NOT EXISTS idx_receipts_status_date ON public.receipts(status, issued_at);

-- Tax Compliance Calendar Indexes
CREATE INDEX IF NOT EXISTS idx_tax_cases_due_status ON public.tax_cases(due_date, status);
CREATE INDEX IF NOT EXISTS idx_tax_cases_client_year ON public.tax_cases(client_id, tax_year);

-- Task Priority & Deadlines
CREATE INDEX IF NOT EXISTS idx_tasks_due_status ON public.tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status ON public.tasks(assigned_to, status);

-- Stamp Movements Aggregations
CREATE INDEX IF NOT EXISTS idx_stamp_movements_prod_type ON public.stamp_stock_movements(stamp_product_id, movement_type);

-- Audit Investigation Index
CREATE INDEX IF NOT EXISTS idx_audit_logs_module_created ON public.audit_logs(module, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON public.audit_logs(action, created_at DESC);
