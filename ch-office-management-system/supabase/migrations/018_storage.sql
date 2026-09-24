-- ==============================================================================
-- 018_storage.sql
-- Project: CH Office Management System
-- Step 18: Supabase Storage Buckets and Security Configuration
-- Note: Sensitive client/tax records are strictly private with signed URL access.
-- ==============================================================================

-- Create Storage Buckets in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('client-documents', 'client-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('tax-documents', 'tax-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
    ('expense-receipts', 'expense-receipts', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('service-files', 'service-files', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
    ('stamp-documents', 'stamp-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('generated-receipts', 'generated-receipts', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('generated-reports', 'generated-reports', false, 52428800, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']),
    ('user-avatars', 'user-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('business-assets', 'business-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies for Authenticated Office Staff
-- 1. Public Read for public assets
CREATE POLICY "Public Assets Viewable"
ON storage.objects FOR SELECT
USING (bucket_id IN ('user-avatars', 'business-assets'));

-- 2. Authenticated Staff can view private documents
CREATE POLICY "Authenticated Staff View Private Docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id IN (
        'client-documents',
        'tax-documents',
        'expense-receipts',
        'service-files',
        'stamp-documents',
        'generated-receipts',
        'generated-reports',
        'user-avatars',
        'business-assets'
    )
);

-- 3. Authenticated Staff can upload documents
CREATE POLICY "Authenticated Staff Upload Docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id IN (
        'client-documents',
        'tax-documents',
        'expense-receipts',
        'service-files',
        'stamp-documents',
        'generated-receipts',
        'generated-reports',
        'user-avatars',
        'business-assets'
    )
);

-- 4. Authorized Staff can update or delete their documents
CREATE POLICY "Authenticated Staff Update Own Docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

CREATE POLICY "Admin Delete Storage Docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid() AND r.name = 'Admin'
    )
);
