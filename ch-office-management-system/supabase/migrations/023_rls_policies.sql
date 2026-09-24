-- ==============================================================================
-- 023_rls_policies.sql
-- Project: CH Office Management System
-- Step 23: Row Level Security (RLS) on EVERY Business Table
-- Role Profiles: Admin, Tax Consultant, Accountant, Stamp Vendor, Staff
-- ==============================================================================

-- 1. Helper Security Functions (STABLE, SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.current_user_has_role(p_role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
          AND r.name = p_role_name
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT public.current_user_has_role('Admin');
$$;

CREATE OR REPLACE FUNCTION public.is_office_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
    );
$$;

-- 2. Enable RLS on All Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_adjustments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.stamp_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_adjustments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tax_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_tasks ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.daily_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. Define Policies
-- ==============================================================================

-- PROFILES
CREATE POLICY "Profiles viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles"
ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- ROLES & PERMISSIONS
CREATE POLICY "Roles viewable by authenticated staff"
ON public.roles FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Permissions viewable by authenticated staff"
ON public.permissions FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Admin manage roles and permissions"
ON public.roles FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Admin manage user roles"
ON public.user_roles FOR ALL TO authenticated USING (public.is_admin());

-- CLIENTS
CREATE POLICY "Office staff can view clients"
ON public.clients FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff can create clients"
ON public.clients FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

CREATE POLICY "Staff can update clients"
ON public.clients FOR UPDATE TO authenticated USING (public.is_office_staff());

CREATE POLICY "Admin can delete clients"
ON public.clients FOR DELETE TO authenticated USING (public.is_admin());

-- CLIENT CONTACTS & NOTES & DOCS
CREATE POLICY "Staff view client details"
ON public.client_contacts FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff manage client contacts"
ON public.client_contacts FOR ALL TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff view client notes"
ON public.client_notes FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff insert client notes"
ON public.client_notes FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

CREATE POLICY "Staff view client documents"
ON public.client_documents FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff upload client documents"
ON public.client_documents FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

-- SERVICES & ORDERS
CREATE POLICY "Staff view services"
ON public.services FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff view service categories"
ON public.service_categories FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff manage service orders"
ON public.service_orders FOR ALL TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff manage order items"
ON public.service_order_items FOR ALL TO authenticated USING (public.is_office_staff());

-- FINANCIAL LEDGER & ACCOUNTS
-- Accountants & Admins have full access; Stamp vendors & staff have read/create for operational duties
CREATE POLICY "Staff view payment accounts"
ON public.payment_accounts FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff view payment methods"
ON public.payment_methods FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff view financial transactions"
ON public.financial_transactions FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff create financial transactions"
ON public.financial_transactions FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

CREATE POLICY "Only admin/accountant can update/reverse transactions"
ON public.financial_transactions FOR UPDATE TO authenticated
USING (public.current_user_has_role('Admin') OR public.current_user_has_role('Accountant'));

CREATE POLICY "No hard deletion of financial transactions"
ON public.financial_transactions FOR DELETE TO authenticated USING (false);

CREATE POLICY "Staff view transaction entries"
ON public.transaction_entries FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff insert transaction entries"
ON public.transaction_entries FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

CREATE POLICY "No deletion of transaction entries"
ON public.transaction_entries FOR DELETE TO authenticated USING (false);

-- EXPENSES
CREATE POLICY "Staff view expenses"
ON public.expenses FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff create expenses"
ON public.expenses FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

CREATE POLICY "Admin/Accountant manage expenses"
ON public.expenses FOR UPDATE TO authenticated 
USING (public.current_user_has_role('Admin') OR public.current_user_has_role('Accountant'));

CREATE POLICY "Staff view expense categories and vendors"
ON public.expense_categories FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff view vendors"
ON public.vendors FOR SELECT TO authenticated USING (public.is_office_staff());

-- RECEIPTS
CREATE POLICY "Staff view receipts"
ON public.receipts FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff issue receipts"
ON public.receipts FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

CREATE POLICY "Staff cancel receipts with reason"
ON public.receipts FOR UPDATE TO authenticated USING (public.is_office_staff());

CREATE POLICY "No hard deletion of receipts"
ON public.receipts FOR DELETE TO authenticated USING (false);

CREATE POLICY "Staff view receipt items"
ON public.receipt_items FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff insert receipt items"
ON public.receipt_items FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

-- STAMP INVENTORY
CREATE POLICY "Staff view stamp products"
ON public.stamp_products FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff view stamp movements"
ON public.stamp_stock_movements FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff record stamp sales and purchases"
ON public.stamp_stock_movements FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

CREATE POLICY "Staff view stamp sales"
ON public.stamp_sales FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff record stamp sales"
ON public.stamp_sales FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

CREATE POLICY "Staff view stamp purchases"
ON public.stamp_purchases FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff record stamp purchases"
ON public.stamp_purchases FOR INSERT TO authenticated WITH CHECK (public.is_office_staff());

CREATE POLICY "Admin/Vendor manage adjustments"
ON public.stamp_adjustments FOR ALL TO authenticated 
USING (public.current_user_has_role('Admin') OR public.current_user_has_role('Stamp Vendor'));

-- TAX MANAGEMENT
CREATE POLICY "Tax consultants and staff view tax cases"
ON public.tax_cases FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Tax consultants and staff manage tax cases"
ON public.tax_cases FOR ALL TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff view tax deadlines"
ON public.tax_deadlines FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff view tax case documents"
ON public.tax_case_documents FOR ALL TO authenticated USING (public.is_office_staff());

-- TASKS
CREATE POLICY "Staff view and manage tasks"
ON public.tasks FOR ALL TO authenticated USING (public.is_office_staff());

CREATE POLICY "Staff view task comments"
ON public.task_comments FOR ALL TO authenticated USING (public.is_office_staff());

-- DAILY CLOSING
CREATE POLICY "Staff view daily closings"
ON public.daily_closings FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Accountant and Admin perform daily closing"
ON public.daily_closings FOR INSERT TO authenticated 
WITH CHECK (public.current_user_has_role('Admin') OR public.current_user_has_role('Accountant'));

CREATE POLICY "Admin can reopen daily closing"
ON public.daily_closings FOR UPDATE TO authenticated USING (public.is_admin());

-- NOTIFICATIONS
CREATE POLICY "Users view own or broadcast notifications"
ON public.notifications FOR SELECT TO authenticated 
USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can mark own notifications as read"
ON public.notifications FOR UPDATE TO authenticated 
USING (user_id = auth.uid());

-- AUDIT LOGS
CREATE POLICY "Staff can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "System/Staff append audit logs"
ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "No one can update or delete audit logs"
ON public.audit_logs FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No one can delete audit logs"
ON public.audit_logs FOR DELETE TO authenticated USING (false);

-- SETTINGS
CREATE POLICY "Staff view business settings"
ON public.business_settings FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Admin manage business settings"
ON public.business_settings FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Staff view system settings"
ON public.system_settings FOR SELECT TO authenticated USING (public.is_office_staff());

CREATE POLICY "Admin manage system settings"
ON public.system_settings FOR ALL TO authenticated USING (public.is_admin());
