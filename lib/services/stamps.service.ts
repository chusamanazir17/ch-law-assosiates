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
    .is("deleted_at", null)
    .order("denomination", { ascending: true });

  if (error) {
    console.error("[StampsService] listStampProducts error:", error);
    throw new Error(`Failed to load stamp products: ${error.message}`);
  }

  return (data || []) as StampProduct[];
}

export async function createStampProduct(dto: CreateStampProductDTO): Promise<StampProduct> {
  const supabase = await getAdminDatabaseClient();
  if (!dto.name || !dto.name.trim()) throw new Error("Product name is required.");
  if (!Number.isInteger(dto.denomination) || dto.denomination <= 0) {
    throw new Error("Denomination must be a positive integer.");
  }
  for (const [label, v] of [["Purchase price", dto.purchase_price], ["Sale price", dto.sale_price]] as const) {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
      throw new Error(`${label} cannot be negative.`);
    }
  }
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

  // Allowlist + guards: only pricing/stock-floor/name fields are mutable here.
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) {
    if (!String(updates.name).trim()) throw new Error("Product name is required.");
    payload.name = String(updates.name).trim();
  }
  for (const key of ["purchase_price", "sale_price", "minimum_stock"] as const) {
    const v = updates[key];
    if (v !== undefined) {
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
        throw new Error(`${key} cannot be negative.`);
      }
      payload[key] = v;
    }
  }

  const { data, error } = await supabase
    .from("stamp_products")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[StampsService] updateStampProduct error:", error);
    throw new Error(`Failed to update stamp product: ${error.message}`);
  }

  return (data as StampProduct) || null;
}

/** Soft delete a stamp product (no hard deletes on inventory masters). */
export async function deleteStampProduct(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const supabase = await getAdminDatabaseClient();
  const { error } = await supabase
    .from("stamp_products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
  if (error) throw new Error(`Failed to delete stamp product: ${error.message}`);
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
    .is("deleted_at", null)
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

  // API-2: quantity must be a non-zero integer. The sign is normalized from
  // movement_type below (the DB trigger applies ABS() symmetrically), so a
  // zero quantity is the only rejected case — it would be a no-op row.
  if (!Number.isInteger(dto.quantity) || dto.quantity === 0) {
    throw new Error("Quantity must be a non-zero integer.");
  }

  // Resolve target stamp product
  let targetProductId = dto.stampProductId;
  let targetProduct: any = null;

  if (isUuid(targetProductId)) {
    const { data } = await supabase
      .from("stamp_products")
      .select("*")
      .eq("id", targetProductId)
      .is("deleted_at", null)
      .maybeSingle();
    targetProduct = data;
  } else {
    // Try resolving by numeric denomination
    const numericDenom = parseInt(targetProductId.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numericDenom)) {
      const { data } = await supabase
        .from("stamp_products")
        .select("*")
        .eq("denomination", numericDenom)
        .is("deleted_at", null)
        .maybeSingle();
      if (data) {
        targetProductId = data.id;
        targetProduct = data;
      }
    }
  }

  // H4: an unresolvable product must fail loudly — never record a stock
  // movement against a random product.
  if (!targetProduct || !isUuid(targetProductId)) {
    throw new Error(
      `No stamp product found for '${dto.stampProductId}'. Provide a valid product id or denomination.`
    );
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

  // NOTE: `stamp_products.current_stock` is maintained by the DB trigger
  // `handle_stamp_movement` (single source of truth). Do NOT recompute it
  // here — doing so adjusts the same stock twice and can silently overwrite
  // the trigger's value with a stale read.
}
