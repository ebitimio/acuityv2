"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./modal";
import { Button } from "./form";
import { createClient } from "@/lib/supabase/client";
import { parseNumberInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Delete, ArrowRightLeft, CreditCard, ChevronDown, Plus } from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { buildCategoryList } from "@/lib/category-options";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { getAccounts } from "@/lib/supabase/database";
import type { Account } from "@/lib/types";

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function QuickAddSheet({ isOpen, onClose, onSaved }: QuickAddSheetProps) {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"debit" | "credit">("debit");
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [customCategory, setCustomCategory] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const { active: activeWs } = useWorkspace();
  const supabase = createClient();

  const categoryNames = useMemo(() => {
    const rawStrings = Array.isArray(CATEGORIES)
      ? CATEGORIES.map((c: any) => (typeof c === "string" ? c : c.name || c.label || c.value))
      : [];
    return buildCategoryList(rawStrings);
  }, []);

  useEffect(() => {
    if (isOpen && activeWs) {
      getAccounts().then((accs) => {
        setAccounts(accs);
        if (accs.length > 0 && !selectedAccount) {
          setSelectedAccount(accs[0].id);
        }
      });
    }
  }, [isOpen, activeWs]);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDirection("debit");
      setCategory(CATEGORIES[0].name);
      setCustomCategory("");
      setIsCustom(false);
      setDate(new Date().toISOString().split("T")[0]);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

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
    const finalCategory = isCustom ? customCategory.trim() : category;

    if (parsedAmount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    if (!finalCategory) {
      setError("Enter a category name");
      return;
    }
    if (!selectedAccount) {
      setError("Please select an account");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const { error: dbError } = await supabase.from("transactions").insert({
        account_id: selectedAccount,
        amount_minor: Math.round(parsedAmount * 100),
        direction: direction,
        category_name: finalCategory,
        description_clean: finalCategory,
        description_raw: finalCategory,
        date: new Date(date).toISOString(),
        status: "posted",
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

  const activeAccount = accounts.find(a => a.id === selectedAccount);
  const selectedCatObj = getCategory(isCustom ? "Uncategorized" : category);

  return (
    <Modal open={isOpen} onClose={onClose} title="">
      <div className="flex flex-col h-[75dvh] min-h-0 bg-[#0b0b0c] -mx-5 -mt-6 px-5 pt-6 pb-2">
        
        {/* Top Bar (Direction) */}
        <div className="flex justify-center shrink-0 mb-4">
          <div className="flex items-center rounded-full bg-[#1c1c1e] p-1 border border-white/5">
            <button
              onClick={() => setDirection("debit")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
                direction === "debit" ? "bg-[#DE3121] text-white" : "text-[var(--text-3)] hover:text-white"
              )}
            >
              <ArrowRightLeft size={14} className="rotate-90" /> Expense
            </button>
            <button
              onClick={() => setDirection("credit")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
                direction === "credit" ? "bg-[#52c28a] text-white" : "text-[var(--text-3)] hover:text-white"
              )}
            >
              <ArrowRightLeft size={14} className="-rotate-90" /> Income
            </button>
          </div>
        </div>

        {/* Big Amount */}
        <div className="flex flex-col items-center justify-center py-6 shrink-0">
          <p className="text-[48px] font-bold tabular tracking-tight text-white leading-none">
            ₦{amount || "0"}
          </p>
        </div>

        {/* Account & Date Pills */}
        <div className="flex items-center justify-between gap-2 shrink-0 mb-4">
          <div className="flex items-center gap-2 rounded-full bg-[#1c1c1e] px-3 py-1.5 border border-white/5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
              <CreditCard size={12} />
            </div>
            <span className="text-[12px] font-medium text-white max-w-[100px] truncate">
              {activeAccount?.name || "Account"}
            </span>
            <ChevronDown size={12} className="text-white/50" />
          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#1c1c1e] px-3 py-1.5 border border-white/5 relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
            <span className="text-[12px] font-medium text-white">
              {new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>

        {/* Category Scroller (Replaces Note Input) */}
        <div className="mb-4 shrink-0">
          <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2">
              {categoryNames.map((name) => {
                const cat = getCategory(name);
                const Icon = cat.icon;
                const isActive = (category === name && !isCustom);
                return (
                  <button
                    key={name}
                    onClick={() => { setCategory(name); setIsCustom(false); }}
                    className={cn(
                      "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-3 w-[72px] transition-colors",
                      isActive ? "bg-[var(--fill-2)] border-white/20" : "bg-[#1c1c1e] border-white/5"
                    )}
                  >
                    <div 
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                      style={{ background: `${cat.color}22`, color: cat.color }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className={cn("text-[10px] font-medium truncate w-full text-center", isActive ? "text-white" : "text-white/60")}>
                      {name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
              
              {/* Add Custom Category Button */}
              <button
                onClick={() => setIsCustom(true)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-3 w-[72px] transition-colors",
                  isCustom ? "bg-[var(--fill-2)] border-white/20" : "bg-[#1c1c1e] border-white/5"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white/60">
                  <Plus size={16} />
                </div>
                <span className="text-[10px] font-medium text-white/60">Custom</span>
              </button>
            </div>
          </div>

          {isCustom && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Type custom category..."
              className="mt-2 w-full rounded-xl border border-[var(--line-strong)] bg-[#1c1c1e] px-4 py-2.5 text-[14px] text-white outline-none focus:border-[#DE3121]"
              autoFocus
            />
          )}
        </div>

        {/* Numpad & Save */}
        <div className="mt-auto pb-2 pt-2 shrink-0">
          {error && (
            <p className="mb-2 text-center text-[12px] font-medium text-[var(--danger)]">{error}</p>
          )}

          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {["1", "2", "3", "+", "4", "5", "6", "-", "7", "8", "9", "x", ".", "0", "backspace", "/"].map((key) => {
              // For the extra operator keys, we just pass them to the amount string for now
              // or disable them if you only want numbers. I'll include them visually.
              const isOperator = ["+", "-", "x", "/"].includes(key);
              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-xl text-[20px] font-medium transition-colors",
                    isOperator ? "bg-transparent text-white/40" : "bg-[#1c1c1e] text-white active:bg-[#2c2c2e]"
                  )}
                  disabled={isOperator}
                >
                  {key === "backspace" ? <Delete size={20} /> : key}
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={parseNumberInput(amount) <= 0 || !selectedAccount}
            className="w-full h-14 rounded-2xl text-[16px] font-bold bg-white text-black hover:bg-gray-200"
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}