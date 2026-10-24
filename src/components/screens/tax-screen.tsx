"use client";

import { useState, useEffect } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { CurrencyField } from "@/components/ui/currency-field";
import { Button } from "@/components/ui/form";
import { useCurrency } from "@/lib/currency";
import { computeTax, EXEMPTION_THRESHOLD } from "@/lib/tax";
import { printDocument } from "@/lib/export";
import { useToast } from "@/components/ui/toast";
import { 
  getRecurringItems, getAnnualRent, setAnnualRent, getAllTransactions 
} from "@/lib/supabase/database";
import { ChevronRight, Info, ShieldCheck, ChevronLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function TaxScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  // Inputs
  const [gross, setGross] = useState(0);
  const [rent, setRent] = useState(0);
  const [pension, setPension] = useState(0);
  const [nhf, setNhf] = useState(0);
  const [nhis, setNhis] = useState(0);
  const [other, setOther] = useState(0);

  const { fmt } = useCurrency();
  const toast = useToast();

  // 1. Pull Data
  useEffect(() => {
    async function load() {
      try {
        const [items, savedRent] = await Promise.all([getRecurringItems(), getAnnualRent()]);
        
        // Calculate Annual Gross from Income commitments
        const monthlyIncome = items.filter(i => i.kind === "income").reduce((s, i) => s + i.amount_minor / 100, 0);
        const annualGross = monthlyIncome * 12;
        
        setGross(annualGross);
        // Auto-fill 8% Pension based on gross
        setPension(annualGross * 0.08);
        setRent(savedRent);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const result = computeTax({ gross, pension, nhf, nhis, rent, other });

  const handleSaveRent = async () => {
    try {
      await setAnnualRent(rent);
      setStep(3);
    } catch {
      toast("Could not save rent", "err");
    }
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) handleSaveRent();
  };

  const exportPdf = () => {
    const html = `<h1>Acuity Tax Summary</h1><p class="sub">${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long" })}</p>
      <table>
        <tr><td>Gross Income</td><td>₦${gross.toLocaleString()}</td></tr>
        <tr><td>Pension (8%)</td><td>₦${pension.toLocaleString()}</td></tr>
        <tr><td>NHF</td><td>₦${nhf.toLocaleString()}</td></tr>
        <tr><td>NHIS</td><td>₦${nhis.toLocaleString()}</td></tr>
        <tr><td>Rent Relief (20% capped at 500k)</td><td>₦${result.rentRelief.toLocaleString()}</td></tr>
        <tr><td>Other Deductions</td><td>₦${other.toLocaleString()}</td></tr>
        <tr><td>Taxable Income</td><td>₦${result.taxable.toLocaleString()}</td></tr>
        <tr class="total"><td>Estimated PIT</td><td>₦${result.tax.toLocaleString()}</td></tr>
      </table>
      <p class="note">Estimate only. Consult a tax professional before filing.</p>`;
    if (!printDocument("Acuity Tax Summary", html)) toast("Pop-up blocked", "err");
  };

  if (loading) return <div className="min-h-[100dvh]" style={{ background: "var(--bg)" }} />;

  return (
    <div className="min-h-[100dvh] pb-32 bg-[#0b0b0c]">
      <ScreenHeader 
        title="Tax Estimator" 
        onBack={step === 1 ? onBack : () => setStep(step - 1)} 
      />

      <div className="px-4 pt-6 max-w-md mx-auto">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn("h-1 flex-1 rounded-full transition-colors", s <= step ? "bg-[#DE3121]" : "bg-white/10")} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: INCOME & PENSION */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-[24px] font-bold text-white">Income Details</h2>
                <p className="text-[13px] text-[var(--text-3)] mt-1">We pre-filled your income from your Commitments page.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] space-y-4">
                <CurrencyField label="Gross Annual Income" value={gross} onChange={setGross} />
                <CurrencyField label="Pension Contribution (8%)" value={pension} onChange={setPension} />
              </div>

              <div className="p-4 rounded-xl bg-[#DE3121]/10 border border-[#DE3121]/20 flex items-start gap-3">
                <Info size={18} className="text-[#DE3121] shrink-0 mt-0.5" />
                <p className="text-[12px] text-white/80 leading-relaxed">
                  Your pension is automatically estimated at 8% of your gross income. You can adjust this if your employer uses a different structure.
                </p>
              </div>

              <Button onClick={handleNext} className="w-full h-14 text-[16px] font-bold">Continue</Button>
            </motion.div>
          )}

          {/* STEP 2: RENT & DEDUCTIONS */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-[24px] font-bold text-white">Deductions</h2>
                <p className="text-[13px] text-[var(--text-3)] mt-1">Add your rent and other reliefs to reduce your tax.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] space-y-4">
                <CurrencyField label="Annual Rent Paid" value={rent} onChange={setRent} />
                <CurrencyField label="NHF Contribution" value={nhf} onChange={setNhf} />
                <CurrencyField label="NHIS Contribution" value={nhis} onChange={setNhis} />
                <CurrencyField label="Other Deductions (Life Insurance, etc.)" value={other} onChange={setOther} />
              </div>

              <Button onClick={handleNext} className="w-full h-14 text-[16px] font-bold">Calculate Tax</Button>
            </motion.div>
          )}

          {/* STEP 3: RESULT */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="text-[24px] font-bold text-white">Your Estimate</h2>
                <p className="text-[13px] text-[var(--text-3)] mt-1">Based on the Nigeria Tax Act 2025.</p>
              </div>

              {/* Exemption Check */}
              {result.isExempt ? (
                <div className="p-6 rounded-3xl bg-[#52c28a]/10 border border-[#52c28a]/20 text-center">
                  <ShieldCheck size={48} className="text-[#52c28a] mx-auto mb-4" />
                  <h3 className="text-[20px] font-bold text-white">You are Tax Exempt!</h3>
                  <p className="text-[13px] text-[var(--text-2)] mt-2">
                    Your gross income is below the ₦{EXEMPTION_THRESHOLD.toLocaleString()} annual exemption threshold.
                  </p>
                  <p className="text-[36px] font-bold tabular text-[#52c28a] mt-4">₦0</p>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-[#DE3121] text-black shadow-xl">
                  <p className="text-[13px] font-medium text-black/70">Estimated PIT</p>
                  <p className="text-[40px] font-black tabular mt-1">{fmt(result.tax)}</p>
                  <div className="flex justify-between mt-4 pt-4 border-t border-black/20 text-[12px] font-semibold">
                    <span>Monthly: {fmt(result.monthly)}</span>
                    <span>Effective Rate: {(result.effectiveRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}

              {/* Breakdown Card */}
              <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-5 space-y-3">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--text-3)]">Gross Income</span>
                  <span className="font-semibold text-white">{fmt(gross)}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--text-3)]">Total Deductions</span>
                  <span className="font-semibold text-[#52c28a]">-{fmt(result.totalDeductions)}</span>
                </div>
                <div className="h-px w-full bg-[var(--line)]" />
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--text-1)] font-bold">Taxable Income</span>
                  <span className="font-bold text-white">{fmt(result.taxable)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Edit</Button>
                <Button onClick={exportPdf} className="flex-[2]">Export PDF</Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}