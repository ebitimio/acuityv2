"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getHomeMetrics, getRecentTransactions, deleteTransaction, clearDataCache,
  getSetupStatus, completeOnboarding, getSafeToSpend,
  getCurrentCycle, getCategorySpend, getPeriodLabel, getAccounts,
  type SetupStatus, type SafeToSpend, type CategorySpendRow,
} from "@/lib/supabase/database";
import { useWorkspace } from "@/lib/workspace";
import type { Txn, HomeMetrics, Account } from "@/lib/types";
import { AuthScreen } from "@/components/screens/auth-screen";
import { SplashScreen } from "@/components/ui/splash-screen";
import { HomeSkeleton } from "@/components/ui/skeleton-loader";
import { FloatingTabBar, type TabId } from "@/components/ui/floating-tab-bar";
import { TransactionRow } from "@/components/ui/transaction-row";
import { SetupChecklist } from "@/components/screens/setup-checklist";
import { SafeToSpendHero } from "@/components/ui/safe-to-spend";
import { ToolsScroller } from "@/components/ui/tools-scroller";
import { TransactionFilterChips, type TransactionFilter } from "@/components/ui/transaction-filter-chips";
import { ScreenTransition } from "@/components/ui/screen-transition";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { useCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/toast";
import { AnalyticsScreen } from "@/components/screens/analytics-screen";
import { BudgetScreen } from "@/components/screens/budget-screen";
import { AccountsScreen } from "@/components/screens/accounts-screen";
import { CommitmentsScreen } from "@/components/screens/commitments-screen";
import { TaxScreen } from "@/components/screens/tax-screen";
import { NeedsReviewScreen } from "@/components/screens/needs-review-screen";
import { AjoScreen } from "@/components/screens/ajo-screen";
import { BankChargeScreen } from "@/components/screens/bank-charge-screen";
import { SettingsSheet } from "@/components/ui/settings-sheet";
import { NotificationsSheet } from "@/components/ui/notifications-sheet";
import { WorkspaceSwitcher } from "@/components/ui/workspace-switcher";
import { ImportSheet } from "@/components/ui/import-sheet";
import { TransactionDetailSheet } from "@/components/ui/transaction-detail-sheet";
import { AIDrawer } from "@/components/ui/ai-drawer";
import { AddTransactionSheet } from "@/components/ui/add-transaction-sheet";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Field, Button } from "@/components/ui/form";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  ChevronRight, Receipt, ChevronDown, Plus, Trash2,
  PiggyBank, PieChart, ArrowLeftRight, Bell, Crown, Sparkles, Award, Lightbulb
} from "lucide-react";
import { TransactionsScreen } from "@/components/screens/transactions-screen";
import { OnboardingCarousel } from "@/components/screens/onboarding-carousel";
import { PinLockScreen } from "@/components/screens/pin-lock-screen";
import { StackedAccountCard } from "@/components/ui/stacked-account-card";
import { MonthlyReportModal } from "@/components/ui/monthly-report-modal";
import { cn } from "@/lib/utils";

const ZERO_METRICS: HomeMetrics = {
  net_worth_minor: 0,
  total_spent_minor: 0,
  total_income_minor: 0,
  budget_limit_minor: 0,
  uncategorized_count: 0,
};

type ScreenId = TabId | "budget" | "commitments" | "tax" | "needs-review" | "ajo" | "bank-charge" | "transactions";

