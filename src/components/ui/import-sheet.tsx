"use client";

import { Modal } from "./modal";
import { Button } from "./form";

export function ImportSheet({
  isOpen, onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void; // Kept optional so page.tsx doesn't break
}) {
  return (
    <Modal open={isOpen} onClose={onClose} title="Import Statement">
      <div className="relative flex flex-col items-center justify-center py-10 space-y-6 overflow-hidden rounded-b-[28px]">
        
        {/* Background Construction Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-col items-center justify-center">
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
            className="absolute w-48 h-48 opacity-20"
          >
            <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
            <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
            <path d="M4 15v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3" />
            <path d="M4 15h16" />
          </svg>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
          
          {/* Acuity Logo */}
          <div className="flex items-baseline">
            <span className="text-[42px] font-black tracking-tighter text-white">
              ACUITY
            </span>
            <span className="text-[42px] font-black tracking-tighter" style={{ color: "var(--brand)" }}>
              .
            </span>
          </div>

          {/* Orange Construction Badge */}
          <div className="flex items-center gap-2 rounded-full bg-[var(--warn)]/10 px-4 py-1.5 border border-[var(--warn)]/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
              <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
              <path d="M4 15v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3" />
              <path d="M4 15h16" />
            </svg>
            <span className="text-[12px] font-semibold text-[var(--warn)]">Feature in development</span>
          </div>

          <p className="max-w-[260px] text-center text-[13px] leading-relaxed text-[var(--text-3)]">
            We're currently building an automated statement scanner. Soon you'll be able to import your bank statements directly into Acuity.
          </p>

          <div className="w-full pt-4 mt-2 border-t border-[var(--line)]">
            <Button variant="ghost" onClick={onClose} className="w-full h-12">
              Got it
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}