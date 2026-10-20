"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./form";
import { UploadCloud } from "lucide-react";
import { importStatement } from "@/lib/supabase/database";
import { useToast } from "./toast";

export function ImportSheet({
  isOpen, onClose, onImportSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}) {
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
        <div className="flex h-48 w-full flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-[var(--line-strong)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
            <UploadCloud size={32} />
          </div>
          <div className="px-4 text-center">
            <p className="text-[16px] font-medium text-[var(--text-1)]">Statement Scan</p>
            <p className="mt-1 text-[12px] leading-snug text-[var(--text-3)]">
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
