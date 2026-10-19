"use client";

import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { Button } from "./form";
import { useToast } from "./toast";
import { getAccounts, createTransaction, getCustomCategories } from "@/lib/supabase/database";
import { buildCategoryList } from "@/lib/category-options";
import type { Account } from "@/lib/types";
import { Delete, ArrowLeft } from "lucide-react";

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
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const [a, cats] = await Promise.all([getAccounts(), getCustomCategories()]);
      setAccounts(a);
      setCustomNames(cats.map((c) => c.name));
      if (a[0]) setAccountId(a[0].id);
    })().catch(() => {});
  }, [isOpen]);

  const categories = buildCategoryList(customNames);
  const displayed = (parseInt(digitString || "0", 10) / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });

  const press = (key: string) => {
    if (key === "del") setDigitString((s) => s.slice(0, -1));
    else if (key === "000") setDigitString((s) => (s + "000").slice(0, 12));
    else setDigitString((s) => (s + key).slice(0, 12));
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
        date: new Date().toISOString(),
      });
      toast(`${direction === "credit" ? "Received" : "Spent"} ₦${amount.toLocaleString()}`);
      onSaved();
      onClose();
      setDigitString("");
    } catch (e: any) {
      toast(e.message ?? "Could not save", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Quick add">
      <div className="space-y-4">
        {/* Account picker */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccountId(a.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 ${
                accountId === a.id ? "bg-[var(--brand)] text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>

        {/* Big number */}
        <div className="text-center py-2">
          <p className="text-[13px] text-[var(--text-3)]">{direction === "credit" ? "Received" : "Spent"}</p>
          <p className="text-[44px] font-bold tabular tracking-tight">
            ₦{displayed || "0"}
          </p>
        </div>

        {/* Usual chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {USUALS.map((u) => (
            <button
              key={u.label}
              onClick={() => {
                setCategory(u.category);
                setDigitString(String(u.amount * 100));
              }}
              className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[12px] whitespace-nowrap"
            >
              {u.label} ₦{u.amount.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.slice(0, 12).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 ${
                category === c ? "bg-[var(--brand)] text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "del"].map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="h-14 rounded-xl bg-white/[0.06] border border-white/10 text-[20px] font-semibold active:bg-white/[0.12]"
            >
              {k === "del" ? <Delete size={20} className="mx-auto" /> : k}
            </button>
          ))}
        </div>

        {/* Direction toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setDirection("debit")}
            className={`flex-1 py-2 rounded-xl text-[13px] font-semibold ${direction === "debit" ? "bg-white/15" : "bg-white/5 text-white/60"}`}
          >
            Money out
          </button>
          <button
            onClick={() => setDirection("credit")}
            className={`flex-1 py-2 rounded-xl text-[13px] font-semibold ${direction === "credit" ? "bg-[var(--gain)]/25 text-[var(--gain)]" : "bg-white/5 text-white/60"}`}
          >
            Money in
          </button>
        </div>

        <Button loading={saving} onClick={submit} disabled={!accountId || !digitString}>
          Save
        </Button>
      </div>
    </Modal>
  );
}