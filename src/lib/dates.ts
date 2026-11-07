export const startOfMonthISO = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};

export const daysInMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

/**
 * Returns YYYY-MM-DD in the user's local timezone (e.g. Nigeria WAT).
 * Prevents transactions added after 11pm from landing on yesterday's date.
 */
export function formatLocalDate(d = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parses YYYY-MM-DD as local date at noon to avoid UTC midnight timezone rollback.
 */
export function parseLocalDate(str: string): Date {
  if (!str) return new Date();
  const raw = str.split("T")[0];
  const parts = raw.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Converts a local YYYY-MM-DD string to an ISO timestamp, using current local time
 * so it preserves the exact local calendar day.
 */
export function localDateToISO(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const now = new Date();
  // If the picked date is today, preserve current hour and minute
  if (formatLocalDate(now) === formatLocalDate(d)) {
    d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  } else {
    d.setHours(12, 0, 0, 0);
  }
  return d.toISOString();
}

export function dayLabel(iso: string) {
  const d = parseLocalDate(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
}

export const shortDate = (iso: string) => parseLocalDate(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
export const ordinal = (n: number) => { const s = ["th", "st", "nd", "rd"]; const v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
export const errMsg = (e: unknown) => e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "Something went wrong";
