"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Check } from "lucide-react";
import { AcuityCompanion } from "@/components/ui/acuity-companion";
import { useWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/client";
import { addRecurringItem, completeOnboarding } from "@/lib/supabase/database";
import { useToast } from "@/components/ui/toast";
import { formatAmountWithCommas, parseNumberInput } from "@/lib/format";
import { cn } from "@/lib/utils";

interface OggyOnboardingProps {
  userName?: string;
  onComplete: () => void;
}

type ChatStage =
  | "intro"
  | "bank_name"
  | "account_name"
  | "account_balance"
  | "income_amount"
  | "income_payday"
  | "bill_ask"
  | "bill_name"
  | "bill_amount"
  | "bill_due_day"
  | "ready";

export function OggyOnboarding({ userName, onComplete }: OggyOnboardingProps) {
  const [stage, setStage] = useState<ChatStage>("intro");
  const [isSaving, setIsSaving] = useState(false);
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);

  // Mascot expressive choreography states
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isSmiling, setIsSmiling] = useState(false);
  const [isSilly, setIsSilly] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Choreography: mouth speaks briefly, stops, smiles, does a silly dance across screen, returns to center
  useEffect(() => {
    setIsSpeaking(true);
    setIsSmiling(false);
    setIsSilly(false);

    // 1. Mouth moves briefly while asking, then stops speaking & smiles
    const stopSpeakingTimer = setTimeout(() => {
      setIsSpeaking(false);
      setIsSmiling(true);
    }, 1800);

    // 2. Do something silly moving playfully across the screen
    const sillyTimer = setTimeout(() => {
      setIsSilly(true);
    }, 2400);

    // 3. Smoothly settle back into original center position
    const settleTimer = setTimeout(() => {
      setIsSilly(false);
    }, 4600);

    return () => {
      clearTimeout(stopSpeakingTimer);
      clearTimeout(sillyTimer);
      clearTimeout(settleTimer);
    };
  }, [stage]);

  // User input states
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountBalance, setAccountBalance] = useState("");

  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomePayday, setIncomePayday] = useState("");

  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDay, setBillDueDay] = useState("");

  const { active: activeWs } = useWorkspace();
  const supabase = createClient();
  const toast = useToast();

  const firstName = userName?.trim()?.split(" ")[0] || "there";

  // Account creation
  const handleSaveAccount = async () => {
    if (!activeWs) return;
    const balanceNum = parseNumberInput(accountBalance);
    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("accounts")
        .insert({
          workspace_id: activeWs.id,
          name: accountName.trim() || `${bankName.trim() || "Main"} Account`,
          institution: bankName.trim() || "Checking",
          type: "checking",
          balance_minor: Math.round(balanceNum * 100),
          balance_as_of: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setCreatedAccountId(data.id);

      setStage("income_amount");
    } catch (e: any) {
      console.error(e);
      toast(e.message || "Could not save account", "err");
    } finally {
      setIsSaving(false);
    }
  };

  // Income creation
  const handleSaveIncome = async () => {
    const amountNum = parseNumberInput(incomeAmount);
    const dayNum = parseInt(incomePayday.trim(), 10);

    if (amountNum > 0) {
      setIsSaving(true);
      try {
        await addRecurringItem({
          account_id: createdAccountId,
          name: "Monthly Income",
          kind: "income",
          amount: amountNum,
          frequency: "monthly",
          day: isNaN(dayNum) || dayNum < 1 || dayNum > 31 ? 25 : dayNum,
          category: "Income",
          auto_post: false,
        });
      } catch (e: any) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }

    setStage("bill_ask");
  };

  // Bill creation
  const handleSaveBill = async () => {
    const amountNum = parseNumberInput(billAmount);
    const dayNum = parseInt(billDueDay.trim(), 10);

    if (amountNum > 0 && billName.trim()) {
      setIsSaving(true);
      try {
        await addRecurringItem({
          account_id: createdAccountId,
          name: billName.trim(),
          kind: "bill",
          amount: amountNum,
          frequency: "monthly",
          day: isNaN(dayNum) || dayNum < 1 || dayNum > 31 ? 5 : dayNum,
          category: "Bills",
          auto_post: false,
        });
      } catch (e: any) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }

    await finishOnboarding();
  };

  const finishOnboarding = async () => {
    try {
      await completeOnboarding();
    } catch {}
    setStage("ready");
  };

  return (
    <div className="fixed inset-0 z-[250] flex flex-col justify-between items-center bg-[#070709] text-white overflow-hidden select-none px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      {/* Ambient Brand Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-[var(--brand)]/15 blur-[90px] pointer-events-none" />

      {/* Mascot Section — Living Oggy */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center justify-center shrink-0 transition-all duration-300 ease-out",
          isInputFocused ? "mt-1 sm:mt-2 scale-[0.85]" : "mt-8 sm:mt-12 scale-100"
        )}
      >
        <motion.div
          animate={
            isSilly
              ? {
                  x: [0, -65, 75, -20, 0],
                  y: [0, -18, 12, -6, 0],
                  rotate: [0, -14, 16, -6, 0],
                  scale: [1, 1.08, 0.94, 1.04, 1],
                }
              : {
                  x: 0,
                  y: [0, -5, 0],
                  rotate: [-1.5, 1.5, -1.5],
                  scale: 1,
                }
          }
          transition={
            isSilly
              ? { duration: 2.2, ease: "easeInOut" }
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative flex items-center justify-center cursor-pointer pointer-events-auto"
        >
          <AcuityCompanion
            size="large"
            isSpeaking={isSpeaking}
            isSmiling={isSmiling}
            isThinking={isSaving}
            forceDark={true}
          />
        </motion.div>
      </div>

      {/* Conversational Stream: Brought down into the comfortable lower area */}
      <div
        className={cn(
          "relative z-10 max-w-sm mx-auto w-full transition-transform duration-300 ease-out space-y-4 mb-3 sm:mb-6",
          isInputFocused ? "-translate-y-[160px] sm:-translate-y-[180px]" : "translate-y-0"
        )}
      >
        <AnimatePresence mode="wait">
          {/* 1. INTRO */}
          {stage === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-xl space-y-2 text-left">
                <p className="text-[16px] font-semibold text-white leading-relaxed">
                  Hello {firstName}. I am <span className="text-[var(--brand)] font-bold">Oggy</span>, your personal wealth manager.
                </p>
                <p className="text-[13.5px] text-white/70 leading-relaxed">
                  I will help you take control of your financial runway, safeguard your cash, and grow your wealth. Let us get to know your finances.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStage("bank_name")}
                className="w-full h-13 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform"
              >
                <span>Get Started</span>
                <ArrowRight size={17} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {/* 2. BANK NAME */}
          {stage === "bank_name" && (
            <motion.div
              key="bank_name"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-lg text-left">
                <p className="text-[15px] text-white leading-snug">
                  What bank or financial institution would you like to add first?
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Enter bank name (e.g. GTBank, Kuda, Cash)"
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-[15px] text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && bankName.trim()) setStage("account_name");
                  }}
                />

                <button
                  type="button"
                  disabled={!bankName.trim()}
                  onClick={() => setStage("account_name")}
                  className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-40"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. ACCOUNT NICKNAME */}
          {stage === "account_name" && (
            <motion.div
              key="account_name"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-lg text-left">
                <p className="text-[15px] text-white leading-snug">
                  What should we name this account?
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="e.g. Main Checking or Daily Spending"
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-[15px] text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setStage("account_balance");
                  }}
                />

                <button
                  type="button"
                  onClick={() => setStage("account_balance")}
                  className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. ACCOUNT BALANCE */}
          {stage === "account_balance" && (
            <motion.div
              key="account_balance"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-lg text-left">
                <p className="text-[15px] text-white leading-snug">
                  What is your current balance in this account?
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[17px] font-bold text-white/60">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(formatAmountWithCommas(e.target.value))}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="0"
                    className="w-full rounded-2xl bg-white/5 border border-white/15 pl-9 pr-4 py-3 text-[16px] font-bold text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveAccount();
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveAccount}
                  className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-50"
                >
                  <span>Save Account</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* 5. INCOME AMOUNT */}
          {stage === "income_amount" && (
            <motion.div
              key="income_amount"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-lg text-left">
                <p className="text-[15px] text-white leading-snug">
                  How much estimated income do you receive each month?
                </p>
                <p className="text-[12.5px] text-white/50 mt-1">
                  This sets up your daily Safe to Spend runway.
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[17px] font-bold text-white/60">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(formatAmountWithCommas(e.target.value))}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="e.g. 250,000"
                    className="w-full rounded-2xl bg-white/5 border border-white/15 pl-9 pr-4 py-3 text-[16px] font-bold text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (parseNumberInput(incomeAmount) > 0) setStage("income_payday");
                        else setStage("bill_ask");
                      }
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStage("bill_ask")}
                    className="flex-1 h-12 rounded-full bg-white/10 text-white/80 font-medium text-[13.5px] hover:bg-white/15 transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    disabled={parseNumberInput(incomeAmount) <= 0}
                    onClick={() => setStage("income_payday")}
                    className="flex-[2] h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-40"
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 6. INCOME PAYDAY DATE */}
          {stage === "income_payday" && (
            <motion.div
              key="income_payday"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-lg text-left">
                <p className="text-[15px] text-white leading-snug">
                  What day of the month do you typically receive your income?
                </p>
                <p className="text-[12.5px] text-white/50 mt-1">
                  Enter any day between 1 and 31.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={incomePayday}
                  onChange={(e) => setIncomePayday(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Enter day of month (e.g. 25)"
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-[15px] text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveIncome();
                  }}
                />

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveIncome}
                  className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-50"
                >
                  <span>Save Income</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* 7. BILL ASK */}
          {stage === "bill_ask" && (
            <motion.div
              key="bill_ask"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-lg text-left">
                <p className="text-[15px] text-white leading-snug">
                  Do you have any recurring bills or subscriptions you would like me to safeguard your balance for?
                </p>
                <p className="text-[12.5px] text-white/50 mt-1">
                  Such as rent, electricity, wifi, or streaming.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStage("bill_name")}
                  className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform"
                >
                  <span>Yes, add a recurring bill</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={finishOnboarding}
                  className="w-full h-12 rounded-full bg-white/10 text-white/80 font-medium text-[13.5px] hover:bg-white/15 transition-colors"
                >
                  No recurring bills right now
                </button>
              </div>
            </motion.div>
          )}

          {/* 8a. BILL NAME */}
          {stage === "bill_name" && (
            <motion.div
              key="bill_name"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-lg text-left">
                <p className="text-[15px] text-white leading-snug">
                  What is the name of this bill?
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="e.g. Internet, Rent, Electricity"
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-[15px] text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && billName.trim()) setStage("bill_amount");
                  }}
                />

                <button
                  type="button"
                  disabled={!billName.trim()}
                  onClick={() => setStage("bill_amount")}
                  className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-40"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* 8b. BILL AMOUNT */}
          {stage === "bill_amount" && (
            <motion.div
              key="bill_amount"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-lg text-left">
                <p className="text-[15px] text-white leading-snug">
                  How much is your monthly {billName || "bill"}?
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[17px] font-bold text-white/60">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={billAmount}
                    onChange={(e) => setBillAmount(formatAmountWithCommas(e.target.value))}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="e.g. 15,000"
                    className="w-full rounded-2xl bg-white/5 border border-white/15 pl-9 pr-4 py-3 text-[16px] font-bold text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && parseNumberInput(billAmount) > 0) setStage("bill_due_day");
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={parseNumberInput(billAmount) <= 0}
                  onClick={() => setStage("bill_due_day")}
                  className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-40"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* 8c. BILL DUE DAY */}
          {stage === "bill_due_day" && (
            <motion.div
              key="bill_due_day"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-lg text-left">
                <p className="text-[15px] text-white leading-snug">
                  What day of the month is this bill due?
                </p>
                <p className="text-[12.5px] text-white/50 mt-1">
                  Enter any day between 1 and 31.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={billDueDay}
                  onChange={(e) => setBillDueDay(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Enter day of month (e.g. 5)"
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-[15px] text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveBill();
                  }}
                />

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveBill}
                  className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-50"
                >
                  <span>Save & Complete Setup</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* 9. READY */}
          {stage === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-[22px] bg-[#141417] border border-white/10 shadow-2xl text-left space-y-2">
                <p className="text-[16px] font-bold text-white leading-snug">
                  Your foundation is set, {firstName}.
                </p>
                <p className="text-[13.5px] text-white/70 leading-relaxed">
                  Your primary account, income, and commitments are locked in. Your Safe to Spend calculations are active.
                </p>
                <p className="text-[13px] text-white/50">
                  Let me walk you through your dashboard so you know exactly where everything lives.
                </p>
              </div>

              <button
                type="button"
                onClick={onComplete}
                className="w-full h-13 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(222,49,33,0.35)] active:scale-98 transition-transform"
              >
                <span>Take Dashboard Tour</span>
                <ArrowRight size={17} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
