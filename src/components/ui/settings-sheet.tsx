"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button, Toggle } from "./form";
import { useCurrency } from "@/lib/currency";
import { useToast } from "./toast";
import { createClient } from "@/lib/supabase/client";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSignOut: () => void;
}

export function SettingsSheet({ isOpen, onClose, user, onSignOut }: SettingsSheetProps) {
  const { currency, setCurrency, hidden, toggleHidden } = useCurrency();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const supabase = createClient();

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Account deleted");
      await supabase.auth.signOut();
      window.location.reload();
    } catch (e: any) { toast(e.message || "Could not delete account", "err"); setDeleting(false); }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-[15px]">Currency</span>
          <div className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-1)] p-1">
            {(["NGN", "USD"] as const).map((c) => (
              <button key={c} onClick={() => setCurrency(c)} className={`rounded-full px-4 py-1.5 text-[13px] font-bold ${currency === c ? "bg-[var(--brand)] text-white" : "text-white/60"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[15px]">Hide balances</span>
          <Toggle checked={hidden} onChange={toggleHidden} label="Hide balances" />
        </div>

        <div className="h-px bg-[var(--line)]" />

        <Button variant="ghost" onClick={onSignOut}>Sign Out</Button>
        <Button variant="danger" loading={deleting} onClick={handleDeleteAccount}>
          {confirmDelete ? "Tap again to confirm delete" : "Delete Account"}
        </Button>
      </div>
    </Modal>
  );
}