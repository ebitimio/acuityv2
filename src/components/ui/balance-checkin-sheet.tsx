"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./form";
import { CurrencyField } from "./currency-field";
import { useToast } from "./toast";
import { useCurrency } from "@/lib/currency";
import { submitBalanceCheckin } from "@/lib/supabase/database";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  account: { id: string; name: string; current_minor: number } | null;
}

export function BalanceCheckinSheet({ isOpen, onClose, onSaved, account }: Props) {
  const [reported, setReported] = useState(0);
  const [busy, setBusy] = useState(false);
  const { fmt } = useCurrency();
  const toast = useToast();

  if (!account) return null;

  const expected = account.current_minor / 100;
  const diff = reported - expected;
  const hasDiff = Math.abs(diff) > 0.01;

  const submit = async () => {
    if (!reported) {
      toast("Enter the balance your bank shows", "err");
      return;
    }
    setBusy(true);
    try {
      const result = await submitBalanceCheckin(account.id, reported, { logAdjustment: true });
      
      if (Math.abs(result.difference_minor) > 100) {
        toast(`Balance updated to ${fmt(reported)}`);
      } else {
        toast("Balance confirmed");
      }
      
      // CHANGED: Call onSaved FIRST to trigger the parent refresh, then close
      onSaved();
      onClose();
      setReported(0);
    } catch (e: any) {
      toast(e.message ?? "Could not save check-in", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={`Check balance · ${account.name}`}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--line)] p-4">
          <p className="text-[12px] text-[var(--text-3)] mb-1">Acuity's expected balance</p>
          <p className="text-[20px] font-bold tabular text-[var(--text-1)]">{fmt(expected)}</p>
        </div>

        <CurrencyField
          label="What does your bank show right now?"
          value={reported}
          onChange={setReported}
          placeholder="Enter the real balance"
        />

        {hasDiff && (
          <div
            className={`rounded-2xl p-4 border ${
              diff > 0
                ? "bg-[var(--gain)]/10 border-[var(--gain)]/30"
                : "bg-[var(--danger)]/10 border-[var(--danger)]/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className={diff > 0 ? "text-[var(--gain)]" : "text-[var(--danger)]"} />
              <p className="text-[12px] font-semibold">
                {diff > 0 ? "You have more than expected" : "You have less than expected"}
              </p>
            </div>
            
            <p className={`text-[18px] font-bold tabular ${diff > 0 ? "text-[var(--gain)]" : "text-[var(--danger)]"}`}>
              {diff > 0 ? "+" : "-"}{fmt(Math.abs(diff))}
            </p>
            
            <p className="text-[11px] text-[var(--text-3)] mt-2 leading-snug">
              Your account balance will be updated to match this figure.
            </p>
          </div>
        )}

        {!hasDiff && reported > 0 && (
          <div className="rounded-2xl p-4 bg-[var(--gain)]/10 border border-[var(--gain)]/30 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[var(--gain)] shrink-0" />
            <p className="text-[13px] text-[var(--text-1)]">Everything matches. No adjustment needed.</p>
          </div>
        )}

        <Button loading={busy} onClick={submit} disabled={!reported}>
          {hasDiff ? "Update balance" : "Confirm balance"}
        </Button>
      </div>
    </Modal>
  );
}