"use client";

import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { Field, SelectField, Button } from "./form";
import { CurrencyField } from "./currency-field";
import { useToast } from "./toast";
import { CATEGORY_NAMES } from "@/lib/categories";
import { getAccounts, createTransaction } from "@/lib/supabase/database";
import type { Account } from "@/lib/types";

export function AddTransactionSheet({ isOpen, onClose, onSaved }: { isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [direction, setDirection] = useState<"debit" | "credit">("debit");
  const [category, setCategory] = useState("Groceries");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) getAccounts().then(setAccounts).catch(() => {});
  }, [isOpen]);

  const submit = async () => {
    if (!accountId || !desc || !amount) return;
    setSaving(true);
    try {
      await createTransaction({
        account_id: accountId,
        amount,
        direction,
        description: desc,
        category,
        date: new Date().toISOString(),
      });
      toast("Transaction added");
      onSaved();
      onClose();
      setDesc("");
      setAmount(0);
    } catch {
      toast("Could not save", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Add Transaction">
      <div className="space-y-3">
        <SelectField label="Account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Select account</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </SelectField>
        <Field label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Uber trip" />
        <CurrencyField label="Amount" value={amount} onChange={setAmount} />
        <SelectField label="Direction" value={direction} onChange={(e) => setDirection(e.target.value as "debit" | "credit")}>
          <option value="debit">Money out</option>
          <option value="credit">Money in</option>
        </SelectField>
        <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_NAMES.map((c) => <option key={c}>{c}</option>)}
        </SelectField>
        <Button loading={saving} onClick={submit}>Save Transaction</Button>
      </div>
    </Modal>
  );
}