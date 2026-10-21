"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Button } from "./form";
import { parseNumberInput } from "@/lib/format";
import { transferFunds } from "@/lib/supabase/database";
import { useCurrency } from "@/lib/currency";
import { useToast } from "./toast";
import type { Account } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface TransferSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
}

export function TransferSheet({ isOpen, onClose, onSuccess, accounts }: TransferSheetProps) {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { fmt } = useCurrency();
  const toast = useToast();

  useEffect(() => {
    if (isOpen && accounts.length >= 2) {
      setFromId(accounts[0].id);
      setToId(accounts[1].id);
      setAmount("");
      setNote("");
    }
  }, [isOpen, accounts]);

  const handleTransfer = async () => {
    const parsed = parseNumberInput(amount);
    if (parsed <= 0) return toast("Enter an amount", "err");
    if (fromId === toId) return toast("Cannot transfer to the same account", "err");

    setIsSaving(true);
    try {
      await transferFunds(fromId, toId, Math.round(parsed * 100), note, new Date().toISOString());
      toast("Transfer complete");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast(e.message || "Transfer failed", "err");
    } finally {
      setIsSaving(false);
    }
  };

  if (accounts.length < 2) {
    return (
      <Modal open={isOpen} onClose={onClose} title="Transfer Funds">
        <p className="text-center text-[14px] text-[var(--text-3)] py-6">
          You need at least two accounts to make a transfer.
        </p>
      </Modal>
    );
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Transfer Funds">
      <div className="space-y-4 pb-4">
        <div className="bg-[var(--surface-2)] rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-[11px] font-medium text-[var(--text-3)] mb-1">From</p>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full bg-transparent text-[15px] font-semibold text-[var(--text-1)] outline-none appearance-none"
            >
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
          <div className="flex justify-center -my-2">
            <div className="bg-[var(--surface-3)] p-1.5 rounded-full">
              <ArrowRight size={14} className="text-[var(--text-3)] rotate-90" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[var(--text-3)] mb-1">To</p>
            {/* FIX: Removed the filter so all accounts can be selected as destination */}
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full bg-transparent text-[15px] font-semibold text-[var(--text-1)] outline-none appearance-none"
            >
              {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className="text-[13px] font-medium text-[var(--text-3)] mb-1.5">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] font-bold text-[var(--text-3)]">₦</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="w-full h-14 pl-10 pr-4 rounded-xl border border-[var(--line-strong)] bg-[var(--surface-1)] text-[20px] font-bold text-[var(--text-1)] outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>

        <div>
          <p className="text-[13px] font-medium text-[var(--text-3)] mb-1.5">Note (optional)</p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Monthly savings"
            className="w-full h-11 px-4 rounded-xl border border-[var(--line-strong)] bg-[var(--surface-1)] text-[15px] text-[var(--text-1)] outline-none focus:border-[var(--brand)]"
          />
        </div>

        {/* FIX: Added error message if user selects same account */}
        {fromId === toId && (
          <p className="text-[12px] text-[var(--danger)] text-center">
            Select a different destination account
          </p>
        )}

        <Button onClick={handleTransfer} loading={isSaving} disabled={!amount || fromId === toId} className="w-full h-12">
          Move {amount ? fmt(parseNumberInput(amount)) : "Funds"}
        </Button>
      </div>
    </Modal>
  );
}