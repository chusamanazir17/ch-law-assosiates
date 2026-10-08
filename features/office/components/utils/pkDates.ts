/**
 * Pakistan business-day helpers for the office views.
 *
 * The business runs on Asia/Karachi. All "today" computations and day
 * boundaries MUST use that timezone — never `new Date().toISOString()`
 * (UTC) and never locale-default `toLocaleDateString()` — see WF-27.
 *
 * Ledger / stamp date-time strings are written as "DD-MM-YYYY HH:MM AM/PM"
 * (see OfficeContext.formatDateTime). The helpers below match against that
 * format directly, so a dashboard KPI compares "today in PK" against the
 * date portion of the stored string.
 */

export const PK_TIME_ZONE = 'Asia/Karachi';

/**
 * "Today" in the business timezone, formatted to match the date portion of
 * ledger strings: "DD-MM-YYYY" (e.g. "08-10-2026").
 */
export function pkTodayLabel(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: PK_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return `${get('day')}-${get('month')}-${get('year')}`;
}

/** Parsed form of a ledger "DD-MM-YYYY HH:MM AM/PM" string, or null. */
export function parseLedgerDate(dateTime?: string | null): {
  day: number;
  month: number;
  year: number;
} | null {
  if (!dateTime) return null;
  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})/.exec(dateTime.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { day, month, year };
}

/**
 * Whether a ledger dateTime string falls on the current PK business day.
 * Primary: prefix-match the PK "DD-MM-YYYY" label (fast path for the
 * standard ledger format). Fallback: parse the date portion.
 */
export function isLedgerDateToday(dateTime?: string | null, now: Date = new Date()): boolean {
  if (!dateTime) return false;
  const label = pkTodayLabel(now);
  if (dateTime.startsWith(label)) return true;
  const parsed = parseLedgerDate(dateTime);
  if (!parsed) return false;
  const [td, tm, ty] = label.split('-');
  return parsed.day === Number(td) && parsed.month === Number(tm) && parsed.year === Number(ty);
}

/** Short day label in PK timezone for charts: "8 Oct". */
export function pkDayLabel(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: PK_TIME_ZONE,
    day: 'numeric',
    month: 'short',
  }).format(d);
}

/** Month key in PK timezone: "2026-10" (for grouping monthly series). */
export function pkMonthKey(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}`;
}

/** Short month label from a "YYYY-MM" key: "Oct 26". */
export function pkMonthKeyLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, (m || 1) - 1, 15, 7, 0, 0));
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: PK_TIME_ZONE,
    month: 'short',
    year: '2-digit',
  }).format(d);
}

/** Today in PK timezone as "YYYY-MM-DD" (for <input type="date"> defaults). */
export function pkIsoDate(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Format an API ISO date ("YYYY-MM-DD", possibly with time) for PK display:
 * "08-10-2026". Returns "—" when empty/unparseable.
 */
export function formatIsoDatePk(iso?: string | null): string {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return iso;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/**
 * Convert a ledger "DD-MM-YYYY HH:MM AM/PM" string (or a Date) to a real
 * Date for chronological sorting/grouping. Returns null when unparseable.
 */
export function ledgerToDate(dateTime?: string | null): Date | null {
  if (!dateTime) return null;
  if (typeof dateTime !== "string") return null;
  const datePart = String(dateTime).split(' ')[0];
  const [dd, mm, yyyy] = datePart.split('-').map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
}
