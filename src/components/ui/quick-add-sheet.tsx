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

  // We use a custom full-screen modal wrapper instead of the bottom sheet Modal
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0b0b0c] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-4">
        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 active:scale-95">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div className="flex items-center rounded-full bg-[#1c1c1e] p-1">
          <button
            onClick={() => setDirection("debit")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
              direction === "debit" ? "bg-[#DE3121] text-white" : "text-[var(--text-3)]"
            )}
          >
            <ArrowRightLeft size={14} className="rotate-90" /> Expense
          </button>
          <button
            onClick={() => setDirection("credit")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
              direction === "credit" ? "bg-[#52c28a] text-white" : "text-[var(--text-3)]"
            )}
          >
            <ArrowRightLeft size={14} className="-rotate-90" /> Income
          </button>
        </div>
        <div className="w-10" /> {/* Spacer to balance header */}
      </div>

      <div className="flex-1 flex flex-col px-4 overflow-y-auto">
        {/* Big Amount */}
        <div className="flex flex-col items-center justify-center py-8 shrink-0">
          <p className="text-[52px] font-bold tabular tracking-tight text-white leading-none">
            ₦{amount || "0"}
          </p>
        </div>

        {/* Account & Date Pills */}
        <div className="flex items-center justify-between gap-2 shrink-0 mb-6">
          
          {/* FIXED ACCOUNT DROPDOWN: Uses native select but looks like a pill */}
          <div className="relative flex items-center gap-2 rounded-full bg-[#1c1c1e] px-4 py-2 border border-white/5">
            <CreditCard size={16} className="text-white/60" />
            <span className="text-[14px] font-semibold text-white">
              {activeAccount?.name || "Select Account"}
            </span>
            <ChevronDown size={14} className="text-white/60" />
            
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
              {accounts.length === 0 && <option value="">No accounts</option>}
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative flex items-center gap-2 rounded-full bg-[#1c1c1e] px-4 py-2 border border-white/5">
            <span className="text-[14px] font-semibold text-white">
              {new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
        </div>

        {/* Category Scroller */}
        <div className="mb-4 shrink-0">
          <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                      "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-3 w-[80px] transition-colors",
                      isActive ? "bg-white/10 border-white/20" : "bg-[#1c1c1e] border-transparent"
                    )}
                  >
                    <div 
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                      style={{ background: `${cat.color}22`, color: cat.color }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className={cn("text-[11px] font-medium truncate w-full text-center", isActive ? "text-white" : "text-white/60")}>
                      {name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
              
              <button
                onClick={() => setIsCustom(true)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-3 w-[80px] transition-colors",
                  isCustom ? "bg-white/10 border-white/20" : "bg-[#1c1c1e] border-transparent"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white/60">
                  <Plus size={16} />
                </div>
                <span className="text-[11px] font-medium text-white/60">Custom</span>
              </button>
            </div>
          </div>

          {isCustom && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Type custom category..."
              className="mt-3 w-full rounded-xl border border-[var(--line-strong)] bg-[#1c1c1e] px-4 py-3 text-[15px] text-white outline-none focus:border-[#DE3121]"
              autoFocus
            />
          )}
        </div>

        {/* Numpad & Save */}
        <div className="mt-auto pb-[calc(env(safe-area-inset-bottom)+16px)] shrink-0 pt-2">
          {error && (
            <p className="mb-2 text-center text-[12px] font-medium text-[var(--danger)]">{error}</p>
          )}

          {/* Clean 3-column Numpad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="flex h-14 items-center justify-center rounded-2xl bg-[#1c1c1e] text-[22px] font-medium text-white active:bg-[#2c2c2e] transition-colors"
              >
                {key === "backspace" ? <Delete size={22} /> : key}
              </button>
            ))}
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
    </div>
  );
}