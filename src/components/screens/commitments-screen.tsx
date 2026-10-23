"use client";

import { useEffect, useState, useMemo } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  getRecurringItems, addRecurringItem, deleteRecurringItem,
  getFunds, addFund, addToFund, deleteFund,
  getFamilySupport, setFamilySupport,
  getAllTransactions,
  getAccounts,
} from "@/lib/supabase/database";
import { detectRecurring, type Suggestion } from "@/lib/recurring";
import { useCurrency } from "@/lib/currency";
import { Modal } from "@/components/ui/modal";
import { Field, Button } from "@/components/ui/form";
import { CurrencyField } from "@/components/ui/currency-field";
import { useToast } from "@/components/ui/toast";
import { Plus, Trash2, Sparkles, Check, X, Home, Wifi, Tv, Zap, Shield, Car, CircleDollarSign, Calendar as CalendarIcon, Grid, List, ChevronDown } from "lucide-react";
import type { Account, Fund, RecurringItem } from "@/lib/types";
import { cn } from "@/lib/utils";

// Brand Detection Logic
const BRANDS = [
  { key: "netflix", name: "Netflix", icon: Tv, color: "#E50914", bg: "bg-[#E50914]" },
  { key: "spotify", name: "Spotify", icon: Wifi, color: "#1DB954", bg: "bg-[#1DB954]" },
  { key: "disney", name: "Disney+", icon: Sparkles, color: "#113CCF", bg: "bg-[#113CCF]" },
  { key: "chatgpt", name: "ChatGPT", icon: Sparkles, color: "#10A37F", bg: "bg-[#10A37F]" },
  { key: "internet", name: "Internet", icon: Wifi, color: "#F59E0B", bg: "bg-[#F59E0B]" },
  { key: "power", name: "Power", icon: Zap, color: "#F59E0B", bg: "bg-[#F59E0B]" },
  { key: "insurance", name: "Insurance", icon: Shield, color: "#3B82F6", bg: "bg-[#3B82F6]" },
  { key: "rent", name: "Rent", icon: Home, color: "#8B5CF6", bg: "bg-[#8B5CF6]" },
  { key: "car", name: "Car", icon: Car, color: "#EF4444", bg: "bg-[#EF4444]" },
  { key: "salary", name: "Salary", icon: CircleDollarSign, color: "#10B981", bg: "bg-[#10B981]" },
];

const getBrand = (name: string) => {
  const lower = name.toLowerCase();
  return BRANDS.find((b) => lower.includes(b.key)) || { name: "Bill", icon: CircleDollarSign, color: "#6B7280", bg: "bg-gray-500" };
};

