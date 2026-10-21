"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types";

interface StackedAccountCardProps {
  account: Account;
  isExpanded: boolean;
  onClick: () => void;
  balance: number;
  fmt: (n: number) => string;
}

export function StackedAccountCard({ account, isExpanded, onClick, balance, fmt }: StackedAccountCardProps) {
  return (
    <motion.div
      layout
      onClick={onClick}
      animate={{ 
        y: isExpanded ? 0 : -10, 
        scale: isExpanded ? 1 : 0.95,
        opacity: isExpanded ? 1 : 0.7,
      }}
      whileHover={{ scale: isExpanded ? 1.02 : 0.97 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full cursor-pointer overflow-hidden rounded-2xl p-5 shadow-xl",
        // Dark background with orange-red border
        "bg-gradient-to-br from-[#1c1c1e] to-[#0b0b0c] border border-[#DE3121]/30"
      )}
      style={{ zIndex: isExpanded ? 10 : 1 }}
    >
      {/* Orange-red accent circles */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[12px] border-[#DE3121]/10" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full border-[12px] border-[#DE3121]/10" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DE3121]/20">
              <span className="text-[14px] font-bold text-[#DE3121]">{account.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#DE3121]">{account.name}</p>
              <p className="text-[10px] text-[#DE3121]/60 uppercase">{account.type}</p>
            </div>
          </div>
          <p className="text-[16px] font-bold tabular text-[#DE3121]">{fmt(balance)}</p>
        </div>

        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-[#DE3121]/60">Balance</p>
            <p className="text-[20px] font-bold tabular text-[#DE3121]">{fmt(balance)}</p>
          </div>
          <p className="text-[11px] font-medium text-[#DE3121]/80">{account.institution}</p>
        </div>
      </div>
    </motion.div>
  );
}