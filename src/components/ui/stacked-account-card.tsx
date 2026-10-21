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
  const gradients = [
    "from-blue-600 to-blue-900",
    "from-red-600 to-red-900",
    "from-emerald-600 to-emerald-900",
    "from-purple-600 to-purple-900",
    "from-orange-500 to-red-600",
  ];
  const hash = account.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const gradient = gradients[hash % gradients.length];

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
        "bg-gradient-to-br border border-white/10 text-white",
        gradient
      )}
      style={{ zIndex: isExpanded ? 10 : 1 }}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[12px] border-white/10" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full border-[12px] border-white/10" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
              <span className="text-[14px] font-bold">{account.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-[14px] font-bold">{account.name}</p>
              <p className="text-[10px] text-white/70 uppercase">{account.type}</p>
            </div>
          </div>
          <p className="text-[16px] font-bold tabular">{fmt(balance)}</p>
        </div>

        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-white/70">Balance</p>
            <p className="text-[20px] font-bold tabular">{fmt(balance)}</p>
          </div>
          <p className="text-[11px] font-medium text-white/80">{account.institution}</p>
        </div>
      </div>
    </motion.div>
  );
}