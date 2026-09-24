-- ==============================================================================
-- seed.sql
-- Project: CH Office Management System
-- Business: CH Composing E-Stamp & Tax Advisor, Chamber 121, Kachahri Sahiwal
-- Realistic Seed Data for Sahiwal Legal & Tax Practice
-- ==============================================================================

-- 1. Roles
INSERT INTO public.roles (name, description) VALUES
    ('Admin', 'Complete Chamber Office Management and Audit Control'),
    ('Tax Consultant', 'Advocate High Court / FBR Tax Filing and Case Law Advisor'),
    ('Accountant', 'Chamber Cashier and Double-Entry Ledger Bookkeeper'),
    ('Stamp Vendor', 'Licensed E-Stamp and Stamp Paper Stock Manager'),
    ('Staff', 'Composing Operator and Front-Desk Assistant')
ON CONFLICT (name) DO NOTHING;

-- 2. Core Permissions
INSERT INTO public.permissions (code, module, description) VALUES
    ('finance.view', 'Finance', 'View ledger and account balances'),
    ('finance.transact', 'Finance', 'Record cash in, cash out and transfers'),
    ('finance.reverse', 'Finance', 'Reverse financial transactions'),
    ('finance.close_day', 'Finance', 'Perform daily closing reconciliation'),
    ('stamps.view', 'Stamps', 'View stamp inventory and movements'),
    ('stamps.transact', 'Stamps', 'Record stamp purchases and counter sales'),
    ('stamps.adjust', 'Stamps', 'Perform stock audits and adjustments'),
    ('tax.view', 'Tax', 'View client tax cases and documents'),
    ('tax.manage', 'Tax', 'File returns and update IRIS case statuses'),
    ('clients.manage', 'Clients', 'Create and modify client directory profiles'),
    ('services.order', 'Services', 'Book composing and typing service orders'),
    ('system.audit', 'Settings', 'Inspect immutable audit logs')
ON CONFLICT (code) DO NOTHING;

-- Map Admin to all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- 3. Payment Accounts (Chamber Treasury & Digital Wallets)
INSERT INTO public.payment_accounts (id, name, account_type, account_number, bank_name, opening_balance, active)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Chamber Cash Drawer (Chamber 121)', 'cash', 'CASH-DRW-121', 'Cash in Hand', 50000.00, true),
    ('a0000000-0000-0000-0000-000000000002', 'Meezan Bank - High Street Sahiwal', 'bank', '0281-0104829101', 'Meezan Bank Ltd', 250000.00, true),
    ('a0000000-0000-0000-0000-000000000003', 'JazzCash Business - 03006925121', 'jazzcash', '03006925121', 'Mobilink Microfinance', 35000.00, true),
    ('a0000000-0000-0000-0000-000000000004', 'EasyPaisa Merchant - 03006925121', 'easypaisa', '03006925121', 'Telenor Bank', 20000.00, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Payment Methods
INSERT INTO public.payment_methods (name, code, active) VALUES
    ('Cash (Chamber Counter)', 'cash', true),
    ('Meezan Bank Transfer', 'bank_meezan', true),
    ('JazzCash Mobile Wallet', 'jazzcash', true),
    ('EasyPaisa Mobile Wallet', 'easypaisa', true),
    ('Bank Cheque / Pay Order', 'cheque', true)
ON CONFLICT (code) DO NOTHING;

-- 5. Stamp Denominations (Punjab E-Stamp & Judicial Papers)
INSERT INTO public.stamp_products (id, name, denomination, purchase_price, sale_price, minimum_stock, active)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Stamp Paper Rs. 50', 50, 48.00, 50.00, 50, true),
    ('b0000000-0000-0000-0000-000000000002', 'Stamp Paper Rs. 100', 100, 96.00, 100.00, 50, true),
    ('b0000000-0000-0000-0000-000000000003', 'Stamp Paper Rs. 200', 200, 192.00, 200.00, 30, true),
    ('b0000000-0000-0000-0000-000000000004', 'Stamp Paper Rs. 500', 500, 480.00, 500.00, 25, true),
    ('b0000000-0000-0000-0000-000000000005', 'Stamp Paper Rs. 1000', 1000, 960.00, 1000.00, 20, true),
    ('b0000000-0000-0000-0000-000000000006', 'Stamp Paper Rs. 1200', 1200, 1150.00, 1200.00, 15, true),
    ('b0000000-0000-0000-0000-000000000007', 'Stamp Paper Rs. 1500', 1500, 1440.00, 1500.00, 15, true),
    ('b0000000-0000-0000-0000-000000000008', 'Stamp Paper Rs. 2000', 2000, 1920.00, 2000.00, 10, true)
ON CONFLICT (denomination) DO NOTHING;

-- Initial Opening Stock Movements for Stamp Products
INSERT INTO public.stamp_stock_movements (stamp_product_id, movement_type, quantity, reference_type, notes)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'opening', 150, 'opening', 'Opening inventory batch'),
    ('b0000000-0000-0000-0000-000000000002', 'opening', 200, 'opening', 'Opening inventory batch'),
    ('b0000000-0000-0000-0000-000000000003', 'opening', 80, 'opening', 'Opening inventory batch'),
    ('b0000000-0000-0000-0000-000000000004', 'opening', 60, 'opening', 'Opening inventory batch'),
    ('b0000000-0000-0000-0000-000000000005', 'opening', 40, 'opening', 'Opening inventory batch'),
    ('b0000000-0000-0000-0000-000000000006', 'opening', 25, 'opening', 'Opening inventory batch'),
    ('b0000000-0000-0000-0000-000000000007', 'opening', 20, 'opening', 'Opening inventory batch'),
    ('b0000000-0000-0000-0000-000000000008', 'opening', 15, 'opening', 'Opening inventory batch')
