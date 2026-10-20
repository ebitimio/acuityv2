// src/lib/format.ts

// --- 1. Helper to get the active currency outside of React components ---
// We assume your app stores the currency in localStorage (e.g., 'acuity-currency' or similar).
// If it's stored somewhere else, adjust the key below.
function getActiveCurrency(): "NGN" | "USD" {
  if (typeof window === "undefined") return "NGN"; // Default for server-side
  const stored = localStorage.getItem("acuity-currency") || localStorage.getItem("currency");
  return stored === "USD" ? "USD" : "NGN";
}

// --- 2. The Formatter ---
export function formatCurrency(
  amount: number | string,
  overrideCurrency?: "NGN" | "USD"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return overrideCurrency === "USD" ? "$0" : "₦0";

  const currency = overrideCurrency || getActiveCurrency();

  // Format numbers (no decimals)
  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);

  // Prepend the correct symbol
  return currency === "NGN" ? `₦${formattedNumber}` : `$${formattedNumber}`;
}