export function CommitmentsScreen({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [family, setFamily] = useState({ amount_minor: 0, label: "" });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<"recurring" | "fund" | "family" | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [kind, setKind] = useState<"income" | "bill">("bill");
  const [day, setDay] = useState("1");
  const [accountId, setAccountId] = useState<string>("");

  const { fmt } = useCurrency();
  const toast = useToast();

  const load = async () => {
    const [rec, f, fam, txs, accs] = await Promise.all([
      getRecurringItems(), getFunds(), getFamilySupport(), getAllTransactions(), getAccounts(),
    ]);
    setItems(rec);
    setFunds(f);
    setFamily(fam);
    setAccounts(accs);
    const known = new Set(rec.map((x) => x.name));
    setSuggestions(detectRecurring(txs, known));
  };
  useEffect(() => { load(); }, []);

  const addRec = async () => {
    if (!name || !amount) return;
    try {
      await addRecurringItem({
        account_id: accountId || null,
        name, kind, amount, frequency: "monthly", day: parseInt(day),
      });
      toast(`${kind === "income" ? "Income" : "Bill"} added`);
      setModal(null); setName(""); setAmount(0); setDay("1"); setAccountId("");
      load();
    } catch (e: any) { toast(e.message ?? "Could not add", "err"); }
  };

  const addF = async () => {
    if (!name || !amount) return;
    try {
      await addFund(name, amount, 0, null);
      toast("Fund created");
      setModal(null); setName(""); setAmount(0);
      load();
    } catch (e: any) { toast(e.message ?? "Could not create", "err"); }
  };

  const addFam = async () => {
    try {
      await setFamilySupport(amount || 0, name || "Family support");
      toast("Saved");
      setModal(null); setName(""); setAmount(0);
      load();
    } catch (e: any) { toast(e.message ?? "Could not save", "err"); }
  };

  const acceptSuggestion = async (s: Suggestion) => {
    try {
      await addRecurringItem({
        account_id: null,
        name: s.name,
        kind: "bill",
        amount: s.amount_minor / 100,
        frequency: s.cadence === "weekly" ? "weekly" : "monthly",
        day: new Date(s.next_date).getDate(),
      });
      toast(`Saved "${s.name}" as a bill`);
      load();
    } catch (e: any) { toast(e.message ?? "Could not save", "err"); }
  };

  const dismiss = (key: string) => setDismissed((p) => new Set(p).add(key));
  const visibleSuggestions = suggestions.filter((s) => !dismissed.has(s.key));

  const income = items.filter((i) => i.kind === "income");
  const bills = items.filter((i) => i.kind === "bill");

  // Calendar Logic
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long", year: "numeric" });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const billsByDay = useMemo(() => {
    const map = new Map<number, RecurringItem[]>();
    bills.forEach((b) => {
      if (!map.has(b.day)) map.set(b.day, []);
      map.get(b.day)!.push(b);
    });
    return map;
  }, [bills]);

  return (
    <div className="min-h-[100dvh] pb-32 bg-[#0b0b0c]">
      <ScreenHeader title="Bills" onBack={onBack} right={
        <div className="flex gap-2">
          <button onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")} className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fill-1)] border border-[var(--line)] text-[var(--text-1)]">
            {viewMode === "list" ? <CalendarIcon size={16} /> : <List size={16} />}
          </button>
          <button onClick={() => { setKind("bill"); setModal("recurring"); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-white">
            <Plus size={18} />
          </button>
        </div>
      } />

      <div className="px-4 pt-6 space-y-6">
        
        {/* Detected Recurring (Suggestions) */}
        {visibleSuggestions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Sparkles size={16} className="text-[var(--brand)]" />
              <h3 className="text-[15px] font-semibold">Detected recurring</h3>
            </div>
            <div className="space-y-2">
              {visibleSuggestions.map((s) => {
                const brand = getBrand(s.name);
                const Icon = brand.icon;
                return (
                  <div key={s.key} className="rounded-2xl bg-[var(--brand)]/10 border border-[var(--brand)]/25 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", brand.bg)}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold truncate">{s.name}</p>
                        <p className="text-[11px] text-[var(--text-2)]">{fmt(s.amount_minor / 100)} · {s.cadence} · seen {s.occurrences}x</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptSuggestion(s)} className="flex-1 py-2 rounded-lg bg-[var(--brand)] text-white text-[13px] font-semibold flex items-center justify-center gap-1">
                        <Check size={14} /> Save as bill
                      </button>
                      <button onClick={() => dismiss(s.key)} className="px-3 py-2 rounded-lg bg-[var(--fill-2)] text-[13px] flex items-center gap-1">
                        <X size={14} /> Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* VIEW MODE: CALENDAR */}
        {viewMode === "calendar" && (
          <div className="rounded-[32px] bg-white p-6 shadow-2xl text-black">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold">{currentMonth}</h2>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-[11px] font-semibold text-gray-400">{d[0]}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayBills = billsByDay.get(day) || [];
                const isToday = day === today.getDate();
                return (
                  <div 
                    key={day}
                    className={cn(
                      "flex flex-col items-center justify-center aspect-square rounded-xl border p-1",
                      dayBills.length > 0 ? "bg-gray-50 border-gray-200" : "border-transparent",
                      isToday && "ring-2 ring-[#DE3121] ring-offset-1"
                    )}
                  >
                    <span className={cn("text-[13px] font-medium", isToday ? "text-[#DE3121]" : "text-gray-700")}>{day}</span>
                    <div className="flex gap-1 mt-1">
                      {dayBills.slice(0, 3).map((b, i) => {
                        const brand = getBrand(b.name);
                        const Icon = brand.icon;
                        return (
                          <div key={i} className={cn("flex h-4 w-4 items-center justify-center rounded-full text-white", brand.bg)}>
                            <Icon size={10} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW MODE: LIST */}
        {viewMode === "list" && (
          <>
            {/* Income Section */}
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[15px] font-semibold text-white">Income</h3>
                <button onClick={() => { setKind("income"); setModal("recurring"); }} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
              </div>
              <div className="space-y-2">
                {income.map((i) => {
                  const brand = getBrand(i.name);
                  const Icon = brand.icon;
                  return (
                    <div key={i.id} className="flex items-center justify-between rounded-2xl bg-[#1c1c1e] p-4 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", brand.bg)}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-white">{i.name}</p>
                          <p className="text-[11px] text-white/50">{i.frequency}, day {i.day}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tabular font-semibold text-[var(--gain)]">+{fmt(i.amount_minor / 100)}</span>
                        <button onClick={async () => { await deleteRecurringItem(i.id); load(); }} className="text-[var(--danger)] p-2"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
                {income.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-white/40 bg-[#1c1c1e] rounded-2xl">No income set up yet.</p>}
              </div>
            </section>

            {/* Bills Section */}
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[15px] font-semibold text-white">Bills</h3>
                <button onClick={() => { setKind("bill"); setModal("recurring"); }} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
              </div>
              <div className="space-y-2">
                {bills.map((i) => {
                  const brand = getBrand(i.name);
                  const Icon = brand.icon;
                  return (
                    <div key={i.id} className={cn("flex items-center justify-between rounded-2xl p-4 text-white shadow-lg", brand.bg)}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-[15px] font-bold">{i.name}</p>
                          <p className="text-[12px] opacity-80">{i.frequency}, day {i.day}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[16px] font-bold tabular">{fmt(i.amount_minor / 100)}</p>
                          <p className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-full inline-block mt-1">Overdue</p>
                        </div>
                        <button onClick={async () => { await deleteRecurringItem(i.id); load(); }} className="text-white/70 p-2 hover:text-white"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
                {bills.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-white/40 bg-[#1c1c1e] rounded-2xl">No bills yet.</p>}
              </div>
            </section>
          </>
        )}

        {/* Sinking Funds & Family Support */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Sinking funds</h3>
            <button onClick={() => setModal("fund")} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
          </div>
          <div className="space-y-2">
            {funds.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-2xl bg-[#1c1c1e] p-4 border border-white/5">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-white">{f.name}</p>
                  <p className="text-[11px] text-white/50">{fmt(f.saved_minor / 100)} of {fmt(f.target_minor / 100)}</p>
                  <div className="h-1.5 mt-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--brand)]" style={{ width: `${f.target_minor ? Math.min((f.saved_minor / f.target_minor) * 100, 100) : 0}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={async () => { const v = prompt("Add ₦ to fund:"); if (v) { await addToFund(f, parseFloat(v.replace(/,/g, ""))); load(); } }} className="text-[var(--brand)] text-[12px] font-bold">+ Add</button>
                  <button onClick={async () => { await deleteFund(f.id); load(); }} className="text-[var(--danger)] p-2"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {funds.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-white/40 bg-[#1c1c1e] rounded-2xl">No funds yet.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Family support</h3>
            <button onClick={() => setModal("family")} className="text-[var(--brand)] text-[13px] font-semibold">Edit</button>
          </div>
          <div className="rounded-2xl bg-[#1c1c1e] p-4 border border-white/5">
            <p className="text-[11px] text-white/50 mb-1">{family.label || "Monthly allocation"}</p>
            <p className="text-[20px] font-bold tabular text-white">{fmt(family.amount_minor / 100)}</p>
          </div>
        </section>
      </div>

      {/* ADD BILL / INCOME MODAL */}
      <Modal open={modal === "recurring"} onClose={() => setModal(null)} title={kind === "income" ? "Add Income" : "Add Bill"}>
        <div className="space-y-4 pb-6">
          <div className="text-center">
            <p className="text-[12px] text-[var(--text-3)]">Amount</p>
            <div className="flex items-center justify-center mt-1">
              <span className="text-[32px] text-[var(--text-3)]">₦</span>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full max-w-[200px] bg-transparent text-center text-[48px] font-bold tabular text-white outline-none placeholder:text-[var(--text-3)]"
              />
            </div>
          </div>

          <Field 
            label="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Netflix, Rent, Salary" 
            className="text-center"
          />

          {/* Smart Auto-Detect Banner */}
          {name.length > 2 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
              <div className="flex items-center gap-3">
                {(() => {
                  const brand = getBrand(name);
                  const Icon = brand.icon;
                  return (
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-white", brand.bg)}>
                      <Icon size={20} />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-[13px] font-semibold text-white">{getBrand(name).name} recognized</p>
                  <p className="text-[11px] text-[var(--text-3)]">Icon and color set from the name</p>
                </div>
              </div>
              <button onClick={() => setName("")} className="text-[12px] font-semibold text-[var(--brand)]">Undo</button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setKind("bill")}
              className={cn("flex-1 h-10 rounded-xl text-[13px] font-bold transition-colors", kind === "bill" ? "bg-[#DE3121] text-white" : "bg-[var(--surface-2)] text-[var(--text-2)]")}
            >
              Bill
            </button>
            <button
              onClick={() => setKind("income")}
              className={cn("flex-1 h-10 rounded-xl text-[13px] font-bold transition-colors", kind === "income" ? "bg-[#10B981] text-white" : "bg-[var(--surface-2)] text-[var(--text-2)]")}
            >
              Income
            </button>
          </div>

          <Field 
            label="Day of month (1-31)" 
            type="number" 
            value={day} 
            onChange={(e) => setDay(e.target.value)} 
            placeholder="e.g. 5" 
          />

          <Button onClick={addRec} disabled={!name || !amount} className="w-full h-12 text-[15px] font-bold">
            Save {kind === "income" ? "Income" : "Bill"}
          </Button>
        </div>
      </Modal>

      <Modal open={modal === "fund"} onClose={() => setModal(null)} title="Create Fund">
        <div className="space-y-3">
          <Field label="Fund name" value={name} onChange={(e) => setName(e.target.value)} />
          <CurrencyField label="Target" value={amount} onChange={setAmount} />
          <Button onClick={addF}>Create</Button>
        </div>
      </Modal>

      <Modal open={modal === "family"} onClose={() => setModal(null)} title="Family Support">
        <div className="space-y-3">
          <Field label="Label" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monthly support" />
          <CurrencyField label="Monthly amount" value={amount} onChange={setAmount} />
          <Button onClick={addFam}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}