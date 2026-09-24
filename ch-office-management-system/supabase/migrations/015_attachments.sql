-- ==============================================================================
-- 015_attachments.sql
-- Project: CH Office Management System
-- Step 15: Generic File & Attachment Metadata
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    reference_type TEXT NOT NULL,
    reference_id UUID NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_ref ON public.attachments(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploader ON public.attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_bucket ON public.attachments(bucket);
