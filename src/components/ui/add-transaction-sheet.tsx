"use client";

import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { Field, SelectField, Button } from "./form";
import { CurrencyField } from "./currency-field";
import { useToast } from "./toast";
import { getAccounts, createTransaction, getCustomCategories, addCustomCategory } from "@/lib/supabase/database";
import { buildCategoryList } from "@/lib/category-options";
import type { Account } from "@/lib/types";
import { Check, Plus, X } from "lucide-react";

export function AddTransactionSheet({
  isOpen, onClose, onSaved,
}: { isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customNames, setCustomNames] = useState<string[]>([]);
  const [accountId, setAccountId] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [direction, setDirection] = useState<"debit" | "credit">("debit");
  const [category, setCategory] = useState("Groceries");
  const [saving, setSaving] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatText, setNewCatText] = useState("");

  const toast = useToast();

  const reload = async () => {
    const [a, cats] = await Promise.all([getAccounts(), getCustomCategories()]);
    setAccounts(a);
    setCustomNames(cats.map((c) => c.name));
  };

  useEffect(() => {
    if (isOpen) reload().catch(() => {});
  }, [isOpen]);

  const options = buildCategoryList(customNames);

  const createCategory = async () => {
    const trimmed = newCatText.trim();
    if (!trimmed) return;
    try {
      await addCustomCategory(trimmed);
      await reload();
      setCategory(trimmed);
      setNewCatText("");
      setNewCatOpen(false);
      setPickerOpen(false);
    } catch (e: any) {
      toast(e.message ?? "Could not create category", "err");
    }
  };

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

        {/* Category field — opens a picker */}
        <div>
          <label className="t-label mb-1.5 block px-1">Category</label>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="field w-full justify-between text-left"
          >
            <span className="text-[16px] text-white">{category}</span>
            <span className="text-[11px] text-[var(--text-3)]">Change</span>
          </button>
        </div>

        <Button loading={saving} onClick={submit}>Save Transaction</Button>
      </div>

      {/* Category picker (uses the same modal styling, sits above everything) */}
      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Choose category">
        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
          {options.map((name) => (
            <button
              key={name}
              onClick={() => {
                setCategory(name);
                setPickerOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left"
            >
              <div className="w-4 flex justify-center shrink-0">
                {category === name && <Check size={16} className="text-[var(--brand)]" />}
              </div>
              <span className="text-[15px]">{name}</span>
            </button>
          ))}

          <div className="h-px bg-white/10 my-2" />

          <button
            onClick={() => { setNewCatOpen(true); setPickerOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left text-[var(--brand)]"
          >
            <Plus size={16} />
            <span className="text-[15px] font-semibold">Other / create new category…</span>
          </button>
        </div>
      </Modal>

      {/* Create new category */}
      <Modal open={newCatOpen} onClose={() => setNewCatOpen(false)} title="New category">
        <div className="space-y-3">
          <Field
            label="Category name"
            value={newCatText}
            onChange={(e) => setNewCatText(e.target.value)}
            placeholder="e.g. Church, Black tax"
            autoFocus
          />
          <Button onClick={createCategory} disabled={!newCatText.trim()}>Create category</Button>
          <Button variant="ghost" onClick={() => setNewCatOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </Modal>
  );
}