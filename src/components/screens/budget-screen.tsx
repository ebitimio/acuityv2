"use client";

import { useState, useEffect } from "react";
import { GlassSurface } from "@/components/ui/glass-surface";
import { GaugeArc } from "@/components/ui/gauge-arc";
import { ChevronLeft, Pencil, Trash2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getHomeMetrics, updateBudgetLimit } from "@/lib/supabase/database";
import { motion, AnimatePresence } from "framer-motion";

export function BudgetScreen({ onBack }: { onBack: () => void }) {
  const [metrics, setMetrics] = useState({ total_spent_minor: 0, budget_limit_minor: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  const fetchMetrics = async () => {
    try {
      const data = await getHomeMetrics();
      setMetrics(data);
      setNewLimit((data.budget_limit_minor / 100).toString());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSaveBudget = async () => {
    try {
      await updateBudgetLimit(parseFloat(newLimit) || 0);
      await fetchMetrics();
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const spentNGN = metrics.total_spent_minor / 100;
  const budgetNGN = metrics.budget_limit_minor / 100;
  const percentage = budgetNGN > 0 ? Math.min(Math.round((spentNGN / budgetNGN) * 100), 100) : 0;
  const remaining = Math.max(budgetNGN - spentNGN, 0);

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Budget</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsEditing(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Pencil size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* AI Insight Line */}
        <div className="flex items-start gap-2 px-1">
          <span className="text-[var(--brand)] mt-0.5">✨</span>
          <p className="text-[14px] text-white/80 leading-snug">
            {percentage < 50 ? "Well under pace. You've built a strong cushion." : percentage < 85 ? "On pace. Keep it steady." : "Approaching limit. Watch out."}
          </p>
        </div>

        {/* Main Budget Card */}
        <GlassSurface tier="thick" radius={32} className="p-6 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4 text-[13px] text-white/60">
            <span>Monthly Budget</span>
            <span>Days left: 20</span>
          </div>

          <GaugeArc percentage={percentage} />

          <div className="text-center mt-4 mb-6">
            <p className="text-[13px] text-white/60 mb-1">Left to spend</p>
            <p className="text-[28px] font-semibold text-white tabular">₦{remaining.toLocaleString()}</p>
          </div>

          <div className="w-full flex justify-between items-center pt-4 border-t border-white/10 text-[13px]">
            <div>
              <p className="text-white/50 mb-1">Total Limit</p>
              <p className="font-medium text-white tabular">₦{budgetNGN.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 mb-1">Spent</p>
              <p className="font-medium text-white tabular">₦{spentNGN.toLocaleString()}</p>
            </div>
          </div>
        </GlassSurface>

        {/* Category Budgets (Placeholder for now) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Category budgets</h3>
            <button className="text-[13px] text-[var(--brand)] font-medium">Manage</button>
          </div>

          <GlassSurface tier="thin" radius={24} className="p-4 text-center text-white/40 text-sm">
            Category budgets coming soon
          </GlassSurface>
        </div>
      </div>

      {/* Edit Budget Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm"
            >
              <GlassSurface tier="thick" radius={28} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[18px] font-semibold text-white">Edit Monthly Budget</h2>
                  <button onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  <input 
                    type="number" 
                    placeholder="Enter new limit" 
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[20px] font-mono outline-none focus:border-[var(--brand)] tabular" 
                  />
                  <button 
                    onClick={handleSaveBudget}
                    className="w-full py-3 mt-2 bg-[var(--brand)] text-black font-semibold rounded-xl"
                  >
                    Save Budget
                  </button>
                </div>
              </GlassSurface>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}