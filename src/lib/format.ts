/**
 * Formats a numeric string with thousand separators as the user types.
 * Keeps the cursor at the end of the input.
 *
 * Examples:
 *   "1000"       -> "1,000"
 *   "1234567.89" -> "1,234,567.89"
 *   "12."        -> "12."
 *   ""           -> ""
 */
export function formatNumberInput(raw: string): string {
  // Remove anything that isn't a digit or a single dot
  const cleaned = raw.replace(/[^\d.]/g, "");

  // Keep only the first dot
  const parts = cleaned.split(".");
  const intPart = parts[0] ?? "";
  const decPart = parts.length > 1 ? parts.slice(1).join("") : null;

  // Group integer part with commas
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decPart === null) return withCommas;
  return `${withCommas}.${decPart}`;
}

/** Parse a formatted string back into a number. */
export function parseNumberInput(formatted: string): number {
  const cleaned = formatted.replace(/,/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
