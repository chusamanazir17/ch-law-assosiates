import { z } from "zod";

/**
 * Server-side validation for office DTOs (SEC-03 remediation).
 * Every /api/office/* mutation must safeParse its canonical body through one
 * of these schemas and return 400 on failure. Reject, don't coerce.
 */

const toNumber = (v: unknown): unknown => {
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }
  return v;
};

/** Any finite number (rejects NaN/Infinity that Number() coercion lets through). */
const finiteNumber = z.preprocess(toNumber, z.number().finite());

/** Money in: must be finite and strictly positive (API-2). */
export const positiveMoney = finiteNumber.refine((n) => n > 0, {
  message: "Amount must be greater than 0.",
});

/** Money that may legitimately be zero (tax, discount, balance due). */
export const nonNegativeMoney = finiteNumber.refine((n) => n >= 0, {
  message: "Amount cannot be negative.",
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null));

const requiredText = (min: number, max: number) =>
  z.string().trim().min(min).max(max);

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be YYYY-MM-DD." });

const uuid = z.string().uuid({ message: "Must be a valid UUID." });

const optionalUuid = uuid.optional().nullable();

/** Pakistani CNIC: 13 digits, dash-tolerant. Rejects the 'XXXXXXX' placeholder (SEC-06). */
const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const cnic = z
  .preprocess(
    emptyToUndef,
    z
      .string()
      .trim()
      .regex(/^\d{5}-?\d{7}-?\d{1}$/, {
        message: "CNIC must be 13 digits (e.g. 36502-1234567-1).",
      })
      .refine((v) => !/[xX]/.test(v), { message: "CNIC placeholder values are not allowed." })
      .optional()
      .nullable()
  )
  .transform((v) => (v && (v as string).length > 0 ? v : null));

const email = z
  .preprocess(
    emptyToUndef,
    z.string().trim().email({ message: "Email address is invalid." }).max(160).optional().nullable()
  )
  .transform((v) => (v && (v as string).length > 0 ? v : null));

// ---------------------------------------------------------------- clients

const CLIENT_TYPES = ["individual", "sole_proprietor", "partnership", "company", "other"] as const;
const CLIENT_STATUSES = ["active", "inactive", "archived"] as const;

// Base fields without defaults so PATCH schemas never inject values the
// caller did not send (defaults would clobber existing rows on update).
const clientFields = {
  full_name: requiredText(2, 120),
  business_name: optionalText(160),
  client_type: z.enum(CLIENT_TYPES),
  cnic,
  ntn: optionalText(40),
  mobile: requiredText(7, 24),
  phone: optionalText(24),
  email,
  city: z.string().trim().max(80),
  address: optionalText(500),
  status: z.enum(CLIENT_STATUSES),
};

export const clientCreateSchema = z.object({
  ...clientFields,
  client_type: clientFields.client_type.default("individual"),
  city: clientFields.city.default("Sahiwal"),
  status: clientFields.status.default("active"),
});

export const clientUpdateSchema = z.object(clientFields).partial();

/** Fields a client PATCH may change (mass-assignment guard). */
export const CLIENT_UPDATE_ALLOWLIST = [
  "full_name",
  "business_name",
  "client_type",
  "cnic",
  "ntn",
  "mobile",
  "phone",
  "email",
  "city",
  "address",
  "status",
] as const;

// ---------------------------------------------------------------- cases

const CASE_STATUSES = ["active", "pending", "decided", "disposed", "archived"] as const;

const caseFields = {
  case_number: requiredText(1, 60),
  title: requiredText(2, 200),
  court_name: z.string().trim().max(160),
  judge_name: optionalText(120),
  case_type: z.string().trim().max(60),
  case_category: optionalText(80),
  stage: z.string().trim().max(60),
  status: z.enum(CASE_STATUSES),
  filing_date: dateString.optional(),
  decision_date: dateString.optional().nullable(),
  description: optionalText(2000),
  next_hearing_date: dateString.optional().nullable(),
  client_id: optionalUuid,
  client_role: z.string().trim().max(40).optional().nullable(),
  lawyer_id: optionalUuid,
};

