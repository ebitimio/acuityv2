"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { GlassSurface } from "./glass-surface";
import { X, Check, Tag, Divide, Trash2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TransactionDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  transaction: {
    id: string;
    merchant: string;
    amount: number;
    categoryName: string;
    categoryIcon: string;
    accountName: string;
    date: string;
    accountId?: string;
    direction?: string;
    descriptionRaw?: string;
  } | null;
}

export function TransactionDetailSheet({ isOpen, onClose, onSaved, transaction }: TransactionDetailSheetProps) {
  const [isSplitting, setIsSplitting] = useState(false);
  const [splits, setSplits] = useState([
    { category: "Groceries", amount: 0 },
    { category: "Household", amount: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  if (!transaction) return null;

  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
  const isValidSplit = Math.abs(totalSplit - transaction.amount) < 1;

  const handleSplit = async () => {
    if (!isValidSplit) return;
    setSaving(true);

    try {
      // 1. Mark the parent transaction as a "split parent"
      const { error: parentError } = await supabase
        .from("transactions")
        .update({ category_name: "Split Parent" })
        .eq("id", transaction.id);
      
      if (parentError) throw parentError;

      // 2. Insert the child transactions
      const children = splits.map(s => ({
        account_id: transaction.accountId,
        amount_minor: Math.round(s.amount * 100),
        direction: transaction.direction || "debit",
        description_raw: transaction.descriptionRaw,
        description_clean: `${transaction.merchant} (Split)`,
        category_name: s.category,
        date: new Date().toISOString(),
        parent_id: transaction.id,
      }));

      const { error: childrenError } = await supabase
        .from("transactions")
        .insert(children);

      if (childrenError) throw childrenError;

      onSaved();
      onClose();
      setIsSplitting(false);
    } catch (e) {
      console.error("Split failed:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" />
        
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[100] outline-none">
          <GlassSurface 
            tier="thick" 
            radius="36px 36px 0 0" 
            className="flex flex-col pt-3 pb-12 px-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-6" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-semibold text-white">
                {isSplitting ? "Split Transaction" : "Transaction"}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[28px] mb-4">
                {transaction.categoryIcon}
              </div>
              <p className="text-[17px] font-medium text-white mb-1">{transaction.merchant}</p>
              <p className="text-[32px] font-bold text-white tabular tracking-tight">
                ₦{transaction.amount.toLocaleString()}
              </p>
              <p className="text-[13px] text-white/50 mt-1">{transaction.date}</p>
            </div>

            {!isSplitting ? (
              <>
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-[15px] text-white/60">Account</span>
                    <span className="text-[15px] font-medium text-white">{transaction.accountName}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <span className="text-[15px] text-white/60">Category</span>
                    <span className="flex items-center gap-2 text-[15px] font-medium text-[var(--brand)] bg-[var(--brand)]/10 px-3 py-1.5 rounded-lg">
                      {transaction.categoryName}
                      <Tag size={14} />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    onClick={() => setIsSplitting(true)}
                    className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors"
                  >
                    <Divide size={18} className="text-white/70" />
                    <span className="text-[15px] font-medium text-white">Split</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 rounded-xl border border-[var(--danger)]/20 transition-colors">
                    <Trash2 size={18} className="text-[var(--danger)]" />
                    <span className="text-[15px] font-medium text-[var(--danger)]">Delete</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-[13px] text-white/60">Total to split</span>
                  <span className="text-[15px] font-semibold text-white">₦{transaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-[13px] text-white/60">Allocated</span>
                  <span className={`text-[15px] font-semibold ${isValidSplit ? 'text-[var(--brand)]' : 'text-[var(--danger)]'}`}>
                    ₦{totalSplit.toLocaleString()}
                  </span>
                </div>

                {splits.map((split, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select 
                      value={split.category}
                      onChange={(e) => {
                        const newSplits = [...splits];
                        newSplits[idx].category = e.target.value;
                        setSplits(newSplits);
                      }}
                      className="flex-1 bg-[#17191A] text-white p-3 rounded-xl border border-white/10 outline-none text-[14px]"
                    >
                      <option>Groceries</option>
                      <option>Household</option>
                      <option>Transport</option>
                      <option>Personal</option>
                      <option>Subscriptions</option>
                    </select>
                    <input 
                      type="number"
                      value={split.amount || ""}
                      onChange={(e) => {
                        const newSplits = [...splits];
                        newSplits[idx].amount = parseFloat(e.target.value) || 0;
                        setSplits(newSplits);
                      }}
                      placeholder="Amount"
                      className="w-32 bg-[#17191A] text-white p-3 rounded-xl border border-white/10 outline-none text-[14px] tabular"
                    />
                  </div>
                ))}

                <button 
                  onClick={() => setSplits([...splits, { category: "Groceries", amount: 0 }])}
                  className="flex items-center justify-center gap-2 py-2 text-[13px] text-white/60 hover:text-white transition-colors"
                >
                  <Plus size={14} /> Add another split
                </button>
              </div>
            )}

            <button 
              onClick={isSplitting ? handleSplit : onClose}
              disabled={saving || (isSplitting && !isValidSplit)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-full font-semibold text-[17px] active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {saving ? "Saving..." : isSplitting ? "Confirm Split" : (
                <>
                  <Check size={20} strokeWidth={3} />
                  Save Changes
                </>
              )}
            </button>

          </GlassSurface>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}