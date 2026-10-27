"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "./modal";
import { Button } from "./form";
import { Sparkles, TrendingUp, TrendingDown, Loader2, Award } from "lucide-react";
import { useCurrency } from "@/lib/currency";

interface ReportData {
  income: number;
  spent: number;
  prevIncome: number;
  prevSpent: number;
  topCats: { name: string; amount: number }[];
  aiSummary: string;
}

export function MonthlyReportModal({ 
  isOpen, 
  onClose, 
  workspaceId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  workspaceId: string;
}) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { fmt } = useCurrency();

  useEffect(() => {
    if (!isOpen || !workspaceId) return;
    
    setLoading(true);
    fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    })
      .then((res) => res.json())
      .then((d) => {
        if (!d.error) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

  const spentDiff = data ? data.spent - data.prevSpent : 0;
  const isSpentLess = spentDiff <= 0;

  return (
    <Modal open={isOpen} onClose={onClose} title="Monthly Report Card">
      <div className="relative flex flex-col items-center py-6 space-y-6 overflow-hidden rounded-b-[28px]">
        
        {/* Glowing Background Effects */}
        <div className="absolute top-0 w-full h-32 bg-[var(--brand)]/20 blur-[60px] rounded-full" />
        <div className="absolute top-10 w-48 h-48 bg-[var(--brand)]/10 blur-[40px] rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center w-full">
          
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand)]/60 shadow-[0_0_30px_rgba(var(--brand-rgb,222,49,33),0.4)] mb-4"
          >
            <Award size={40} className="text-[var(--brand-ink)]" />
          </motion.div>

          <h2 className="text-[24px] font-black tracking-tight text-white mb-1">
            Last 30 Days
          </h2>
          <p className="text-[13px] text-[var(--text-3)] mb-6">
            Here is how your money moved.
          </p>

          {loading ? (
            <div className="flex flex-col items-center py-8 space-y-3">
              <Loader2 className="animate-spin text-[var(--brand)]" size={32} />
              <p className="text-[12px] text-[var(--text-2)]">Analyzing your month...</p>
            </div>
          ) : data ? (
            <div className="w-full space-y-4">
              
              {/* Financial Numbers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-4 text-left">
                  <p className="text-[11px] text-[var(--text-3)] mb-1">Money In</p>
                  <p className="text-[18px] font-bold text-[var(--gain)]">{fmt(data.income)}</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-4 text-left">
                  <p className="text-[11px] text-[var(--text-3)] mb-1">Money Out</p>
                  <p className="text-[18px] font-bold text-[var(--danger)]">{fmt(data.spent)}</p>
                </div>
              </div>

              {/* Comparison */}
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--surface-3)] py-3 border border-[var(--line)]">
                {isSpentLess ? <TrendingDown size={16} className="text-[var(--gain)]" /> : <TrendingUp size={16} className="text-[var(--danger)]" />}
                <span className="text-[13px] font-medium text-[var(--text-1)]">
                  You spent {fmt(Math.abs(spentDiff))} {isSpentLess ? "less" : "more"} than the previous month
                </span>
              </div>

              {/* Top Categories */}
              <div className="text-left w-full mt-4">
                <p className="text-[12px] font-semibold text-[var(--text-2)] mb-2">Top Categories</p>
                <div className="flex flex-wrap gap-2">
                  {data.topCats.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5 rounded-full bg-[var(--brand)]/10 px-3 py-1 border border-[var(--brand)]/20">
                      <span className="text-[11px] font-medium text-[var(--brand)]">{c.name}</span>
                      <span className="text-[10px] text-[var(--brand)]/70">{fmt(c.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insight */}
              <div className="relative overflow-hidden rounded-2xl border border-[var(--brand)]/30 bg-gradient-to-br from-[var(--brand)]/10 to-transparent p-5 mt-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-[var(--brand)]" />
                  <span className="text-[13px] font-bold text-[var(--brand)]">AI Financial Coach</span>
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--text-1)] whitespace-pre-wrap">
                  {data.aiSummary}
                </p>
              </div>

            </div>
          ) : (
            <p className="text-[14px] text-[var(--danger)]">Could not load report.</p>
          )}

          <div className="w-full pt-6">
            <Button onClick={onClose} className="w-full h-12 bg-white text-black hover:bg-gray-200">
              Awesome, thanks!
            </Button>
          </div>

        </div>
      </div>
    </Modal>
  );
}