export const caseCreateSchema = z.object({
  ...caseFields,
  court_name: caseFields.court_name.default("District Court Sahiwal"),
  case_type: caseFields.case_type.default("Civil"),
  stage: caseFields.stage.default("filing"),
  status: caseFields.status.default("active"),
});

export const caseUpdateSchema = z.object(caseFields).partial().omit({
  case_number: true,
  client_id: true,
  client_role: true,
  lawyer_id: true,
});

/** Fields a non-admin role may change on a case (API-1 mass-assignment fix). */
export const CASE_UPDATE_ALLOWLIST = [
  "title",
  "court_name",
  "judge_name",
  "case_type",
  "case_category",
  "stage",
  "status",
  "filing_date",
  "decision_date",
  "description",
  "next_hearing_date",
] as const;

/** Reassignment fields reserved for super_admin / office_admin. */
export const CASE_REASSIGN_ALLOWLIST = ["client_id", "client_role", "lawyer_id"] as const;

// ---------------------------------------------------------------- hearings

const HEARING_STATUSES = ["scheduled", "adjourned", "completed", "cancelled"] as const;

export const hearingCreateSchema = z.object({
  // Accepts a UUID or a case_number (service resolves case_number -> id).
  case_id: requiredText(1, 80),
  hearing_date: dateString,
  court_room: optionalText(80),
  judge_name: optionalText(120),
  purpose: requiredText(2, 200),
  proceedings_summary: optionalText(2000),
  next_hearing_date: dateString.optional().nullable(),
  next_purpose: optionalText(200),
  status: z.enum(HEARING_STATUSES).default("scheduled"),
});

export const hearingUpdateSchema = z.object({
  hearing_date: dateString.optional(),
  court_room: optionalText(80),
  judge_name: optionalText(120),
  purpose: z.string().trim().min(2).max(200).optional(),
  proceedings_summary: optionalText(2000),
  next_hearing_date: dateString.optional().nullable(),
  next_purpose: optionalText(200),
  status: z.enum(HEARING_STATUSES).optional(),
  // case_id moves are admin-only and handled via the allowlist, not the schema.
});

/** Fields a non-admin role may change on a hearing (API-1). */
export const HEARING_UPDATE_ALLOWLIST = [
  "hearing_date",
  "court_room",
  "judge_name",
  "purpose",
  "proceedings_summary",
  "next_hearing_date",
  "next_purpose",
  "status",
] as const;

// ---------------------------------------------------------------- invoices & payments

export const invoiceItemSchema = z.object({
  description: requiredText(1, 200),
  quantity: z.preprocess(toNumber, z.number().int().min(1).max(100000)),
  unit_price: nonNegativeMoney,
});

export const invoiceCreateSchema = z.object({
  client_id: uuid,
  case_id: optionalUuid,
  due_date: dateString,
  tax_amount: nonNegativeMoney.default(0),
  discount_amount: nonNegativeMoney.default(0),
  notes: optionalText(2000),
  items: z.array(invoiceItemSchema).min(1).max(200),
});

const PAYMENT_METHODS = ["cash", "bank", "jazzcash", "easypaisa", "cheque", "online"] as const;

export const paymentCreateSchema = z.object({
  invoice_id: optionalUuid,
  client_id: optionalUuid,
  amount: positiveMoney,
  payment_method: z
    .string()
    .trim()
    .max(40)
    .default("cash")
    .transform((v) => {
      const low = v.toLowerCase();
      return (PAYMENT_METHODS as readonly string[]).includes(low) ? low : v;
    }),
  payment_account_id: optionalUuid,
  reference_number: optionalText(80),
  notes: optionalText(1000),
});

// ---------------------------------------------------------------- expenses

export const expenseCreateSchema = z.object({
  // Accepts a payment-account UUID or a resolvable account key/name —
  // the finance service resolves non-UUID identifiers.
  account_id: z.string().min(1).max(120).optional().nullable(),
  category: requiredText(2, 80),
  payee: requiredText(2, 120),
  amount: positiveMoney,
  expense_date: dateString.optional(),
  description: optionalText(1000),
  receipt_url: z
    .string()
    .trim()
    .url({ message: "Receipt URL must be valid." })
    .max(500)
    .optional()
    .nullable(),
});

