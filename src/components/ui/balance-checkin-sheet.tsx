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
  const [logAdjustment, setLogAdjustment] = useState(true);
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
      const result = await submitBalanceCheckin(account.id, reported, { logAdjustment });
      if (Math.abs(result.difference_minor) > 100) {
        toast(`Recorded ₦ ₦¦${Math.abs(result.difference_minor / 100).toLocaleString()} difference ${logAdjustment ? "logged as adjustment" : "resolved by re-anchor"}`);
      } else {
        toast("Balance confirmed");
      }
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
    <Modal open={isOpen} onClose={onClose} title={`Check balance ₦· ${account.name}`}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--line)] p-4">
          <p className="text-[12px] text-[var(--text-3)] mb-1">Acuity's expected balance</p>
          <p className="text-[20px] font-bold tabular">{fmt(expected)}</p>
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
              {diff > 0 ? "+" : "₦"}{fmt(Math.abs(diff))}
            </p>
            <p className="text-[11px] text-[var(--text-3)] mt-2 leading-snug">
              {diff < 0
                ? "This is likely spending you didn't log. Choose how to handle it below."
                : "This could be income or a transfer you didn't log. Choose how to handle it below."}
            </p>
          </div>
        )}

        {!hasDiff && reported > 0 && (
          <div className="rounded-2xl p-4 bg-[var(--gain)]/10 border border-[var(--gain)]/30 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[var(--gain)] shrink-0" />
            <p className="text-[13px] text-[var(--text-1)]">Everything matches. No adjustment needed.</p>
          </div>
        )}

        {hasDiff && (
          <div className="space-y-2">
            <button
              onClick={() => setLogAdjustment(true)}
              className={`w-full text-left rounded-2xl p-3 border transition-colors ${
                logAdjustment
                  ? "bg-[var(--brand)]/15 border-[var(--brand)]/40"
                  : "bg-[var(--surface-1)] border-[var(--line)]"
              }`}
            >
              <p className="text-[13px] font-semibold mb-0.5">Log as adjustment</p>
              <p className="text-[11px] text-[var(--text-2)]">
                Create one line "Balance check-in adjustment" for {fmt(Math.abs(diff))}. Category trends stay accurate.
              </p>
            </button>
            <button
              onClick={() => setLogAdjustment(false)}
              className={`w-full text-left rounded-2xl p-3 border transition-colors ${
                !logAdjustment
                  ? "bg-[var(--brand)]/15 border-[var(--brand)]/40"
                  : "bg-[var(--surface-1)] border-[var(--line)]"
              }`}
            >
              <p className="text-[13px] font-semibold mb-0.5">Just re-anchor</p>
              <p className="text-[11px] text-[var(--text-2)]">
                Reset the balance to what you typed without logging a transaction. History stays clean, but the gap goes unexplained.
              </p>
            </button>
          </div>
        )}

        <Button loading={busy} onClick={submit} disabled={!reported}>
          {hasDiff ? "Save check-in" : "Confirm balance"}
        </Button>
      </div>
    </Modal>
  );
}