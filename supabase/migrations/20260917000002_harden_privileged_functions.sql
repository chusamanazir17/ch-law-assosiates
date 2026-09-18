-- Harden SECURITY DEFINER functions used by the reminder subsystem.
-- Worker-only functions must never be callable through the anon or ordinary
-- authenticated API roles because they bypass table RLS by design.

ALTER FUNCTION public.check_rate_limit(TEXT, INT, INT)
  SET search_path = public;

ALTER FUNCTION public.is_admin(UUID)
  SET search_path = public;

ALTER FUNCTION public.claim_reminder_deliveries(INT)
  SET search_path = public;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;

REVOKE ALL ON FUNCTION public.claim_reminder_deliveries(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_reminder_deliveries(INT) TO service_role;

-- Admin authorization is required by authenticated browser sessions and RLS.
-- Keep it callable for authenticated users, but remove anonymous access.
REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, service_role;
