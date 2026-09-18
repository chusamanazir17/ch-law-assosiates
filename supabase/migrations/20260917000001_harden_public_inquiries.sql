-- Route public consultation submissions through a single rate-limited function.
-- This prevents callers from bypassing the application endpoint and inserting
-- directly into consultation_inquiries with the public anon key.

DROP POLICY IF EXISTS "Public can submit consultation inquiries"
  ON public.consultation_inquiries;

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
BEGIN
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
    left(trim(p_name), 100),
    left(trim(p_phone), 50),
    left(trim(p_service_needed), 100),
    nullif(left(trim(coalesce(p_message, '')), 2000), ''),
    'new'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_consultation_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_consultation_inquiry(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
