import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { Client, ClientContact, ClientNote } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export interface CreateClientDTO {
  full_name: string;
  business_name?: string | null;
  client_type?: Client["client_type"];
  cnic?: string | null;
  ntn?: string | null;
  mobile: string;
  phone?: string | null;
  email?: string | null;
  city?: string;
  address?: string | null;
  status?: Client["status"];
}

export async function listClients(searchTerm?: string): Promise<Client[]> {
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("clients")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (searchTerm && searchTerm.trim()) {
    const term = `%${searchTerm.trim()}%`;
    query = query.or(`full_name.ilike.${term},business_name.ilike.${term},mobile.ilike.${term},cnic.ilike.${term},client_code.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[ClientsService] listClients error:", error);
    throw new Error(`Failed to load clients: ${error.message}`);
  }

  return (data || []) as Client[];
}

export async function getClientById(id: string): Promise<(Client & { contacts?: ClientContact[]; notes?: ClientNote[] }) | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();
  const { data: client, error } = await supabase
    .from("clients")
    .select(`
      *,
      contacts:client_contacts(*),
      notes:client_notes(*)
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("[ClientsService] getClientById error:", error);
    throw new Error(`Failed to load client: ${error.message}`);
  }

  return client as (Client & { contacts?: ClientContact[]; notes?: ClientNote[] }) | null;
}

export async function createClientRecord(dto: CreateClientDTO): Promise<Client> {
  const supabase = await getAdminDatabaseClient();

  // SEC-06: never persist the 'XXXXXXX' placeholder as real identity data.
  const rawCnic = dto.cnic ? dto.cnic.trim() : "";
  const cnic = rawCnic && !/[xX]/.test(rawCnic) ? rawCnic : null;

  const { data, error } = await supabase
    .from("clients")
    .insert({
      full_name: dto.full_name.trim(),
      business_name: dto.business_name ? dto.business_name.trim() : null,
      client_type: dto.client_type || "individual",
      cnic,
      ntn: dto.ntn ? dto.ntn.trim() : null,
      mobile: dto.mobile ? dto.mobile.trim() : "N/A",
      phone: dto.phone ? dto.phone.trim() : null,
      email: dto.email ? dto.email.trim() : null,
      city: dto.city || "Sahiwal",
      address: dto.address ? dto.address.trim() : null,
      status: dto.status || "active",
    })
    .select()
    .single();

  if (error) {
    console.error("[ClientsService] createClientRecord error:", error);
    throw new Error(`Failed to create client: ${error.message}`);
  }

  return data as Client;
}

export async function updateClientRecord(
  id: string,
  updates: Partial<CreateClientDTO>,
  opts?: { allowedFields?: readonly string[] }
): Promise<Client | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();

  // Mass-assignment guard: only explicitly allowed fields reach the DB.
  const allowed = new Set(opts?.allowedFields || []);
  const picked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && (allowed.size === 0 || allowed.has(key))) {
      picked[key] = value;
    }
  }
  // SEC-06 on update as well.
  if (typeof picked.cnic === "string") {
    const c = picked.cnic.trim();
    picked.cnic = c && !/[xX]/.test(c) ? c : null;
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      ...picked,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[ClientsService] updateClientRecord error:", error);
    throw new Error(`Failed to update client: ${error.message}`);
  }

  return (data as Client) || null;
}

export async function deleteClientRecord(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const supabase = await getAdminDatabaseClient();

  // A client with live (non-deleted) cases cannot be deleted — 409, not a
  // silent FK 500. Historical clients should be archived (status) instead.
  const { data: liveCases, error: casesError } = await supabase
    .from("case_clients")
    .select("case_id, cases!inner(id, deleted_at)")
    .eq("client_id", id)
    .is("cases.deleted_at", null)
    .limit(1);

  if (casesError) {
    throw new Error(`Failed to check client cases: ${casesError.message}`);
  }
  if (liveCases && liveCases.length > 0) {
    const err = new Error(
      "Cannot delete this client: they have active cases. Archive the client instead."
    );
    (err as any).statusCode = 409;
    throw err;
  }

  // Soft delete: hidden from lists, retained for financial history (invoices
  // and payments reference clients with ON DELETE RESTRICT).
  const { error } = await supabase
    .from("clients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
  if (error) {
    throw new Error(`Failed to delete client: ${error.message}`);
  }
}
