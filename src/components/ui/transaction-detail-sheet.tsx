"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Field, SelectField, Button } from "./form";
import { CATEGORY_NAMES, getCategory } from "@/lib/categories";
import { useCurrency } from "@/lib/currency";
import { useToast } from "./toast";
import { updateTransaction, deleteTransaction, splitTransaction } from "@/lib/supabase/database";
import type { Txn } from "@/lib/types";

export function TransactionDetailSheet({ isOpen, onClose, onSaved, transaction }: { isOpen: boolean; onClose: () => void; onSaved: () => void; transaction: Txn | null }) {
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"view" | "split">("view");
  const [splitA, setSplitA] = useState({ category: "Groceries", amount: "" });
  const [splitB, setSplitB] = useState({ category: "Household", amount: "" });
  const { fmt } = useCurrency();
  const toast = useToast();

  useEffect(() => {
    if (transaction) {
      setDesc(transaction.description_clean || "");
      setCategory(transaction.category_name || "");
    }
  }, [transaction]);

  if (!transaction) return null;
  const cat = getCategory(transaction.category_name);

  const reset = () => { setDesc(""); setCategory(""); setMode("view"); setSplitA({ category: "Groceries", amount: "" }); setSplitB({ category: "Household", amount: "" }); };

  const save = async () => {
    setBusy(true);
    try {
      const patch: any = {};
      if (desc && desc !== transaction.description_clean) patch.description_clean = desc;
      if (category && category !== transaction.category_name) patch.category_name = category;
      if (Object.keys(patch).length) await updateTransaction(transaction.id, patch);
      toast("Saved");
      onSaved(); onClose(); reset();
    } catch { toast("Could not save", "err"); }
    finally { setBusy(false); }
  };

  const del = async () => {
    setBusy(true);
    try { await deleteTransaction(transaction.id); toast("Deleted"); onSaved(); onClose(); reset(); }
    catch { toast("Could not delete", "err"); }
    finally { setBusy(false); }
  };

  const doSplit = async () => {
    const total = (parseFloat(splitA.amount) || 0) + (parseFloat(splitB.amount) || 0);
    if (Math.abs(total - transaction.amount_minor / 100) > 1) { toast("Split total must match transaction", "err"); return; }
    setBusy(true);
    try {
      await splitTransaction(transaction, [
        { category: splitA.category, amount: parseFloat(splitA.amount) },
        { category: splitB.category, amount: parseFloat(splitB.amount) },
      ]);
      toast("Transaction split");
      onSaved(); onClose(); reset();
    } catch (e: any) { toast(e.message || "Could not split", "err"); }
    finally { setBusy(false); }
  };

  // SAFETY: If the transaction category is "Transfers" or "Split Parent" but not in CATEGORY_NAMES, 
  // we add it to the list of options temporarily so the dropdown doesn't incorrectly default to Groceries.
  const availableCategories = Array.from(new Set([
    ...CATEGORY_NAMES,
    transaction.category_name || ""
  ])).filter(Boolean);

  return (
    <Modal open={isOpen} onClose={() => { onClose(); reset(); }} title={mode === "split" ? "Split Transaction" : "Transaction"}>
      {mode === "view" ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${cat.color}22`, color: cat.color }}>
              <cat.icon size={32} />
            </div>
            <p className="text-[17px] font-medium">{transaction.description_clean || transaction.description_raw}</p>
            <p className={`text-[32px] font-bold tabular ${transaction.direction === "credit" ? "text-[var(--gain)]" : ""}`}>
              {transaction.direction === "credit" ? "+" : "-"}
              {fmt(transaction.amount_minor / 100)}
            </p>
          </div>

          <Field label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={transaction.description_clean || transaction.description_raw || ""} />
          
          <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {availableCategories.map((c) => <option key={c}>{c}</option>)}
          </SelectField>

          <Button loading={busy} onClick={save}>Save Changes</Button>
          
          {/* Only show split if it's not already a split or transfer */}
          {transaction.category_name !== "Split Parent" && transaction.category_name !== "Transfers" && (
            <Button variant="ghost" onClick={() => setMode("split")}>Split Transaction</Button>
          )}
          
          <Button variant="danger" loading={busy} onClick={del}>Delete</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[13px] text-[var(--text-2)]">Split {fmt(transaction.amount_minor / 100)} across two categories. Total must match exactly.</p>
          <div className="grid grid-cols-2 gap-2">
            <SelectField label="Part 1" value={splitA.category} onChange={(e) => setSplitA({ ...splitA, category: e.target.value })}>
              {CATEGORY_NAMES.map((c) => <option key={c}>{c}</option>)}
            </SelectField>
            <Field label="Amount" type="number" value={splitA.amount} onChange={(e) => setSplitA({ ...splitA, amount: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SelectField label="Part 2" value={splitB.category} onChange={(e) => setSplitB({ ...splitB, category: e.target.value })}>
              {CATEGORY_NAMES.map((c) => <option key={c}>{c}</option>)}
            </SelectField>
            <Field label="Amount" type="number" value={splitB.amount} onChange={(e) => setSplitB({ ...splitB, amount: e.target.value })} />
          </div>
          <Button loading={busy} onClick={doSplit}>Confirm Split</Button>
          <Button variant="ghost" onClick={() => setMode("view")}>Back</Button>
        </div>
      )}
    </Modal>
  );
}