"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { getCategory, CATEGORY_NAMES } from "@/lib/categories";
import { useCurrency } from "@/lib/currency";
import { updateTransaction } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/client";
import type { Txn } from "@/lib/types";
import { ScreenHeader } from "@/components/ui/screen-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircle2 } from "lucide-react";

export function NeedsReviewScreen({ onBack, onResolved }: { onBack: () => void; onResolved: () => void }) {
  const [items, setItems] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);
  const { fmt } = useCurrency();
  const supabase = createClient();

  useEffect(() => {
    supabase.from("transactions").select("*").eq("category_name", "Uncategorized").order("date", { ascending: false }).limit(20)
      .then(({ data }) => { setItems((data ?? []) as any); setLoading(false); });
  }, [supabase]);

  const top = items[0];

  const handleResolve = async (category: string) => {
    if (!top) return;
    await updateTransaction(top.id, { category_name: category });
    setItems(prev => prev.slice(1));
    x.set(0);
    onResolved();
  };

  const swipe = () => { setItems(prev => prev.slice(1)); x.set(0); };

  if (loading) return <div className="min-h-[100dvh]" />;

  return (
    <div className="min-h-[100dvh] pb-32">
      <ScreenHeader title="Needs Review" onBack={onBack} />

      {items.length === 0 ? (
        <div className="px-4 pt-20">
          <EmptyState icon={CheckCircle2} title="All caught up!" body="You've resolved all pending transactions." action="Back to Home" onAction={onBack} />
        </div>
      ) : (
        <div className="flex flex-col items-center pt-8">
          <div className="relative w-full max-w-sm h-[420px]">
            {items.slice(0, 2).reverse().map((t) => {
              const isTop = t.id === top.id;
              const cat = getCategory(t.category_name);
              return (
                <motion.div key={t.id} drag={isTop ? "x" : false} dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 100) swipe(); }} style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, opacity: isTop ? opacity : 1, zIndex: isTop ? 10 : 1 }} className="absolute inset-0">
                  <div className="w-full h-full bg-[var(--surface-2)] border border-[var(--line-strong)] rounded-3xl p-6 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${cat.color}22`, color: cat.color }}><cat.icon size={28} /></div>
                      <div className="text-right"><p className="text-[12px] text-[var(--text-3)]">Amount</p><p className="text-[20px] font-bold tabular">{fmt(t.amount_minor / 100)}</p></div>
                    </div>
                    <div><p className="text-[18px] font-semibold mb-2">{t.description_clean || t.description_raw}</p><p className="text-[13px] text-[var(--text-2)]">What category does this belong to?</p></div>
                    <div className="flex flex-col gap-2">
                      {CATEGORY_NAMES.slice(0, 4).map((c) => (
                        <button key={c} onClick={() => handleResolve(c)} className="w-full py-3 bg-[var(--fill-1)] border border-[var(--line)] rounded-xl text-[15px] font-medium hover:bg-[var(--brand)] hover:text-[var(--text-1)] transition-colors">
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-8 text-[13px] text-[var(--text-3)]">Swipe to dismiss or tap an option</p>
        </div>
      )}
    </div>
  );
}