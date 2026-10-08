/**
 * Server-safe Pakistan business-day helpers (Asia/Karachi).
 *
 * The chamber operates on Asia/Karachi. Every server-side "today" and every
 * day-boundary filter MUST use these helpers — never
 * `new Date().toISOString().split("T")[0]` (UTC) — otherwise KPIs like
 * "today's cash" silently cover the wrong 24h window (WF-27).
 *
 * Pure Intl.DateTimeFormat math: no node builtins, no client imports, safe in
 * route handlers, server components, and edge middleware alike.
 */

export const PK_TIME_ZONE = "Asia/Karachi";

function ymdInZone(date: Date, timeZone: string): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
  };
}

/** "Today" in Asia/Karachi as `YYYY-MM-DD`. */
export function pkTodayIso(now: Date = new Date()): string {
  const { year, month, day } = ymdInZone(now, PK_TIME_ZONE);
  const p = (n: number, len: number) => String(n).padStart(len, "0");
  return `${p(year, 4)}-${p(month, 2)}-${p(day, 2)}`;
}

/** Add (or subtract, with negative `days`) calendar days to a `YYYY-MM-DD`. */
export function pkAddDaysIso(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().split("T")[0];
}

/** Milliseconds that `timeZone` is ahead of UTC at `date`. */
function tzOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const asUtc = Date.UTC(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")) % 24,
    Number(get("minute")),
    Number(get("second"))
  );
  return asUtc - date.getTime();
}

/**
 * UTC instants bounding the Asia/Karachi calendar day `dateIso`
 * (`YYYY-MM-DD`): `[PK 00:00, next PK 00:00)` as ISO strings.
 * Use for `timestamptz` range filters (e.g. `created_at`).
 */
export function pkDayRangeUtc(dateIso: string): {
  startUtcIso: string;
  endUtcIso: string;
} {
  const [y, m, d] = dateIso.split("-").map(Number);
  const wallMidnightUtc = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  // Sample the offset at the target instant (two passes) so the boundary is
  // exact even across DST transitions in zones that observe them.
  let start = wallMidnightUtc - tzOffsetMs(new Date(wallMidnightUtc), PK_TIME_ZONE);
  start = wallMidnightUtc - tzOffsetMs(new Date(start), PK_TIME_ZONE);
  const end = start + 24 * 60 * 60 * 1000;
  return {
    startUtcIso: new Date(start).toISOString(),
    endUtcIso: new Date(end).toISOString(),
  };
}
