"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./modal";
import { Button } from "./form";
import { createClient } from "@/lib/supabase/client";
import { parseNumberInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";
import { buildCategoryList } from "@/lib/category-options";
import { CATEGORIES } from "@/lib/categories";

interface AddTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AddTransactionSheet({ isOpen, onClose, onSaved }: AddTransactionSheetProps) {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"debit" | "credit">("debit");
  const [category, setCategory] = useState("Groceries");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setDate(new Date().toISOString().split("T")[0]);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen, categoryNames]);

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

  return (
    <Modal open={isOpen} onClose={onClose} title="Add Transaction">
      <div className="flex flex-col h-[85dvh] bg-[var(--bg)] -mx-6 -mt-6 rounded-t-3xl overflow-hidden">
        
        {/* Scrollable Top Section */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
          
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-[14px] font-medium text-[var(--text-3)] mb-2">
              {direction === "credit" ? "Received" : "Spent"}
            </p>
            <div className="flex items-center justify-center text-[48px] font-bold tabular tracking-tight text-[var(--text-1)] w-full">
              <span className="text-[36px] mr-2 text-[var(--text-3)]">₦</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="bg-transparent text-center outline-none w-full max-w-[250px] placeholder:text-[var(--text-3)]"
              />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {/* Native Select for Category */}
            <div>
              <p className="mb-1.5 px-1 text-[13px] font-medium text-[var(--text-3)]">Category</p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3.5 text-[15px] text-[var(--text-1)] focus:border-[var(--brand)] outline-none appearance-none"
              >
                {categoryNames.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <p className="mb-1.5 px-1 text-[13px] font-medium text-[var(--text-3)]">Date</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3.5 text-[15px] text-[var(--text-1)] focus:border-[var(--brand)] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section (Direction & Save) */}
        <div className="shrink-0 px-6 pb-8 pt-4 border-t border-[var(--line)] bg-[var(--bg)]">
          {error && (
            <p className="mb-3 text-center text-[12px] font-medium text-[var(--danger)]">
              {error}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setDirection("debit")}
              className={cn(
                "flex h-12 items-center justify-center rounded-xl text-[14px] font-medium transition-colors",
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
                "flex h-12 items-center justify-center rounded-xl text-[14px] font-medium transition-colors",
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
            className="w-full h-14 rounded-2xl text-[16px]"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}