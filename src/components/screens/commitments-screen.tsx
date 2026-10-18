"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  getBills, addBill, deleteBill,
  getFunds, addFund, addToFund, deleteFund,
  getFamilySupport, setFamilySupport,
  getAllTransactions,
} from "@/lib/supabase/database";
import { detectRecurring, type Suggestion } from "@/lib/recurring";
import { useCurrency } from "@/lib/currency";
import { Modal } from "@/components/ui/modal";
import { Field, Button } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Sparkles, Check, X } from "lucide-react";
import type { Bill, Fund, Txn } from "@/lib/types";

export function CommitmentsScreen({ onBack }: { onBack: () => void }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [family, setFamily] = useState({ amount_minor: 0, label: "" });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<"bill" | "fund" | "family" | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const { fmt } = useCurrency();
  const toast = useToast();

  const load = async () => {
    const [b, f, fam, txs] = await Promise.all([
      getBills(), getFunds(), getFamilySupport(), getAllTransactions(),
    ]);
    setBills(b); setFunds(f); setFamily(fam);
    const known = new Set(b.map((x) => x.name));
    setSuggestions(detectRecurring(txs, known));
  };
  useEffect(() => { load(); }, []);

  const addB = async () => {
    if (!name || !amount) return;
    try { await addBill(name, parseFloat(amount), parseInt(dueDay)); toast("Bill added"); setModal(null); setName(""); setAmount(""); load(); }
    catch { toast("Could not add", "err"); }
  };
  const addF = async () => {
    if (!name || !amount) return;
    try { await addFund(name, parseFloat(amount), 0, null); toast("Fund created"); setModal(null); setName(""); setAmount(""); load(); }
    catch { toast("Could not create", "err"); }
  };
  const addFam = async () => {
    try { await setFamilySupport(parseFloat(amount) || 0, name || "Family support"); toast("Saved"); setModal(null); setName(""); setAmount(""); load(); }
    catch { toast("Could not save", "err"); }
  };

  const acceptSuggestion = async (s: Suggestion) => {
    const day = new Date(s.next_date).getDate();
    try {
      await addBill(s.name, s.amount_minor / 100, day);
      toast(`Saved "${s.name}" as a bill`);
      load();
    } catch { toast("Could not save", "err"); }
  };

  const dismiss = (key: string) => setDismissed((p) => new Set(p).add(key));

  const visibleSuggestions = suggestions.filter((s) => !dismissed.has(s.key));

  return (
    <div className="min-h-[100dvh] bg-black pb-32">
      <ScreenHeader title="Commitments" onBack={onBack} />
      <div className="px-4 pt-6 space-y-6">

        {visibleSuggestions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Sparkles size={16} className="text-[var(--brand)]" />
              <h3 className="text-[15px] font-semibold">Detected recurring</h3>
            </div>
            <div className="space-y-2">
              {visibleSuggestions.map((s) => (
                <div key={s.key} className="rounded-2xl bg-[var(--brand)]/10 border border-[var(--brand)]/25 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold truncate">{s.name}</p>
                      <p className="text-[11px] text-[var(--text-2)]">
                        {fmt(s.amount_minor / 100)} · {s.cadence} · seen {s.occurrences}× · {Math.round(s.confidence * 100)}% confidence
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptSuggestion(s)} className="flex-1 py-2 rounded-lg bg-[var(--brand)] text-white text-[13px] font-semibold flex items-center justify-center gap-1">
                      <Check size={14} /> Save as bill
                    </button>
                    <button onClick={() => dismiss(s.key)} className="px-3 py-2 rounded-lg bg-white/10 text-[13px] flex items-center gap-1">
                      <X size={14} /> Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold">Recurring bills</h3>
            <button onClick={() => setModal("bill")} className="text-[var(--brand)] text-[13px] flex items-center gap-1"><Plus size={14} /> Add</button>
          </div>
          <div className="group-list">
            {bills.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3">
                <div><p className="text-[14px] font-medium">{b.name}</p><p className="text-[11px] text-[var(--text-3)]">Due day {b.due_day}</p></div>
                <div className="flex items-center gap-3">
                  <span className="tabular font-semibold">{fmt(b.amount_minor / 100)}</span>
                  <button onClick={async () => { await deleteBill(b.id); load(); }} className="text-[var(--danger)]"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {bills.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)]">No bills yet.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold">Sinking funds</h3>
            <button onClick={() => setModal("fund")} className="text-[var(--brand)] text-[13px] flex items-center gap-1"><Plus size={14} /> Add</button>
          </div>
          <div className="group-list">
            {funds.map((f) => (
              <div key={f.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <p className="text-[14px] font-medium">{f.name}</p>
                  <p className="text-[11px] text-[var(--text-3)]">{fmt(f.saved_minor / 100)} of {fmt(f.target_minor / 100)}</p>
                  <div className="h-1 mt-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--brand)]" style={{ width: `${f.target_minor ? Math.min((f.saved_minor / f.target_minor) * 100, 100) : 0}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={async () => { const v = prompt("Add ₦ to fund:"); if (v) { await addToFund(f, parseFloat(v)); load(); } }} className="text-[var(--brand)] text-[12px]">+</button>
                  <button onClick={async () => { await deleteFund(f.id); load(); }} className="text-[var(--danger)]"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {funds.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)]">No funds yet.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold">Family support</h3>
            <button onClick={() => setModal("family")} className="text-[var(--brand)] text-[13px]">Edit</button>
          </div>
          <div className="group-list p-4">
            <p className="text-[11px] text-[var(--text-3)] mb-1">{family.label || "Monthly allocation"}</p>
            <p className="text-[20px] font-bold tabular">{fmt(family.amount_minor / 100)}</p>
          </div>
        </section>
      </div>

      <Modal open={modal === "bill"} onClose={() => setModal(null)} title="Add Bill">
        <div className="space-y-3">
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Amount (₦)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Field label="Due day (1-31)" type="number" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
          <Button onClick={addB}>Save</Button>
        </div>
      </Modal>
      <Modal open={modal === "fund"} onClose={() => setModal(null)} title="Create Fund">
        <div className="space-y-3">
          <Field label="Fund name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Target (₦)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button onClick={addF}>Create</Button>
        </div>
      </Modal>
      <Modal open={modal === "family"} onClose={() => setModal(null)} title="Family Support">
        <div className="space-y-3">
          <Field label="Label" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monthly support" />
          <Field label="Monthly amount (₦)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button onClick={addFam}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}