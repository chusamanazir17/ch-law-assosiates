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
  let query = supabase.from("clients").select("*").order("created_at", { ascending: false });

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
    .maybeSingle();

  if (error) {
    console.error("[ClientsService] getClientById error:", error);
    throw new Error(`Failed to load client: ${error.message}`);
  }

  return client as (Client & { contacts?: ClientContact[]; notes?: ClientNote[] }) | null;
}

export async function createClientRecord(dto: CreateClientDTO): Promise<Client> {
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      full_name: dto.full_name.trim(),
      business_name: dto.business_name ? dto.business_name.trim() : null,
      client_type: dto.client_type || "individual",
      cnic: dto.cnic ? dto.cnic.trim() : null,
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

export async function updateClientRecord(id: string, updates: Partial<CreateClientDTO>): Promise<Client | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[ClientsService] updateClientRecord error:", error);
    throw new Error(`Failed to update client: ${error.message}`);
  }

  return data as Client;
}

export async function deleteClientRecord(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete client: ${error.message}`);
  }
}
