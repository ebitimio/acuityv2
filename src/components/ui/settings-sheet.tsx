"use client";

import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { Button, Toggle } from "./form";
import { useCurrency } from "@/lib/currency";
import { useTheme } from "@/lib/theme";
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
  const { theme, setTheme } = useTheme();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) setConfirmDelete(false);
  }, [isOpen]);

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Account deleted");
      await supabase.auth.signOut();
      window.location.reload();
    } catch (e: any) {
      toast(e.message || "Could not delete account", "err");
      setDeleting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-5">
        {/* Currency */}
        <div className="flex items-center justify-between">
          <span className="text-[15px] text-[var(--text-1)]">Currency</span>
          <div className="inline-flex rounded-full border border-[var(--line)] bg-[var(--fill-1)] p-1">
            {(["NGN", "USD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${
                  currency === c
                    ? "bg-[var(--text-1)] text-[var(--bg)]"
                    : "text-[var(--text-2)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="flex items-center justify-between">
          <span className="text-[15px] text-[var(--text-1)]">Appearance</span>
          <div className="inline-flex rounded-full border border-[var(--line)] bg-[var(--fill-1)] p-1">
            {(["system", "light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-bold capitalize transition-colors ${
                  theme === t
                    ? "bg-[var(--text-1)] text-[var(--bg)]"
                    : "text-[var(--text-2)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Hide balances */}
        <div className="flex items-center justify-between">
          <span className="text-[15px] text-[var(--text-1)]">Hide balances</span>
          <Toggle checked={hidden} onChange={toggleHidden} label="Hide balances" />
        </div>

        <div className="h-px bg-[var(--line)]" />

        <Button variant="ghost" onClick={onSignOut}>
          Sign Out
        </Button>
        <Button variant="danger" loading={deleting} onClick={handleDeleteAccount}>
          {confirmDelete ? "Tap again to confirm delete" : "Delete Account"}
        </Button>
      </div>
    </Modal>
  );
}