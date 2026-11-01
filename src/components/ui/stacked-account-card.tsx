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
  isCompact?: boolean; 
  showChip?: boolean;
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
  isCompact = false, 
  showChip = false, // Defaults to false
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
        "bg-gradient-to-br from-[#1c1c1e] to-[#0b0b0c] border border-[var(--brand)]/30",
        isCompact && "h-[200px]" 
      )}
    >
      <div onClick={onClick} className={cn("relative p-5 cursor-pointer overflow-hidden", isCompact ? "h-full flex flex-col justify-between" : "")}>
        
        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[48px] font-black tracking-tighter text-[var(--brand)]/[0.04] select-none">
            ACUITY<span className="text-[var(--brand)]/[0.08]">.</span>
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[12px] border-[var(--brand)]/10" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full border-[12px] border-[var(--brand)]/10" />

        {/* EMV Chip - Only renders if showChip is true */}
        {showChip && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-8 z-0">
            <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-60">
              <rect width="40" height="32" rx="6" fill="#1a1a1c" />
              <rect x="1" y="1" width="38" height="30" rx="5" stroke="var(--brand)" strokeWidth="1.5" strokeOpacity="0.6" />
              <path d="M13 0V32" stroke="var(--brand)" strokeWidth="1.5" strokeOpacity="0.6" />
              <path d="M27 0V32" stroke="var(--brand)" strokeWidth="1.5" strokeOpacity="0.6" />
              <path d="M0 10H13" stroke="var(--brand)" strokeWidth="1.5" strokeOpacity="0.6" />
              <path d="M0 22H13" stroke="var(--brand)" strokeWidth="1.5" strokeOpacity="0.6" />
              <path d="M27 10H40" stroke="var(--brand)" strokeWidth="1.5" strokeOpacity="0.6" />
              <path d="M27 22H40" stroke="var(--brand)" strokeWidth="1.5" strokeOpacity="0.6" />
              <rect x="13" y="10" width="14" height="12" fill="var(--brand)" fillOpacity="0.2" />
            </svg>
          </div>
        )}

        <div className={cn("relative z-10 flex flex-col", isCompact ? "h-full justify-between" : "h-full justify-between")}>
          <div className="flex items-start justify-between gap-2">
            {/* Account Info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/20">
                <span className="text-[14px] font-bold text-[var(--brand)]">{account.name.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <p className={cn("text-[14px] font-bold text-[var(--brand)]", isCompact ? "truncate" : "")}>{account.name}</p>
                <p className="text-[10px] text-[var(--brand)]/60 uppercase">{account.type}</p>
              </div>
            </div>
            
            {/* Cardholder Name */}
            <div className="text-right shrink-0">
              <p className="text-[9px] uppercase tracking-widest text-[var(--brand)]/60 font-semibold">Cardholder</p>
              <p className={cn(
                "font-mono tracking-wider text-[var(--brand)] uppercase leading-tight",
                isCompact ? "text-[11px] max-w-[130px]" : "text-[13px]"
              )}>
                {cardholderName || "CARDHOLDER"}
              </p>
            </div>
          </div>
              
          <div className="flex items-end justify-between gap-2 mt-auto">
            <div>
              <p className="text-[10px] text-[var(--brand)]/60">Balance</p>
              <p className="text-[20px] font-bold tabular text-[var(--brand)]">{fmt(balance)}</p>
            </div>
            {/* Bank Name */}
            <p className={cn("text-[11px] font-medium text-[var(--brand)]/80 text-right", isCompact ? "truncate max-w-[100px]" : "")}>{account.institution}</p>
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