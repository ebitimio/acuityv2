"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Check } from "lucide-react";
import { AcuityCompanion } from "@/components/ui/acuity-companion";
import { useWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/client";
import { addRecurringItem, updateCycleStartDay, completeOnboarding } from "@/lib/supabase/database";
import { useToast } from "@/components/ui/toast";
import { formatAmountWithCommas, parseNumberInput } from "@/lib/format";
import { DayPicker } from "@/components/ui/day-picker";
import { cn } from "@/lib/utils";
import { searchInstitutions } from "@/lib/institutions";

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

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedParts(text: string, firstName?: string) {
  const patterns: string[] = ["\\bOggy\\b", "₦[0-9,]+", '"[^"]*?"'];
  if (firstName && firstName.trim() && firstName.toLowerCase() !== "there") {
    patterns.push(`\\b${escapeRegExp(firstName.trim())}\\b`);
  }

  const regex = new RegExp(`(${patterns.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.toLowerCase() === "oggy") {
      return (
        <span key={i} className="text-[var(--brand)] font-bold">
          Oggy
        </span>
      );
    }
    if (part.startsWith("₦")) {
      return (
        <span key={i} className="text-[var(--brand)] font-bold font-hero">
          {part}
        </span>
      );
    }
    if (part.startsWith('"') && part.endsWith('"')) {
      return (
        <span key={i} className="text-white font-bold">
          {part}
        </span>
      );
    }
    if (firstName && part.toLowerCase() === firstName.toLowerCase()) {
      return (
        <span key={i} className="text-white font-bold">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function TypewriterSpeech({
  text,
  firstName,
  onComplete,
  speed = 36,
}: {
  text: string;
  firstName?: string;
  onComplete?: () => void;
  speed?: number;
}) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayedLength(0);
    setIsDone(false);

    let idx = 0;
    let timer: NodeJS.Timeout;

    const nextChar = () => {
      if (idx < text.length) {
        idx++;
        setDisplayedLength(idx);

        const char = text[idx - 1];
        let delay = speed;
        if (char === "." || char === "!" || char === "?") {
          delay = speed + 220; // natural punctuation breathing pause
        } else if (char === "," || char === ";") {
          delay = speed + 110;
        }

        timer = setTimeout(nextChar, delay);
      } else {
        setIsDone(true);
        onCompleteRef.current?.();
      }
    };

    // Small initial breath before typing begins as bubble pops in
    timer = setTimeout(nextChar, 140);

    return () => clearTimeout(timer);
  }, [text, speed]);

  const handleSkip = () => {
    if (!isDone) {
      setDisplayedLength(text.length);
      setIsDone(true);
      onCompleteRef.current?.();
    }
  };

  const currentSlice = text.slice(0, displayedLength);

  return (
    <span onClick={handleSkip} className="cursor-pointer select-none">
      {renderHighlightedParts(currentSlice, firstName)}
      {!isDone && (
        <span className="inline-block w-[2px] h-[13px] ml-0.5 bg-[var(--brand)] align-middle animate-pulse" />
      )}
    </span>
  );
}

export function OggyOnboarding({ userName, onComplete }: OggyOnboardingProps) {
  const [stage, setStage] = useState<ChatStage>("intro");
  const [isSaving, setIsSaving] = useState(false);
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);

  // Mascot expressive choreography states
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isSmiling, setIsSmiling] = useState(false);
  const [isSilly, setIsSilly] = useState(false);
  const [isEnthusiastic, setIsEnthusiastic] = useState(false);

  // Viewport tracking to prevent mobile keyboard jumps & keep screen rock-solid (same logic as ai-screen)
  const [vvHeight, setVvHeight] = useState<number | null>(null);
  const [vvTop, setVvTop] = useState<number>(0);

  // Keyboard jump prevention & visual viewport synchronization
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    const origPosition = document.body.style.position;
    const origWidth = document.body.style.width;
    const origHeight = document.body.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    const vv = window.visualViewport;
    const updateViewport = () => {
      if (vv) {
        setVvHeight(vv.height);
        setVvTop(vv.offsetTop);
      }
      if (typeof window !== "undefined" && window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    if (vv) {
      updateViewport();
      vv.addEventListener("resize", updateViewport);
      vv.addEventListener("scroll", updateViewport);
    }

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.position = origPosition;
      document.body.style.width = origWidth;
      document.body.style.height = origHeight;
      if (vv) {
        vv.removeEventListener("resize", updateViewport);
        vv.removeEventListener("scroll", updateViewport);
      }
    };
  }, []);

  const isKeyboardOpen = vvHeight !== null && typeof window !== "undefined" && vvHeight < window.innerHeight - 80;

  const handleInputFocus = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Choreography: on each input/stage transition, Oggy perks up enthusiastically, speaks, and dances
  useEffect(() => {
    setIsSpeaking(true);
    setIsSmiling(false);
    setIsSilly(false);
    setIsEnthusiastic(true);

    // 1. Enthusiastic bounce & celebratory cheer
    const enthusiasmTimer = setTimeout(() => {
      setIsEnthusiastic(false);
    }, 1400);

    // 2. Playful dance if left waiting after speech
    const sillyTimer = setTimeout(() => {
      setIsSilly(true);
    }, 4500);

    // 3. Smoothly settle back into original center position
    const settleTimer = setTimeout(() => {
      setIsSilly(false);
    }, 6800);

    return () => {
      clearTimeout(enthusiasmTimer);
      clearTimeout(sillyTimer);
      clearTimeout(settleTimer);
    };
  }, [stage]);

  const handleTypewriterComplete = () => {
    setIsSpeaking(false);
    setIsSmiling(true);
  };

  // User input states
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountBalance, setAccountBalance] = useState("");

  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomePayday, setIncomePayday] = useState("25");

  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDueDay, setBillDueDay] = useState("5");

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
    const dayNum = parseInt(incomePayday.trim() || "25", 10);
    const validDay = isNaN(dayNum) || dayNum < 1 || dayNum > 31 ? 25 : dayNum;

    if (amountNum > 0) {
      setIsSaving(true);
      try {
        await addRecurringItem({
          account_id: createdAccountId,
          name: "Monthly Income",
          kind: "income",
          amount: amountNum,
          frequency: "monthly",
          day: validDay,
          category: "Income",
          auto_post: false,
        });
        await updateCycleStartDay(validDay);
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
    const dayNum = parseInt(billDueDay.trim() || "5", 10);
    const validDay = isNaN(dayNum) || dayNum < 1 || dayNum > 31 ? 5 : dayNum;

    if (amountNum > 0 && billName.trim()) {
      setIsSaving(true);
      try {
        await addRecurringItem({
          account_id: createdAccountId,
          name: billName.trim(),
          kind: "bill",
          amount: amountNum,
          frequency: "monthly",
          day: validDay,
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

  const getOrdinal = (n: number) => {
    if (isNaN(n)) return "th";
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const getOggySpeechString = () => {
    switch (stage) {
      case "intro":
        return `Hello ${firstName}! I am Oggy, your personal finance assistant. I will help you track your financial runway, understand your cash flow, and master your spending. Let us get to know your finances.`;
      case "bank_name":
        return "What bank or financial institution would you like to add first?";
      case "account_name":
        return bankName.trim()
          ? `Awesome, ${bankName.trim()}! What nickname should we give this account?`
          : "What nickname should we give this account?";
      case "account_balance":
        return accountName.trim()
          ? `Love "${accountName.trim()}"! What is your current balance in this account right now?`
          : bankName.trim()
          ? `Great! What is your current balance in your ${bankName.trim()} account?`
          : "What is your current balance in this account right now?";
      case "income_amount":
        return accountBalance.trim()
          ? `₦${accountBalance.trim()} logged! How much estimated monthly income do you receive?`
          : "How much estimated income do you receive each month?";
      case "income_payday":
        return incomeAmount.trim()
          ? `₦${incomeAmount.trim()} noted! What day of the month do you typically receive your income?`
          : "What day of the month do you typically receive your income?";
      case "bill_ask":
        return incomePayday.trim()
          ? `Payday on the ${incomePayday.trim()}${getOrdinal(Number(incomePayday.trim()))} noted! Do you have any recurring bills or subscriptions to track?`
          : "Do you have any recurring bills or subscriptions (like rent, electricity, wifi) to track?";
      case "bill_name":
        return "Great! What is the name of this recurring bill or subscription?";
      case "bill_amount":
        return billName.trim()
          ? `Got ${billName.trim()}! How much is your monthly payment for it?`
          : "How much is your monthly payment for this bill?";
      case "bill_due_day":
        return billAmount.trim() && billName.trim()
          ? `₦${billAmount.trim()} for ${billName.trim()}! What day of the month is this bill due?`
          : "What day of the month is this bill due?";
      case "ready":
        return `Your foundation is set, ${firstName}! Your primary account, income runway, and obligations are active. Let me walk you through your dashboard!`;
      default:
        return "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex flex-col justify-between items-center text-white overflow-hidden select-none px-6"
      style={{
        background: "var(--bg)",
        touchAction: "none",
        paddingTop: isKeyboardOpen ? "8px" : "max(1.5rem, env(safe-area-inset-top))",
      }}
    >
      {/* Ambient Brand Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-[var(--brand)]/15 blur-[90px] pointer-events-none" />

      {/* Mascot Section — Living Oggy (Subject) + Conversational Chat Bubble from Mascot */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center w-full py-2">
        <motion.div
          animate={
            isEnthusiastic
              ? {
                  y: [0, -14, 0, -6, 0],
                  rotate: [0, 5, -5, 2, 0],
                  scale: isKeyboardOpen ? [0.82, 0.9, 0.82, 0.86, 0.82] : [1, 1.1, 0.98, 1.05, 1],
                }
              : isSilly
              ? {
                  x: [0, -55, 65, -18, 0],
                  y: [0, -15, 12, -5, 0],
                  rotate: [0, -12, 14, -5, 0],
                  scale: isKeyboardOpen ? [0.82, 0.88, 0.78, 0.85, 0.82] : [1, 1.08, 0.94, 1.04, 1],
                }
              : {
                  x: 0,
                  y: [0, -5, 0],
                  rotate: [-1.5, 1.5, -1.5],
                  scale: isKeyboardOpen ? 0.82 : 1,
                }
          }
          transition={
            isEnthusiastic
              ? { duration: 1.2, ease: "easeInOut" }
              : isSilly
              ? { duration: 2.2, ease: "easeInOut" }
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative flex items-center justify-center cursor-pointer pointer-events-auto transition-transform duration-300"
        >
          <AcuityCompanion
            size="large"
            isSpeaking={isSpeaking}
            isSmiling={isSmiling}
            isThinking={isSaving}
            forceDark={true}
          />
        </motion.div>

        {/* Chat Bubble coming directly from Oggy */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col items-center mt-3 max-w-[340px] sm:max-w-sm w-full relative z-10"
          >
            {/* Beak / Pointer tail pointing directly up to Oggy's mouth */}
            <div className="w-0 h-0 border-x-[8px] border-x-transparent border-b-[8px] border-b-[#18181b] z-20" />

            {/* Bubble Surface */}
            <div className="w-full rounded-[22px] bg-[#18181b] border border-white/10 px-5 py-3.5 shadow-2xl text-center">
              <p className="text-[14.5px] sm:text-[15.5px] font-medium text-white/95 leading-relaxed">
                <TypewriterSpeech
                  text={getOggySpeechString()}
                  firstName={firstName}
                  onComplete={handleTypewriterComplete}
                  speed={36}
                />
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Input Section: Docked at bottom, elevating smoothly with visual viewport */}
      <div
        className="relative z-10 max-w-sm mx-auto w-full shrink-0 space-y-4"
        style={{
          paddingBottom: isKeyboardOpen
            ? `${Math.max(16, (typeof window !== "undefined" ? window.innerHeight : 0) - (vvHeight ?? 0) + 16)}px`
            : "max(calc(env(safe-area-inset-bottom) + 12px), 28px)",
        }}
      >
        <AnimatePresence mode="wait">
          {/* 1. INTRO */}
          {stage === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
            >
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
              transition={{ duration: 0.24 }}
              className="space-y-3"
            >
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                onFocus={handleInputFocus}
                placeholder="Enter bank name (e.g. GTBank, Kuda, Cash)"
                className="w-full rounded-2xl bg-[#141417] border border-white/15 px-4 py-3.5 text-[16px] text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30 shadow-lg"
                style={{ fontSize: "16px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && bankName.trim()) setStage("account_name");
                }}
                autoFocus
              />

              {/* Suggestions chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-24 overflow-y-auto">
                {searchInstitutions(bankName, 6).map((inst) => (
                  <button
                    key={inst.name}
                    type="button"
                    onClick={() => {
                      setBankName(inst.shortName || inst.name);
                    }}
                    className="text-[12px] px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 active:scale-95 transition-all"
                  >
                    {inst.shortName || inst.name}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={!bankName.trim()}
                onClick={() => setStage("account_name")}
                className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-40"
              >
                <span>Continue</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {/* 3. ACCOUNT NICKNAME */}
          {stage === "account_name" && (
            <motion.div
              key="account_name"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="space-y-3"
            >
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                onFocus={handleInputFocus}
                placeholder="e.g. Main Checking or Daily Spending"
                className="w-full rounded-2xl bg-[#141417] border border-white/15 px-4 py-3.5 text-[16px] text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30 shadow-lg"
                style={{ fontSize: "16px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setStage("account_balance");
                }}
                autoFocus
              />

              <button
                type="button"
                onClick={() => setStage("account_balance")}
                className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform"
              >
                <span>Continue</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {/* 4. ACCOUNT BALANCE */}
          {stage === "account_balance" && (
            <motion.div
              key="account_balance"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="space-y-3"
            >
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[17px] font-bold text-white/60">₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(formatAmountWithCommas(e.target.value))}
                  onFocus={handleInputFocus}
                  placeholder="0"
                  className="w-full rounded-2xl bg-[#141417] border border-white/15 pl-9 pr-4 py-3.5 text-[16px] font-bold text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30 shadow-lg"
                  style={{ fontSize: "16px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveAccount();
                  }}
                  autoFocus
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
            </motion.div>
          )}

          {/* 5. INCOME AMOUNT */}
          {stage === "income_amount" && (
            <motion.div
              key="income_amount"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="space-y-3"
            >
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[17px] font-bold text-white/60">₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(formatAmountWithCommas(e.target.value))}
                  onFocus={handleInputFocus}
                  placeholder="e.g. 250,000"
                  className="w-full rounded-2xl bg-[#141417] border border-white/15 pl-9 pr-4 py-3.5 text-[16px] font-bold text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30 shadow-lg"
                  style={{ fontSize: "16px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (parseNumberInput(incomeAmount) > 0) setStage("income_payday");
                      else setStage("bill_ask");
                    }
                  }}
                  autoFocus
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
            </motion.div>
          )}

          {/* 6. INCOME PAYDAY DATE */}
          {stage === "income_payday" && (
            <motion.div
              key="income_payday"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="space-y-3"
            >
              <DayPicker
                value={parseInt(incomePayday, 10) || 25}
                onChange={(d) => setIncomePayday(String(d))}
                label="Pick Your Payday"
                maxDays={31}
              />

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveIncome}
                className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-50"
              >
                <span>Confirm Payday ({incomePayday || "25"}th)</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {/* 7. BILL ASK */}
          {stage === "bill_ask" && (
            <motion.div
              key="bill_ask"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="space-y-2 pt-1"
            >
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
            </motion.div>
          )}

          {/* 8a. BILL NAME */}
          {stage === "bill_name" && (
            <motion.div
              key="bill_name"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="space-y-3"
            >
              <input
                type="text"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                onFocus={handleInputFocus}
                placeholder="e.g. Internet, Rent, Electricity"
                className="w-full rounded-2xl bg-[#141417] border border-white/15 px-4 py-3.5 text-[16px] text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30 shadow-lg"
                style={{ fontSize: "16px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && billName.trim()) setStage("bill_amount");
                }}
                autoFocus
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
            </motion.div>
          )}

          {/* 8b. BILL AMOUNT */}
          {stage === "bill_amount" && (
            <motion.div
              key="bill_amount"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="space-y-3"
            >
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[17px] font-bold text-white/60">₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={billAmount}
                  onChange={(e) => setBillAmount(formatAmountWithCommas(e.target.value))}
                  onFocus={handleInputFocus}
                  placeholder="e.g. 15,000"
                  className="w-full rounded-2xl bg-[#141417] border border-white/15 pl-9 pr-4 py-3.5 text-[16px] font-bold text-white outline-none focus:border-[var(--brand)] placeholder:text-white/30 shadow-lg"
                  style={{ fontSize: "16px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && parseNumberInput(billAmount) > 0) setStage("bill_due_day");
                  }}
                  autoFocus
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
            </motion.div>
          )}

          {/* 8c. BILL DUE DAY */}
          {stage === "bill_due_day" && (
            <motion.div
              key="bill_due_day"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.24 }}
              className="space-y-3"
            >
              <DayPicker
                value={parseInt(billDueDay, 10) || 5}
                onChange={(d) => setBillDueDay(String(d))}
                label="Pick Bill Due Day"
                maxDays={31}
              />

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveBill}
                className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--brand-ink)] font-bold text-[14.5px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform disabled:opacity-50"
              >
                <span>Save & Complete Setup ({billDueDay || "5"}th)</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}

          {/* 9. READY */}
          {stage === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.28 }}
            >
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
