"use client";

import { useRef, useState } from "react";
import { Modal } from "./modal";
import { Button } from "./form";
import { UploadCloud } from "lucide-react";
import { importCsvStatement } from "@/lib/supabase/database";
import { useToast } from "./toast";

export function ImportSheet({ isOpen, onClose, onImportSuccess }: { isOpen: boolean; onClose: () => void; onImportSuccess: () => void }) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const result = await importCsvStatement(file);
      const summary = result.skipped
        ? `Imported ${result.inserted}, skipped ${result.skipped} duplicates`
        : `Imported ${result.inserted} transactions`;
      toast(summary);
      onImportSuccess();
      onClose();
    } catch (err: any) {
      toast(err.message || "Import failed", "err");
    } finally { setBusy(false); }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Import Statement">
      <div className="space-y-4">
        <button onClick={() => fileRef.current?.click()} disabled={busy} className="w-full h-48 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors">
          <div className="w-16 h-16 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)]"><UploadCloud size={32} /></div>
          <div className="text-center">
            <p className="text-[17px] font-medium">{busy ? "Reading..." : "Upload Statement"}</p>
            <p className="text-[13px] text-[var(--text-3)] mt-1">CSV from any Nigerian bank</p>
          </div>
        </button>
        <input type="file" accept=".csv" ref={fileRef} onChange={handleFile} className="hidden" />
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}