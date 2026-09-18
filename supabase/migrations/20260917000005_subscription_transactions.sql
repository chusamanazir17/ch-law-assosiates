-- Make subscription state transitions atomic. Each SECURITY DEFINER function
-- executes inside one PostgreSQL transaction and is restricted to service_role.

CREATE OR REPLACE FUNCTION public.prepare_subscription_request(
  p_name TEXT,
  p_email TEXT,
  p_category_ids UUID[],
  p_token_hash TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS TABLE (
  subscriber_id UUID,
  should_send BOOLEAN,
  is_suppressed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscriber public.subscribers%ROWTYPE;
  v_category_count INTEGER;
  v_now TIMESTAMPTZ := now();
BEGIN
  IF trim(coalesce(p_name, '')) = '' OR trim(coalesce(p_email, '')) = '' THEN
    RAISE EXCEPTION 'INVALID_SUBSCRIPTION_INPUT' USING ERRCODE = '22023';
  END IF;

  IF p_category_ids IS NULL OR cardinality(p_category_ids) < 1 OR cardinality(p_category_ids) > 20 THEN
    RAISE EXCEPTION 'INVALID_CATEGORY_SELECTION' USING ERRCODE = '22023';
  END IF;

  IF trim(coalesce(p_token_hash, '')) = '' OR p_expires_at <= v_now THEN
    RAISE EXCEPTION 'INVALID_CONFIRMATION_TOKEN' USING ERRCODE = '22023';
  END IF;

  SELECT count(DISTINCT id)
  INTO v_category_count
  FROM public.tax_categories
  WHERE id = ANY(p_category_ids)
    AND is_active = true;

  IF v_category_count <> cardinality(p_category_ids) THEN
    RAISE EXCEPTION 'INVALID_CATEGORY_SELECTION' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_subscriber
  FROM public.subscribers
  WHERE email = lower(trim(p_email))::citext
  FOR UPDATE;

  IF FOUND AND v_subscriber.status = 'suppressed' THEN
    RETURN QUERY SELECT v_subscriber.id, false, true;
    RETURN;
  END IF;

  IF NOT FOUND THEN
    INSERT INTO public.subscribers (
      name,
      email,
      status,
      consent_at,
      consent_text_version
    ) VALUES (
      trim(p_name),
      lower(trim(p_email))::citext,
      'pending',
      v_now,
      'v1.0'
    )
    RETURNING * INTO v_subscriber;
  ELSE
    -- A fresh submission records fresh consent. Active subscribers remain active
    -- until the newly requested category set is confirmed.
    UPDATE public.subscribers
    SET name = CASE
          WHEN status IN ('pending', 'unsubscribed') THEN trim(p_name)
          ELSE name
        END,
        consent_at = v_now,
        consent_text_version = 'v1.0',
        updated_at = v_now
    WHERE id = v_subscriber.id
    RETURNING * INTO v_subscriber;
  END IF;

  UPDATE public.subscription_tokens
  SET revoked_at = v_now
  WHERE subscriber_id = v_subscriber.id
    AND purpose = 'confirmation'
    AND used_at IS NULL
    AND revoked_at IS NULL;

  INSERT INTO public.subscription_tokens (
    subscriber_id,
    token_hash,
    purpose,
    metadata,
    expires_at
  ) VALUES (
    v_subscriber.id,
    p_token_hash,
    'confirmation',
    jsonb_build_object(
      'category_ids', to_jsonb(p_category_ids),
      'proposed_name', trim(p_name)
    ),
    p_expires_at
  );

  RETURN QUERY SELECT v_subscriber.id, true, false;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_confirmation_token(
  p_token_hash TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token public.subscription_tokens%ROWTYPE;
  v_category_ids UUID[];
  v_category_count INTEGER;
  v_now TIMESTAMPTZ := now();
  v_proposed_name TEXT;
BEGIN
  SELECT *
  INTO v_token
  FROM public.subscription_tokens
  WHERE token_hash = p_token_hash
    AND purpose = 'confirmation'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'invalid';
  END IF;

  IF v_token.used_at IS NOT NULL THEN
    RETURN 'already_confirmed';
  END IF;

  IF v_token.revoked_at IS NOT NULL OR v_token.expires_at <= v_now THEN
    RETURN 'expired';
  END IF;

  SELECT coalesce(array_agg(value::uuid), ARRAY[]::uuid[])
  INTO v_category_ids
  FROM jsonb_array_elements_text(coalesce(v_token.metadata->'category_ids', '[]'::jsonb)) AS category(value);

  IF cardinality(v_category_ids) < 1 OR cardinality(v_category_ids) > 20 THEN
    RETURN 'invalid';
  END IF;

  SELECT count(DISTINCT id)
  INTO v_category_count
  FROM public.tax_categories
  WHERE id = ANY(v_category_ids)
    AND is_active = true;

  IF v_category_count <> cardinality(v_category_ids) THEN
    RETURN 'categories_changed';
  END IF;

  v_proposed_name := nullif(trim(coalesce(v_token.metadata->>'proposed_name', '')), '');

  UPDATE public.subscribers
  SET status = 'active',
      confirmed_at = v_now,
      name = coalesce(v_proposed_name, name),
      updated_at = v_now
  WHERE id = v_token.subscriber_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SUBSCRIBER_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.subscriber_categories
  WHERE subscriber_id = v_token.subscriber_id;

  INSERT INTO public.subscriber_categories (subscriber_id, category_id)
  SELECT v_token.subscriber_id, category_id
  FROM unnest(v_category_ids) AS category_id;

  UPDATE public.subscription_tokens
  SET used_at = v_now
  WHERE id = v_token.id
    AND used_at IS NULL;

  UPDATE public.subscription_tokens
  SET revoked_at = v_now
  WHERE subscriber_id = v_token.subscriber_id
    AND purpose = 'confirmation'
    AND id <> v_token.id
    AND used_at IS NULL
    AND revoked_at IS NULL;

  RETURN 'confirmed';
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_unsubscribe_token(
  p_token_hash TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token public.subscription_tokens%ROWTYPE;
  v_now TIMESTAMPTZ := now();
BEGIN
  SELECT *
  INTO v_token
  FROM public.subscription_tokens
  WHERE token_hash = p_token_hash
    AND purpose = 'unsubscribe'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'invalid';
  END IF;

  IF v_token.used_at IS NOT NULL OR v_token.revoked_at IS NOT NULL OR v_token.expires_at <= v_now THEN
    RETURN 'expired';
  END IF;

  UPDATE public.subscribers
  SET status = 'unsubscribed',
      updated_at = v_now
  WHERE id = v_token.subscriber_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SUBSCRIBER_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.reminder_deliveries
  SET status = 'cancelled',
      error_details = 'Subscriber unsubscribed before delivery completed.',
      updated_at = v_now
  WHERE subscriber_id = v_token.subscriber_id
    AND status IN ('queued', 'processing');

  UPDATE public.subscription_tokens
  SET used_at = v_now
  WHERE id = v_token.id
    AND used_at IS NULL;

  UPDATE public.subscription_tokens
  SET revoked_at = v_now
  WHERE subscriber_id = v_token.subscriber_id
    AND purpose = 'unsubscribe'
    AND id <> v_token.id
    AND used_at IS NULL
    AND revoked_at IS NULL;

  RETURN 'unsubscribed';
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_subscription_request(TEXT, TEXT, UUID[], TEXT, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_subscription_request(TEXT, TEXT, UUID[], TEXT, TIMESTAMPTZ)
  TO service_role;

REVOKE ALL ON FUNCTION public.consume_confirmation_token(TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_confirmation_token(TEXT)
  TO service_role;

REVOKE ALL ON FUNCTION public.consume_unsubscribe_token(TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_unsubscribe_token(TEXT)
  TO service_role;
