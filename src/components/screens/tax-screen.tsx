"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Field, Button } from "@/components/ui/form";
import { useCurrency } from "@/lib/currency";
import { computeTax } from "@/lib/tax";
import { printDocument } from "@/lib/export";
import { useToast } from "@/components/ui/toast";

export function TaxScreen({ onBack }: { onBack: () => void }) {
  const [gross, setGross] = useState(""); const [pension, setPension] = useState(""); const [nhf, setNhf] = useState("");
  const [nhis, setNhis] = useState(""); const [rent, setRent] = useState(""); const [other, setOther] = useState("");
  const { fmt } = useCurrency();
  const toast = useToast();

  const result = computeTax({
    gross: parseFloat(gross) || 0, pension: parseFloat(pension) || 0, nhf: parseFloat(nhf) || 0,
    nhis: parseFloat(nhis) || 0, rent: parseFloat(rent) || 0, other: parseFloat(other) || 0,
  });

  const exportPdf = () => {
    const html = `<h1>Acuity Tax Summary</h1><p class="sub">${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long" })}</p>
      <table><tr><td>Gross income</td><td>₦${(parseFloat(gross) || 0).toLocaleString()}</td></tr>
      <tr><td>Pension</td><td>−₦${result.slices.reduce((_, s) => _, result.deductions - result.rentRelief).toLocaleString()}</td></tr>
      <tr><td>Rent relief</td><td>−₦${result.rentRelief.toLocaleString()}</td></tr>
      <tr><td>Taxable income</td><td>₦${result.taxable.toLocaleString()}</td></tr>
      <tr class="total"><td>Estimated PIT</td><td>₦${result.tax.toLocaleString()}</td></tr></table>
      <p class="note">Estimate only. Consult a tax professional before filing.</p>`;
    if (!printDocument("Acuity Tax Summary", html)) toast("Pop-up blocked", "err");
  };

  return (
    <div className="min-h-[100dvh] bg-black pb-32">
      <ScreenHeader title="Tax Estimator" onBack={onBack} />
      <div className="px-4 pt-6 space-y-5">
        <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-6">
          <p className="text-[13px] text-[var(--text-2)] mb-1">Estimated PIT</p>
          <p className="text-[34px] font-bold tabular">{fmt(result.tax)}</p>
          <p className="text-[12px] text-[var(--text-3)] mt-1">Effective rate: {(result.effectiveRate * 100).toFixed(1)}%</p>
        </div>

        <div className="space-y-3">
          <Field label="Gross annual income (₦)" type="number" value={gross} onChange={(e) => setGross(e.target.value)} />
          <Field label="Pension (₦)" type="number" value={pension} onChange={(e) => setPension(e.target.value)} />
          <Field label="NHF (₦)" type="number" value={nhf} onChange={(e) => setNhf(e.target.value)} />
          <Field label="NHIS (₦)" type="number" value={nhis} onChange={(e) => setNhis(e.target.value)} />
          <Field label="Annual rent (₦)" type="number" value={rent} onChange={(e) => setRent(e.target.value)} />
          <Field label="Other deductions (₦)" type="number" value={other} onChange={(e) => setOther(e.target.value)} />
        </div>

        <Button onClick={exportPdf}>Export LIRS Summary (PDF)</Button>
      </div>
    </div>
  );
}