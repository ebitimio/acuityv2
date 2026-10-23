"use client";

import { useEffect, useState, useMemo } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import {
  getRecurringItems, addRecurringItem, deleteRecurringItem,
  getFamilySupport, setFamilySupport,
  getAccounts,
} from "@/lib/supabase/database";
import { useCurrency } from "@/lib/currency";
import { Modal } from "@/components/ui/modal";
import { Field, Button } from "@/components/ui/form";
import { CurrencyField } from "@/components/ui/currency-field";
import { useToast } from "@/components/ui/toast";
import { 
  Plus, Trash2, Check, X, Calendar as CalendarIcon, 
  ChevronDown, ChevronUp, Delete, Wallet, Users, ShieldCheck, Wifi, Zap, Phone, Home, HeartHandshake, Briefcase
} from "lucide-react";
import type { Account, RecurringItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// List of popular billers to auto-detect and fetch logos/colors for
const BILLERS = [
  { name: "Netflix", domain: "netflix.com", color: "#E50914", bg: "bg-[#E50914]", icon: "logo" },
  { name: "Spotify", domain: "spotify.com", color: "#1DB954", bg: "bg-[#1DB954]", icon: "logo" },
  { name: "Disney+", domain: "disneyplus.com", color: "#113CCF", bg: "bg-[#113CCF]", icon: "logo" },
  { name: "ChatGPT", domain: "openai.com", color: "#10A37F", bg: "bg-[#10A37F]", icon: "logo" },
  { name: "YouTube", domain: "youtube.com", color: "#FF0000", bg: "bg-[#FF0000]", icon: "logo" },
  { name: "Apple", domain: "apple.com", color: "#333333", bg: "bg-[#333333]", icon: "logo" },
  { name: "Amazon", domain: "amazon.com", color: "#FF9900", bg: "bg-[#FF9900]", icon: "logo" },
  { name: "MTN", domain: "mtn.com", color: "#FFCC00", bg: "bg-[#FFCC00]", icon: "logo" },
  { name: "Airtel", domain: "airtel.com", color: "#E40000", bg: "bg-[#E40000]", icon: "logo" },
  { name: "Glo", domain: "gloworld.com", color: "#00B140", bg: "bg-[#00B140]", icon: "logo" },
  { name: "Internet", domain: "starlink.com", color: "#0070F3", bg: "bg-[#0070F3]", icon: Wifi },
  { name: "Power", domain: "ikejaelectric.com", color: "#F59E0B", bg: "bg-[#F59E0B]", icon: Zap },
  { name: "Rent", domain: "rent.com", color: "#8B5CF6", bg: "bg-[#8B5CF6]", icon: Home },
  { name: "Insurance", domain: "axa.com", color: "#00008F", bg: "bg-[#00008F]", icon: ShieldCheck },
];

const getBiller = (name: string) => {
  const lower = name.toLowerCase();
  return BILLERS.find((b) => lower.includes(b.name.toLowerCase())) || { name: "Bill", domain: "", color: "#6B7280", bg: "bg-gray-600", icon: Wallet };
};

export function CommitmentsScreen({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  // State for multiple family supports
  const [familySupports, setFamilySupports] = useState<{ name: string; amount: number }[]>([]);
  const [totalFamilySupport, setTotalFamilySupport] = useState(0);

  const [modal, setModal] = useState<"bill" | "income" | "family" | null>(null);
  
  // View states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("1");
  const [accountId, setAccountId] = useState<string>("");
  const [familyName, setFamilyName] = useState("");
  const [familyAmt, setFamilyAmt] = useState("");

  const { fmt } = useCurrency();
  const toast = useToast();

  const load = async () => {
    const [rec, accs, fam] = await Promise.all([
      getRecurringItems(), getAccounts(), getFamilySupport()
    ]);
    setItems(rec);
    setAccounts(accs);
    
    // Because your database stores family support as a single field, 
    // we simulate multiple entries here. You would ideally update your schema 
    // to a `family_supports` table, but we'll store it as a JSON array in the label for now.
    try {
      const parsed = JSON.parse(fam.label);
      if (Array.isArray(parsed)) {
        setFamilySupports(parsed);
        setTotalFamilySupport(parsed.reduce((s, f) => s + f.amount, 0));
      } else {
        setFamilySupports([{ name: fam.label || "Family Support", amount: fam.amount_minor / 100 }]);
        setTotalFamilySupport(fam.amount_minor / 100);
      }
    } catch {
      if (fam.amount_minor > 0) {
        setFamilySupports([{ name: fam.label || "Family Support", amount: fam.amount_minor / 100 }]);
        setTotalFamilySupport(fam.amount_minor / 100);
      }
    }
  };
  useEffect(() => { load(); }, []);

  const addRec = async () => {
    const numericAmount = parseFloat(amount);
    if (!name || !numericAmount) return;
    try {
      await addRecurringItem({
        account_id: accountId || null,
        name, 
        kind: modal === "bill" ? "bill" : "income", 
        amount: numericAmount, 
        frequency: "monthly", 
        day: parseInt(day),
      });
      toast(`Added successfully`);
      setModal(null); setName(""); setAmount(""); setDay("1"); setAccountId("");
      load();
    } catch (e: any) { toast(e.message ?? "Could not add", "err"); }
  };

  const addFamily = async () => {
    if (!familyName || !familyAmt) return;
    const newList = [...familySupports, { name: familyName, amount: parseFloat(familyAmt) }];
    const newTotal = newList.reduce((s, f) => s + f.amount, 0);
    
    // Save as a JSON array string in the label so we don't have to change your DB schema
    await setFamilySupport(newTotal, JSON.stringify(newList));
    
    setFamilySupports(newList);
    setTotalFamilySupport(newTotal);
    setFamilyName(""); setFamilyAmt(""); setModal(null);
    toast("Family support added");
  };

  const removeFamily = async (index: number) => {
    const newList = familySupports.filter((_, i) => i !== index);
    const newTotal = newList.reduce((s, f) => s + f.amount, 0);
    await setFamilySupport(newTotal, JSON.stringify(newList));
    setFamilySupports(newList);
    setTotalFamilySupport(newTotal);
  };

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
            <IconButton label="Add Bill" onClick={() => { setModal("bill"); }}>
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
            <Wallet size={16} />
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
                        const biller = getBiller(b.name);
                        return (
                          <div key={i} className={cn("flex h-4 w-4 items-center justify-center rounded-full", biller.bg)}>
                            {biller.domain ? (
                              <img src={`https://logo.clearbit.com/${biller.domain}`} alt="" className="h-3 w-3 object-contain rounded-full bg-white" />
                            ) : (
                              <biller.icon size={10} className="text-white" />
                            )}
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

        {/* STACKED BILLS VIEW (Matches Reference) */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Bills</h3>
            <button onClick={() => setModal("bill")} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
          </div>
          
          <div className="flex flex-col relative w-full">
            {bills.map((i, index) => {
              const biller = getBiller(i.name);
              return (
                <div 
                  key={i.id} 
                  className={cn(
                    "w-full flex items-center justify-between rounded-[24px] p-5 text-white shadow-2xl relative border border-white/10",
                    index > 0 && "-mt-6", // The overlap effect
                    biller.bg
                  )}
                  style={{ zIndex: bills.length - index }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      {biller.domain ? (
                        <img src={`https://logo.clearbit.com/${biller.domain}`} alt={i.name} className="h-6 w-6 object-contain" />
                      ) : (
                        <biller.icon size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-[16px] font-bold">{i.name}</p>
                      <p className="text-[12px] opacity-80 mt-0.5">Subscriptions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[17px] font-bold tabular">{fmt(i.amount_minor / 100)}</p>
                      <p className="text-[11px] font-bold bg-black/25 px-2.5 py-1 rounded-full inline-block mt-1">Overdue</p>
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
            <button onClick={() => setModal("income")} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
          </div>
          <div className="space-y-2">
            {income.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-2xl bg-[#1c1c1e] p-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gain)]/20 text-[var(--gain)]">
                    <Briefcase size={20} />
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
            ))}
            {income.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-2xl border border-[var(--line)]">No income set up yet.</p>}
          </div>
        </section>

        {/* FAMILY SUPPORT VIEW */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Family support</h3>
            <button onClick={() => setModal("family")} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add Person</button>
          </div>
          
          <div className="space-y-2">
            {familySupports.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DE3121]/10 text-[#DE3121]">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">{f.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular font-semibold text-white">{fmt(f.amount)}</span>
                  <button onClick={() => removeFamily(idx)} className="text-[var(--danger)] p-2"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            
            {familySupports.length > 0 && (
              <div className="flex items-center justify-between rounded-2xl bg-[#DE3121] p-4 shadow-lg mt-4">
                <p className="text-[14px] font-bold text-black/70">Total Support</p>
                <p className="text-[18px] font-bold tabular text-black">{fmt(totalFamilySupport)}</p>
              </div>
            )}
            {familySupports.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-2xl border border-[var(--line)]">No family support set up.</p>}
          </div>
        </section>
      </div>

      {/* ADD BILL MODAL (Smart Logo Detection) */}
      <Modal open={modal === "bill"} onClose={() => setModal(null)} title="Add Bill">
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
            {name.length > 2 && (() => {
              const biller = getBiller(name);
              return (
                <div className="flex w-full mt-4 items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-white", biller.bg)}>
                      {biller.domain ? (
                        <img src={`https://logo.clearbit.com/${biller.domain}`} alt={name} className="h-5 w-5 object-contain" />
                      ) : (
                        <biller.icon size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{biller.name} recognized</p>
                      <p className="text-[11px] text-[var(--text-3)]">Icon and color set from the name</p>
                    </div>
                  </div>
                  <button onClick={() => setName("")} className="text-[12px] font-semibold text-[var(--brand)]">Undo</button>
                </div>
              );
            })()}
          </div>

          <div className="shrink-0 space-y-4 pb-4">
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

            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"].map((key, i) => (
                <div key={i} className="flex justify-center">
                  {key === "" ? null : key === "backspace" ? (
                    <button onClick={() => setAmount(amount.slice(0, -1))} className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--surface-2)] active:bg-[var(--fill-2)]"><Delete size={20} className="text-[var(--text-1)]" /></button>
                  ) : (
                    <button onClick={() => setAmount(amount + key)} className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--surface-2)] text-[20px] font-medium text-white active:bg-[var(--fill-2)]">{key}</button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={addRec} disabled={!name || !amount} className="w-full h-12 text-[15px] font-bold">Save Bill</Button>
          </div>
        </div>
      </Modal>

      {/* ADD INCOME MODAL (Clean, no corporate logos) */}
      <Modal open={modal === "income"} onClose={() => setModal(null)} title="Add Income">
        <div className="space-y-4 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gain)]/20 text-[var(--gain)]">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-[16px] font-bold text-white">New Income</p>
              <p className="text-[12px] text-[var(--text-3)]">Salary, freelance, allowance</p>
            </div>
          </div>

          <CurrencyField label="Amount" value={parseFloat(amount)} onChange={(v) => setAmount(v.toString())} />
          <Field label="Source (e.g. Salary)" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter source" />
          <Field label="Day of month (1-31)" type="number" value={day} onChange={(e) => setDay(e.target.value)} />
          
          <Button onClick={addRec} disabled={!name || !amount} className="w-full h-12 text-[15px] font-bold">Save Income</Button>
        </div>
      </Modal>

      {/* ADD FAMILY MODAL */}
      <Modal open={modal === "family"} onClose={() => setModal(null)} title="Add Family Support">
        <div className="space-y-4 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DE3121]/20 text-[#DE3121]">
              <HeartHandshake size={24} />
            </div>
            <div>
              <p className="text-[16px] font-bold text-white">Support a Family Member</p>
              <p className="text-[12px] text-[var(--text-3)]">Add a name and monthly amount</p>
            </div>
          </div>

          <Field label="Person's Name (e.g. Mom)" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
          <CurrencyField label="Monthly Amount" value={parseFloat(familyAmt)} onChange={(v) => setFamilyAmt(v.toString())} />
          
          <Button onClick={addFamily} disabled={!familyName || !familyAmt} className="w-full h-12 text-[15px] font-bold">Add Person</Button>
        </div>
      </Modal>
    </div>
  );
}