ON CONFLICT DO NOTHING;

-- 6. Service Categories & Catalog (CH Composing & Legal Services)
INSERT INTO public.service_categories (id, name, description) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'FBR Tax Consultancy', 'Income tax, sales tax and IRIS compliance filing'),
    ('c0000000-0000-0000-0000-000000000002', 'Legal Composing & Drafting', 'Urdu/English legal agreements, plaints and petitions'),
    ('c0000000-0000-0000-0000-000000000003', 'E-Stamp & Challan Services', 'Punjab E-Stamp 32-A Challan generation and printout'),
    ('c0000000-0000-0000-0000-000000000004', 'Business Registration', 'SECP, NTN, PRA and Chamber of Commerce registration')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.services (category_id, name, default_price, active) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Individual Income Tax Return Filing (Salaried)', 2500.00, true),
    ('c0000000-0000-0000-0000-000000000001', 'Business Income Tax Return Filing (Trader/AOP)', 6000.00, true),
    ('c0000000-0000-0000-0000-000000000001', 'FBR NTN Registration (Individual/Business)', 1500.00, true),
    ('c0000000-0000-0000-0000-000000000001', 'FBR Audit Notice Reply & Legal Representation', 12000.00, true),
    ('c0000000-0000-0000-0000-000000000002', 'Sale Deed / Iqraarnama Urdu Legal Composing', 2000.00, true),
    ('c0000000-0000-0000-0000-000000000002', 'Rent Agreement Drafting with Notary Stamp', 1200.00, true),
    ('c0000000-0000-0000-0000-000000000002', 'Affidavit / Bayan-e-Halafi Composing', 500.00, true),
    ('c0000000-0000-0000-0000-000000000002', 'Power of Attorney (Mukhtar Nama) Drafting', 2500.00, true),
    ('c0000000-0000-0000-0000-000000000003', 'E-Stamp 32-A Form Generation & Verification', 500.00, true),
    ('c0000000-0000-0000-0000-000000000004', 'PRA (Punjab Revenue Authority) Sales Tax Reg', 7500.00, true)
ON CONFLICT DO NOTHING;

-- 7. Vendors (Sahiwal District Vendors)
INSERT INTO public.vendors (name, contact_person, mobile, city, address) VALUES
    ('State Bank of Pakistan / National Bank Sahiwal', 'Treasury Officer', '040-9200145', 'Sahiwal', 'Main Branch, Civil Lines, Sahiwal'),
    ('Al-Madina Paper Mart & Stationers', 'Haji Muhammad Shafiq', '0301-7128456', 'Sahiwal', 'Old Grain Market, Near Jinnah Chowk, Sahiwal'),
    ('Gulgashat Power UPS & Computer Solutions', 'Kashif Rasheed', '0300-9694121', 'Sahiwal', 'Liaquat Road, Saddar Sahiwal')
