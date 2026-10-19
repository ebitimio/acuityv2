"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getHomeMetrics, getRecentTransactions, deleteTransaction, clearDataCache,
  getSetupStatus, completeOnboarding, getSafeToSpend,
  type SetupStatus, type SafeToSpend,
} from "@/lib/supabase/database";
import { useWorkspace } from "@/lib/workspace";
import type { Txn, HomeMetrics } from "@/lib/types";
import { AuthScreen } from "@/components/screens/auth-screen";
import { SplashScreen } from "@/components/ui/splash-screen";
import { HomeSkeleton } from "@/components/ui/skeleton-loader";
import { FloatingTabBar } from "@/components/ui/floating-tab-bar";
import { TransactionRow } from "@/components/ui/transaction-row";
import { SetupChecklist } from "@/components/screens/setup-checklist";
import { SetupWizard } from "@/components/screens/setup-wizard";
import { SafeToSpendHero } from "@/components/ui/safe-to-spend";
import { RunwayCards } from "@/components/ui/runway-card";
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
import { ImportSheet } from "@/components/ui/import-sheet";
import { TransactionDetailSheet } from "@/components/ui/transaction-detail-sheet";
import { AIDrawer } from "@/components/ui/ai-drawer";
import { AddTransactionSheet } from "@/components/ui/add-transaction-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Field, Button } from "@/components/ui/form";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Eye, EyeOff, Bell, TrendingUp, ArrowLeftRight, CalendarDays, FileText,
  Users, ShieldAlert, ChevronRight, Receipt, ChevronDown, Plus, Trash2,
} from "lucide-react";

const ZERO_METRICS: HomeMetrics = {
  net_worth_minor: 0,
  total_spent_minor: 0,
  total_income_minor: 0,
  budget_limit_minor: 0,
  uncategorized_count: 0,
};

