"use client";

import { ScreenHeader } from "@/components/ui/screen-header";
import { Button } from "@/components/ui/form";

export function BankChargeScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg)] relative overflow-hidden">
      <ScreenHeader title="Bank Charges" onBack={onBack} />

      {/* Background Construction Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex flex-col items-center justify-center">
        {/* Warning Stripes */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="20" height="40" fill="var(--warn)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stripes)" />
        </svg>
        
        {/* Large Construction Helmet */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--warn)" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="absolute w-64 h-64 opacity-20"
        >
          <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
          <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
          <path d="M4 15v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3" />
          <path d="M4 15h16" />
        </svg>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20 space-y-8">
        
        {/* Acuity Logo */}
        <div className="flex items-baseline">
          <span className="text-[52px] font-black tracking-tighter text-white">
            ACUITY
          </span>
          <span className="text-[52px] font-black tracking-tighter" style={{ color: "var(--brand)" }}>
            .
          </span>
        </div>

        {/* Orange Construction Badge */}
        <div className="flex items-center gap-2 rounded-full bg-[var(--warn)]/10 px-5 py-2 border border-[var(--warn)]/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
            <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
            <path d="M4 15v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3" />
            <path d="M4 15h16" />
          </svg>
          <span className="text-[14px] font-semibold text-[var(--warn)]">Feature in development</span>
        </div>

        <p className="max-w-[300px] text-center text-[15px] leading-relaxed text-[var(--text-2)]">
          We're currently building an advanced Bank Charge auditor. Soon you'll be able to automatically detect overcharges, stamp duties, and hidden fees directly from your statements.
        </p>

        <div className="w-full max-w-[280px] pt-6">
          <Button variant="ghost" onClick={onBack} className="w-full h-12">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}