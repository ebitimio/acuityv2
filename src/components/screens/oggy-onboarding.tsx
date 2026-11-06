"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Building2, Banknote, ArrowRight, Check,
  Sparkles, Calendar, DollarSign, ShieldCheck, ChevronRight
} from "lucide-react";
import { AcuityCompanion } from "@/components/ui/acuity-companion";
import { useWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/client";
import { createAccount, addRecurringItem, completeOnboarding } from "@/lib/supabase/database";
import { useToast } from "@/components/ui/toast";

interface OggyOnboardingProps {
  userName?: string;
  onComplete: () => void;
}

type OnboardingStep = "welcome" | "account" | "income" | "bill" | "ready";

const POPULAR_BANKS = [
  "GTBank",
  "Kuda Bank",
  "OPay",
  "Access Bank",
  "Zenith Bank",
  "Moniepoint",
  "UBA",
  "Cash Wallet",
];

const INCOME_SOURCES = [
  { label: "Salary", icon: "💼" },
  { label: "Freelancing", icon: "💻" },
  { label: "Business", icon: "🛍️" },
  { label: "Allowance", icon: "🎁" },
];

const COMMON_BILLS = [
  { label: "Rent", icon: "🏠" },
  { label: "Internet", icon: "📡" },
  { label: "Electricity", icon: "⚡" },
  { label: "Netflix / Subs", icon: "🍿" },
  { label: "Family Support", icon: "👨‍👩‍👧" },
];

export function OggyOnboarding({ userName, onComplete }: OggyOnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [isSaving, setIsSaving] = useState(false);
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);

  // Form State
  const [bankName, setBankName] = useState("GTBank");
  const [accountName, setAccountName] = useState("Main Checking");
  const [accountBalance, setAccountBalance] = useState("");

  const [incomeSource, setIncomeSource] = useState("Salary");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomePayday, setIncomePayday] = useState("25");

  const [billName, setBillName] = useState("Internet / Wifi");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDay, setBillDueDay] = useState("5");

  const { active: activeWs } = useWorkspace();
  const supabase = createClient();
  const toast = useToast();

  const firstName = userName?.trim()?.split(" ")[0] || "there";

  // Mascot dynamic reaction states
  const [oggyPose, setOggyPose] = useState<"float" | "speak" | "think" | "cheer">("speak");

  const handleCreateAccount = async () => {
    if (!activeWs) return;
    const balanceNum = parseFloat(accountBalance.replace(/,/g, "") || "0");
    setIsSaving(true);
    setOggyPose("think");

    try {
      const { data, error } = await supabase
        .from("accounts")
        .insert({
          workspace_id: activeWs.id,
          name: accountName.trim() || `${bankName} Account`,
          institution: bankName,
          type: "checking",
          balance_minor: Math.round(balanceNum * 100),
          balance_as_of: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setCreatedAccountId(data.id);

      setOggyPose("speak");
      setStep("income");
    } catch (e: any) {
      console.error(e);
      toast(e.message || "Failed to create account", "err");
      setOggyPose("speak");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIncome = async () => {
    const amountNum = parseFloat(incomeAmount.replace(/,/g, "") || "0");
    if (amountNum <= 0) {
      // Allow proceeding without income
      setStep("bill");
      return;
    }

    setIsSaving(true);
    setOggyPose("think");

    try {
      await addRecurringItem({
        account_id: createdAccountId,
        name: incomeSource,
        kind: "income",
        amount: amountNum,
        frequency: "monthly",
        day: parseInt(incomePayday, 10) || 25,
        category: "Income",
        auto_post: false,
      });

      setOggyPose("speak");
      setStep("bill");
    } catch (e: any) {
      console.error(e);
      toast(e.message || "Could not save income", "err");
      setOggyPose("speak");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBill = async (skip = false) => {
    if (skip) {
      await finishAll();
      return;
    }

    const amountNum = parseFloat(billAmount.replace(/,/g, "") || "0");
    if (amountNum <= 0) {
      await finishAll();
      return;
    }

    setIsSaving(true);
    setOggyPose("think");

    try {
      await addRecurringItem({
        account_id: createdAccountId,
        name: billName,
        kind: "bill",
        amount: amountNum,
        frequency: "monthly",
        day: parseInt(billDueDay, 10) || 5,
        category: "Bills",
        auto_post: false,
      });

      await finishAll();
    } catch (e: any) {
      console.error(e);
      toast(e.message || "Could not save bill", "err");
      setOggyPose("speak");
      setIsSaving(false);
    }
  };

  const finishAll = async () => {
    try {
      await completeOnboarding();
    } catch {}
    setOggyPose("cheer");
    setStep("ready");
    setIsSaving(false);
  };

  const stepProgress = {
    welcome: 10,
    account: 35,
    income: 65,
    bill: 90,
    ready: 100,
  }[step];

  return (
    <div className="fixed inset-0 z-[250] flex flex-col justify-between bg-[#08080a] text-white overflow-hidden select-none">
      {/* Ambient Radial Glowing Brand Embers */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[var(--brand)]/15 blur-[100px] pointer-events-none" />

      {/* Top Header Bar */}
      <header
        className="relative z-20 flex items-center justify-between px-6 pb-2 shrink-0"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
            <span className="text-[20px] font-black tracking-tight text-white">ACUITY</span>
            <span className="text-[20px] font-black tracking-tight text-[var(--brand)]">.</span>
          </div>
          <span className="text-[11px] font-mono tracking-widest text-white/40 uppercase pl-1">
            • Setup with Oggy
          </span>
        </div>

        {step !== "ready" && (
          <button
            onClick={() => {
              completeOnboarding().catch(() => {});
              onComplete();
            }}
            className="text-[12.5px] font-medium text-white/50 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            Skip setup
          </button>
        )}
      </header>

      {/* Progress Line */}
      <div className="w-full bg-white/5 h-1">
        <motion.div
          animate={{ width: `${stepProgress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full bg-[var(--brand)] shadow-[0_0_10px_var(--brand)]"
        />
      </div>

      {/* Living Mascot Stage */}
      <div className="relative z-10 flex flex-col items-center pt-4 sm:pt-6">
        {/* Living Oggy Companion with Sentient Organic Float */}
        <motion.div
          animate={{
            y: oggyPose === "cheer" ? [0, -18, 0, -10, 0] : [0, -8, 0],
            rotate: oggyPose === "cheer" ? [0, 8, -8, 4, 0] : [-1.5, 1.5, -1.5],
            scale: oggyPose === "cheer" ? 1.08 : 1,
          }}
          transition={{
            duration: oggyPose === "cheer" ? 0.9 : 3.2,
            repeat: oggyPose === "cheer" ? 0 : Infinity,
            ease: "easeInOut",
          }}
          className="relative flex items-center justify-center cursor-pointer"
        >
          {/* Oggy Tag */}
          <div className="absolute -top-7 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
            <span className="text-[11px] font-bold text-white tracking-wide">Oggy</span>
            <span className="text-[9.5px] text-white/60 font-medium">Personal CFO</span>
          </div>

          <AcuityCompanion
            size="large"
            isSpeaking={step === "welcome" || step === "ready"}
            isThinking={isSaving}
            forceDark={true}
          />
        </motion.div>
      </div>

      {/* Conversational Interaction Panel */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-5 pb-6 max-w-lg mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* STEP 0: WELCOME & INTRO */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-xl space-y-2">
                <p className="text-[17px] font-bold text-white leading-snug">
                  Hey {firstName}! 👋 I&apos;m <span className="text-[var(--brand)]">Oggy</span>.
                </p>
                <p className="text-[14px] text-white/70 leading-relaxed">
                  I&apos;m your personal co-pilot here at Acuity. I&apos;ll help you protect your daily runway, stay on top of bills, and know exactly what you can safely spend without going broke.
                </p>
                <p className="text-[13px] text-white/50 pt-1">
                  Let&apos;s get your financial base set up together in under a minute!
                </p>
              </div>

              <button
                onClick={() => setStep("account")}
                className="w-full h-13 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(222,49,33,0.35)] active:scale-98 transition-transform"
              >
                <span>Let&apos;s do this, Oggy</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {/* STEP 1: ADD ACCOUNT */}
          {step === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-3.5"
            >
              {/* Oggy Bubble */}
              <div className="p-3.5 rounded-[20px] bg-[#141417] border border-white/10 shadow-lg">
                <p className="text-[14px] text-white/90 font-medium">
                  Where do you keep your everyday spending money, <span className="text-white font-bold">{firstName}</span>?
                </p>
              </div>

              {/* Bank Selection Chips */}
              <div>
                <label className="text-[11.5px] font-semibold text-white/50 uppercase tracking-wider pl-1 mb-1.5 block">
                  Select your bank or wallet
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {POPULAR_BANKS.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => {
                        setBankName(bank);
                        if (bank === "Cash Wallet") setAccountName("Cash Wallet");
                        else setAccountName(`${bank} Main`);
                      }}
                      className={`py-2 px-2 rounded-xl text-[12px] font-medium border text-center transition-all ${
                        bankName === bank
                          ? "bg-[var(--brand)] text-black border-[var(--brand)] font-bold shadow-sm"
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {bank.replace(" Bank", "").replace(" Wallet", "")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Nickname */}
              <div>
                <label className="text-[11.5px] font-semibold text-white/50 uppercase tracking-wider pl-1 mb-1 block">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Everyday Checking"
                  className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-[14.5px] text-white outline-none focus:border-[var(--brand)]"
                />
              </div>

              {/* Starting Balance */}
              <div>
                <label className="text-[11.5px] font-semibold text-white/50 uppercase tracking-wider pl-1 mb-1 block">
                  Current Balance
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[16px] font-bold text-white/60">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl bg-white/5 border border-white/15 pl-8 pr-3.5 py-2.5 text-[15px] font-bold text-white outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              {/* Action */}
              <button
                disabled={isSaving}
                onClick={handleCreateAccount}
                className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform disabled:opacity-50"
              >
                <span>Save Account</span>
                <ArrowRight size={17} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: MONTHLY INCOME */}
          {step === "income" && (
            <motion.div
              key="income"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-3.5"
            >
              <div className="p-3.5 rounded-[20px] bg-[#141417] border border-white/10 shadow-lg">
                <p className="text-[14px] text-white/90 font-medium">
                  Got it! Now what&apos;s your primary monthly inflow or earnings?
                </p>
                <p className="text-[12px] text-white/50 mt-1">
                  This powers your daily Safe-to-Spend calculations.
                </p>
              </div>

              {/* Source pills */}
              <div>
                <label className="text-[11.5px] font-semibold text-white/50 uppercase tracking-wider pl-1 mb-1.5 block">
                  Income Source
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {INCOME_SOURCES.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setIncomeSource(s.label)}
                      className={`py-2 px-1.5 rounded-xl text-[12px] font-medium border text-center transition-all ${
                        incomeSource === s.label
                          ? "bg-[var(--brand)] text-black border-[var(--brand)] font-bold shadow-sm"
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span className="mr-1">{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Income Amount */}
              <div>
                <label className="text-[11.5px] font-semibold text-white/50 uppercase tracking-wider pl-1 mb-1 block">
                  Monthly Amount
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[16px] font-bold text-white/60">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    placeholder="e.g. 200,000"
                    className="w-full rounded-xl bg-white/5 border border-white/15 pl-8 pr-3.5 py-2.5 text-[15px] font-bold text-white outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              {/* Typical Payday */}
              <div>
                <label className="text-[11.5px] font-semibold text-white/50 uppercase tracking-wider pl-1 mb-1 block">
                  Typical Payday (Day of month)
                </label>
                <div className="flex items-center gap-2">
                  {[25, 28, 30, 1].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setIncomePayday(String(d))}
                      className={`flex-1 py-2 rounded-xl text-[12.5px] font-medium border transition-all ${
                        incomePayday === String(d)
                          ? "bg-white text-black border-white font-bold"
                          : "bg-white/5 border-white/10 text-white/70"
                      }`}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("bill")}
                  className="flex-1 h-12 rounded-full bg-white/10 text-white font-medium text-[14px]"
                >
                  I&apos;ll add later
                </button>
                <button
                  disabled={isSaving}
                  onClick={handleSaveIncome}
                  className="flex-[2] h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform disabled:opacity-50"
                >
                  <span>Save Income</span>
                  <ArrowRight size={17} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RECURRING BILLS */}
          {step === "bill" && (
            <motion.div
              key="bill"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-3.5"
            >
              <div className="p-3.5 rounded-[20px] bg-[#141417] border border-white/10 shadow-lg">
                <p className="text-[14px] text-white/90 font-medium">
                  Last piece: do you have an essential recurring bill we should protect your balance for?
                </p>
                <p className="text-[12px] text-white/50 mt-1">
                  Like rent, electricity, wifi or streaming.
                </p>
              </div>

              {/* Common bill chips */}
              <div>
                <label className="text-[11.5px] font-semibold text-white/50 uppercase tracking-wider pl-1 mb-1.5 block">
                  Select Bill
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_BILLS.map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => setBillName(b.label)}
                      className={`py-1.5 px-3 rounded-xl text-[12px] font-medium border text-center transition-all ${
                        billName === b.label
                          ? "bg-[var(--brand)] text-black border-[var(--brand)] font-bold shadow-sm"
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span className="mr-1">{b.icon}</span>
                      <span>{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bill Amount */}
              <div>
                <label className="text-[11.5px] font-semibold text-white/50 uppercase tracking-wider pl-1 mb-1 block">
                  Monthly Amount
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[16px] font-bold text-white/60">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="e.g. 15,000"
                    className="w-full rounded-xl bg-white/5 border border-white/15 pl-8 pr-3.5 py-2.5 text-[15px] font-bold text-white outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              {/* Due Day */}
              <div>
                <label className="text-[11.5px] font-semibold text-white/50 uppercase tracking-wider pl-1 mb-1 block">
                  Due Day of Month
                </label>
                <div className="flex items-center gap-2">
                  {[1, 5, 15, 28].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setBillDueDay(String(d))}
                      className={`flex-1 py-2 rounded-xl text-[12.5px] font-medium border transition-all ${
                        billDueDay === String(d)
                          ? "bg-white text-black border-white font-bold"
                          : "bg-white/5 border-white/10 text-white/70"
                      }`}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveBill(true)}
                  className="flex-1 h-12 rounded-full bg-white/10 text-white font-medium text-[13.5px]"
                >
                  No bills right now
                </button>
                <button
                  disabled={isSaving}
                  onClick={() => handleSaveBill(false)}
                  className="flex-[2] h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform disabled:opacity-50"
                >
                  <span>Save & Finish</span>
                  <ArrowRight size={17} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: READY TO TOUR */}
          {step === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/15 shadow-2xl text-center space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--brand)]/20 text-[var(--brand)] mb-1">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-[20px] font-black text-white">
                  You&apos;re All Set, {firstName}! 🎉
                </h3>
                <p className="text-[14px] text-white/70 leading-relaxed">
                  Your primary account and runway are primed. Now let me personally show you around where everything lives on your dashboard!
                </p>
              </div>

              <button
                onClick={onComplete}
                className="w-full h-14 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-extrabold text-[16px] flex items-center justify-center gap-2 shadow-[0_4px_30px_rgba(222,49,33,0.4)] active:scale-98 transition-transform"
              >
                <span>Take the Dashboard Tour</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
