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
import { DayPicker } from "@/components/ui/day-picker";
import { useToast } from "@/components/ui/toast";
import { 
  Plus, Trash2, ChevronDown, ChevronUp, Delete, Wallet, Users, ShieldCheck, Wifi, Zap, Home, Briefcase, HeartHandshake, TrendingUp
} from "lucide-react";
import type { Account, RecurringItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { findBrand } from "@/lib/brands";
import { BrandLogo } from "@/components/ui/brand-logo";

const BRAND_CARD_COLORS: Record<string, string> = {
  netflix: "bg-[#E50914]",
  spotify: "bg-[#1DB954]",
  disney: "bg-[#113CCF]",
  chatgpt: "bg-[#10A37F]",
  apple: "bg-[#1C1C1E]",
  youtube: "bg-[#CC0000]",
  prime: "bg-[#00A8E1]",
  canva: "bg-[#00C4CC]",
  mtn: "bg-[#D9A000]",
  airtel: "bg-[#ED1C24]",
  glo: "bg-[#006837]",
  "9mobile": "bg-[#006738]",
  dstv: "bg-[#0054A6]",
  gotv: "bg-[#5D9900]",
  startimes: "bg-[#E65100]",
  ikedc: "bg-[#E84E1B]",
  ekedc: "bg-[#005BAA]",
  aedc: "bg-[#00843D]",
  bolt: "bg-[#34D186]",
  uber: "bg-[#1A1A1A]",
  chowdeck: "bg-[#0C513F]",
  glovo: "bg-[#FFC244]",
};

const getCommitmentCardBg = (name: string, isRent?: boolean) => {
  if (isRent) return "bg-[#8B5CF6]";
  const brand = findBrand(name);
  if (brand && BRAND_CARD_COLORS[brand.id]) {
    return BRAND_CARD_COLORS[brand.id];
  }
  const lower = name.toLowerCase();
  if (lower.includes("rent")) return "bg-[#8B5CF6]";
  if (lower.includes("power") || lower.includes("electric") || lower.includes("nepa")) return "bg-[#F59E0B]";
  if (lower.includes("internet") || lower.includes("wifi") || lower.includes("data")) return "bg-[#0070F3]";
  if (lower.includes("insurance")) return "bg-[#3B82F6]";
  return "bg-[#1f2937]";
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function CommitmentsScreen({ 
  onBack,
  autoOpenModal,
  onAutoOpenHandled
}: { 
  onBack: () => void,
  autoOpenModal?: "bill" | "income" | "family" | "rent" | null,
  onAutoOpenHandled?: () => void
}) {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [familySupports, setFamilySupports] = useState<{ name: string; amount: number; day: number }[]>([]);
  const [totalFamilySupport, setTotalFamilySupport] = useState(0);

  const [modal, setModal] = useState<"bill" | "income" | "family" | "rent" | null>(null);
  const [showDayPicker, setShowDayPicker] = useState<"bill" | "family" | "rent" | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState<"rent" | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("0"); // 0 = Jan
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "annually">("monthly");
  
  const [familyName, setFamilyName] = useState("");
  const [familyAmt, setFamilyAmt] = useState("");
  const [familyDay, setFamilyDay] = useState("1");

  const { fmt } = useCurrency();
  const toast = useToast();

  // --- NEW: Auto-open logic from Setup Checklist ---
  useEffect(() => {
    if (autoOpenModal) {
      setModal(autoOpenModal);
      onAutoOpenHandled?.();
    }
  }, [autoOpenModal, onAutoOpenHandled]);

  const load = async () => {
    const [rec, fam] = await Promise.all([getRecurringItems(), getFamilySupport()]);
    setItems(rec);
    
    try {
      const parsed = JSON.parse(fam.label);
      if (Array.isArray(parsed)) {
        const sanitized = parsed.map(p => ({ ...p, day: p.day || fam.day || 1 }));
        setFamilySupports(sanitized);
        setTotalFamilySupport(sanitized.reduce((s, f) => s + f.amount, 0));
      } else {
        setFamilySupports([{ name: fam.label || "Family Support", amount: fam.amount_minor / 100, day: fam.day }]);
        setTotalFamilySupport(fam.amount_minor / 100);
      }
    } catch {
      if (fam.amount_minor > 0) {
        setFamilySupports([{ name: fam.label || "Family Support", amount: fam.amount_minor / 100, day: fam.day }]);
        setTotalFamilySupport(fam.amount_minor / 100);
      }
    }
  };
  useEffect(() => { load(); }, []);

  const addRec = async () => {
    const numericAmount = parseFloat(amount);
    if (!name || !numericAmount) return;
    
    const kind = modal === "rent" ? "rent" : modal === "bill" ? "bill" : "income";
    
    try {
      await addRecurringItem({
        account_id: null,
        name, 
        kind: kind as any, 
        amount: numericAmount, 
        frequency: modal === "rent" ? "annually" : frequency, 
        day: parseInt(day),
        month: modal === "rent" ? parseInt(month) : undefined,
      });
      toast(`Added successfully`);
      setModal(null); setName(""); setAmount(""); setDay("1"); setFrequency("monthly"); setMonth("0");
      load();
    } catch (e: any) { toast(e.message ?? "Could not add", "err"); }
  };

  const addFamily = async () => {
    if (!familyName || !familyAmt) return;
    const newList = [...familySupports, { name: familyName, amount: parseFloat(familyAmt), day: parseInt(familyDay) }];
    const newTotal = newList.reduce((s, f) => s + f.amount, 0);
    await setFamilySupport(newTotal, JSON.stringify(newList), parseInt(familyDay));
    
    setFamilySupports(newList);
    setTotalFamilySupport(newTotal);
    setFamilyName(""); setFamilyAmt(""); setFamilyDay("1"); setModal(null);
    toast("Family support added");
  };

  const removeFamily = async (index: number) => {
    const newList = familySupports.filter((_, i) => i !== index);
    const newTotal = newList.reduce((s, f) => s + f.amount, 0);
    const fallbackDay = newList[0]?.day || 1;
    await setFamilySupport(newTotal, JSON.stringify(newList), fallbackDay);
    setFamilySupports(newList);
    setTotalFamilySupport(newTotal);
  };

  const income = items.filter((i) => i.kind === "income");
  const bills = items.filter((i) => i.kind === "bill");
  const rents = items.filter((i) => i.kind === "rent");

  const totalIncome = income.reduce((s, i) => s + i.amount_minor / 100, 0);
  const totalBills = bills.reduce((s, i) => s + i.amount_minor / 100, 0);
  
  // REMOVED: totalRent from the calculation
  const netIncome = totalIncome - (totalBills + totalFamilySupport);

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
        title="Bills & Commitments" 
        onBack={onBack} 
        right={
          <IconButton label="Add Bill" onClick={() => { setModal("bill"); }} data-setup-btn="add-bill">
            <Plus size={18} />
          </IconButton>
        } 
      />

      <div className="px-4 pt-4 space-y-8">
        
        {/* HERO: CALENDAR */}
        <div className="rounded-[32px] bg-[var(--surface-2)] p-6 border border-[var(--line)] shadow-2xl">
          <div className="flex items-center justify-between mb-4">
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
            
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
              const dayBills = billsByDay.get(d) || [];
              const isToday = d === today.getDate();
              return (
                <div 
                  key={d}
                  className={cn(
                    "flex flex-col items-center justify-center aspect-square rounded-xl border p-1 relative transition-all",
                    dayBills.length > 0 ? "bg-[var(--fill-2)] border-[var(--line-strong)]" : "border-transparent",
                    isToday && "ring-2 ring-[#DE3121] ring-offset-1 ring-offset-[var(--surface-2)]"
                  )}
                >
                  <span className={cn("text-[13px] font-medium", isToday ? "text-[var(--brand)]" : "text-[var(--text-1)]")}>{d}</span>
                  {dayBills.length > 0 && (
                    <div className="absolute bottom-1.5 flex gap-0.5">
                      {dayBills.slice(0, 3).map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#DE3121]" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: RENT */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-bold text-white">Rent</h3>
              <span className="text-[12px] font-semibold bg-[var(--surface-3)] text-[var(--text-2)] px-2 py-0.5 rounded-full">{rents.length}</span>
            </div>
            <button onClick={() => setModal("rent")} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
          </div>
          
          <div className="flex flex-col relative w-full pb-4">
            {rents.map((i, index) => {
              const bg = getCommitmentCardBg(i.name, true);
              return (
                <div 
                  key={i.id} 
                  className={cn(
                    "w-full flex items-center justify-between rounded-[24px] p-5 text-white shadow-2xl relative border border-white/10 transition-transform hover:-translate-y-1",
                    index > 0 && "-mt-8",
                    bg
                  )}
                  style={{ zIndex: rents.length - index }}
                >
                  <div className="flex items-center gap-4">
                    <BrandLogo name={i.name} size={44} className="shadow-md" />
                    <div>
                      <p className="text-[16px] font-bold">{i.name}</p>
                      <p className="text-[12px] opacity-80 mt-0.5">Annually, {MONTHS[i.month || 0]} {i.day}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <p className="text-[18px] font-bold tabular">{fmt(i.amount_minor / 100)}</p>
                    <button onClick={async () => { await deleteRecurringItem(i.id); load(); }} className="text-white/60 p-2 hover:text-white transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              );
            })}
            {rents.length === 0 && <p className="px-4 py-8 text-center text-[14px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-3xl border border-[var(--line)]">No rent added yet.</p>}
          </div>
        </section>

        {/* SECTION: BILLS */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-bold text-white">Bills</h3>
              <span className="text-[12px] font-semibold bg-[var(--surface-3)] text-[var(--text-2)] px-2 py-0.5 rounded-full">{bills.length}</span>
            </div>
            <button onClick={() => setModal("bill")} data-setup-btn="add-bill" className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
          </div>
          
          <div className="flex flex-col relative w-full pb-4">
            {bills.map((i, index) => {
              const bg = getCommitmentCardBg(i.name);
              return (
                <div 
                  key={i.id} 
                  className={cn(
                    "w-full flex items-center justify-between rounded-[24px] p-5 text-white shadow-2xl relative border border-white/10 transition-transform hover:-translate-y-1",
                    index > 0 && "-mt-8",
                    bg
                  )}
                  style={{ zIndex: bills.length - index }}
                >
                  <div className="flex items-center gap-4">
                    <BrandLogo name={i.name} size={44} className="shadow-md" />
                    <div>
                      <p className="text-[16px] font-bold">{i.name}</p>
                      <p className="text-[12px] opacity-80 mt-0.5">{i.frequency}, day {i.day}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <p className="text-[18px] font-bold tabular">{fmt(i.amount_minor / 100)}</p>
                    <button onClick={async () => { await deleteRecurringItem(i.id); load(); }} className="text-white/60 p-2 hover:text-white transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              );
            })}
            {bills.length === 0 && <p className="px-4 py-8 text-center text-[14px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-3xl border border-[var(--line)]">No bills yet. Tap + to add one.</p>}
          </div>
        </section>

        {/* SECTION: INCOME */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[18px] font-bold text-white">Income</h3>
            <button onClick={() => setModal("income")} data-setup-btn="add-income" className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add</button>
          </div>
          <div className="space-y-3">
            {income.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-2xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#52c28a]/10 text-[#52c28a]">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{i.name}</p>
                    <p className="text-[12px] text-[var(--text-3)]">{i.frequency}, day {i.day}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular text-[16px] font-bold text-[#52c28a]">+{fmt(i.amount_minor / 100)}</span>
                  <button onClick={async () => { await deleteRecurringItem(i.id); load(); }} className="text-[var(--text-3)] hover:text-[var(--danger)] p-2 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {income.length === 0 && <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)] bg-[var(--surface-2)] rounded-2xl border border-[var(--line)]">No income set up yet.</p>}
          </div>
        </section>

        {/* SECTION: FAMILY SUPPORT */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[18px] font-bold text-white">Family support</h3>
            <button onClick={() => setModal("family")} className="text-[var(--brand)] text-[13px] flex items-center gap-1 font-semibold"><Plus size={14} /> Add Person</button>
          </div>
          
          <div className="space-y-3">
            {familySupports.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl bg-[var(--surface-2)] p-4 border border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DE3121]/10 text-[#DE3121]">
                    <Users size={22} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{f.name}</p>
                    <p className="text-[12px] text-[var(--text-3)]">Day {f.day}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular text-[16px] font-bold text-white">{fmt(f.amount)}</span>
                  <button onClick={() => removeFamily(idx)} className="text-[var(--text-3)] hover:text-[var(--danger)] p-2 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SUMMARY CARD */}
        <section className="mt-8">
          <div className="rounded-[32px] bg-black border border-[var(--line)] p-6 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-[var(--text-2)]">Total Income</p>
                <p className="text-[15px] font-bold text-[var(--gain)] tabular">+{fmt(totalIncome)}</p>
              </div>
              {/* REMOVED: Total Rent Row */}
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-[var(--text-2)]">Total Bills</p>
                <p className="text-[15px] font-bold text-white tabular">-{fmt(totalBills)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-[var(--text-2)]">Family Support</p>
                <p className="text-[15px] font-bold text-white tabular">-{fmt(totalFamilySupport)}</p>
              </div>
              
              <div className="h-px w-full bg-[var(--line)] my-2" />
              
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-bold text-white">Net Left</p>
                <p className={cn("text-[24px] font-black tabular", netIncome >= 0 ? "text-[var(--brand)]" : "text-[var(--danger)]")}>
                  {netIncome >= 0 ? "+" : ""}{fmt(netIncome)}
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ADD RENT MODAL */}
      <Modal open={modal === "rent"} onClose={() => setModal(null)} title="Add Rent">
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
              placeholder="Rent (e.g. Lekki Apartment)"
              className="w-full max-w-[280px] bg-transparent text-center text-[18px] font-semibold text-white outline-none placeholder:text-[var(--text-3)] mt-2 border-b border-[var(--line)] pb-2"
            />
          </div>

          <div className="shrink-0 space-y-4 pb-4">
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowMonthPicker("rent")} className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-4 py-2 border border-[var(--line)]">
                <span className="text-[13px] font-semibold text-white">{MONTHS[parseInt(month)]}</span>
                <ChevronDown size={14} className="text-[var(--text-3)]" />
              </button>
              <button onClick={() => setShowDayPicker("rent")} className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-4 py-2 border border-[var(--line)]">
                <span className="text-[13px] font-semibold text-white">Day {day}</span>
                <ChevronDown size={14} className="text-[var(--text-3)]" />
              </button>
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

            <Button onClick={addRec} disabled={!name || !amount} className="w-full h-12 text-[15px] font-bold">Save Rent</Button>
          </div>
        </div>
      </Modal>

      {/* ADD BILL MODAL */}
      <Modal open={modal === "bill"} onClose={() => setModal(null)} title="Add Bill">
        <div className="flex flex-col h-[75dvh]">
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
              placeholder="Name of bill (e.g. Spotify)"
              className="w-full max-w-[280px] bg-transparent text-center text-[18px] font-semibold text-white outline-none placeholder:text-[var(--text-3)] mt-2 border-b border-[var(--line)] pb-2"
            />

            {name.length > 2 && (() => {
              const brand = findBrand(name);
              if (!brand) return null;
              return (
                <div className="flex w-full mt-4 items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                  <div className="flex items-center gap-3">
                    <BrandLogo name={brand.name} size={36} className="shadow-xs" />
                    <div>
                      <p className="text-[13px] font-semibold text-white">{brand.name} recognized</p>
                      <p className="text-[11px] text-[var(--text-3)]">Official brand icon and colors matched</p>
                    </div>
                  </div>
                  <button onClick={() => setName("")} className="text-[12px] font-semibold text-[var(--brand)]">Undo</button>
                </div>
              );
            })()}
          </div>

          <div className="shrink-0 space-y-4 pb-4">
            <div className="flex gap-2 justify-center">
              <div className="flex gap-1 bg-[var(--surface-2)] p-1 rounded-full border border-[var(--line)]">
                {(["weekly", "monthly"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={cn(
                      "px-3 py-1 text-[12px] font-semibold rounded-full capitalize transition-colors",
                      frequency === f ? "bg-[var(--brand)] text-white" : "text-[var(--text-3)]"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button onClick={() => setShowDayPicker("bill")} className="flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-4 py-2 border border-[var(--line)]">
                <span className="text-[13px] font-semibold text-white">Day {day}</span>
                <ChevronDown size={14} className="text-[var(--text-3)]" />
              </button>
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

      {/* ADD FAMILY MODAL */}
      <Modal open={modal === "family"} onClose={() => setModal(null)} title="Add Family Support">
        <div className="space-y-4 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DE3121]/20 text-[#DE3121]"><HeartHandshake size={24} /></div>
            <div><p className="text-[16px] font-bold text-white">Support a Family Member</p><p className="text-[12px] text-[var(--text-3)]">Add a name, amount, and day</p></div>
          </div>
          <Field label="Person's Name (e.g. Mom)" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
          <CurrencyField label="Monthly Amount" value={parseFloat(familyAmt)} onChange={(v) => setFamilyAmt(v.toString())} />
          
          <button onClick={() => setShowDayPicker("family")} className="flex w-full items-center justify-between rounded-xl border border-[var(--line-strong)] bg-[var(--surface-1)] px-4 py-3 text-[15px] text-[var(--text-1)]">
            <span>Day of month</span>
            <span className="font-semibold">Day {familyDay}</span>
          </button>

          <Button onClick={addFamily} disabled={!familyName || !familyAmt} className="w-full h-12 text-[15px] font-bold">Add Person</Button>
        </div>
      </Modal>

      {/* DAY PICKER MODAL */}
      <Modal open={!!showDayPicker} onClose={() => setShowDayPicker(null)} title="Select Day of Month">
        <div className="pb-4">
          <DayPicker
            value={parseInt(showDayPicker === "bill" || showDayPicker === "rent" ? day : familyDay, 10) || 1}
            onChange={(d) => {
              if (showDayPicker === "bill" || showDayPicker === "rent") setDay(d.toString());
              else setFamilyDay(d.toString());
              setShowDayPicker(null);
            }}
            maxDays={31}
          />
        </div>
      </Modal>

      {/* MONTH PICKER MODAL (For Rent) */}
      <Modal open={!!showMonthPicker} onClose={() => setShowMonthPicker(null)} title="Select Month">
        <div className="grid grid-cols-3 gap-2 pb-6">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => { setMonth(i.toString()); setShowMonthPicker(null); }}
              className={cn(
                "flex h-12 items-center justify-center rounded-xl text-[15px] font-semibold transition-colors",
                month === i.toString() ? "bg-[#DE3121] text-white" : "bg-[var(--surface-2)] text-[var(--text-1)] hover:bg-[var(--fill-2)]"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </Modal>

      {/* ADD INCOME MODAL */}
      <Modal open={modal === "income"} onClose={() => setModal(null)} title="Add Income">
        <div className="space-y-4 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gain)]/20 text-[var(--gain)]"><Briefcase size={24} /></div>
            <div><p className="text-[16px] font-bold text-white">New Income</p><p className="text-[12px] text-[var(--text-3)]">Salary, freelance, allowance</p></div>
          </div>
          <CurrencyField label="Amount" value={parseFloat(amount)} onChange={(v) => setAmount(v.toString())} />
          <Field label="Source (e.g. Salary)" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter source" />
          <DayPicker value={parseInt(day, 10) || 25} onChange={(d) => setDay(String(d))} label="Payday (Day of month)" maxDays={31} />
          <Button onClick={addRec} disabled={!name || !amount} className="w-full h-12 text-[15px] font-bold">Save Income</Button>
        </div>
      </Modal>
    </div>
  );
}