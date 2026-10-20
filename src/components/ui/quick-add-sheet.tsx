"use client";

import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { Button, Field } from "./form";
import { useToast } from "./toast";
import { getAccounts, createTransaction, getCustomCategories, addCustomCategory } from "@/lib/supabase/database";
import { buildCategoryList } from "@/lib/category-options";
import type { Account } from "@/lib/types";
import { Delete, Check, Plus } from "lucide-react";

const todayISO = () => new Date().toISOString().slice(0, 10);

const USUALS = [
  { label: "Bolt", category: "Transport", amount: 1500 },
  { label: "Lunch", category: "Food & Dining", amount: 2500 },
  { label: "Data", category: "Bills & Utilities", amount: 2000 },
  { label: "Fuel", category: "Fuel", amount: 8000 },
];

export function QuickAddSheet({
  isOpen, onClose, onSaved,
}: { isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customNames, setCustomNames] = useState<string[]>([]);
  const [accountId, setAccountId] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [digitString, setDigitString] = useState("");
  const [direction, setDirection] = useState<"debit" | "credit">("debit");
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatText, setNewCatText] = useState("");

  const toast = useToast();

  const reload = async () => {
    const [a, cats] = await Promise.all([getAccounts(), getCustomCategories()]);
    setAccounts(a);
    setCustomNames(cats.map((c) => c.name));
    if (a[0] && !accountId) setAccountId(a[0].id);
  };

  useEffect(() => {
    if (!isOpen) return;
    reload().catch(() => {});
    setDate(todayISO());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const categories = buildCategoryList(customNames);
  const displayed = (parseInt(digitString || "0", 10) / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
  });

  const press = (key: string) => {
    if (key === "del") setDigitString((s) => s.slice(0, -1));
    else if (key === "000") setDigitString((s) => (s + "000").slice(0, 12));
    else setDigitString((s) => (s + key).slice(0, 12));
  };

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
    const amount = parseInt(digitString || "0", 10) / 100;
    if (!accountId || !amount) return;
    setSaving(true);
    try {
      await createTransaction({
        account_id: accountId,
        amount,
        direction,
        description: category,
        category,
        date: new Date(date + "T12:00:00").toISOString(),
      });
      toast(`${direction === "credit" ? "Received" : "Spent"} â¦${amount.toLocaleString()}`);
      onSaved();
      onClose();
      setDigitString("");
      setDate(todayISO());
    } catch (e: any) {
      toast(e.message ?? "Could not save", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Quick add">
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccountId(a.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 ${
                accountId === a.id ? "bg-[var(--brand)] text-[var(--text-1)]" : "bg-[var(--fill-2)] text-[var(--text-2)]"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>

        <div className="text-center py-2">
          <p className="text-[13px] text-[var(--text-3)]">{direction === "credit" ? "Received" : "Spent"}</p>
          <p className="text-[44px] font-bold tabular tracking-tight">₦| "0"}</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {USUALS.map((u) => (
            <button
              key={u.label}
              onClick={() => {
                setCategory(u.category);
                setDigitString(String(u.amount * 100));
              }}
              className="px-3 py-1.5 rounded-full bg-[var(--fill-1)] border border-[var(--line)] text-[12px] whitespace-nowrap"
            >
              {u.label} â¦{u.amount.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPickerOpen(true)}
          className="field w-full justify-between text-left"
        >
          <span className="text-[16px] text-[var(--text-1)]">{category}</span>
          <span className="text-[11px] text-[var(--text-3)]">Change</span>
        </button>

        <Field label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "del"].map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="h-14 rounded-xl bg-[var(--fill-1)] border border-[var(--line)] text-[20px] font-semibold active:bg-white/[0.12]"
            >
              {k === "del" ? <Delete size={20} className="mx-auto" /> : k}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setDirection("debit")}
            className={`flex-1 py-2 rounded-xl text-[13px] font-semibold ${
              direction === "debit" ? "bg-[var(--fill-3)]" : "bg-[var(--fill-1)] text-[var(--text-2)]"
            }`}
          >
            Money out
          </button>
          <button
            onClick={() => setDirection("credit")}
            className={`flex-1 py-2 rounded-xl text-[13px] font-semibold ${
              direction === "credit" ? "bg-[var(--gain)]/25 text-[var(--gain)]" : "bg-[var(--fill-1)] text-[var(--text-2)]"
            }`}
          >
            Money in
          </button>
        </div>

        <Button loading={saving} onClick={submit} disabled={!accountId || !digitString}>
          Save
        </Button>
      </div>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Choose category">
        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
          {categories.map((name) => (
            <button
              key={name}
              onClick={() => { setCategory(name); setPickerOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--fill-1)] text-left"
            >
              <div className="w-4 flex justify-center shrink-0">
                {category === name && <Check size={16} className="text-[var(--brand)]" />}
              </div>
              <span className="text-[15px]">{name}</span>
            </button>
          ))}

          <div className="h-px bg-[var(--fill-2)] my-2" />

          <button
            onClick={() => { setNewCatOpen(true); setPickerOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--fill-1)] text-left text-[var(--brand)]"
          >
            <Plus size={16} />
            <span className="text-[15px] font-semibold">Other / create new categoryâ¦</span>
          </button>
        </div>
      </Modal>

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
