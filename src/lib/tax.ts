export const BANDS = [
  { upTo: 800_000, rate: 0 },
  { upTo: 3_000_000, rate: 0.15 },
  { upTo: 12_000_000, rate: 0.18 },
  { upTo: 25_000_000, rate: 0.21 },
  { upTo: 50_000_000, rate: 0.23 },
  { upTo: Infinity, rate: 0.25 },
];
export const RENT_RELIEF_RATE = 0.2;
export const RENT_RELIEF_CAP = 500_000;

export interface TaxInput { gross: number; pension: number; nhf: number; nhis: number; rent: number; other: number; }
export interface TaxResult { rentRelief: number; deductions: number; taxable: number; tax: number; monthly: number; effectiveRate: number; slices: { from: number; to: number; rate: number; amount: number; tax: number }[]; }

export function computeTax(i: TaxInput): TaxResult {
  const rentRelief = Math.min(RENT_RELIEF_CAP, Math.max(i.rent, 0) * RENT_RELIEF_RATE);
  const deductions = i.pension + i.nhf + i.nhis + i.other + rentRelief;
  const taxable = Math.max(i.gross - deductions, 0);

  let prev = 0, tax = 0;
  const slices: TaxResult["slices"] = [];
  for (const b of BANDS) {
    const amount = Math.max(Math.min(taxable, b.upTo) - prev, 0);
    const t = amount * b.rate;
    if (amount > 0) slices.push({ from: prev, to: Math.min(taxable, b.upTo), rate: b.rate, amount, tax: t });
    tax += t;
    prev = b.upTo;
  }
  return { rentRelief, deductions, taxable, tax, monthly: tax / 12, effectiveRate: i.gross > 0 ? tax / i.gross : 0, slices };
}
