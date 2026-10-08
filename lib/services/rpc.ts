import "server-only";

/**
 * Thin wrapper around supabase.rpc for the atomic backend functions added in
 * migration 20261008000002_backend_integrity.sql.
 *
 * If the migration has not been applied yet, PostgREST answers "Could not
 * find the function" — surface that as an actionable error instead of a
 * cryptic 404, and fail closed (never silently fall back to the old
 * non-atomic multi-write flows).
 */
export async function callRpc<T>(
  supabase: any,
  fn: string,
  args: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    const msg = String(error.message || "");
    if (/PGRST202|Could not find the function/i.test(msg)) {
      throw new Error(
        `Database function "${fn}" is missing. Apply migration ` +
          `20261008000002_backend_integrity.sql in the Supabase SQL editor, then retry.`
      );
    }
    throw new Error(`Database error in ${fn}: ${msg || "unknown error"}`);
  }
  return data as T;
}

/** Collision-safe human-facing document numbers (FIN-12). */
export async function nextDocumentNumber(
  supabase: any,
  kind:
    | "invoice"
    | "payment_receipt"
    | "ledger"
    | "receipt"
    | "tax_case"
    | "service_order"
): Promise<string> {
  return callRpc<string>(supabase, "next_document_number", { p_kind: kind });
}
