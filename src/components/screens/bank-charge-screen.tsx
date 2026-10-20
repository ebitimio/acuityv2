"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { getAllTransactions } from "@/lib/supabase/database";
import { auditCharges } from "@/lib/charges";
import { useCurrency } from "@/lib/currency";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export function BankChargeScreen({ onBack }: { onBack: () => void }) {
  const [txns, setTxns] = useState<any[]>([]);
  const { fmt } = useCurrency();
  useEffect(() => { getAllTransactions().then(setTxns); }, []);

  const audit = auditCharges(txns as any);

  return (
    <div className="min-h-[100dvh] pb-32">
      <ScreenHeader title="Bank Charges" onBack={onBack} />
      <div className="px-4 pt-6 space-y-4">
        <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-6 text-center">
          <p className="text-[13px] text-[var(--text-2)] mb-1">Possible overcharges</p>
          <p className={`text-[34px] font-bold tabular ${audit.totalOver > 0 ? "text-[var(--danger)]" : "text-[var(--gain)]"}`}>
            {fmt(audit.totalOver)}
          </p>
          <p className="text-[12px] text-[var(--text-3)] mt-1">{audit.charges.length} bank charges audited</p>
        </div>

        {audit.charges.length === 0 ? (
          <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-10 text-center">
            <ShieldCheck size={40} className="mx-auto text-[var(--gain)] mb-3" />
            <p className="text-[15px] font-semibold">All clear</p>
            <p className="text-[13px] text-[var(--text-2)] mt-1">No overcharges detected.</p>
          </div>
        ) : (
          <div className="group-list">
            {audit.charges.map((c) => (
              <div key={c.id} className="px-4 py-4">
                <div className="flex justify-between items-start mb-1">
                  <div><p className="text-[14px] font-medium">{c.description}</p><p className="text-[11px] text-[var(--text-3)]">{new Date(c.date).toLocaleDateString("en-NG")} ₦· {c.type}</p></div>
                  <p className="tabular font-bold">{fmt(c.amount)}</p>
                </div>
                {c.flag && <div className="flex items-center gap-1 text-[var(--danger)] text-[12px] mt-2"><AlertTriangle size={12} /> {c.flag}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}