"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RefreshCw, Trash2 } from "lucide-react";
import type { Account } from "@/lib/types";
import { MoneyText } from "@/lib/currency";

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
  isMetallic?: boolean; // NEW PROP
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
  showChip = false,
  isMetallic = false, // Default to false
}: StackedAccountCardProps) {
  
  const shouldShowChip = showChip || !hideActions;

  return (
    <motion.div
      layout
      animate={{ 
        scale: isExpanded ? 1 : 0.95,
        opacity: isExpanded ? 1 : 0.85,
      }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl shadow-xl border border-white/10",
        // If metallic, use the dark metallic gradient. Otherwise, use original dark bg.
        isMetallic 
          ? "bg-gradient-to-br from-[#1a1a1c] via-[#0d0d0f] to-[#050505]"
          : "bg-gradient-to-br from-[#1c1c1e] to-[#0b0b0c]",
        // Only force fixed height if it's compact AND metallic. 
        // Accounts page needs to expand to show buttons.
        (isCompact && isMetallic) ? "h-[220px]" : ""
      )}
    >
      {/* METALLIC EFFECTS (Only render if isMetallic is true) */}
      {isMetallic && (
        <>
          <div 
            className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        </>
      )}

      <div onClick={onClick} className={cn("relative p-5 cursor-pointer overflow-hidden h-full flex flex-col justify-between z-10", !isMetallic && "min-h-[190px]")}>
        
        {/* WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className={cn("text-[48px] font-black tracking-tighter select-none", isMetallic ? "text-[var(--brand)]/[0.04]" : "text-[var(--brand)]/[0.03]")}>
            ACUITY<span className={isMetallic ? "text-[var(--brand)]/[0.08]" : "text-[var(--brand)]/[0.06]"}>.</span>
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[12px] border-[var(--brand)]/10 shadow-inner" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full border-[12px] border-[var(--brand)]/10 shadow-inner" />

        {/* EMV Chip */}
        {shouldShowChip && (
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

        {/* Top Row: Account Info & Cardholder */}
        <div className="relative z-10 flex items-start justify-between gap-4 mt-1">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/20 shadow-inner backdrop-blur-sm">
              <span className="text-[16px] font-bold text-[var(--brand)] drop-shadow-sm">{account.name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-white truncate drop-shadow-sm">{account.name}</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wider">{account.type}</p>
            </div>
          </div>
          
          {/* Cardholder Name */}
          <div className="text-right shrink-0 flex flex-col items-end">
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-0.5">Cardholder</p>
            <p className={cn(
              "font-mono tracking-wider text-white uppercase leading-tight break-words text-right drop-shadow-sm",
              isCompact ? "text-[12px] max-w-[110px]" : "text-[13px]"
            )}>
              {cardholderName || "CARDHOLDER"}
            </p>
          </div>
        </div>
            
        {/* Bottom Row: Balance & Bank Name */}
        <div className="relative z-10 flex items-end justify-between gap-4 mt-6">
          <div className="min-w-0">
            <p className="text-[11px] text-white/60 mb-1">Balance</p>
            <div className="text-[24px] font-bold tabular text-white truncate leading-none drop-shadow-md font-hero">
              <MoneyText value={balance} className="text-[24px] font-bold text-white font-hero" />
            </div>
          </div>
          
          <p className="text-[12px] font-medium text-white/80 text-right truncate max-w-[110px] drop-shadow-sm">
            {account.institution}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && !hideActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-20 overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-md"
          >
            <div className="flex justify-end gap-5 px-5 py-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onCheckBalance(); }} 
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--brand)] hover:opacity-80 transition-opacity"
              >
                <RefreshCw size={13} /> Check Balance
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--danger)] hover:opacity-80 transition-opacity"
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