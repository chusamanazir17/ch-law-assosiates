import { createClient } from "@/lib/supabase/server";
import type { StampProduct, StampMovement } from "@/types/office";

export interface CreateStampProductDTO {
  name: string;
  denomination: number;
  purchase_price: number;
  sale_price: number;
  current_stock?: number;
  minimum_stock?: number;
}

export interface RecordStampMovementDTO {
  stampProductId: string;
  movementType: "opening" | "purchase" | "sale" | "adjustment_in" | "adjustment_out" | "reversal";
  quantity: number;
  unitPrice?: number;
  clientId?: string | null;
  clientName?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdBy?: string | null;
}

export async function listStampProducts(): Promise<StampProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stamp_products")
    .select("*")
    .eq("active", true)
    .order("denomination", { ascending: true });

  if (error) {
    console.error("[StampsService] listStampProducts error:", error);
    throw new Error(`Failed to load stamp products: ${error.message}`);
  }

  return (data || []) as StampProduct[];
}

export async function createStampProduct(dto: CreateStampProductDTO): Promise<StampProduct> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stamp_products")
    .insert({
      name: dto.name.trim(),
      denomination: dto.denomination,
      purchase_price: dto.purchase_price,
      sale_price: dto.sale_price,
      current_stock: dto.current_stock || 0,
      minimum_stock: dto.minimum_stock || 20,
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("[StampsService] createStampProduct error:", error);
    throw new Error(`Failed to create stamp product: ${error.message}`);
  }

  return data as StampProduct;
}

export async function updateStampProduct(id: string, updates: Partial<CreateStampProductDTO>): Promise<StampProduct> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stamp_products")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[StampsService] updateStampProduct error:", error);
    throw new Error(`Failed to update stamp product: ${error.message}`);
  }

  return data as StampProduct;
}

export async function listStampMovements(filter?: {
  stampProductId?: string;
  movementType?: string;
  limit?: number;
}): Promise<StampMovement[]> {
  const supabase = await createClient();
  let query = supabase
    .from("stamp_stock_movements")
    .select(`
      *,
      stamp:stamp_products(denomination),
      client:clients(full_name),
      user:profiles(full_name)
    `)
    .order("created_at", { ascending: false });

  if (filter?.stampProductId) {
    query = query.eq("stamp_product_id", filter.stampProductId);
  }

  if (filter?.movementType && filter.movementType !== "ALL") {
    query = query.eq("movement_type", filter.movementType as any);
  }

  if (filter?.limit) {
    query = query.limit(filter.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[StampsService] listStampMovements error:", error);
    throw new Error(`Failed to load stamp movements: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    ...row,
    denomination: row.stamp?.denomination,
    client_name: row.client?.full_name,
    user: row.user?.full_name,
  })) as StampMovement[];
}

export async function recordStampMovement(dto: RecordStampMovementDTO): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("stamp_stock_movements")
    .insert({
      stamp_product_id: dto.stampProductId,
      movement_type: dto.movementType,
      quantity: dto.quantity,
      unit_price: dto.unitPrice || null,
      client_id: dto.clientId || null,
      reference_type: dto.referenceType || null,
      reference_id: dto.referenceId || null,
      notes: dto.notes || (dto.clientName ? `${dto.movementType} - ${dto.clientName}` : null),
      created_by: dto.createdBy || null,
    });

  if (error) {
    console.error("[StampsService] recordStampMovement error:", error);
    throw new Error(`Failed to record stamp movement: ${error.message}`);
  }
}
