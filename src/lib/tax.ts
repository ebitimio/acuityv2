export const TAX_BANDS = [
  { upTo: 800_000, rate: 0 },
  { upTo: 3_000_000, rate: 0.15 },
  { upTo: 12_000_000, rate: 0.18 },
  { upTo: 25_000_000, rate: 0.21 },
  { upTo: 50_000_000, rate: 0.23 },
  { upTo: Infinity, rate: 0.25 },
];

export const RENT_RELIEF_RATE = 0.20;
export const RENT_RELIEF_CAP = 500_000;
export const EXEMPTION_THRESHOLD = 800_000;

export interface TaxInput {
  gross: number;
  pension: number;
  nhf: number;
  nhis: number;
  rent: number;
  other: number;
}

export interface TaxResult {
  gross: number;
  rentRelief: number;
  totalDeductions: number;
  taxable: number;
  tax: number;
  monthly: number;
  effectiveRate: number;
  isExempt: boolean;
  slices: { from: number; to: number; rate: number; amount: number; tax: number }[];
}

export function computeTax(i: TaxInput): TaxResult {
  // 1. Check Exemption
  const isExempt = i.gross <= EXEMPTION_THRESHOLD;

  // 2. Calculate Rent Relief (Lower of 20% of rent or 500k)
  const rentRelief = Math.min(RENT_RELIEF_CAP, Math.max(i.rent, 0) * RENT_RELIEF_RATE);

  // 3. Total Deductions
  const totalDeductions = i.pension + i.nhf + i.nhis + i.other + rentRelief;

  // 4. Taxable Income
  const taxable = Math.max(i.gross - totalDeductions, 0);

  // 5. Apply Bands (If Exempt, tax is 0)
  let tax = 0;
  let prev = 0;
  const slices: TaxResult["slices"] = [];

  if (!isExempt) {
    for (const b of TAX_BANDS) {
      const amount = Math.max(Math.min(taxable, b.upTo) - prev, 0);
      const t = amount * b.rate;
      if (amount > 0) {
        slices.push({ from: prev, to: Math.min(taxable, b.upTo), rate: b.rate, amount, tax: t });
      }
      tax += t;
      prev = b.upTo;
    }
  }

  return {
    gross: i.gross,
    rentRelief,
    totalDeductions,
    taxable,
    tax,
    monthly: tax / 12,
    effectiveRate: i.gross > 0 ? tax / i.gross : 0,
    isExempt,
    slices,
  };
} 