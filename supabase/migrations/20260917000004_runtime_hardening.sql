-- Final runtime hardening for public inquiry submission and evergreen seed data.

CREATE OR REPLACE FUNCTION public.submit_consultation_inquiry(
  p_name TEXT,
  p_phone TEXT,
  p_service_needed TEXT,
  p_message TEXT,
  p_rate_key TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_allowed BOOLEAN;
  v_name TEXT := trim(coalesce(p_name, ''));
  v_phone TEXT := trim(coalesce(p_phone, ''));
  v_service TEXT := trim(coalesce(p_service_needed, ''));
  v_message TEXT := trim(coalesce(p_message, ''));
BEGIN
  IF char_length(v_name) < 2 OR char_length(v_name) > 100 THEN
    RAISE EXCEPTION 'INVALID_NAME' USING ERRCODE = '22023';
  END IF;

  IF char_length(v_phone) < 7 OR char_length(v_phone) > 24
     OR v_phone !~ '^[+()0-9[:space:]-]+$' THEN
    RAISE EXCEPTION 'INVALID_PHONE' USING ERRCODE = '22023';
  END IF;

  IF v_service NOT IN (
    'Tax Services',
    'E-Stamping',
    'Property Services',
    'Business Registration',
    'Legal Documentation'
  ) THEN
    RAISE EXCEPTION 'INVALID_SERVICE' USING ERRCODE = '22023';
  END IF;

  IF char_length(v_message) > 1500 THEN
    RAISE EXCEPTION 'MESSAGE_TOO_LONG' USING ERRCODE = '22023';
  END IF;

  v_allowed := public.check_rate_limit(
    'inquiry_' || left(coalesce(nullif(trim(p_rate_key), ''), 'unknown'), 160),
    5,
    600
  );

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.consultation_inquiries (
    name,
    phone,
    service_needed,
    message,
    status
  ) VALUES (
    v_name,
    v_phone,
    v_service,
    nullif(v_message, ''),
    'new'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Public clients submit through the Next.js API. Only the server-side service
-- client can execute the privileged insert RPC directly.
REVOKE ALL ON FUNCTION public.submit_consultation_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_consultation_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.submit_consultation_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.submit_consultation_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- Remove the stale year from the original example post without changing its slug.
UPDATE public.posts
SET title = 'Complete Guide to E-Stamping & Property Registration in Punjab',
    updated_at = now()
WHERE slug = 'complete-guide-e-stamping-property-registration-punjab'
  AND title = 'Complete Guide to E-Stamping & Property Registration in Punjab (2024)';
