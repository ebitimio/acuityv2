"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./modal";
import { Button } from "./form";
import { useCurrency } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import { parseNumberInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check, Delete } from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { buildCategoryList } from "@/lib/category-options";
import { CATEGORIES } from "@/lib/categories";

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function QuickAddSheet({ isOpen, onClose, onSaved }: QuickAddSheetProps) {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"debit" | "credit">("debit");
  const [category, setCategory] = useState("Groceries");
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fmt } = useCurrency();
  const { active: activeWs } = useWorkspace();
  const supabase = createClient();

  const categoryNames = useMemo(() => {
    const rawStrings = Array.isArray(CATEGORIES) 
      ? CATEGORIES.map((c: any) => typeof c === 'string' ? c : c.name || c.label || c.value)
      : [];
    return buildCategoryList(rawStrings);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDirection("debit");
      setCategory(categoryNames[0] || "Groceries");
      setIsCatOpen(false);
      setDate(new Date().toISOString().split("T")[0]);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen, categoryNames]);

  const handleKeyPress = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === "000") {
      if (amount !== "" && amount !== "0") setAmount((prev) => prev + "000");
    } else {
      if (amount === "0" && key !== ".") setAmount(key);
      else if (amount.includes(".") && key === ".") return;
      else setAmount((prev) => prev + key);
    }
  };

  const handleSave = async () => {
    const parsedAmount = parseNumberInput(amount);
    if (parsedAmount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    if (!activeWs) {
      setError("No active workspace");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // REMOVED `description` to fix the DB schema error
      const { error: dbError } = await supabase.from("transactions").insert({
        workspace_id: activeWs.id,
        amount_minor: Math.round(parsedAmount * 100),
        direction: direction,
        category_name: category,
        transaction_date: date,
      });

      if (dbError) throw dbError;

      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save transaction");
    } finally {
      setIsSaving(false);
    }
  };

  const quickPills = [
    { label: "Bolt", amount: 1500 },
    { label: "Lunch", amount: 2500 },
    { label: "Data", amount: 2000 },
  ];

  return (
    <Modal open={isOpen} onClose={onClose} title="Quick add">
      <div className="flex flex-col h-[85dvh] bg-[var(--bg)] -mx-6 -mt-6 rounded-t-3xl">
        {/* Top Section */}
        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full bg-[var(--brand)]/10 px-3 py-1.5 text-[13px] font-medium text-[var(--brand)]">
              {activeWs?.name || "Main Acc"}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <p className="text-[14px] font-medium text-[var(--text-3)] mb-1">
              {direction === "credit" ? "Received" : "Spent"}
            </p>
            <p className="text-[42px] font-bold tabular tracking-tight text-[var(--text-1)]">
              ₦{amount || "0"}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar justify-center">
            {quickPills.map((p) => (
              <button
                key={p.label}
                onClick={() => setAmount(p.amount.toString())}
                className="whitespace-nowrap rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--text-2)]"
              >
                {p.label} {fmt(p.amount)}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="relative">
              <button
                onClick={() => setIsCatOpen(!isCatOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3 text-left"
              >
                <span className="text-[15px] font-medium text-[var(--text-1)]">
                  {category || "Select category"}
                </span>
                <span className="text-[13px] text-[var(--text-3)]">Change</span>
              </button>
              
              {isCatOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--surface-3)] p-1 shadow-xl">
                  {categoryNames.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCategory(c);
                        setIsCatOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-[14px]",
                        category === c
                          ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                          : "text-[var(--text-1)] hover:bg-[var(--fill-1)]"
                      )}
                    >
                      {c}
                      {category === c && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section (Keypad) */}
        <div className="bg-[var(--surface-2)] px-4 pb-6 pt-3 rounded-t-3xl border-t border-[var(--line)]">
          {error && (
            <p className="mb-2 text-center text-[12px] font-medium text-[var(--danger)]">
              {error}
            </p>
          )}

          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "backspace"].map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="flex h-12 items-center justify-center rounded-xl bg-[var(--surface-3)] text-[20px] font-medium text-[var(--text-1)] active:bg-[var(--fill-2)] transition-colors"
              >
                {key === "backspace" ? <Delete size={22} className="text-[var(--text-2)]" /> : key}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setDirection("debit")}
              className={cn(
                "flex h-11 items-center justify-center rounded-xl text-[14px] font-medium transition-colors",
                direction === "debit"
                  ? "bg-[var(--text-1)] text-[var(--bg)]"
                  : "bg-[var(--surface-3)] text-[var(--text-3)]"
              )}
            >
              Money out
            </button>
            <button
              onClick={() => setDirection("credit")}
              className={cn(
                "flex h-11 items-center justify-center rounded-xl text-[14px] font-medium transition-colors",
                direction === "credit"
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--surface-3)] text-[var(--text-3)]"
              )}
            >
              Money in
            </button>
          </div>

          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={parseNumberInput(amount) <= 0}
            className="w-full h-12 rounded-xl text-[15px]"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}