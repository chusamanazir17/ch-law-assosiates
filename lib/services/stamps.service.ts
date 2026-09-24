import { getAdminDatabaseClient } from "@/lib/supabase/service";
import type { StampProduct, StampMovement } from "@/types/office";

const isUuid = (str: any): boolean =>
  typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

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
  const supabase = await getAdminDatabaseClient();
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
  const supabase = await getAdminDatabaseClient();
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

export async function updateStampProduct(id: string, updates: Partial<CreateStampProductDTO>): Promise<StampProduct | null> {
  if (!isUuid(id)) return null;
  const supabase = await getAdminDatabaseClient();
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
  const supabase = await getAdminDatabaseClient();
  let query = supabase
    .from("stamp_stock_movements")
    .select(`
      *,
      stamp:stamp_products(denomination),
      client:clients(full_name),
      user:profiles(full_name)
    `)
    .order("created_at", { ascending: false });

  if (filter?.stampProductId && isUuid(filter.stampProductId)) {
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
  const supabase = await getAdminDatabaseClient();

  // Resolve target stamp product
  let targetProductId = dto.stampProductId;
  let targetProduct: any = null;

  if (isUuid(targetProductId)) {
    const { data } = await supabase.from("stamp_products").select("*").eq("id", targetProductId).maybeSingle();
    targetProduct = data;
  } else {
    // Try resolving by numeric denomination or fallback
    const numericDenom = parseInt(targetProductId.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numericDenom)) {
      const { data } = await supabase.from("stamp_products").select("*").eq("denomination", numericDenom).maybeSingle();
      if (data) {
        targetProductId = data.id;
        targetProduct = data;
      }
    }
  }

  if (!targetProduct || !isUuid(targetProductId)) {
    const { data: fallback } = await supabase.from("stamp_products").select("*").limit(1).maybeSingle();
    if (fallback) {
      targetProductId = fallback.id;
      targetProduct = fallback;
    } else {
      throw new Error("No stamp product found for this movement.");
    }
  }

  const sanitizedClientId = dto.clientId && isUuid(dto.clientId) ? dto.clientId : null;
  const sanitizedCreatedBy = dto.createdBy && isUuid(dto.createdBy) ? dto.createdBy : null;
  const qty = Math.abs(dto.quantity);

  const { error } = await supabase
    .from("stamp_stock_movements")
    .insert({
      stamp_product_id: targetProductId,
      movement_type: dto.movementType,
      quantity: dto.movementType === "sale" || dto.movementType === "adjustment_out" ? -qty : qty,
      unit_price: dto.unitPrice || targetProduct.sale_price || null,
      client_id: sanitizedClientId,
      reference_type: dto.referenceType || null,
      reference_id: dto.referenceId || null,
      notes: dto.notes || (dto.clientName ? `${dto.movementType} - ${dto.clientName}` : null),
      created_by: sanitizedCreatedBy,
    });

  if (error) {
    console.error("[StampsService] recordStampMovement error:", error);
    throw new Error(`Failed to record stamp movement: ${error.message}`);
  }

  // Update real-time current_stock in stamp_products
  const current = Number(targetProduct.current_stock || 0);
  let nextStock = current;
  if (dto.movementType === "sale" || dto.movementType === "adjustment_out") {
    nextStock = Math.max(0, current - qty);
  } else if (dto.movementType === "purchase" || dto.movementType === "opening" || dto.movementType === "adjustment_in") {
    nextStock = current + qty;
  }

  const { error: stockUpdateError } = await supabase
    .from("stamp_products")
    .update({ current_stock: nextStock, updated_at: new Date().toISOString() })
    .eq("id", targetProductId);

  if (stockUpdateError) {
    console.warn("[StampsService] current_stock update warning:", stockUpdateError.message);
  }
}
