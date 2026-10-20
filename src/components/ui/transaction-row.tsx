"use client";

import { motion, useAnimation, type PanInfo } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { getCategory } from "@/lib/categories";
import { useCurrency } from "@/lib/currency";
import { shortDate } from "@/lib/dates";
import type { Txn } from "@/lib/types";

export function TransactionRow({
  txn,
  onOpen,
  onDelete,
}: {
  txn: Txn;
  onOpen: (t: Txn) => void;
  onDelete: (t: Txn) => void;
}) {
  const controls = useAnimation();
  const { fmt } = useCurrency();
  const cat = getCategory(txn.category_name);
  const Icon = cat.icon;
  const income = txn.direction === "credit";

  const onDragEnd = async (_: unknown, info: PanInfo) => {
    const dx = info.offset.x;
    await controls.start({ x: 0, transition: { type: "spring", stiffness: 500, damping: 40 } });
    if (dx > 80) onOpen(txn);
    else if (dx < -80) onDelete(txn);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-between px-5 text-[14px] font-bold">
        <span className="flex items-center gap-2 text-[var(--brand)]">
          <Pencil size={18} /> Edit
        </span>
        <span className="flex items-center gap-2 text-[var(--danger)]">
          Delete <Trash2 size={18} />
        </span>
      </div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.35}
        onDragEnd={onDragEnd}
        animate={controls}
        onTap={() => onOpen(txn)}
        style={{ touchAction: "pan-y" }}
        className="relative flex cursor-pointer select-none items-center gap-3 bg-[var(--surface-2)] px-4 py-3.5"
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ background: `${cat.color}22`, color: cat.color }}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[var(--text-1)]">
            {txn.description_clean || txn.description_raw}
          </p>
          <p className="truncate text-[12px] text-[var(--text-2)]">
            {txn.category_name || "Uncategorized"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`tabular text-[15px] font-bold ${
              income ? "text-[var(--gain)]" : "text-[var(--danger)]"
            }`}
          >
            {income ? "+" : "-"}
            {fmt(txn.amount_minor / 100)}
          </p>
          <p className="text-[11px] text-[var(--text-3)]">{shortDate(txn.date)}</p>
        </div>
      </motion.div>
    </div>
  );
}