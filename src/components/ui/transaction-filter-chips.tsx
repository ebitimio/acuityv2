"use client";

type Filter = "all" | "credit" | "debit" | "transfers";

const CHIPS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "credit", label: "In" },
  { key: "debit", label: "Out" },
  // Removed Transfers
];

export function TransactionFilterChips({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (f: Filter) => void;
}) {
  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      {CHIPS.map((chip) => {
        const isActive = active === chip.key;
        return (
          <button
            key={chip.key}
            onClick={() => onChange(chip.key)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
              isActive
                ? "border-[var(--text-1)] bg-[var(--fill-2)] text-[var(--text-1)]"
                : "border-[var(--line)] bg-[var(--fill-1)] text-[var(--text-2)]"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

export type { Filter as TransactionFilter }