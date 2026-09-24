-- ==============================================================================
-- tests/001_auth_permissions.sql
-- Test Suite 1: Authentication, Roles and Permission Hierarchy
-- ==============================================================================

BEGIN;

-- 1. Verify standard roles exist
DO $$
BEGIN
    ASSERT (SELECT count(*) FROM public.roles WHERE name IN ('Admin', 'Tax Consultant', 'Accountant', 'Stamp Vendor', 'Staff')) = 5,
        'FAIL: All 5 essential business roles must exist.';
END $$;

-- 2. Verify permissions exist
DO $$
BEGIN
    ASSERT (SELECT count(*) FROM public.permissions WHERE module IN ('Finance', 'Stamps', 'Tax', 'Clients', 'Settings')) >= 10,
        'FAIL: Core system permissions must be populated.';
END $$;

ROLLBACK;
