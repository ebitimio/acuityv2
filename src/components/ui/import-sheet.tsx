"use client";

import { Modal } from "./modal";
import { Button } from "./form";
import { Construction } from "lucide-react";

export function ImportSheet({
  isOpen, onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void; // Kept optional so page.tsx doesn't break
}) {
  return (
    <Modal open={isOpen} onClose={onClose} title="Import Statement">
      <div className="flex flex-col items-center justify-center py-10 space-y-6">
        
        {/* Acuity Logo */}
        <div className="flex items-baseline">
          <span className="text-[42px] font-black tracking-tighter text-white">
            ACUITY
          </span>
          <span className="text-[42px] font-black tracking-tighter" style={{ color: "#DE3121" }}>
            .
          </span>
        </div>

        {/* Coming Soon Indicator */}
        <div className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-4 py-1.5 border border-[var(--line)]">
          <Construction size={14} className="text-[var(--warn)]" />
          <span className="text-[12px] font-semibold text-[var(--text-2)]">Feature in development</span>
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
    </Modal>
  );
}