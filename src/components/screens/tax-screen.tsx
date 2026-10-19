"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { CurrencyField } from "@/components/ui/currency-field";
import { Button } from "@/components/ui/form";
import { useCurrency } from "@/lib/currency";
import { computeTax } from "@/lib/tax";
import { printDocument } from "@/lib/export";
import { useToast } from "@/components/ui/toast";

export function TaxScreen({ onBack }: { onBack: () => void }) {
  const [gross, setGross] = useState(0);
  const [pension, setPension] = useState(0);
  const [nhf, setNhf] = useState(0);
  const [nhis, setNhis] = useState(0);
  const [rent, setRent] = useState(0);
  const [other, setOther] = useState(0);

  const { fmt } = useCurrency();
  const toast = useToast();

  const result = computeTax({ gross, pension, nhf, nhis, rent, other });

  const exportPdf = () => {
    const html = `<h1>Acuity Tax Summary</h1><p class="sub">${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long" })}</p>
      <table><tr><td>Gross income</td><td>₦${gross.toLocaleString()}</td></tr>
      <tr><td>Deductions</td><td>−₦${(result.deductions - result.rentRelief).toLocaleString()}</td></tr>
      <tr><td>Rent relief</td><td>−₦${result.rentRelief.toLocaleString()}</td></tr>
      <tr><td>Taxable income</td><td>₦${result.taxable.toLocaleString()}</td></tr>
      <tr class="total"><td>Estimated PIT</td><td>₦${result.tax.toLocaleString()}</td></tr></table>
      <p class="note">Estimate only. Consult a tax professional before filing.</p>`;
    if (!printDocument("Acuity Tax Summary", html)) toast("Pop-up blocked", "err");
  };

  return (
    <div className="min-h-[100dvh] pb-32">
      <ScreenHeader title="Tax Estimator" onBack={onBack} />
      <div className="px-4 pt-6 space-y-5">
        <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-6">
          <p className="text-[13px] text-[var(--text-2)] mb-1">Estimated PIT</p>
          <p className="text-[34px] font-bold tabular">{fmt(result.tax)}</p>
          <p className="text-[12px] text-[var(--text-3)] mt-1">Effective rate: {(result.effectiveRate * 100).toFixed(1)}%</p>
        </div>

        <div className="space-y-3">
          <CurrencyField label="Gross annual income" value={gross} onChange={setGross} />
          <CurrencyField label="Pension" value={pension} onChange={setPension} />
          <CurrencyField label="NHF" value={nhf} onChange={setNhf} />
          <CurrencyField label="NHIS" value={nhis} onChange={setNhis} />
          <CurrencyField label="Annual rent" value={rent} onChange={setRent} />
          <CurrencyField label="Other deductions" value={other} onChange={setOther} />
        </div>

        <Button onClick={exportPdf}>Export LIRS Summary (PDF)</Button>
      </div>
    </div>
  );
}