export default function SandboxPage() {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [profileName, setProfileName] = useState<string>("there");
  const [liquidAssets, setLiquidAssets] = useState(0);
  const supabase = createClient();
  const toast = useToast();
  const { fmt, rate } = useCurrency();
  const { workspaces, active: activeWs, setActive: setActiveWs, createWorkspace, deleteWorkspace, loading: wsLoading } = useWorkspace();

  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");

  const [onboardingSequence, setOnboardingSequence] = useState<"checking" | "carousel" | "pin" | "complete">("checking");
  const [isLocked, setIsLocked] = useState(false);
  const [lockError, setLockError] = useState("");
  const [dbPin, setDbPin] = useState<string | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddTxnOpen, setIsAddTxnOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null);
  
  // Monthly Report State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showReportTeaser, setShowReportTeaser] = useState(false);

  const [metrics, setMetrics] = useState<HomeMetrics | null>(null);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [categoryRows, setCategoryRows] = useState<CategorySpendRow[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpend | null>(null);
  const [cycle, setCycle] = useState<{ cycle_start: string; cycle_end: string } | null>(null);
  
  const [openAddAccount, setOpenAddAccount] = useState(false);
  const [openCommitmentsTab, setOpenCommitmentsTab] = useState<"bill" | "income" | "family" | "rent" | null>(null);

  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [txnFilter, setTxnFilter] = useState<TransactionFilter>("all");

  const [navHidden, setNavHidden] = useState(false);

  const [wsOpen, setWsOpen] = useState(false);
  const [wsCreateOpen, setWsCreateOpen] = useState(false);
  const [wsNewName, setWsNewName] = useState("");
  const [wsBusy, setWsBusy] = useState(false);
  
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const isAtWorkspaceLimit = workspaces.length >= 2;

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 100) setNavHidden(true);
    else setNavHidden(false);
  });

  // NEW MONTHLY REPORT LOGIC
  useEffect(() => {
    if (!activeWs?.id || !metrics) return;
    
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.toISOString().slice(0, 7); 
    
    const reportGeneratedFor = localStorage.getItem(`acuity:report_generated_${activeWs.id}`);
    const hasAccounts = accounts.length > 0;
    const hasActivity = metrics.total_income_minor > 0 || metrics.total_spent_minor > 0;

    if (reportGeneratedFor && reportGeneratedFor !== currentMonth) {
      localStorage.removeItem(`acuity:report_generated_${activeWs.id}`);
    }

    if (currentDay >= 29 && reportGeneratedFor !== currentMonth && hasAccounts && hasActivity) {
      setShowReportTeaser(true);
    } else if (reportGeneratedFor === currentMonth && hasAccounts && hasActivity) {
      setShowReportTeaser(true);
    } else {
      setShowReportTeaser(false);
    }
  }, [activeWs?.id, metrics, accounts.length]);

  const handleViewReport = () => {
    setIsReportOpen(true);
    const currentMonth = new Date().toISOString().slice(0, 7);
    localStorage.setItem(`acuity:report_generated_${activeWs?.id}`, currentMonth);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const width = scrollContainerRef.current.offsetWidth;
    const index = Math.round(scrollLeft / (width * 0.85));
    setActiveCardIndex(index);

    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
    startAutoScroll();
  };

  const startAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    if (!accounts || accounts.length <= 1) return;

    autoScrollTimerRef.current = setInterval(() => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const children = container.children[0]?.children;
      if (!children) return;

      let nextIndex = activeCardIndex + 1;
      if (nextIndex >= accounts.length) {
        nextIndex = 0;
      }

      const nextElement = children[nextIndex] as HTMLElement;
      if (nextElement) {
        container.scrollTo({
          left: nextElement.offsetLeft - 20,
          behavior: "smooth",
        });
      }
    }, 4000);
  }, [activeCardIndex, accounts.length]);

  useEffect(() => {
    if (accounts.length > 1) {
      startAutoScroll();
    }
    return () => {
      if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current);
    };
  }, [accounts.length, startAutoScroll]);


  useEffect(() => {
    if (!session || onboardingSequence !== "complete" || isLocked || !dbPin) return;

    const updateActiveTime = () => {
      localStorage.setItem("acuity:last_active", String(Date.now()));
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, updateActiveTime));

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        localStorage.setItem("acuity:last_active", String(Date.now()));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(() => {
      const lastActive = Number(localStorage.getItem("acuity:last_active") || "0");
      if (Date.now() - lastActive > 1800000) {
        setIsLocked(true);
      }
    }, 60000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActiveTime));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [session, onboardingSequence, isLocked, dbPin]);

  useEffect(() => {
    if (session?.user?.id) {
      supabase.from("profiles").select("full_name, pin").eq("id", session.user.id).single()
        .then(({ data }) => {
          if (data?.full_name) setProfileName(data.full_name);
          else if (session.user.email) setProfileName(session.user.email.split("@")[0]);
          
          if (data?.pin) setDbPin(data.pin);
        });
    }
  }, [session, supabase]);

  const refreshData = useCallback(async () => {
    const activeId = activeWs?.id;
    if (!activeId) return;

    try {
      const stored = localStorage.getItem("acuity:activeWorkspace");
      if (stored !== activeId) localStorage.setItem("acuity:activeWorkspace", activeId);
    } catch {}

    clearDataCache();
    
    try {
      const [m, t, accs] = await Promise.all([
        getHomeMetrics(), 
        getRecentTransactions(20),
        getAccounts()
      ]);
      setMetrics(m ?? ZERO_METRICS);
      setTransactions(t ?? []);
      setAccounts(accs ?? []);
      
      const total = (accs ?? []).reduce((s, a) => s + (a.current_minor ?? a.balance_minor), 0) / 100;
      setLiquidAssets(total);
    } catch (e: any) { 
      setMetrics(ZERO_METRICS); 
      setTransactions([]); 
      setAccounts([]);
      setLiquidAssets(0);
    }

    try {
      const catSpend = await getCategorySpend(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      );
      setCategoryRows(catSpend ?? []);
    } catch (e: any) { setCategoryRows([]); }

    try {
      const s = await getSetupStatus();
      setSetupStatus(s);
      setSetupError(null);
    } catch (e: any) { setSetupError(e?.message ?? String(e)); setSetupStatus(null); }

    try {
      const sts = await getSafeToSpend();
      setSafeToSpend(sts);
    } catch (e: any) { setSafeToSpend(null); }

    try {
      const c = await getCurrentCycle();
      setCycle(c);
    } catch { setCycle(null); }
  }, [activeWs?.id]);

  useEffect(() => {
    const wasDeleted = localStorage.getItem("acuity:account_deleted") === "true";
    
    if (wasDeleted) {
      localStorage.removeItem("acuity:account_deleted");
      localStorage.removeItem("acuity:new_signup");
      localStorage.removeItem("acuity:last_active");
      localStorage.removeItem("acuity:activeWorkspace");
      localStorage.removeItem("acuity:pin");
      setOnboardingSequence("complete");
      setSession(null);
      setIsAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
      
      if (session) {
        const isNewSignup = localStorage.getItem("acuity:new_signup") === "true";
        
        if (isNewSignup) {
          setOnboardingSequence("carousel");
        } else {
          const { data: profile } = await supabase.from("profiles").select("pin").eq("id", session.user.id).single();
          
          if (!profile?.pin) {
            setOnboardingSequence("carousel");
          } else {
            setDbPin(profile.pin);
            
            const lastActive = Number(localStorage.getItem("acuity:last_active") || "0");
            if (lastActive === 0 || Date.now() - lastActive > 1800000) {
              setIsLocked(true);
            } else {
              localStorage.setItem("acuity:last_active", String(Date.now()));
            }
            
            setOnboardingSequence("complete");
          }
        }
      } else {
        setOnboardingSequence("complete");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (session && activeWs?.id) refreshData();
  }, [session, refreshData, activeWs?.id]);

  useEffect(() => {
    setMetrics(ZERO_METRICS);
    setTransactions([]);
    setCategoryRows([]);
    setSafeToSpend(null);
    setLiquidAssets(0);
    setAccounts([]);
  }, [activeWs?.id]);

  useEffect(() => {
    if (!showSplash && session && metrics) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [showSplash, session, metrics]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeScreen]);

  const handleTabChange = (tabId: TabId) => {
    if (tabId === "ai") {
      setIsAdvisorOpen(true);
      return;
    }
    setActiveScreen(tabId);
  };

  const handleAddClick = () => setIsQuickAddOpen(true);

  const handleDeleteTxn = async (t: Txn) => {
    try {
      await deleteTransaction(t.id);
      toast("Transaction deleted");
      refreshData();
    } catch {
      toast("Could not delete", "err");
    }
  };

  const handleSignOut = async () => {
    clearDataCache();
    localStorage.removeItem("acuity:new_signup");
    localStorage.removeItem("acuity:last_active");
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleForgotPin = async () => {
    if (!session?.user?.id) return;
    await supabase.from("profiles").update({ pin: null }).eq("id", session.user.id);
    clearDataCache();
    localStorage.removeItem("acuity:new_signup");
    localStorage.removeItem("acuity:last_active");
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleSwitchWorkspace = (id: string) => {
    setWsOpen(false);
    try { localStorage.setItem("acuity:activeWorkspace", id); } catch {}
    setActiveWs(id);
    clearDataCache();
  };

  const handleCreateClick = () => {
    if (isAtWorkspaceLimit) {
      setIsPremiumModalOpen(true);
    } else {
      setWsCreateOpen(true);
    }
  };

  const handleCreateWorkspace = async () => {
    const name = wsNewName.trim();
    if (!name) return;
    setWsBusy(true);
    try {
      const ws = await createWorkspace(name);
      try { localStorage.setItem("acuity:activeWorkspace", ws.id); } catch {}
      setActiveWs(ws.id);
      clearDataCache();
      toast(`Workspace "${name}" created`);
      setWsCreateOpen(false);
      setWsNewName("");
    } catch (err: any) {
      toast(`Could not create: ${err?.message ?? "Unknown error"}`, "err");
    } finally {
      setWsBusy(false);
    }
  };

  const handleDeleteWorkspace = async (w: { id: string; name: string }) => {
    if (workspaces.length <= 1) {
      toast("You need at least one workspace", "err");
      return;
    }
    if (!confirm(`Delete "${w.name}" and all its data? This cannot be undone.`)) return;
    try {
      await deleteWorkspace(w.id);
      toast(`Deleted "${w.name}"`);
      if (w.id === activeWs?.id) {
        const remaining = workspaces.filter(x => x.id !== w.id);
        if (remaining.length > 0) handleSwitchWorkspace(remaining[0].id);
      }
    } catch (err: any) {
      toast(`Could not delete: ${err?.message ?? "Unknown error"}`, "err");
    }
  };

  const handleBackToHome = () => {
    setActiveScreen("home");
    refreshData();
  };

  const handleStartSetupStep = (step: "account" | "income" | "bills") => {
    if (step === "account") {
      setActiveScreen("accounts");
      setTimeout(() => {
        const btn = document.querySelector('[data-setup-btn="add-account"]') as HTMLElement;
        if (btn) btn.click();
      }, 150);
    } else if (step === "income") {
      setActiveScreen("commitments");
      setTimeout(() => {
        const btn = document.querySelector('[data-setup-btn="add-income"]') as HTMLElement;
        if (btn) btn.click();
      }, 150);
    } else if (step === "bills") {
      setActiveScreen("commitments");
      setTimeout(() => {
        const btn = document.querySelector('[data-setup-btn="add-bill"]') as HTMLElement;
        if (btn) btn.click();
      }, 150);
    }
  };

  const handleDismissChecklist = async () => {
    try {
      await completeOnboarding();
      setChecklistDismissed(true);
      toast("Setup skipped — you can finish any time from Accounts or Commitments");
    } catch {
      setChecklistDismissed(true);
    }
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  
  if (isAuthLoading || wsLoading) return <div className="min-h-[100dvh]" style={{ background: "var(--bg)" }} />;
  
  if (!session) return <AuthScreen />;

  if (onboardingSequence === "carousel") {
    return <OnboardingCarousel onComplete={() => {
      setOnboardingSequence("pin");
    }} />;
  }

  if (onboardingSequence === "pin") {
    return <PinLockScreen mode="setup" onComplete={async (pin) => {
      await supabase.from("profiles").update({ pin }).eq("id", session.user.id);
      setDbPin(pin);
      localStorage.removeItem("acuity:new_signup");
      localStorage.setItem("acuity:last_active", String(Date.now()));
      setOnboardingSequence("complete");
    }} />;
  }

  if (isLocked) {
    return <PinLockScreen mode="unlock" errorText={lockError} onForgot={handleForgotPin} onComplete={(pin) => {
      if (pin === dbPin) {
        setIsLocked(false);
        setLockError("");
        localStorage.setItem("acuity:last_active", String(Date.now()));
      } else {
        setLockError("Incorrect PIN. Try again.");
      }
    }} />;
  }

  if (isLoading || !metrics) return <HomeSkeleton />;

  const m = metrics ?? ZERO_METRICS;
  const netAcrossAccounts = m.net_worth_minor / 100;
  const spentThisMonth = m.total_spent_minor / 100;
  const incomeThisMonth = m.total_income_minor / 100;
  const budgetLimit = m.budget_limit_minor / 100;
  const showChecklist = !!setupStatus && !setupStatus.is_complete && !checklistDismissed;
  const periodLabel = getPeriodLabel(cycle);
  const daysUntilIncome = safeToSpend?.days_until_next_income ?? 0;
  const nextIncomeDateRaw = safeToSpend?.next_income_date ?? "";
  const nextIncomeDate = nextIncomeDateRaw
    ? new Date(nextIncomeDateRaw).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
    : "";

  const visibleTransactions = transactions.filter((t) => {
    if (txnFilter === "all") return true;
    if (txnFilter === "credit") return t.direction === "credit";
    if (txnFilter === "debit") return t.direction === "debit";
    return true;
  });

  // --- NEW: Daily AI Insight Logic ---
  const topCategory = categoryRows[0]?.category ?? null;
  const topCategoryAmount = categoryRows[0]?.total_minor ? categoryRows[0].total_minor / 100 : 0;
  const budgetUsedPct = budgetLimit > 0 ? Math.round((spentThisMonth / budgetLimit) * 100) : 0;

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-hidden" style={{ background: "var(--bg)" }}>
      <PullToRefresh onRefresh={refreshData}>
        <ScreenTransition id={activeScreen}>
          {activeScreen === "analytics" ? (
            <AnalyticsScreen key={activeWs?.id} onBack={handleBackToHome} onNavigateTransactions={() => setActiveScreen("transactions")} />
          ) : activeScreen === "transactions" ? (
            <TransactionsScreen key={activeWs?.id} onBack={handleBackToHome} onDataChanged={refreshData} />
          ) : activeScreen === "budget" ? (
            <BudgetScreen key={activeWs?.id} onBack={handleBackToHome} />
          ) : activeScreen === "accounts" ? (
            <AccountsScreen 
              key={activeWs?.id} 
              onBack={handleBackToHome} 
              userName={profileName} 
              autoOpenAddAccount={openAddAccount} 
              onAutoOpenHandled={() => setOpenAddAccount(false)}
            />
          ) : activeScreen === "commitments" ? (
            <CommitmentsScreen 
              key={activeWs?.id} 
              onBack={handleBackToHome} 
              autoOpenModal={openCommitmentsTab}
              onAutoOpenHandled={() => setOpenCommitmentsTab(null)}
            />
          ) : activeScreen === "tax" ? (
            <TaxScreen onBack={handleBackToHome} />
          ) : activeScreen === "needs-review" ? (
            <NeedsReviewScreen onBack={handleBackToHome} onResolved={refreshData} />
          ) : activeScreen === "ajo" ? (
            <AjoScreen onBack={handleBackToHome} />
          ) : activeScreen === "bank-charge" ? (
            <BankChargeScreen onBack={handleBackToHome} />
          ) : (
            <div className="flex-1 overflow-y-auto pb-32">
              <div
                className="sticky top-0 z-30 flex items-center justify-between px-5 pb-3"
                style={{
                  paddingTop: "calc(env(safe-area-inset-top) + 12px)",
                  background: "color-mix(in srgb, var(--bg) 82%, transparent)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <button onClick={() => setWsOpen((v) => !v)} className="flex items-center gap-1">
                  <span className="text-[26px] font-bold tracking-tight text-[var(--text-1)]">
                    {activeWs?.name ?? "Home"}
                  </span>
                  <ChevronDown size={18} className="text-[var(--text-3)]" />
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setIsNotificationsOpen(true)} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--fill-1)] text-[var(--text-2)]">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--brand)]" />
                  </button>
                  <button onClick={() => setIsSettingsOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--fill-1)] text-[12px] font-semibold text-[var(--text-1)]">
                    {profileName.charAt(0).toUpperCase() || "A"}
                  </button>
                </div>
              </div>

              <WorkspaceSwitcher 
                isOpen={wsOpen} 
                onClose={() => setWsOpen(false)} 
                workspaces={workspaces} 
                activeId={activeWs?.id} 
                onSwitch={handleSwitchWorkspace} 
                onCreate={handleCreateClick} 
                onDelete={handleDeleteWorkspace} 
                isPremium={isAtWorkspaceLimit}
              />

              <div className="flex flex-col gap-6 px-5 pt-2">
                <SafeToSpendHero data={safeToSpend} netAcross={netAcrossAccounts} liquidAssets={liquidAssets} spentThisMonth={spentThisMonth} incomeThisMonth={incomeThisMonth} budgetLimit={budgetLimit} periodLabel={periodLabel} daysUntilIncome={daysUntilIncome} nextIncomeDate={nextIncomeDate} />

                {/* NEW: DAILY AI INSIGHT CARD */}
                {accounts.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAdvisorOpen(true)}
                    className="relative overflow-hidden w-full flex items-center justify-between rounded-[20px] bg-gradient-to-r from-[var(--surface-2)] to-[var(--surface-3)] border border-[var(--line)] p-4 text-left shadow-lg"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand)]/10 blur-[30px] rounded-full -mr-8 -mt-8 pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)]/10">
                        <Sparkles size={20} className="text-[var(--brand)]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[var(--brand)] uppercase tracking-wider mb-0.5">Daily Insight</p>
                        <p className="text-[13px] font-medium text-[var(--text-1)] leading-snug">
                          {topCategory ? `You've spent ${fmt(topCategoryAmount)} on ${topCategory} this month.` : "Ask me anything about your finances."}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-[var(--text-3)] relative z-10" />
                  </motion.button>
                )}

                {/* MONTHLY REPORT TEASER */}
                {showReportTeaser && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleViewReport}
                    className="relative overflow-hidden w-full flex items-center justify-between rounded-[20px] bg-gradient-to-r from-[var(--brand)]/20 to-[var(--surface-2)] border border-[var(--brand)]/30 p-4 text-left shadow-[0_0_20px_rgba(222,49,33,0.15)]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)]/20 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)] shadow-lg">
                        <Award size={20} className="text-[var(--brand-ink)]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-white">Your Monthly Report is ready</p>
                        <p className="text-[11px] text-[var(--brand)] font-medium">Tap to see your financial report card</p>
                      </div>
                    </div>
                    <Award size={24} className="text-[var(--brand)]/50 relative z-10" />
                  </motion.button>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setActiveScreen("budget")} className="press flex h-14 items-center justify-center rounded-[18px] border border-white/5 bg-[#1c1c1e]">
                    <PiggyBank size={20} color="var(--brand)" />
                  </button>
                  <button onClick={() => setActiveScreen("analytics")} className="press flex h-14 items-center justify-center rounded-[18px] border border-white/5 bg-[#1c1c1e]">
                    <PieChart size={20} color="var(--brand)" />
                  </button>
                  <button onClick={() => setIsImportOpen(true)} className="press flex h-14 items-center justify-center rounded-[18px] border border-white/5 bg-[#1c1c1e]">
                    <ArrowLeftRight size={20} color="var(--brand)" />
                  </button>
                </div>

                {setupError && <p className="px-1 text-[11px] text-[var(--danger)]">Setup status failed: {setupError}</p>}
                {showChecklist && <SetupChecklist status={setupStatus!} onStartStep={handleStartSetupStep} onDismiss={handleDismissChecklist} />}

                <div className="w-full">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h3 className="text-[15px] font-semibold text-[var(--text-1)]">My Accounts</h3>
                    <button onClick={() => setActiveScreen("accounts")} className="text-[12px] font-medium text-[var(--brand)]">
                      See all
                    </button>
                  </div>
                  
                  {accounts.length > 0 ? (
                    <>
                      <div 
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="-mx-5 overflow-x-auto px-5 pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        <div className="flex gap-4">
                          {accounts.map((a) => (
                            <div key={a.id} className="shrink-0 w-[85vw] max-w-[340px] snap-center">
                              <StackedAccountCard
                                account={a}
                                balance={(a.current_minor ?? a.balance_minor) / 100}
                                fmt={fmt}
                                isExpanded={true}
                                hideActions={true}
                                onClick={() => setActiveScreen("accounts")}
                                onCheckBalance={() => {}}
                                onDelete={() => {}}
                                cardholderName={profileName}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-1.5 mt-1">
                        {accounts.map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              i === activeCardIndex ? "w-6 bg-[var(--brand)]" : "w-1.5 bg-white/20"
                            )} 
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--line-strong)] p-6 text-center">
                      <p className="text-[14px] text-[var(--text-3)]">No accounts yet.</p>
                      <Button onClick={() => setActiveScreen("accounts")} variant="ghost" className="mt-3 h-9 text-[12px]">Add Account</Button>
                    </div>
                  )}
                </div>

                <ToolsScroller onNavigate={(key) => setActiveScreen(key as ScreenId)} />

                {m.uncategorized_count > 0 && (
                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => setActiveScreen("needs-review")} className="flex w-full items-center justify-between rounded-2xl border border-[var(--warn)]/25 bg-[var(--warn)]/10 p-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--warn)]/20">
                        <span className="text-[13px] font-semibold text-[var(--warn)]">{m.uncategorized_count}</span>
                      </div>
                      <span className="text-[14px] font-medium text-[var(--text-1)]">Transactions need review</span>
                    </div>
                    <ChevronRight size={18} className="text-[var(--warn)]" />
                  </motion.button>
                )}

                <div>
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h3 className="text-[15px] font-semibold text-[var(--text-1)]">Transactions</h3>
                    <button onClick={() => setActiveScreen("transactions")} className="text-[12px] font-medium text-[var(--brand)]">See all</button>
                  </div>
                  <TransactionFilterChips active={txnFilter} onChange={setTxnFilter} />
                  <div className="group-list">
                    {visibleTransactions.length === 0 ? (
                      <EmptyState icon={Receipt} title="No transactions yet" body="Add one or import a statement to get started." action="Add transaction" onAction={() => setIsQuickAddOpen(true)} />
                    ) : (
                      visibleTransactions.slice(0, 10).map((t) => (
                        <TransactionRow key={t.id} txn={t} onOpen={setSelectedTxn} onDelete={handleDeleteTxn} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScreenTransition>
      </PullToRefresh>

      <FloatingTabBar activeTab={activeScreen === "budget" ? "home" : (activeScreen as TabId)} onTabChange={handleTabChange} onAddClick={handleAddClick} isHidden={navHidden} />
      <ImportSheet isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImportSuccess={() => { refreshData(); toast("Statement imported"); }} />
      
      {/* UPDATED AI DRAWER WITH LIVE CONTEXT */}
      <AIDrawer 
        isOpen={isAdvisorOpen} 
        onClose={() => setIsAdvisorOpen(false)} 
        fullName={profileName} 
        safeToSpend={safeToSpend}
        metrics={m}
        topCategory={topCategory}
        daysUntilIncome={daysUntilIncome}
      />

      <SettingsSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={{ ...session.user, created_at: session.user.created_at }} onSignOut={handleSignOut} profileName={profileName} onNameUpdated={(name) => setProfileName(name)} />
      
      <NotificationsSheet 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        onDataChanged={refreshData} 
      />

      <AddTransactionSheet isOpen={isAddTxnOpen} onClose={() => setIsAddTxnOpen(false)} onSaved={refreshData} />
      <QuickAddSheet isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onSaved={refreshData} />

      <Modal open={wsCreateOpen} onClose={() => { setWsCreateOpen(false); setWsNewName(""); }} title="New workspace">
        <div className="space-y-3">
          <Field label="Workspace name" value={wsNewName} onChange={(e) => setWsNewName(e.target.value)} placeholder="e.g. Side Business" autoFocus />
          <Button loading={wsBusy} onClick={handleCreateWorkspace} disabled={!wsNewName.trim()}>Create</Button>
        </div>
      </Modal>

      {/* MONTHLY REPORT MODAL */}
      <MonthlyReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        workspaceId={activeWs?.id || ""} 
      />

      {/* --- PREMIUM SUBSCRIPTION MODAL --- */}
      <Modal open={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} title="Acuity Premium">
        <div className="flex flex-col items-center py-4 space-y-6">
          
          <div className="flex items-baseline">
            <span className="text-[38px] font-black tracking-tighter text-white">ACUITY</span>
            <span className="text-[38px] font-black tracking-tighter" style={{ color: "var(--brand)" }}>.</span>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)]/10">
            <Crown size={32} className="text-[var(--brand)]" />
          </div>

          <div className="text-center">
            <h2 className="text-[20px] font-bold text-[var(--text-1)]">Unlock Premium</h2>
            <p className="text-[13px] text-[var(--text-3)] mt-2 max-w-[260px] mx-auto leading-relaxed">
              You've reached the maximum of 2 free workspaces. Upgrade to create unlimited workspaces and unlock advanced features.
            </p>
          </div>

          <div className="w-full space-y-3">
            <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-5 relative overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[15px] font-semibold text-[var(--text-1)]">Monthly Plan</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-white">$3.99</span>
                  <span className="text-[12px] text-[var(--text-3)]">/mo</span>
                </div>
              </div>
              <p className="text-[12px] text-[var(--text-2)]">≈ {fmt(3.99 * rate)} / month</p>
            </div>

            <div className="rounded-2xl bg-[var(--brand)]/10 border border-[var(--brand)]/30 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--brand)] text-[var(--brand-ink)] text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                SAVE 16%
              </div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-[15px] font-semibold text-[var(--brand)]">Annual Plan</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-[var(--brand)]">$39.99</span>
                  <span className="text-[12px] text-[var(--brand)]/70">/yr</span>
                </div>
              </div>
              <p className="text-[12px] text-[var(--brand)]/80">≈ {fmt(39.99 * rate)} / year</p>
              <p className="text-[11px] text-[var(--brand)]/60 mt-1">Just $3.33/mo</p>
            </div>
          </div>

          <div className="w-full pt-2">
            <Button 
              onClick={() => toast("Payment gateway coming soon!")} 
              className="w-full h-12 text-[15px] font-bold"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </Modal>

      <TransactionDetailSheet key={selectedTxn?.id || "empty"} isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} onSaved={refreshData} transaction={selectedTxn} />
    </main>
  );
}