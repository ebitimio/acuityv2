import type { Txn } from "./types";

export type ChargeType = "Transfer fee" | "Stamp duty" | "SMS alert" | "Maintenance" | "VAT" | "Other fee";

export interface Charge { id: string; date: string; description: string; amount: number; type: ChargeType; expected?: number; flag?: string; over: number; tagged: boolean; }

const KEYWORDS = /(charge|fee|stamp\s*duty|sms|commission|vat|maint|levy)/i;
const MAX_CHARGE = 2000;
export const transferFeeFor = (amount: number) => (amount <= 5000 ? 10 : amount <= 50000 ? 25 : 50);
export const STAMP_DUTY = 50;

const text = (t: Txn) => `${t.description_raw ?? ""} ${t.description_clean ?? ""}`;
export function classify(d: string): ChargeType {
  if (/stamp/i.test(d)) return "Stamp duty";
  if (/sms|alert/i.test(d)) return "SMS alert";
  if (/\bvat\b/i.test(d)) return "VAT";
  if (/maint|card|account/i.test(d)) return "Maintenance";
  if (/nip|transfer|trf|electronic|levy/i.test(d)) return "Transfer fee";
  return "Other fee";
}
export const isCharge = (t: Txn) => t.direction === "debit" && (t.category_name === "Bank Charges" || (KEYWORDS.test(text(t)) && t.amount_minor / 100 <= MAX_CHARGE));

export function auditCharges(txs: Txn[]) {
  const sorted = [...txs].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const charges: Charge[] = [];
  const others = sorted.filter((t) => t.direction === "debit" && !isCharge(t));
  const seen = new Map<string, number>();

  for (const t of sorted) {
    if (!isCharge(t)) continue;
    const amount = t.amount_minor / 100;
    const desc = text(t).trim();
    const type = classify(desc);
    const c: Charge = { id: t.id, date: t.date, description: t.description_clean || t.description_raw || "Bank charge", amount, type, over: 0, tagged: t.category_name === "Bank Charges" };

    if (type === "Stamp duty") {
      c.expected = STAMP_DUTY;
      if (amount !== STAMP_DUTY) { c.flag = `Stamp duty is ₦¦${STAMP_DUTY}`; c.over = Math.max(amount - STAMP_DUTY, 0); }
    } else if (type === "Transfer fee") {
      const ms = new Date(t.date).getTime();
      const match = others.find((o) => o.account_id === t.account_id && Math.abs(new Date(o.date).getTime() - ms) <= 10 * 60_000 && o.amount_minor > t.amount_minor);
      if (match) {
        c.expected = transferFeeFor(match.amount_minor / 100);
        if (amount !== c.expected) { c.flag = `A ₦¦${(match.amount_minor / 100).toLocaleString()} transfer should cost ₦¦${c.expected}`; c.over = Math.max(amount - c.expected, 0); }
      } else if (![10, 25, 50].includes(amount)) { c.flag = "Does not match a standard transfer fee (₦¦10, ₦¦25 or ₦¦50)"; }
    }

    const key = `${t.account_id}|${desc}|${t.amount_minor}`;
    const ms = new Date(t.date).getTime();
    const last = seen.get(key);
    if (last !== undefined && ms - last <= 60_000) { c.flag = "Possible duplicate charge"; c.over = amount; }
    seen.set(key, ms);
    charges.push(c);
  }

  const byType = new Map<ChargeType, { count: number; total: number }>();
  for (const c of charges) {
    const e = byType.get(c.type) ?? { count: 0, total: 0 };
    e.count += 1; e.total += c.amount; byType.set(c.type, e);
  }
  return { charges: charges.reverse(), totalFees: charges.reduce((s, c) => s + c.amount, 0), totalOver: charges.reduce((s, c) => s + c.over, 0), byType: [...byType.entries()].map(([type, v]) => ({ type, ...v })).sort((a, b) => b.total - a.total) };
}
