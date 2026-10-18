"use client";

import { motion, useAnimation, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Trash2, ShoppingBag, Car, Briefcase, Tv, Fuel, CreditCard } from "lucide-react";

interface TransactionRowProps {
  id: string;
  merchant: string;
  categoryIcon: string;
  categoryName: string;
  accountName: string;
  amount: number;
  isIncome?: boolean;
  onRowClick?: () => void;
}

export function TransactionRow({
  merchant,
  categoryIcon,
  categoryName,
  accountName,
  amount,
  isIncome = false,
  onRowClick,
}: TransactionRowProps) {
  const controls = useAnimation();

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 80;
    
    if (info.offset.x > threshold) {
      await controls.start({ x: 100, opacity: 0, transition: { duration: 0.2 } });
      controls.set({ x: 0, opacity: 1 });
    }
    
    if (info.offset.x < -threshold) {
      await controls.start({ x: -100, opacity: 0, transition: { duration: 0.2 } });
      controls.set({ x: 0, opacity: 1 });
    }
  };

  // Helper to render the correct icon based on the passed string
  const renderIcon = () => {
    switch (categoryIcon) {
      case "ShoppingBag": return <ShoppingBag size={20} className="text-[var(--brand)]" />;
      case "Car": return <Car size={20} className="text-[var(--info)]" />;
      case "Briefcase": return <Briefcase size={20} className="text-[#AF52DE]" />;
      case "Tv": return <Tv size={20} className="text-[#FF9F0A]" />;
      case "Fuel": return <Fuel size={20} className="text-[var(--danger)]" />;
      default: return <CreditCard size={20} className="text-white/60" />;
    }
  };

  return (
    <div className="relative w-full overflow-hidden border-b border-white/[0.05] last:border-0">
      <div className="absolute inset-0 flex items-center justify-between px-6 bg-[#0E0F10]">
        <div className="flex items-center gap-2 text-[var(--brand)]">
          <Check size={20} />
          <span className="text-[13px] font-medium">Review</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--danger)]">
          <span className="text-[13px] font-medium">Delete</span>
          <Trash2 size={20} />
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        onTap={onRowClick}
        className="relative flex items-center justify-between p-4 bg-[#0E0F10] z-10 cursor-pointer select-none"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center">
            {renderIcon()}
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-medium text-white">{merchant}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[13px] text-white/50">{categoryName}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[13px] text-white/50">{accountName}</span>
            </div>
          </div>
        </div>
        <span className={cn(
          "text-[16px] font-semibold tabular",
          isIncome ? "text-[var(--brand)]" : "text-white"
        )}>
          {isIncome ? "+" : "-"}₦{amount.toLocaleString()}
        </span>
      </motion.div>
    </div>
  );
}