"use client";

import { motion } from "framer-motion";

interface BarData {
  label: string;
  income: number;
  expense: number;
}

export function BarPairChart({ data }: { data: BarData[] }) {
  // Find the maximum value to scale the bars correctly
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1 // Prevent division by zero
  );

  return (
    <div className="flex items-end justify-between h-32 w-full mt-6 gap-2">
      {data.map((item, index) => {
        const incomeHeight = `${(item.income / maxValue) * 100}%`;
        const expenseHeight = `${(item.expense / maxValue) * 100}%`;

        return (
          <div key={index} className="flex flex-col items-center flex-1 gap-2 h-full justify-end group">
            
            {/* The Bars Container */}
            <div className="flex items-end justify-center w-full gap-1 h-full">
              
              {/* Income Bar (Green) */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: incomeHeight }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                className="w-1/2 max-w-[12px] bg-[var(--brand)] rounded-t-sm relative group-hover:opacity-80 transition-opacity"
              >
                {/* Tooltip (Optional) */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-10 pointer-events-none">
                  ₦{item.income.toLocaleString()}
                </div>
              </motion.div>

              {/* Expense Bar (White/Grey) */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: expenseHeight }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 + 0.05 }}
                className="w-1/2 max-w-[12px] bg-white/20 rounded-t-sm relative group-hover:bg-white/30 transition-colors"
              >
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-10 pointer-events-none">
                  ₦{item.expense.toLocaleString()}
                </div>
              </motion.div>
              
            </div>

            {/* X-Axis Label */}
            <span className="text-[11px] text-white/50">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}