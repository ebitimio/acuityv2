"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./form";
import { UploadCloud } from "lucide-react";
import { importStatement } from "@/lib/supabase/database";
import { useToast } from "./toast";

export function ImportSheet({ isOpen, onClose, onImportSuccess }: { isOpen: boolean; onClose: () => void; onImportSuccess: () => void }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handleClick = async () => {
    setBusy(true);
    try {
      await importStatement();
    } catch (err: any) {
      toast(err.message || "Statement Scan is coming in Step 5", "err");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Import Statement">
      <div className="space-y-4">
        <div className="w-full h-48 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)]">
            <UploadCloud size={32} />
          </div>
          <div className="text-center px-4">
            <p className="text-[17px] font-medium">Statement Scan</p>
            <p className="text-[13px] text-[var(--text-3)] mt-1 leading-snug">
              Coming in Step 5. Until then, use Quick Add on the dashboard.
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleClick} loading={busy}>Try Anyway</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}