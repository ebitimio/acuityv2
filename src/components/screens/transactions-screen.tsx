"use client";

import { useEffect, useState, useMemo } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { getTransactionsSince, deleteTransaction } from "@/lib/supabase/database";
import { useCurrency } from "@/lib/currency";
import { useWorkspace } from "@/lib/workspace";
import type { Txn } from "@/lib/types";
import { Search, Filter } from "lucide-react";
import { TransactionRow } from "@/components/ui/transaction-row";
import { TransactionDetailSheet } from "@/components/ui/transaction-detail-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";

export function TransactionsScreen({ onBack, onDataChanged }: { onBack: () => void; onDataChanged: () => void }) {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null);
  const { fmt } = useCurrency();
  const { active: activeWs } = useWorkspace();

  const load = async () => {
    if (!activeWs?.id) return;
    // Get last 6 months of transactions
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    const data = await getTransactionsSince(d.toISOString());
    
    // CHANGED: Filter out internal transfers right when they are fetched
    const filtered = (data || []).filter(t => t.category_name !== "Transfers" && t.category_name !== "Adjustment");
    setTxns(filtered);
  };

  useEffect(() => { 
    setTxns([]); 
    load(); 
  }, [activeWs?.id]);

  const handleDelete = async (t: Txn) => {
    try {
      await deleteTransaction(t.id);
      load();
      onDataChanged();
    } catch {}
  };

  // Filter by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return txns;
    const term = search.toLowerCase();
    return txns.filter(t => 
      (t.description_clean || t.description_raw || "").toLowerCase().includes(term) ||
      (t.category_name || "").toLowerCase().includes(term)
    );
  }, [txns, search]);

  // Group by Date for section headers
  const grouped = useMemo(() => {
    const groups: Record<string, Txn[]> = {};
    filtered.forEach(t => {
      const dateStr = new Date(t.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(t);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="min-h-[100dvh] pb-32">
      <ScreenHeader title="Transactions" onBack={onBack} />
      
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[15px] outline-none focus:border-[var(--brand)]"
          />
        </div>
      </div>

      <div className="px-4 space-y-6 mt-4">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="px-1 mb-2 text-[12px] font-semibold text-[var(--text-3)] uppercase tracking-wider">
              {date}
            </p>
            <div className="group-list">
              {items.map(t => (
                <TransactionRow
                  key={t.id}
                  txn={t}
                  onOpen={setSelectedTxn}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            body={search ? "Try a different search term." : "Your transaction history is empty."}
          />
        )}
      </div>

      <TransactionDetailSheet
        key={selectedTxn?.id || "empty"}
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onSaved={() => { load(); onDataChanged(); }}
        transaction={selectedTxn}
      />
    </div>
  );
}