// ---------------------------------------------------------------- ledger / transfers

export const ledgerEntrySchema = z.object({
  // Accepts a payment-account UUID or a resolvable account key/name
  // ("cash", "bank", "jazzcash", "easypaisa") — the finance service resolves
  // non-UUID identifiers via resolvePaymentAccount.
  account_id: z.string().min(1, { message: "Account is required." }).max(120),
  entry_type: z.enum(["debit", "credit"]),
  amount: positiveMoney,
  category: requiredText(1, 80),
  description: requiredText(1, 500),
  reference_type: optionalText(60),
  reference_id: optionalUuid,
  client_id: optionalUuid,
});

export const transferCreateSchema = z.object({
  // Accepts payment-account UUIDs or resolvable account keys/names —
  // the route resolves non-UUID identifiers before calling the service.
  from_account_id: z.string().min(1, { message: "Source account is required." }).max(120),
  to_account_id: z.string().min(1, { message: "Destination account is required." }).max(120),
  amount: positiveMoney,
  description: optionalText(500),
}).refine((v) => v.from_account_id !== v.to_account_id, {
  message: "Source and destination accounts must differ.",
});

// ---------------------------------------------------------------- stamps

const STAMP_MOVEMENT_TYPES = [
  "opening",
  "purchase",
  "sale",
  "adjustment_in",
  "adjustment_out",
  "reversal",
] as const;

export const stampProductCreateSchema = z.object({
  name: requiredText(2, 120),
  denomination: z.preprocess(toNumber, z.number().int().positive()),
  purchase_price: nonNegativeMoney,
  sale_price: nonNegativeMoney,
  current_stock: z.preprocess(toNumber, z.number().int().min(0)).default(0),
  minimum_stock: z.preprocess(toNumber, z.number().int().min(0)).default(20),
});

export const stampProductUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  purchase_price: nonNegativeMoney.optional(),
  sale_price: nonNegativeMoney.optional(),
  minimum_stock: z.preprocess(toNumber, z.number().int().min(0)).optional(),
});

export const stampMovementSchema = z.object({
  stamp_product_id: requiredText(1, 80),
  movement_type: z.enum(STAMP_MOVEMENT_TYPES),
  quantity: z
    .preprocess(toNumber, z.number().int())
    .refine((n) => n !== 0, { message: "Quantity cannot be zero." }),
  unit_price: nonNegativeMoney.optional().nullable(),
  client_id: optionalUuid,
  client_name: optionalText(160),
  notes: optionalText(1000),
});

// ---------------------------------------------------------------- tasks

const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;
const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const taskCreateSchema = z.object({
  title: requiredText(2, 200),
  description: optionalText(2000),
  assigned_to: optionalUuid,
  case_id: optionalUuid,
  client_id: optionalUuid,
  due_date: dateString,
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  status: z.enum(TASK_STATUSES).default("pending"),
});

export const taskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
});

// ---------------------------------------------------------------- receipts

const RECEIPT_STATUSES = ["paid", "partial", "unpaid", "cancelled"] as const;

export const receiptCreateSchema = z.object({
  client_id: optionalUuid,
  client_name: requiredText(2, 120),
  service_type: z.string().trim().max(160).default("Legal Documentation"),
  amount_paid: positiveMoney,
  balance_due: nonNegativeMoney.default(0),
  payment_method: z.string().trim().max(40).default("cash"),
  status: z.enum(RECEIPT_STATUSES).default("paid"),
  notes: optionalText(1000),
});

export const receiptStatusSchema = z.object({
  status: z.enum(RECEIPT_STATUSES),
  notes: optionalText(1000),
});

// ---------------------------------------------------------------- tax cases & service orders

const taxCaseFields = {
  client_id: uuid,
  tax_year: requiredText(4, 9),
  return_type: z.string().trim().max(80),
  fee: nonNegativeMoney,
  assigned_to: optionalUuid,
  due_date: dateString.optional().nullable(),
  filing_date: dateString.optional().nullable(),
  cpr_number: optionalText(60),
  status: z.string().trim().min(1).max(60),
  notes: optionalText(2000),
  documents: z.unknown().optional(),
};