ON CONFLICT DO NOTHING;

-- 8. Expense Categories
INSERT INTO public.expense_categories (name, description) VALUES
    ('Chamber Rent & Maintenance', 'Chamber 121 Bar Association monthly charges and utilities'),
    ('Printing & Stationery Supplies', 'Legal bond paper, toner cartridges and ribbons'),
    ('Electricity & UPS Battery Backup', 'WAPDA bill and chamber emergency power expenses'),
    ('Office Refreshment & Tea', 'Chamber tea and entertainment for visiting clients'),
    ('Internet & Communication', 'Chamber broadband optical fiber and mobile balance')
ON CONFLICT (name) DO NOTHING;

-- 9. Sahiwal Clients Master
INSERT INTO public.clients (id, client_code, full_name, mobile, cnic, ntn, business_name, city, address, status)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'CL-0001', 'Chaudhry Tariq Mehmood', '0300-8692145', '36502-1829471-1', '2819401-2', 'Mehmood Cotton Ginners Sahiwal', 'Sahiwal', 'Grain Market Road, Sahiwal', 'active'),
    ('d0000000-0000-0000-0000-000000000002', 'CL-0002', 'Malik Zafar Iqbal', '0302-6912384', '36502-4918231-3', '1948271-9', 'Zafar Rice Mills & Trading Co', 'Sahiwal', 'G.T. Road, Near bypass, Sahiwal', 'active'),
    ('d0000000-0000-0000-0000-000000000003', 'CL-0003', 'Rana Sajid Ali Advocate', '0301-7918234', '36502-3918274-5', NULL, 'Sajid Law Chambers', 'Sahiwal', 'Chamber No. 84, Kachahri Sahiwal', 'active'),
    ('d0000000-0000-0000-0000-000000000004', 'CL-0004', 'Dr. Farhan Akram', '0333-6921849', '36502-8491823-7', '3918402-4', 'Farhan Medical Complex', 'Sahiwal', 'Farid Town, Block B, Sahiwal', 'active'),
    ('d0000000-0000-0000-0000-000000000005', 'CL-0005', 'Sheikh Mian Nadeem', '0321-6948201', '36502-5819203-9', '1829304-1', 'Al-Rehman Cloth House', 'Sahiwal', 'Liaquat Bazar, Sahiwal', 'active')
ON CONFLICT (id) DO NOTHING;

-- 10. Statutory Tax Deadlines (FBR Calendar for Chamber 121 Clients)
INSERT INTO public.tax_deadlines (title, tax_year, deadline_date, statutory_body, description, penalty_details)
VALUES
    ('Annual Income Tax Return (Salaried & Business)', '2024', CURRENT_DATE + INTERVAL '20 days', 'FBR', 'Statutory deadline for filing tax year 2024 returns on IRIS portal', 'Penalty under section 182: 0.1% of tax payable per day of default'),
    ('Monthly Sales Tax Statement (PRA Punjab)', '2024', CURRENT_DATE + INTERVAL '12 days', 'PRA', 'Monthly sales tax on services invoice filing under PRA rules', 'Default surcharge and fine under Punjab Sales Tax on Services Act'),
    ('Quarterly Advance Tax Challan u/s 147', '2025', CURRENT_DATE + INTERVAL '45 days', 'FBR', 'Corporate & AOP advance tax installment payment', 'Additional penalty u/s 205 of Income Tax Ordinance 2001')
ON CONFLICT DO NOTHING;

-- 11. Business Settings Default Record
INSERT INTO public.business_settings (
    id,
    business_name,
    legal_name,
    chamber_address,
    phone,
    whatsapp,
    email,
    ntn_number,
    receipt_header,
    receipt_footer,
    currency,
    timezone
) VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'CH Composing E-Stamp & Tax Advisor',
    'CH Composing E-Stamp & Tax Consultancy',
    'Chamber No. 121, District & Sessions Courts (Kachahri), Sahiwal',
    '0300-6925121',
    '0300-6925121',
    'ch.tax.advisor@gmail.com',
    '2938471-5',
    'CH COMPOSING E-STAMP & TAX ADVISOR',
    'Official Computerized Receipt • Chamber 121, Kachahri Sahiwal • Tel: 0300-6925121',
    'PKR',
    'Asia/Karachi'
) ON CONFLICT (id) DO NOTHING;