export default function SandboxPage() {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const supabase = createClient();
  const toast = useToast();
  const { hidden, toggleHidden } = useCurrency();
  const { workspaces, active: activeWs, setActive: setActiveWs, createWorkspace, deleteWorkspace } = useWorkspace();

  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState("home");

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddTxnOpen, setIsAddTxnOpen] = useState(false);
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null);

  const [metrics, setMetrics] = useState<HomeMetrics | null>(null);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpend | null>(null);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [setupWizardStep, setSetupWizardStep] = useState<"account" | "income" | "bills" | "budget">("account");
  const [checklistDismissed, setChecklistDismissed] = useState(false);

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

  const refreshData = useCallback(async () => {
    try {
      clearDataCache();
      const [m, t] = await Promise.all([getHomeMetrics(), getRecentTransactions(8)]);
      setMetrics(m ?? ZERO_METRICS);
      setTransactions(t ?? []);
    } catch (e: any) {
      console.error("refreshData failed:", e);
      setMetrics(ZERO_METRICS);
      setTransactions([]);
    }

    try {
      const s = await getSetupStatus();
      setSetupStatus(s);
      setSetupError(null);
    } catch (e: any) {
      console.error("getSetupStatus failed:", e);
      setSetupError(e?.message ?? String(e));
      setSetupStatus(null);
    }

    try {
      const sts = await getSafeToSpend();
      setSafeToSpend(sts);
    } catch (e: any) {
      console.error("getSafeToSpend failed:", e);
      setSafeToSpend(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (session) refreshData();
  }, [session, refreshData]);

  useEffect(() => {
    if (session && activeWs?.id) refreshData();
  }, [activeWs?.id]);

  useEffect(() => {
    if (!showSplash && session) {
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [showSplash, session]);

  const handleTabChange = (tabId: string) => {
    if (tabId === "advisor") { setIsAdvisorOpen(true); return; }
    setActiveScreen(tabId);
  };

  const handleAddClick = () => setIsAddTxnOpen(true);

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
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleSwitchWorkspace = (id: string) => {
    setWsOpen(false);
    try { localStorage.setItem("acuity:activeWorkspace", id); } catch {}
    setActiveWs(id);
    clearDataCache();
    window.location.href = "/";
  };

  const handleCreateWorkspace = async () => {
    const name = wsNewName.trim();
    if (!name) return;
    setWsBusy(true);
    try {
      const ws = await createWorkspace(name);
      try { localStorage.setItem("acuity:activeWorkspace", ws.id); } catch {}
      clearDataCache();
      toast(`Workspace "${name}" created`);
      setWsCreateOpen(false);
      setWsNewName("");
      window.location.href = "/";
    } catch (err: any) {
      console.error("Workspace create error:", err);
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
      if (w.id === activeWs?.id) window.location.href = "/";
    } catch (err: any) {
      toast(`Could not delete: ${err?.message ?? "Unknown error"}`, "err");
    }
  };

  const handleStartSetupStep = (step: "account" | "income" | "bills" | "budget") => {
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
  if (isAuthLoading) return <div className="min-h-[100dvh] bg-black" />;
  if (!session) return <AuthScreen />;
  if (isLoading) return <HomeSkeleton />;

  const m = metrics ?? ZERO_METRICS;
  const netAcrossAccounts = m.net_worth_minor / 100;
  const totalSpentNGN = m.total_spent_minor / 100;
  const totalIncomeNGN = m.total_income_minor / 100;
  const showChecklist = !!setupStatus && !setupStatus.is_complete && !checklistDismissed;

  return (
    <main className="min-h-[100dvh] bg-black relative overflow-x-hidden flex flex-col">
      {activeScreen === "analytics" ? (
        <AnalyticsScreen onBack={() => setActiveScreen("home")} />
      ) : activeScreen === "budget" ? (
        <BudgetScreen onBack={() => setActiveScreen("home")} />
      ) : activeScreen === "accounts" ? (
        <AccountsScreen onBack={() => setActiveScreen("home")} />
      ) : activeScreen === "commitments" ? (
        <CommitmentsScreen onBack={() => setActiveScreen("home")} />
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
            className="relative pt-[calc(env(safe-area-inset-top)+12px)] pb-5 px-5 rounded-b-[36px] overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #7a0e0e 0%, #b3391f 35%, #e87a1a 75%, #ffb347 100%)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setWsOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30"
              >
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold text-white">
                  {(activeWs?.name ?? "P").charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] font-medium text-white max-w-[120px] truncate">
                  {activeWs?.name ?? "Personal"}
                </span>
                <ChevronDown size={14} className="text-white/70" />
              </button>
              <div className="flex gap-2">
                <button
                  onClick={toggleHidden}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"
                >
                  {hidden ? <EyeOff size={14} className="text-white" /> : <Eye size={14} className="text-white" />}
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"
                >
                  <Bell size={14} className="text-white" />
                </button>
              </div>
            </div>

            {wsOpen && (
              <div className="absolute top-14 left-4 z-50 bg-[var(--surface-2)] border border-[var(--line-strong)] rounded-2xl shadow-2xl p-2 w-64">
                {workspaces.map((w) => {
                  const isActive = w.id === activeWs?.id;
                  const canDelete = workspaces.length > 1;
                  return (
                    <div
                      key={w.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] ${
                        isActive ? "bg-[var(--brand)]/20 text-[var(--brand)]" : "hover:bg-white/5 text-white"
                      }`}
                    >
                      <button onClick={() => handleSwitchWorkspace(w.id)} className="flex-1 text-left truncate">
                        {w.name}
                      </button>
                      {canDelete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteWorkspace(w); }}
                          className="p-1 text-[var(--danger)] hover:bg-[var(--danger)]/20 rounded ml-2"
                          aria-label={`Delete ${w.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => { setWsOpen(false); setWsCreateOpen(true); }}
                  className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] text-[var(--brand)] hover:bg-white/5"
                >
                  <Plus size={14} /> Create workspace
                </button>
              </div>
            )}

            <SafeToSpendHero
              data={safeToSpend}
              netAcross={netAcrossAccounts}
              hasAccounts={(safeToSpend?.liquid_minor ?? 0) > 0}
            />

            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => setActiveScreen("budget")}
                className="flex-1 py-2.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
              >
                <TrendingUp size={15} /> Monitoring
              </button>
              <button
                onClick={() => setIsImportOpen(true)}
                className="flex-1 py-2.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
              >
                <ArrowLeftRight size={15} /> Import
              </button>
            </div>
          </div>

          <div className="px-4 mt-4">
            <RunwayCards
              safe={safeToSpend}
              metrics={metrics}
              onOpenUpcoming={() => setIsUpcomingOpen(true)}
              onOpenBudget={() => setActiveScreen("budget")}
            />
          </div>

          {setupError && (
            <div className="px-4 mt-2">
              <p className="text-[11px] text-[var(--danger)]">Setup status failed: {setupError}</p>
            </div>
          )}

          {showChecklist && (
            <div className="px-4 mt-4">
              <SetupChecklist
                status={setupStatus!}
                onStartStep={handleStartSetupStep}
                onDismiss={handleDismissChecklist}
              />
            </div>
          )}

          <div className="px-4 mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveScreen("commitments")}
              className="rounded-3xl bg-gradient-to-b from-[#3a1a0a] to-[#0a0a0a] border border-white/10 p-4 flex flex-col justify-between text-left hover:border-[#e87a1a]/50 transition-colors aspect-[4/3]"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CalendarDays size={20} className="text-white/80" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">Commitments</p>
                <p className="text-[11px] text-white/50 mt-1 leading-snug">Bills & funds.</p>
              </div>
            </button>
            <button
              onClick={() => setActiveScreen("tax")}
              className="rounded-3xl bg-gradient-to-b from-[#3a1a0a] to-[#0a0a0a] border border-white/10 p-4 flex flex-col justify-between text-left hover:border-[#e87a1a]/50 transition-colors aspect-[4/3]"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <FileText size={20} className="text-white/80" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">Tax Estimator</p>
                <p className="text-[11px] text-white/50 mt-1 leading-snug">PIT & LIRS.</p>
              </div>
            </button>
            <button
              onClick={() => setActiveScreen("ajo")}
              className="rounded-3xl bg-gradient-to-b from-[#3a1a0a] to-[#0a0a0a] border border-white/10 p-4 flex flex-col justify-between text-left hover:border-[#e87a1a]/50 transition-colors aspect-[4/3]"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Users size={20} className="text-white/80" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">Ajo Tracker</p>
                <p className="text-[11px] text-white/50 mt-1 leading-snug">Cooperative groups.</p>
              </div>
            </button>
            <button
              onClick={() => setActiveScreen("bank-charge")}
              className="rounded-3xl bg-gradient-to-b from-[#3a1a0a] to-[#0a0a0a] border border-white/10 p-4 flex flex-col justify-between text-left hover:border-[#e87a1a]/50 transition-colors aspect-[4/3]"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldAlert size={20} className="text-white/80" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">Bank Charges</p>
                <p className="text-[11px] text-white/50 mt-1 leading-snug">Fee auditor.</p>
              </div>
            </button>
          </div>

          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[17px] font-semibold text-white">Monthly expenses</h3>
              <span className="text-[13px] font-medium text-[var(--brand)]">↓ ₦{totalSpentNGN.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-[#17191A] rounded-3xl p-5 border border-white/5">
              <div className="text-center">
                <p className="text-[11px] text-white/50 mb-1">Spent</p>
                <p className="text-[15px] font-semibold text-white">₦{totalSpentNGN.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] text-white/50 mb-1">Income</p>
                <p className="text-[15px] font-semibold text-white">₦{totalIncomeNGN.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] text-white/50 mb-1">Net</p>
                <p
                  className={`text-[15px] font-semibold ${
                    totalIncomeNGN - totalSpentNGN >= 0 ? "text-[var(--gain)]" : "text-[var(--danger)]"
                  }`}
                >
                  ₦{(totalIncomeNGN - totalSpentNGN).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {m.uncategorized_count > 0 && (
            <div className="px-4 mt-4">
              <motion.button
                whileHover={{ y: -3 }}
                onClick={() => setActiveScreen("needs-review")}
                className="w-full flex items-center justify-between p-4 bg-[var(--warn)]/10 border border-[var(--warn)]/20 rounded-2xl group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--warn)]/20 flex items-center justify-center">
                    <span className="text-[var(--warn)] font-semibold text-[14px]">{m.uncategorized_count}</span>
                  </div>
                  <span className="text-[15px] font-medium text-white">Transactions need review</span>
                </div>
                <ChevronRight size={20} className="text-[var(--warn)] group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          )}

          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[17px] font-semibold text-white">Recent</h3>
              <button
                onClick={() => setActiveScreen("analytics")}
                className="text-[13px] text-[var(--brand)] font-medium"
              >
                See all
              </button>
            </div>
            <div className="group-list">
              {transactions.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No transactions yet"
                  body="Once you add an account and log a transaction, it will appear here."
                  action="Add transaction"
                  onAction={() => setIsAddTxnOpen(true)}
                />
              ) : (
                transactions.map((t) => (
                  <TransactionRow key={t.id} txn={t} onOpen={setSelectedTxn} onDelete={handleDeleteTxn} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <FloatingTabBar
        activeTab={activeScreen === "budget" ? "home" : activeScreen}
        onTabChange={handleTabChange}
        onAddClick={handleAddClick}
        isHidden={navHidden}
      />

      <ImportSheet
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => { refreshData(); toast("Statement imported"); }}
      />
      <AIDrawer isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} />
      <SettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={session.user}
        onSignOut={handleSignOut}
      />
      <AddTransactionSheet isOpen={isAddTxnOpen} onClose={() => setIsAddTxnOpen(false)} onSaved={refreshData} />

      <SetupWizard
        isOpen={setupWizardOpen}
        initialStep={setupWizardStep}
        onClose={() => { setSetupWizardOpen(false); refreshData(); }}
        onRefresh={refreshData}
      />

      <Modal
        open={wsCreateOpen}
        onClose={() => { setWsCreateOpen(false); setWsNewName(""); }}
        title="New workspace"
      >
        <div className="space-y-3">
          <Field
            label="Workspace name"
            value={wsNewName}
            onChange={(e) => setWsNewName(e.target.value)}
            placeholder="e.g. Side Business"
            autoFocus
          />
          <Button loading={wsBusy} onClick={handleCreateWorkspace} disabled={!wsNewName.trim()}>
            Create
          </Button>
        </div>
      </Modal>

      <Modal open={isUpcomingOpen} onClose={() => setIsUpcomingOpen(false)} title="Upcoming bills">
        <div className="space-y-2">
          {(safeToSpend?.upcoming_bills ?? []).length === 0 ? (
            <p className="text-[14px] text-[var(--text-3)] text-center py-6">
              No bills set up. Add them in Commitments.
            </p>
          ) : (
            safeToSpend!.upcoming_bills.map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--surface-1)]"
              >
                <div>
                  <p className="text-[14px] font-medium">{b.name}</p>
                  <p className="text-[11px] text-[var(--text-3)]">Day {b.day}</p>
                </div>
                <p className="tabular font-semibold">₦{(b.amount_minor / 100).toLocaleString()}</p>
              </div>
            ))
          )}
          <Button
            variant="ghost"
            onClick={() => { setIsUpcomingOpen(false); setActiveScreen("commitments"); }}
          >
            Manage in Commitments
          </Button>
        </div>
      </Modal>

      <TransactionDetailSheet
        key={selectedTxn?.id || "empty"}
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onSaved={refreshData}
        transaction={selectedTxn}
      />
    </main>
  );
}