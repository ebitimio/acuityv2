"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getHomeMetrics, getRecentTransactions, deleteTransaction, clearDataCache,
  getSetupStatus, completeOnboarding, getSafeToSpend,
  getCurrentCycle, getCategorySpend, getPeriodLabel, getAccounts,
  type SetupStatus, type SafeToSpend, type CategorySpendRow,
} from "@/lib/supabase/database";
import { useWorkspace } from "@/lib/workspace";
import type { Txn, HomeMetrics } from "@/lib/types";
import { AuthScreen } from "@/components/screens/auth-screen";
import { SplashScreen } from "@/components/ui/splash-screen";
import { HomeSkeleton } from "@/components/ui/skeleton-loader";
import { FloatingTabBar, type TabId } from "@/components/ui/floating-tab-bar";
import { TransactionRow } from "@/components/ui/transaction-row";
import { SetupChecklist } from "@/components/screens/setup-checklist";
import { SetupWizard } from "@/components/screens/setup-wizard";
import { SafeToSpendHero } from "@/components/ui/safe-to-spend";
import { CategoryScroller } from "@/components/ui/category-scroller";
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
  PiggyBank, PieChart, ArrowLeftRight, Bell,
} from "lucide-react";
import { TransactionsScreen } from "@/components/screens/transactions-screen";
import { OnboardingCarousel } from "@/components/screens/onboarding-carousel";
import { PinLockScreen } from "@/components/screens/pin-lock-screen";

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
  const { fmt } = useCurrency();
  const { workspaces, active: activeWs, setActive: setActiveWs, createWorkspace, deleteWorkspace, loading: wsLoading } = useWorkspace();

  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");

  // Onboarding & PIN states
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockError, setLockError] = useState("");

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddTxnOpen, setIsAddTxnOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null);

  const [metrics, setMetrics] = useState<HomeMetrics | null>(null);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [categoryRows, setCategoryRows] = useState<CategorySpendRow[]>([]);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpend | null>(null);
  const [cycle, setCycle] = useState<{ cycle_start: string; cycle_end: string } | null>(null);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [setupWizardStep, setSetupWizardStep] = useState<"account" | "income" | "bills">("account");
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [txnFilter, setTxnFilter] = useState<TransactionFilter>("all");

  const [navHidden, setNavHidden] = useState(false);

  const [wsOpen, setWsOpen] = useState(false);
  const [wsCreateOpen, setWsCreateOpen] = useState(false);
  const [wsNewName, setWsNewName] = useState("");
  const [wsBusy, setWsBusy] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 100) setNavHidden(true);
    else setNavHidden(false);
  });

  // 30-Minute Inactivity Lock
  useEffect(() => {
    if (!session || showCarousel || showPinSetup || !isOnboardingChecked) return;

    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      // 30 minutes = 1,800,000 ms
      timeout = setTimeout(() => {
        if (localStorage.getItem("acuity:pin")) {
          setIsLocked(true);
        }
      }, 1800000); 
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [session, showCarousel, showPinSetup, isOnboardingChecked]);

  useEffect(() => {
    if (session?.user?.id) {
      supabase.from("profiles").select("full_name").eq("id", session.user.id).single()
        .then(({ data }) => {
          if (data?.full_name) setProfileName(data.full_name);
          else if (session.user.email) setProfileName(session.user.email.split("@")[0]);
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
      const [m, t] = await Promise.all([getHomeMetrics(), getRecentTransactions(20)]);
      setMetrics(m ?? ZERO_METRICS);
      setTransactions(t ?? []);
    } catch (e: any) { setMetrics(ZERO_METRICS); setTransactions([]); }

    try {
      const accounts = await getAccounts();
      const total = accounts.reduce((s, a) => s + (a.current_minor ?? a.balance_minor), 0) / 100;
      setLiquidAssets(total);
    } catch (e) { setLiquidAssets(0); }

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
      
      // Check onboarding/PIN status securely before rendering
      if (session) {
        const hasPin = localStorage.getItem("acuity:pin");
        const hasSeenCarousel = localStorage.getItem("acuity:onboarded");
        
        if (!hasSeenCarousel) {
          setShowCarousel(true);
        } else if (!hasPin) {
          setShowPinSetup(true);
        }
      }
      setIsOnboardingChecked(true);
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
  }, [activeWs?.id]);

  useEffect(() => {
    if (!showSplash && session) {
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [showSplash, session]);

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
    localStorage.removeItem("acuity:pin");
    localStorage.removeItem("acuity:onboarded");
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleSwitchWorkspace = (id: string) => {
    setWsOpen(false);
    try { localStorage.setItem("acuity:activeWorkspace", id); } catch {}
    setActiveWs(id);
    clearDataCache();
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

  const handleStartSetupStep = (step: "account" | "income" | "bills") => {
    setSetupWizardStep(step);
    setSetupWizardOpen(true);
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
  if (isAuthLoading || wsLoading || !isOnboardingChecked) return <div className="min-h-[100dvh]" style={{ background: "var(--bg)" }} />;
  if (!session) return <AuthScreen />;
  
  if (showCarousel) {
    return <OnboardingCarousel onComplete={() => {
      localStorage.setItem("acuity:onboarded", "1");
      setShowCarousel(false);
      setShowPinSetup(true);
    }} />;
  }

  if (showPinSetup) {
    return <PinLockScreen mode="setup" onComplete={(pin) => {
      localStorage.setItem("acuity:pin", pin);
      setShowPinSetup(false);
    }} />;
  }

  if (isLocked) {
    return <PinLockScreen mode="unlock" errorText={lockError} onComplete={(pin) => {
      if (pin === localStorage.getItem("acuity:pin")) {
        setIsLocked(false);
        setLockError("");
      } else {
        setLockError("Incorrect PIN. Try again.");
      }
    }} />;
  }

  if (isLoading) return <HomeSkeleton />;

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

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-hidden" style={{ background: "var(--bg)" }}>
      <PullToRefresh onRefresh={refreshData}>
        <ScreenTransition id={activeScreen}>
          {activeScreen === "analytics" ? (
            <AnalyticsScreen key={activeWs?.id} onBack={() => setActiveScreen("home")} onNavigateTransactions={() => setActiveScreen("transactions")} />
          ) : activeScreen === "transactions" ? (
            <TransactionsScreen key={activeWs?.id} onBack={() => setActiveScreen("home")} onDataChanged={refreshData} />
          ) : activeScreen === "budget" ? (
            <BudgetScreen key={activeWs?.id} onBack={() => setActiveScreen("home")} />
          ) : activeScreen === "accounts" ? (
            <AccountsScreen key={activeWs?.id} onBack={() => setActiveScreen("home")} userName={profileName} />
          ) : activeScreen === "commitments" ? (
            <CommitmentsScreen key={activeWs?.id} onBack={() => setActiveScreen("home")} />
          ) : activeScreen === "tax" ? (
            <TaxScreen onBack={() => setActiveScreen("home")} />
          ) : activeScreen === "needs-review" ? (
            <NeedsReviewScreen onBack={() => setActiveScreen("home")} onResolved={refreshData} />
          ) : activeScreen === "ajo" ? (
            <AjoScreen onBack={() => setActiveScreen("home")} />
          ) : activeScreen === "bank-charge" ? (
            <BankChargeScreen onBack={() => setActiveScreen("home")} />
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
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DE3121]" />
                  </button>
                  <button onClick={() => setIsSettingsOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--fill-1)] text-[12px] font-semibold text-[var(--text-1)]">
                    {profileName.charAt(0).toUpperCase() || "A"}
                  </button>
                </div>
              </div>

              <WorkspaceSwitcher isOpen={wsOpen} onClose={() => setWsOpen(false)} workspaces={workspaces} activeId={activeWs?.id} onSwitch={handleSwitchWorkspace} onCreate={() => setWsCreateOpen(true)} onDelete={handleDeleteWorkspace} />

              <div className="flex flex-col gap-6 px-5 pt-2">
                <SafeToSpendHero data={safeToSpend} netAcross={netAcrossAccounts} liquidAssets={liquidAssets} spentThisMonth={spentThisMonth} incomeThisMonth={incomeThisMonth} budgetLimit={budgetLimit} periodLabel={periodLabel} daysUntilIncome={daysUntilIncome} nextIncomeDate={nextIncomeDate} />

                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setActiveScreen("budget")} className="press flex h-14 items-center justify-center rounded-[18px] border border-white/5 bg-[#1c1c1e]">
                    <PiggyBank size={20} color="#DE3121" />
                  </button>
                  <button onClick={() => setActiveScreen("analytics")} className="press flex h-14 items-center justify-center rounded-[18px] border border-white/5 bg-[#1c1c1e]">
                    <PieChart size={20} color="#DE3121" />
                  </button>
                  <button onClick={() => setIsImportOpen(true)} className="press flex h-14 items-center justify-center rounded-[18px] border border-white/5 bg-[#1c1c1e]">
                    <ArrowLeftRight size={20} color="#DE3121" />
                  </button>
                </div>

                {setupError && <p className="px-1 text-[11px] text-[var(--danger)]">Setup status failed: {setupError}</p>}
                {showChecklist && <SetupChecklist status={setupStatus!} onStartStep={handleStartSetupStep} onDismiss={handleDismissChecklist} />}

                <CategoryScroller rows={categoryRows} onSeeAll={() => setActiveScreen("analytics")} />

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
      <AIDrawer isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} fullName={profileName} />
      <SettingsSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={{ ...session.user, created_at: session.user.created_at }} onSignOut={handleSignOut} profileName={profileName} onNameUpdated={(name) => setProfileName(name)} />
      <NotificationsSheet isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <AddTransactionSheet isOpen={isAddTxnOpen} onClose={() => setIsAddTxnOpen(false)} onSaved={refreshData} />
      <QuickAddSheet isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onSaved={refreshData} />

      <SetupWizard isOpen={setupWizardOpen} initialStep={setupWizardStep} onClose={() => { setSetupWizardOpen(false); refreshData(); }} onRefresh={refreshData} />

      <Modal open={wsCreateOpen} onClose={() => { setWsCreateOpen(false); setWsNewName(""); }} title="New workspace">
        <div className="space-y-3">
          <Field label="Workspace name" value={wsNewName} onChange={(e) => setWsNewName(e.target.value)} placeholder="e.g. Side Business" autoFocus />
          <Button loading={wsBusy} onClick={handleCreateWorkspace} disabled={!wsNewName.trim()}>Create</Button>
        </div>
      </Modal>

      <TransactionDetailSheet key={selectedTxn?.id || "empty"} isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} onSaved={refreshData} transaction={selectedTxn} />
    </main>
  );
}