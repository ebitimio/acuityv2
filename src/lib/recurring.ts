import type { Txn } from "./types";

export interface Suggestion {
  key: string;
  name: string;
  category: string;
  amount_minor: number; // median amount
  cadence: "weekly" | "biweekly" | "monthly";
  cadence_days: number; // expected days between charges
  occurrences: number;
  last_date: string;
  next_date: string;
  confidence: number; // 0..1
}

const DAY = 86_400_000;

function median(a: number[]): number {
  if (a.length === 0) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? Math.round((s[m - 1] + s[m]) / 2) : s[m];
}

function normalizeName(s: string) {
  return s
    .toLowerCase()
    .replace(/nip\/frm\//g, "")
    .replace(/\/[a-z0-9]{8,}\//g, " ")
    .replace(/pos purchase/g, "")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectRecurring(txns: Txn[], knownBillNames: Set<string> = new Set()): Suggestion[] {
  // Debits only, ignore Split Parent rows
  const debits = txns
    .filter((t) => t.direction === "debit" && t.category_name !== "Split Parent")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));

  const groups = new Map<string, Txn[]>();
  for (const t of debits) {
    const key = normalizeName(t.description_clean || t.description_raw || "").slice(0, 40);
    if (!key || key.length < 3) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const suggestions: Suggestion[] = [];

  for (const [key, list] of groups) {
    if (list.length < 3) continue;

    // Amounts should cluster (within 30% of the median)
    const amounts = list.map((t) => t.amount_minor);
    const med = median(amounts);
    const tight = amounts.filter((a) => Math.abs(a - med) / med <= 0.3);
    if (tight.length < 3 || tight.length / amounts.length < 0.6) continue;

    // Intervals between charges
    const intervals: number[] = [];
    for (let i = 1; i < list.length; i++) {
      intervals.push(Math.round((+new Date(list[i].date) - +new Date(list[i - 1].date)) / DAY));
    }
    const medInterval = median(intervals);
    if (medInterval < 6 || medInterval > 40) continue; // ignore daily noise and yearly

    // Consistent cadence (within ±4 days of the median)
    const consistent = intervals.filter((d) => Math.abs(d - medInterval) <= 4);
    if (consistent.length / intervals.length < 0.6) continue;

    const cadence: Suggestion["cadence"] =
      medInterval <= 10 ? "weekly" : medInterval <= 18 ? "biweekly" : "monthly";
    const cadence_days = cadence === "weekly" ? 7 : cadence === "biweekly" ? 14 : 30;

    const last = list[list.length - 1];
    const next = new Date(+new Date(last.date) + cadence_days * DAY).toISOString();

    // Confidence: how many cycles + how consistent
    const cycles = consistent.length;
    const confidence = Math.min(1, 0.4 + cycles * 0.15 + (1 - Math.abs(medInterval - cadence_days) / 10) * 0.15);

    // Skip ones already saved as a bill (case-insensitive name match)
    const displayName = last.description_clean || last.description_raw || key;
    if ([...knownBillNames].some((n) => normalizeName(n) === key)) continue;

    suggestions.push({
      key,
      name: displayName,
      category: last.category_name || "Uncategorized",
      amount_minor: med,
      cadence,
      cadence_days,
      occurrences: list.length,
      last_date: last.date,
      next_date: next,
      confidence,
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}