"use client";

import { GlassSurface } from "@/components/ui/glass-surface";
import { NumberRoll } from "@/components/ui/number-roll";
import { ChevronLeft, Download, Info, ShieldCheck } from "lucide-react";

const TAX_DATA = {
  grossIncome: 12500000,
  pension: 1000000,
  nhf: 312500,
  rentRelief: 500000,
  otherDeductions: 200000,
};

export function TaxScreen({ onBack }: { onBack: () => void }) {
  // Simple mock calculation for the UI (Real logic goes on the backend)
  const totalDeductions = TAX_DATA.pension + TAX_DATA.nhf + TAX_DATA.rentRelief + TAX_DATA.otherDeductions;
  const taxableIncome = TAX_DATA.grossIncome - totalDeductions;
  
  // Simplified progressive tax bracket logic for demo
  // Real app would use versioned tax_configs table as per spec §7.2
  const estimatedTax = Math.round(
    (300000 * 0.07) + 
    (300000 * 0.11) + 
    (500000 * 0.15) + 
    (500000 * 0.19) + 
    (1600000 * 0.21) + 
    ((taxableIncome - 3200000) * 0.24)
  );

  return (
    <div className="min-h-screen bg-black pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Tax Estimator</h1>
        </div>
        <span className="text-[13px] font-medium text-white/50 bg-white/10 px-3 py-1 rounded-full">
          2026 Tax Year
        </span>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* Hero Tax Card */}
        <GlassSurface tier="thick" radius={28} className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--danger)]/10 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[13px] text-white/70">Estimated Tax Owed (PIT)</p>
            <Info size={14} className="text-white/40" />
          </div>
          
          <div className="text-[40px] font-bold text-white tracking-tight mb-4">
            <NumberRoll value={estimatedTax} currency="₦" />
          </div>
          
          <div className="flex items-center gap-2 text-[13px] text-white/50 bg-white/5 p-3 rounded-xl">
            <ShieldCheck size={16} className="text-[var(--brand)] shrink-0" />
            <p>Based on LIRS progressive tax bands. This is an estimate, not official tax advice.</p>
          </div>
        </GlassSurface>

        {/* Breakdown */}
        <div>
          <h3 className="text-[15px] font-semibold text-white mb-3 px-1">Calculation Breakdown</h3>
          
          <GlassSurface tier="thin" radius={24} className="p-5 flex flex-col gap-4">
            
            <div className="flex justify-between items-center">
              <span className="text-[15px] text-white">Gross Income</span>
              <span className="text-[15px] font-medium text-white tabular">₦{TAX_DATA.grossIncome.toLocaleString()}</span>
            </div>
            
            <div className="h-px w-full bg-white/10" />
            
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-medium text-white/50 uppercase tracking-wider">Deductions</span>
              
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-white/70">Pension Contribution</span>
                <span className="text-white/90 tabular">-₦{TAX_DATA.pension.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-white/70">NHF</span>
                <span className="text-white/90 tabular">-₦{TAX_DATA.nhf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-white/70">Rent Relief</span>
                <span className="text-white/90 tabular">-₦{TAX_DATA.rentRelief.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-white/70">Other Deductions</span>
                <span className="text-white/90 tabular">-₦{TAX_DATA.otherDeductions.toLocaleString()}</span>
              </div>
            </div>

            <div className="h-px w-full bg-white/10" />

            <div className="flex justify-between items-center">
              <span className="text-[15px] font-medium text-white">Taxable Income</span>
              <span className="text-[17px] font-bold text-[var(--brand)] tabular">₦{taxableIncome.toLocaleString()}</span>
            </div>

          </GlassSurface>
        </div>

        {/* Action Button */}
        <button className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-full font-semibold text-[17px] active:scale-[0.98] transition-transform mt-2">
          <Download size={20} />
          Export LIRS Summary (PDF)
        </button>

      </div>
    </div>
  );
}