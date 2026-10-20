// src/lib/format.ts

// 1. Helper to get the active currency on the client
function getActiveCurrency(): "NGN" | "USD" {
  if (typeof window === "undefined") return "NGN";
  const stored = localStorage.getItem("acuity-currency") || localStorage.getItem("currency");
  return stored === "USD" ? "USD" : "NGN";
}

// 2. The main formatter
export function formatCurrency(
  amount: number | string,
  overrideCurrency?: "NGN" | "USD"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return overrideCurrency === "USD" ? "$0" : "₦0";

  const currency = overrideCurrency || getActiveCurrency();

  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);

  return currency === "NGN" ? `₦${formattedNumber}` : `$${formattedNumber}`;
}

// 3. The missing input formatters
export function formatNumberInput(value: string | number): string {
  if (value === "" || value === null || value === undefined) return "";
  const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);
}

export function parseNumberInput(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]+/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}