"use client";

import { getCategory } from "@/lib/categories";
import { useCurrency } from "@/lib/currency";

interface Row {
  category: string;
  total_minor: number;
}

export function CategoryScroller({
  rows,
  onSeeAll,
}: {
  rows: Row[];
  onSeeAll: () => void;
}) {
  const { fmt } = useCurrency();
  if (rows.length === 0) return null;
  const top = rows.slice(0, 8);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-[15px] font-semibold text-[var(--text-1)]">By category</h3>
        <button onClick={onSeeAll} className="text-[12px] font-medium text-[var(--brand)]">
          See all
        </button>
      </div>
      <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
        <div className="flex gap-3">
          {top.map((row) => {
            const cat = getCategory(row.category);
            const Icon = cat.icon;
            return (
              <button
                key={row.category}
                onClick={onSeeAll}
                className="press shrink-0 rounded-[18px] p-3 text-left"
                style={{
                  width: 128,
                  background: `${cat.color}22`,
                  border: "1px solid transparent",
                }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                  style={{ color: cat.color }}
                >
                  <Icon size={18} />
                </div>
                <p className="mt-2 truncate text-[13px] font-semibold text-[var(--text-1)]">
                  {row.category}
                </p>
                <p className="mt-0.5 text-[11px] tabular text-[var(--text-2)]">
                  {fmt(row.total_minor / 100)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
