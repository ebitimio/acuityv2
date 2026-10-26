"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RefreshCw, Trash2 } from "lucide-react";
import type { Account } from "@/lib/types";

interface StackedAccountCardProps {
  account: Account;
  isExpanded: boolean;
  onClick: () => void;
  balance: number;
  fmt: (n: number) => string;
  onCheckBalance: () => void;
  onDelete: () => void;
  cardholderName: string;
  hideActions?: boolean;
}

export function StackedAccountCard({ 
  account, 
  isExpanded, 
  onClick, 
  balance, 
  fmt,
  onCheckBalance,
  onDelete,
  cardholderName,
  hideActions = false,
}: StackedAccountCardProps) {
  return (
    <motion.div
      layout
      animate={{ 
        scale: isExpanded ? 1 : 0.95,
        opacity: isExpanded ? 1 : 0.85,
      }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl shadow-xl",
        "bg-gradient-to-br from-[#1c1c1e] to-[#0b0b0c] border border-[var(--brand)]/30" // Uses brand color for border
      )}
    >
      <div onClick={onClick} className="relative p-5 cursor-pointer overflow-hidden">
        
        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[48px] font-black tracking-tighter text-[var(--brand)]/[0.04] select-none">
            ACUITY<span className="text-[var(--brand)]/[0.08]">.</span>
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[12px] border-[var(--brand)]/10" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full border-[12px] border-[var(--brand)]/10" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)]/20">
                <span className="text-[14px] font-bold text-[var(--brand)]">{account.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-[var(--brand)]">{account.name}</p>
                <p className="text-[10px] text-[var(--brand)]/60 uppercase">{account.type}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-[var(--brand)]/60 font-semibold">Cardholder</p>
              <p className="text-[13px] font-mono tracking-wider text-[var(--brand)] uppercase">
                {cardholderName || "CARDHOLDER"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-end justify-between">
            <div>
              <p className="text-[10px] text-[var(--brand)]/60">Balance</p>
              <p className="text-[20px] font-bold tabular text-[var(--brand)]">{fmt(balance)}</p>
            </div>
            <p className="text-[11px] font-medium text-[var(--brand)]/80">{account.institution}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && !hideActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--brand)]/20 bg-[#0b0b0c]/60"
          >
            <div className="flex justify-end gap-5 px-5 py-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onCheckBalance(); }} 
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--brand)]"
              >
                <RefreshCw size={13} /> Check Balance
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--danger)]"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}