"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
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
import { 
  Plus, Trash2, Sparkles, Check, X, Home, Wifi, Tv, Zap, Shield, Car, 
  CircleDollarSign, Calendar as CalendarIcon, ChevronDown, ChevronUp, Delete
} from "lucide-react";
import type { Account, Fund, RecurringItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  
  // View states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
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
    const numericAmount = parseFloat(amount);
    if (!name || !numericAmount) return;
    try {
      await addRecurringItem({
        account_id: accountId || null,
        name, kind, amount: numericAmount, frequency: "monthly", day: parseInt(day),
      });
      toast(`${kind === "income" ? "Income" : "Bill"} added`);
      setModal(null); setName(""); setAmount(""); setDay("1"); setAccountId("");
      load();
    } catch (e: any) { toast(e.message ?? "Could not add", "err"); }
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
      <ScreenHeader 
        title="Bills" 
        onBack={onBack} 
        right={
          <div className="flex gap-2">
            <IconButton label="Toggle Calendar" onClick={() => setShowCalendar(!showCalendar)}>
              <CalendarIcon size={16} className={showCalendar ? "text-[var(--brand)]" : ""} />
            </IconButton>
            <IconButton label="Add Bill" onClick={() => { setKind("bill"); setModal("recurring"); }}>
              <Plus size={18} />
            </IconButton>
          </div>
        } 
      />

      <div className="px-4 pt-2 space-y-6">
        
        {/* Toggle Summary */}
        <button 
          onClick={() => setShowSummary(!showSummary)}
          className="flex w-full items-center justify-between rounded-2xl bg-[var(--surface-2)] px-4 py-3 border border-[var(--line)]"
        >
          <div className="flex items-center gap-2 text-[var(--text-2)]">
            <CircleDollarSign size={16} />
            <span className="text-[14px] font-medium">Show summary</span>
          </div>
          {showSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {showSummary && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
                  <p className="text-[12px] text-[var(--text-3)] mb-1">Total Bills</p>
                  <p className="text-[18px] font-bold text-white">{fmt(bills.reduce((s, b) => s + b.amount_minor, 0) / 100)}</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
                  <p className="text-[12px] text-[var(--text-3)] mb-1">Total Income</p>
                  <p className="text-[18px] font-bold text-[var(--gain)]">{fmt(income.reduce((s, i) => s + i.amount_minor, 0) / 100)}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detected Recurring (Suggestions) */}
        {visibleSuggestions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Sparkles size={16} className="text-[var(--brand)]" />
              <h3 className="text-[15px] font-semibold text-white">Detected recurring</h3>
            </div>
            <div className="space-y-2">
              {visibleSuggestions.map((s) => {
                const brand = getBrand(s.name);
                const Icon = brand.icon;
                return (
                  <div key={s.key} className="rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", brand.bg)}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-white truncate">{s.name}</p>
                        <p className="text-[11px] text-[var(--text-3)]">{fmt(s.amount_minor / 100)} · {s.cadence} · seen {s.occurrences}x</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptSuggestion(s)} className="flex-1 py-2 rounded-lg bg-[var(--brand)] text-white text-[13px] font-semibold flex items-center justify-center gap-1">
                        <Check size={14} /> Save as bill
                      </button>
                      <button onClick={() => dismiss(s.key)} className="px-3 py-2 rounded-lg bg-[var(--fill-2)] text-[13px] flex items-center gap-1 text-white">
                        <X size={14} /> Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CALENDAR VIEW */}
        {showCalendar && (
          <div className="rounded-[32px] bg-[var(--surface-2)] p-6 border border-[var(--line)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-bold text-white">{currentMonth}</h2>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-[11px] font-semibold text-[var(--text-3)]">{d[0]}</div>
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
                      dayBills.length > 0 ? "bg-[var(--fill-2)] border-[var(--line-strong)]" : "border-transparent",
                      isToday && "ring-2 ring-[#DE3121] ring-offset-1 ring-offset-[var(--bg)]"
                    )}
                  >
                    <span className={cn("text-[13px] font-medium", isToday ? "text-[var(--brand)]" : "text-[var(--text-1)]")}>{day}</span>
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

        {/* STACKED BILLS VIEW */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Bills</h3>
            <button onClick={() => { setKind("bill"); setModal("recurring"); }} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
          </div>
          
          <div className="flex flex-col relative">
            {bills.map((i, index) => {
              const brand = getBrand(i.name);
              const Icon = brand.icon;
              return (
                <div 
                  key={i.id} 
                  className={cn(
                    "w-full flex items-center justify-between rounded-[24px] p-5 text-white shadow-xl relative",
                    index > 0 && "-mt-6", // Overlap effect
                    brand.bg
                  )}
                  style={{ zIndex: bills.length - index }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold">{i.name}</p>
                      <p className="text-[12px] opacity-80 mt-0.5">{i.frequency}, day {i.day}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[17px] font-bold tabular">{fmt(i.amount_minor / 100)}</p>
                      <p className="text-[11px] font-bold bg-black/20 px-2 py-0.5 rounded-full inline-block mt-1">Overdue</p>
                    </div>
                    <button onClick={async () => { await deleteRecurringItem(i.id); load(); }} className="text-white/60 p-2 hover:text-white transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              );
            })}
            {bills.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-2xl border border-[var(--line)]">No bills yet.</p>}
          </div>
        </section>

        {/* INCOME VIEW */}
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
            {income.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-2xl border border-[var(--line)]">No income set up yet.</p>}
          </div>
        </section>

        {/* SINKING FUNDS & FAMILY */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Sinking funds</h3>
            <button onClick={() => setModal("fund")} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
          </div>
          <div className="space-y-2">
            {funds.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-2xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-white">{f.name}</p>
                  <p className="text-[11px] text-[var(--text-3)]">{fmt(f.saved_minor / 100)} of {fmt(f.target_minor / 100)}</p>
                  <div className="h-1.5 mt-2 bg-[var(--fill-2)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--brand)]" style={{ width: `${f.target_minor ? Math.min((f.saved_minor / f.target_minor) * 100, 100) : 0}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={async () => { const v = prompt("Add ₦ to fund:"); if (v) { await addToFund(f, parseFloat(v.replace(/,/g, ""))); load(); } }} className="text-[var(--brand)] text-[12px] font-bold">+ Add</button>
                  <button onClick={async () => { await deleteFund(f.id); load(); }} className="text-[var(--danger)] p-2"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {funds.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-2xl border border-[var(--line)]">No funds yet.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Family support</h3>
            <button onClick={() => setModal("family")} className="text-[var(--brand)] text-[13px] font-semibold">Edit</button>
          </div>
          <div className="rounded-2xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
            <p className="text-[11px] text-[var(--text-3)] mb-1">{family.label || "Monthly allocation"}</p>
            <p className="text-[20px] font-bold tabular text-white">{fmt(family.amount_minor / 100)}</p>
          </div>
        </section>
      </div>

      {/* ADD BILL / INCOME MODAL - Matches Ref 3 & 4 */}
      <Modal open={modal === "recurring"} onClose={() => setModal(null)} title={kind === "income" ? "Add Income" : "Add Bill"}>
        <div className="flex flex-col h-[70dvh]">
          <div className="flex-1 flex flex-col items-center pt-2">
            
            <p className="text-[13px] text-[var(--text-3)] mb-2">Amount</p>
            <div className="flex items-center justify-center">
              <span className="text-[32px] text-[var(--text-3)]">₦</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full max-w-[200px] bg-transparent text-center text-[48px] font-bold tabular text-white outline-none placeholder:text-[var(--text-3)]"
              />
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name of bill (e.g. Netflix)"
              className="w-full max-w-[280px] bg-transparent text-center text-[18px] font-semibold text-white outline-none placeholder:text-[var(--text-3)] mt-2 border-b border-[var(--line)] pb-2"
            />

            {/* Smart Detect Banner */}
            {name.length > 2 && (
              <div className="flex w-full mt-4 items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
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
          </div>

          <div className="shrink-0 space-y-4 pb-4">
            {/* Frequency & Day Pills */}
            <div className="flex gap-2 justify-center">
              <div className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-4 py-2 border border-[var(--line)]">
                <span className="text-[13px] font-semibold text-white">Monthly</span>
                <ChevronDown size={14} className="text-[var(--text-3)]" />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-4 py-2 border border-[var(--line)]">
                <span className="text-[13px] font-semibold text-white">Day {day}</span>
                <ChevronDown size={14} className="text-[var(--text-3)]" />
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
              {["Household", "Internet", "Subscriptions"].map(cat => (
                <button key={cat} className="whitespace-nowrap rounded-full px-4 py-2 border border-[var(--line)] bg-[var(--surface-2)] text-[12px] font-medium text-[var(--text-2)]">
                  {cat}
                </button>
              ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"].map((key, i) => (
                <div key={i} className="flex justify-center">
                  {key === "" ? null : key === "backspace" ? (
                    <button 
                      onClick={() => setAmount(amount.slice(0, -1))}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--surface-2)] active:bg-[var(--fill-2)]"
                    >
                      <Delete size={20} className="text-[var(--text-1)]" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setAmount(amount + key)}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--surface-2)] text-[20px] font-medium text-white active:bg-[var(--fill-2)]"
                    >
                      {key}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={addRec} disabled={!name || !amount} className="w-full h-12 text-[15px] font-bold">
              Save {kind === "income" ? "Income" : "Bill"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Other Modals (Funds/Family) remain the same */}
      <Modal open={modal === "fund"} onClose={() => setModal(null)} title="Create Fund">
        <div className="space-y-3">
          <Field label="Fund name" value={name} onChange={(e) => setName(e.target.value)} />
          <CurrencyField label="Target" value={parseFloat(amount)} onChange={(v) => setAmount(v.toString())} />
          <Button onClick={async () => {
            if (!name || !amount) return;
            await addFund(name, parseFloat(amount), 0, null);
            setModal(null); setName(""); setAmount(""); load();
          }}>Create</Button>
        </div>
      </Modal>

      <Modal open={modal === "family"} onClose={() => setModal(null)} title="Family Support">
        <div className="space-y-3">
          <Field label="Label" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monthly support" />
          <CurrencyField label="Monthly amount" value={parseFloat(amount)} onChange={(v) => setAmount(v.toString())} />
          <Button onClick={async () => {
            await setFamilySupport(parseFloat(amount) || 0, name || "Family support");
            setModal(null); setName(""); setAmount(""); load();
          }}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}