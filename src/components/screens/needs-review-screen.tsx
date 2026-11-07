"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { getCategory } from "@/lib/categories";
import { useCurrency } from "@/lib/currency";
import { updateTransaction, addCategoryRule, getCustomCategories } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/client";
import type { Txn } from "@/lib/types";
import { ScreenHeader } from "@/components/ui/screen-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { buildCategoryList } from "@/lib/category-options";
import { useToast } from "@/components/ui/toast";
import { CheckCircle2, ChevronRight, Check } from "lucide-react";

export function NeedsReviewScreen({ onBack, onResolved }: { onBack: () => void; onResolved: () => void }) {
  const [items, setItems] = useState<Txn[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [alwaysRule, setAlwaysRule] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);
  const { fmt } = useCurrency();
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => {
    Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("category_name", "Uncategorized")
        .order("date", { ascending: false })
        .limit(30),
      getCustomCategories().catch(() => []),
    ]).then(([txRes, cats]) => {
      setItems((txRes.data ?? []) as any);
      setCustomCategories((cats || []).map((c: any) => c.name));
      setLoading(false);
    });
  }, [supabase]);

  const allCategories = useMemo(() => {
    return buildCategoryList(customCategories);
  }, [customCategories]);

  const top = items[0];
  const merchantName = (top?.description_clean || top?.description_raw || "").trim();

  const handleResolve = async (category: string) => {
    if (!top) return;
    const currentTop = top;
    const currentItems = [...items];

    // Optimistically update local list
    const remaining = items.slice(1);
    setItems(remaining);
    x.set(0);
    setShowAllCategories(false);

    try {
      await updateTransaction(currentTop.id, { category_name: category });

      // Save category rule if toggled
      if (alwaysRule && merchantName) {
        await addCategoryRule(merchantName, category).catch(() => {});

        // Automatically categorize any other transactions matching this merchant
        const matchingIds = remaining
          .filter(
            (t) =>
              (t.description_clean || t.description_raw || "").trim().toLowerCase() ===
              merchantName.toLowerCase()
          )
          .map((t) => t.id);

        if (matchingIds.length > 0) {
          for (const id of matchingIds) {
            await updateTransaction(id, { category_name: category }).catch(() => {});
          }
          setItems((prev) => prev.filter((t) => !matchingIds.includes(t.id)));
        }
      }

      onResolved();
      toast(`Categorized as ${category}`, {
        action: {
          label: "Undo",
          onClick: async () => {
            await updateTransaction(currentTop.id, { category_name: "Uncategorized" });
            setItems(currentItems);
            onResolved();
            toast("Undo applied");
          },
        },
      });
    } catch {
      setItems(currentItems);
      toast("Could not categorize", "err");
    }
  };

  const swipe = () => {
    setItems((prev) => prev.slice(1));
    x.set(0);
  };

  if (loading) return <div className="min-h-[100dvh]" />;

  return (
    <div className="min-h-[100dvh] pb-32">
      <ScreenHeader title="Needs Review" onBack={onBack} />

      {items.length === 0 ? (
        <div className="px-4 pt-20">
          <EmptyState
            icon={CheckCircle2}
            title="All caught up!"
            body="You've resolved all pending transactions."
            action="Back to Home"
            onAction={onBack}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center pt-6 px-4">
          <div className="relative w-full max-w-sm h-[470px]">
            {items
              .slice(0, 2)
              .reverse()
              .map((t) => {
                const isTop = t.id === top.id;
                const cat = getCategory(t.category_name);
                return (
                  <motion.div
                    key={t.id}
                    drag={isTop ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 100) swipe();
                    }}
                    style={{
                      x: isTop ? x : 0,
                      rotate: isTop ? rotate : 0,
                      opacity: isTop ? opacity : 1,
                      zIndex: isTop ? 10 : 1,
                    }}
                    className="absolute inset-0"
                  >
                    <div className="w-full h-full bg-[var(--surface-2)] border border-[var(--line-strong)] rounded-3xl p-5 flex flex-col justify-between shadow-xl">
                      {/* Top row */}
                      <div className="flex items-start justify-between">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: `${cat.color}22`, color: cat.color }}
                        >
                          <cat.icon size={24} />
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-medium text-[var(--text-3)] uppercase tracking-wider">Amount</p>
                          <p className="text-[20px] font-bold tabular text-white leading-tight">
                            {fmt(t.amount_minor / 100)}
                          </p>
                        </div>
                      </div>

                      {/* Merchant details */}
                      <div className="my-2">
                        <p className="text-[17px] font-semibold text-white leading-snug line-clamp-2">
                          {t.description_clean || t.description_raw}
                        </p>
                        <p className="text-[12.5px] text-[var(--text-3)] mt-0.5">
                          {new Date(t.date).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Always rule checkbox */}
                      <label className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer select-none text-[12px] text-white/80 active:bg-white/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={alwaysRule}
                          onChange={(e) => setAlwaysRule(e.target.checked)}
                          className="accent-[var(--brand)] rounded h-3.5 w-3.5"
                        />
                        <span className="line-clamp-1">
                          Always categorize <strong className="text-white">"{merchantName}"</strong> like this
                        </span>
                      </label>

                      {/* Category Options (First 4 + More button) */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        {allCategories.slice(0, 4).map((c) => (
                          <button
                            key={c}
                            onClick={() => handleResolve(c)}
                            className="w-full py-2.5 px-3 bg-[var(--fill-1)] hover:bg-[var(--brand)] hover:text-white border border-[var(--line)] rounded-xl text-[14px] font-medium text-[var(--text-1)] text-left flex items-center justify-between transition-colors active:scale-98"
                          >
                            <span>{c}</span>
                            <ChevronRight size={14} className="opacity-40" />
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => setShowAllCategories(true)}
                          className="w-full py-2 text-[12.5px] font-medium text-[var(--brand)] hover:underline text-center mt-1"
                        >
                          More categories ({allCategories.length})...
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>

          <p className="mt-6 text-[12.5px] text-[var(--text-3)] text-center">
            Swipe card left or right to skip • {items.length} left to review
          </p>
        </div>
      )}

      {/* Full Categories Picker Modal */}
      <Modal
        open={showAllCategories}
        onClose={() => setShowAllCategories(false)}
        title="Choose Category"
      >
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {allCategories.map((c) => {
            const cat = getCategory(c);
            const Icon = cat.icon;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleResolve(c)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[var(--fill-1)] hover:bg-[var(--brand)] hover:text-white text-[var(--text-1)] transition-colors active:scale-98"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${cat.color}22`, color: cat.color }}
                >
                  <Icon size={16} />
                </div>
                <span className="font-semibold text-[14px] flex-1 text-left">{c}</span>
                <ChevronRight size={14} className="opacity-40" />
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