export const taxCaseCreateSchema = z.object({
  ...taxCaseFields,
  return_type: taxCaseFields.return_type.default("Income Tax Return"),
  fee: taxCaseFields.fee.default(0),
  status: taxCaseFields.status.default("In Progress"),
});

export const taxCaseUpdateSchema = z
  .object(taxCaseFields)
  .partial()
  .omit({ client_id: true });

/** Fields a tax PATCH may change (client reassignment is not allowed via PATCH). */
export const TAX_CASE_UPDATE_ALLOWLIST = [
  "tax_year",
  "return_type",
  "fee",
  "assigned_to",
  "due_date",
  "filing_date",
  "cpr_number",
  "status",
  "notes",
  "documents",
] as const;

export const serviceOrderCreateSchema = z.object({
  client_id: optionalUuid,
  customer_name: requiredText(2, 120),
  service_name: requiredText(2, 160),
  category: z.string().trim().max(80).default("Legal Drafting"),
  pages: z.preprocess(toNumber, z.number().int().min(1).max(100000)).default(1),
  amount: nonNegativeMoney.default(0),
  payment_status: z.string().trim().max(40).default("Unpaid"),
  delivery_date: optionalText(40),
  file_reference: optionalText(160),
  status: z.string().trim().max(60).default("In Progress"),
  notes: optionalText(2000),
});

export const serviceOrderUpdateSchema = z.object({
  status: z.string().trim().max(60).optional(),
  payment_status: z.string().trim().max(40).optional(),
  delivery_date: optionalText(40),
  notes: optionalText(2000),
});

/** Fields a service-order PATCH may change (mass-assignment guard). */
export const SERVICE_ORDER_UPDATE_ALLOWLIST = [
  "status",
  "payment_status",
  "delivery_date",
  "notes",
] as const;

// ---------------------------------------------------------------- misc

export const dailyClosingSchema = z.object({
  closing_date: dateString.optional(),
  actual_cash: finiteNumber.refine((n) => n >= 0, {
    message: "Actual cash cannot be negative.",
  }),
  notes: optionalText(1000),
});

const ATTENDANCE_STATUSES = ["present", "absent", "late", "half_day", "leave"] as const;

export const attendanceSchema = z.object({
  employee_id: uuid,
  date: dateString.optional(),
  status: z.enum(ATTENDANCE_STATUSES),
  check_in_time: optionalText(16),
  check_out_time: optionalText(16),
  notes: optionalText(500),
});

export const paymentAccountCreateSchema = z.object({
  name: requiredText(2, 120),
  account_type: z.enum(["cash", "bank", "jazzcash", "easypaisa", "other"]),
  account_number: optionalText(60),
  bank_name: optionalText(120),
  opening_balance: nonNegativeMoney.default(0),
});

// ---------------------------------------------------------------- helpers

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Validate an unknown body against a zod schema; returns a 400-ready error string on failure. */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): ValidationResult<T> {
  const parsed = schema.safeParse(body);
  if (parsed.success) return { success: true, data: parsed.data };
  const first = parsed.error.issues[0];
  const path = first.path.length > 0 ? `${first.path.join(".")}: ` : "";
  return { success: false, error: `Invalid request: ${path}${first.message}` };
}

/**
 * Mass-assignment guard: keep only explicitly allowed keys (API-1).
 * Unknown keys are dropped silently so extra client fields can never reach
 * the database layer.
 */
export function pickAllowed(
  body: Record<string, unknown> | null | undefined,
  allowed: readonly string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!body || typeof body !== "object") return out;
  const allow = new Set(allowed);
  for (const key of Object.keys(body)) {
    if (allow.has(key)) out[key] = (body as Record<string, unknown>)[key];
  }
  return out;
}

/** Clamp an attacker-controlled `limit` query param (API-5). */
export function clampLimitParam(
  raw: string | null,
  defaultValue = 100,
  max = 500
): number {
  const parsed = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultValue;
  return Math.min(Math.floor(parsed), max);
}
