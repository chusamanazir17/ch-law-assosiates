import { useMemo } from "react";
import { useOffice } from "../context/OfficeContext";

/**
 * Staff attribution for "recorded by / received by / assigned to" fields.
 *
 * Priority: logged-in session user -> employees directory (systemUsers) ->
 * neutral "Staff" label. Never invents personal names.
 */
export function useStaffAttribution() {
  const { sessionUser, systemUsers } = useOffice();

  const sessionUserName = (sessionUser?.name || "").trim();

  const staffOptions = useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();
    const push = (n?: string | null) => {
      const v = (n || "").trim();
      if (v && !seen.has(v.toLowerCase())) {
        seen.add(v.toLowerCase());
        names.push(v);
      }
    };
    push(sessionUserName);
    systemUsers.forEach((u) => push(u.name));
    push("Staff");
    return names;
  }, [sessionUserName, systemUsers]);

  /** Resolve the staff name to record: explicit choice, else session user, else "Staff". */
  const resolveStaff = (preferred?: string | null): string => {
    const p = (preferred || "").trim();
    if (p) return p;
    return staffOptions[0] || "Staff";
  };

  return { staffOptions, resolveStaff, sessionUserName };
}
