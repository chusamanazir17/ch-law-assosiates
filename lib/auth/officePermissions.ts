import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import {
  getUnifiedSession,
  type UnifiedSession,
} from "@/lib/services/auth.service";
import type { AppRole } from "@/types/office";

/**
 * Fine-grained RBAC for the office API surface (RBAC-1 remediation).
 *
 * Every /api/office/* route must call requireOfficeAccess(route, method)
 * instead of the old coarse canAccessOfficeSystem() gate. The helper returns
 * 401 when there is no (or a suspended) session and 403 when the caller's role
 * is not permitted for the route+method. super_admin bypasses every policy.
 */

export type OfficeRouteKey =
  | "attendance"
  | "audit"
  | "cases"
  | "clients"
  | "daily-closing"
  | "dashboard"
  | "employees"
  | "finance"
  | "hearings"
  | "invoices"
  | "receipts"
  | "services"
  | "settings"
  | "stamps"
  | "tasks"
  | "tax";

export type OfficeMethod = "GET" | "POST" | "PATCH" | "DELETE";

const ALL_OFFICE_ROLES: AppRole[] = [
  "super_admin",
  "office_admin",
  "lawyer",
  "staff",
  "accountant",
  "receptionist",
];

const ADMINS: AppRole[] = ["super_admin", "office_admin"];

const FINANCE_ROLES: AppRole[] = ["super_admin", "office_admin", "accountant"];

const CASE_ROLES: AppRole[] = ["super_admin", "office_admin", "lawyer"];

const CLIENT_WRITE_ROLES: AppRole[] = [
  "super_admin",
  "office_admin",
  "lawyer",
  "receptionist",
];

type Policy = Partial<Record<OfficeMethod, AppRole[]>>;

const OFFICE_ROUTE_POLICIES: Record<OfficeRouteKey, Policy> = {
  // Attendance: everyone reads; anyone may record, but non-admins are scoped
  // to their own profile id in the route handler (RBAC-3).
  attendance: { GET: ALL_OFFICE_ROLES, POST: ALL_OFFICE_ROLES },
  // Audit trail: admins only, read and write (client write path removed).
  audit: { GET: ADMINS },
  // Matters: advocates + admins.
  cases: { GET: CASE_ROLES, POST: CASE_ROLES, PATCH: CASE_ROLES },
  hearings: {
    GET: CASE_ROLES,
    POST: CASE_ROLES,
    PATCH: CASE_ROLES,
    DELETE: CASE_ROLES,
  },
  // Clients: everyone reads; front-desk roles may create/update; only admins delete.
  clients: {
    GET: ALL_OFFICE_ROLES,
    POST: CLIENT_WRITE_ROLES,
    PATCH: CLIENT_WRITE_ROLES,
    DELETE: ADMINS,
  },
  // Money movement: finance roles only.
  finance: { GET: FINANCE_ROLES, POST: FINANCE_ROLES },
  invoices: { GET: FINANCE_ROLES, POST: FINANCE_ROLES },
  receipts: { GET: FINANCE_ROLES, POST: FINANCE_ROLES, PATCH: FINANCE_ROLES },
  "daily-closing": { GET: FINANCE_ROLES, POST: FINANCE_ROLES },
  // Dashboard aggregates cash/P&L/staff data: not for reception.
  dashboard: {
    GET: ["super_admin", "office_admin", "accountant", "lawyer", "staff"],
  },
  // Staff directory: admins read full PII; writes are admin-only
  // (role/status changes additionally restricted to super_admin in handler).
  employees: { GET: ADMINS, PATCH: ADMINS },
  // Office settings feed the public site: admins only.
  settings: { GET: ADMINS, POST: ADMINS },
  // Stamp inventory: everyone reads stock; movements need a trusted role;
  // product create/price changes are finance-admin only (enforced per action).
  stamps: {
    GET: ALL_OFFICE_ROLES,
    POST: ["super_admin", "office_admin", "accountant", "staff", "receptionist"],
    PATCH: FINANCE_ROLES,
  },
  // Tasks: all office roles; deletes are admin-only.
  tasks: {
    GET: ALL_OFFICE_ROLES,
    POST: ALL_OFFICE_ROLES,
    PATCH: ALL_OFFICE_ROLES,
    DELETE: ADMINS,
  },
  // Tax cases: everyone reads; writes need a professional/finance role.
  tax: {
    GET: ALL_OFFICE_ROLES,
    POST: ["super_admin", "office_admin", "lawyer", "accountant"],
    PATCH: ["super_admin", "office_admin", "lawyer", "accountant"],
    DELETE: ADMINS,
  },
  // E-stamp counter service orders: everyone reads; counter roles write.
  services: {
    GET: ALL_OFFICE_ROLES,
    POST: ["super_admin", "office_admin", "staff", "receptionist"],
    PATCH: ["super_admin", "office_admin", "staff", "receptionist"],
    DELETE: ADMINS,
  },
};

export type OfficeAuthResult =
  | { ok: true; session: UnifiedSession }
  | { ok: false; response: NextResponse };

/**
 * Authorize one office API call. Returns { ok: true, session } on success,
 * otherwise { ok: false, response } where response is a 401/403 JSON reply
 * the route handler should return directly.
 *
 * super_admin bypasses every policy. Suspended/inactive profiles are denied
 * even if a session object exists (defense in depth for H14).
 */
export async function requireOfficeAccess(
  route: OfficeRouteKey,
  method: OfficeMethod,
  request?: NextRequest
): Promise<OfficeAuthResult> {
  void request;
  const session = await getUnifiedSession();

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  // Suspended or deactivated profiles must not retain API access (H14).
  const profileStatus = session.profile?.status;
  if (profileStatus && profileStatus !== "active") {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Account is not active. Contact an administrator." },
        { status: 401 }
      ),
    };
  }

  // super_admin bypasses all route policies.
  if (session.role === "super_admin") {
    return { ok: true, session };
  }

  const allowed = OFFICE_ROUTE_POLICIES[route]?.[method];
  if (!allowed || !allowed.includes(session.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Forbidden: role '${session.role}' may not access ${method} /api/office/${route}.`,
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, session };
}

/** Convenience: does this session belong to a finance-privileged role? */
export function canManageFinance(role: AppRole): boolean {
  return FINANCE_ROLES.includes(role);
}

/** Convenience: office admins (super or office) for destructive operations. */
export function isOfficeAdminRole(role: AppRole): boolean {
  return ADMINS.includes(role);
}

/**
 * Build a JSON error response from a service-layer throw. Services may set
 * `err.statusCode` (e.g. 404 / 409) for semantic failures; anything else
 * becomes a 400/500 with the fallback status.
 */
export function officeErrorResponse(
  error: any,
  fallback: string,
  defaultStatus = 400
): NextResponse {
  const status =
    typeof error?.statusCode === "number" &&
    error.statusCode >= 400 &&
    error.statusCode < 600
      ? error.statusCode
      : defaultStatus;
  return NextResponse.json(
    { success: false, error: error?.message || fallback },
    { status }
  );
}
