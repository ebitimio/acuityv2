"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getWorkspaceAndTransactions, getHomeMetrics } from "@/lib/supabase/database";
import { AuthScreen } from "@/components/screens/auth-screen";

import { FloatingTabBar } from "@/components/ui/floating-tab-bar";
import { TopBar } from "@/components/ui/top-bar";
import { GlassSurface } from "@/components/ui/glass-surface";
import { NumberRoll } from "@/components/ui/number-roll";
import { ImportSheet } from "@/components/ui/import-sheet";
import { AIDrawer } from "@/components/ui/ai-drawer";
import { TransactionRow } from "@/components/ui/transaction-row";
import { TransactionDetailSheet } from "@/components/ui/transaction-detail-sheet";
import { SettingsSheet } from "@/components/ui/settings-sheet";
import { SplashScreen } from "@/components/ui/splash-screen";
import { HomeSkeleton } from "@/components/ui/skeleton-loader";
import { AnalyticsScreen } from "@/components/screens/analytics-screen";
import { BudgetScreen } from "@/components/screens/budget-screen";
import { AccountsScreen } from "@/components/screens/accounts-screen";
import { CommitmentsScreen } from "@/components/screens/commitments-screen";
import { TaxScreen } from "@/components/screens/tax-screen";
import { NeedsReviewScreen } from "@/components/screens/needs-review-screen";
import { AjoScreen } from "@/components/screens/ajo-screen";
import { BankChargeScreen } from "@/components/screens/bank-charge-screen";

import { motion } from "framer-motion";
import { RefreshCw, ChevronRight, CalendarDays, FileText, Users, ShieldAlert, LayoutGrid, ArrowLeftRight } from "lucide-react";

const HoverCard = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
  <motion.button
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="w-full flex flex-col items-start p-4 bg-[#17191A] border border-white/5 rounded-3xl transition-colors"
  >
    {children}
  </motion.button>
);

export default function SandboxPage() {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const supabase = createClient();

  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState("home");
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  const [metrics, setMetrics] = useState({
    net_worth_minor: 0,
    total_spent_minor: 0,
    total_income_minor: 0,
    budget_limit_minor: 0,
    uncategorized_count: 0,
  });

  const [transactions, setTransactions] = useState<any[]>([]);

  const refreshData = async () => {
    try {
      const [metricsData, txData] = await Promise.all([
        getHomeMetrics(),
        getWorkspaceAndTransactions()
      ]);
      setMetrics(metricsData);
      setTransactions(txData.transactions);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

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
  }, [session]);

  useEffect(() => {
    if (!showSplash && session) {
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [showSplash, session]);

  const handleTabChange = (tabId: string) => {
    if (tabId === "advisor") {
      setIsAdvisorOpen(true);
      return;
    }
    setActiveScreen(tabId);
  };

  if (isAuthLoading) return <div className="min-h-[100dvh] bg-black" />;
  if (!session) return <AuthScreen />;
  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (isLoading) return <HomeSkeleton />;

  const netWorthNGN = metrics.net_worth_minor / 100;
  const totalSpentNGN = metrics.total_spent_minor / 100;
  const budgetLimitNGN = metrics.budget_limit_minor / 100;
  const spentPercentage = budgetLimitNGN > 0 ? Math.min(Math.round((totalSpentNGN / budgetLimitNGN) * 100), 100) : 0;
  const remaining = Math.max(budgetLimitNGN - totalSpentNGN, 0);

  return (
    <main className="min-h-[100dvh] bg-black relative overflow-x-hidden flex flex-col">
      
      <TopBar 
        baseCurrency="NGN"
        onCurrencyToggle={() => {}}
        onBudgetClick={() => setActiveScreen("budget")}
        onAnalyticsClick={() => setActiveScreen("analytics")}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 overflow-y-auto pb-32">
        {activeScreen === "analytics" ? (
          <AnalyticsScreen />
        ) : activeScreen === "budget" ? (
          <BudgetScreen onBack={() => setActiveScreen("home")} />
        ) : activeScreen === "accounts" ? (
          <AccountsScreen onBack={() => setActiveScreen("home")} />
        ) : activeScreen === "commitments" ? (
          <CommitmentsScreen onBack={() => setActiveScreen("home")} />
        ) : activeScreen === "tax" ? (
          <TaxScreen onBack={() => setActiveScreen("home")} />
        ) : activeScreen === "needs-review" ? (
          <NeedsReviewScreen onBack={() => setActiveScreen("home")} onResolved={refreshData}/>
        ) : activeScreen === "ajo" ? (
          <AjoScreen onBack={() => setActiveScreen("home")} />
        ) : activeScreen === "bank-charge" ? (
          <BankChargeScreen onBack={() => setActiveScreen("home")} />
        ) : (
          // HOME DASHBOARD
          <div className="px-4 pt-4 flex flex-col gap-6">
            
            <GlassSurface tier="thick" radius={28} className="p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand)]/10 blur-[50px] rounded-full pointer-events-none" />
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[13px] text-white/60 mb-1">Total Net Worth</p>
                    <div className="text-[40px] font-bold text-white tracking-tight">
                      <NumberRoll value={netWorthNGN} currency="₦" />
                    </div>
                  </div>
                  <button onClick={refreshData} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <RefreshCw size={16} className="text-white/80" />
                  </button>
               </div>
            </GlassSurface>

            <GlassSurface tier="thick" radius={28} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[15px] font-medium text-white mb-1">Pacing</p>
                  <p className="text-[13px] text-white/60">
                    {spentPercentage === 0 ? "No budget set yet." : spentPercentage < 50 ? "Well under pace. Strong cushion." : "On pace. Keep it steady."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[var(--brand)] flex items-center justify-center relative overflow-hidden">
                  <span className="text-[13px] font-semibold">{spentPercentage}%</span>
                </div>
                <div>
                  <p className="text-[17px] font-semibold text-white">
                    <NumberRoll value={remaining} currency="₦" /> remaining
                  </p>
                  <p className="text-[13px] text-white/60">
                    of <NumberRoll value={budgetLimitNGN} currency="₦" /> budget
                  </p>
                </div>
              </div>
            </GlassSurface>

            <div className="grid grid-cols-2 gap-3">
              <HoverCard onClick={() => setActiveScreen("commitments")}>
                <div className="w-10 h-10 rounded-full bg-[var(--info)]/20 flex items-center justify-center mb-3">
                  <CalendarDays size={20} className="text-[var(--info)]" />
                </div>
                <span className="text-[15px] font-medium text-white block mb-1">Commitments</span>
                <span className="text-[12px] text-white/50 text-left">Bills & sinking funds</span>
              </HoverCard>

              <HoverCard onClick={() => setActiveScreen("tax")}>
                <div className="w-10 h-10 rounded-full bg-[#AF52DE]/20 flex items-center justify-center mb-3">
                  <FileText size={20} className="text-[#AF52DE]" />
                </div>
                <span className="text-[15px] font-medium text-white block mb-1">Tax Estimator</span>
                <span className="text-[12px] text-white/50 text-left">PIT & LIRS export</span>
              </HoverCard>

              <HoverCard onClick={() => setActiveScreen("ajo")}>
                <div className="w-10 h-10 rounded-full bg-[#FF9500]/20 flex items-center justify-center mb-3">
                  <Users size={20} className="text-[#FF9500]" />
                </div>
                <span className="text-[15px] font-medium text-white block mb-1">Ajo Tracker</span>
                <span className="text-[12px] text-white/50 text-left">Thrift & cooperative groups</span>
              </HoverCard>

              <HoverCard onClick={() => setActiveScreen("bank-charge")}>
                <div className="w-10 h-10 rounded-full bg-[#FF453A]/20 flex items-center justify-center mb-3">
                  <ShieldAlert size={20} className="text-[#FF453A]" />
                </div>
                <span className="text-[15px] font-medium text-white block mb-1">Bank Charges</span>
                <span className="text-[12px] text-white/50 text-left">Fee auditor</span>
              </HoverCard>
            </div>

            {metrics.uncategorized_count > 0 && (
              <motion.button 
                whileHover={{ y: -3 }}
                onClick={() => setActiveScreen("needs-review")} 
                className="w-full flex items-center justify-between p-4 bg-[var(--warn)]/10 border border-[var(--warn)]/20 rounded-2xl group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--warn)]/20 flex items-center justify-center">
                    <span className="text-[var(--warn)] font-semibold text-[14px]">{metrics.uncategorized_count}</span>
                  </div>
                  <span className="text-[15px] font-medium text-white">Transactions need review</span>
                </div>
                <ChevronRight size={20} className="text-[var(--warn)] group-hover:translate-x-1 transition-transform" />
              </motion.button>
            )}

            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[17px] font-semibold text-white">Recent Transactions</h3>
                <button className="text-[13px] text-[var(--brand)] font-medium">See all</button>
              </div>
              
              <GlassSurface tier="thin" radius={24} className="overflow-hidden">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <ArrowLeftRight size={20} className="text-white/40" />
                    </div>
                    <p className="text-[15px] text-white/60">No transactions yet.</p>
                    <button 
                      onClick={() => setIsImportOpen(true)}
                      className="text-[13px] font-medium text-[var(--brand)] bg-[var(--brand)]/10 px-4 py-2 rounded-full"
                    >
                      Import your first statement
                    </button>
                  </div>
                ) : (
                  transactions
                    .filter((txn: any) => txn.category_name !== "Split Parent")
                    .slice(0, 5)
                    .map((txn: any) => (
                      <TransactionRow 
                        key={txn.id}
                        id={txn.id}
                        merchant={txn.description_clean || txn.description_raw}
                        categoryIcon={
                          txn.category_name === "Groceries" ? "ShoppingBag" : 
                          txn.category_name === "Transport" ? "Car" : 
                          txn.category_name === "Income" ? "Briefcase" : 
                          txn.category_name === "Subscriptions" ? "Tv" :
                          txn.category_name === "Fuel" ? "Fuel" : "CreditCard"
                        }
                        categoryName={txn.category_name || "Uncategorized"}
                        accountName={txn.account?.name || "Account"}
                        amount={txn.amount_minor / 100}
                        isIncome={txn.direction === "credit"}
                        onRowClick={() => setSelectedTxn(txn)}
                      />
                    ))
                )}
              </GlassSurface>
            </div>
          </div>
        )}
      </div>

      <FloatingTabBar 
        activeTab={activeScreen === "budget" ? "home" : activeScreen}
        onTabChange={handleTabChange}
        onAddClick={() => setIsImportOpen(true)} 
        onAdvisorClick={() => setIsAdvisorOpen(true)}
      />
      
      <ImportSheet isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImportSuccess={refreshData}/>
      <AIDrawer isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} />
      
      <SettingsSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={session.user} baseCurrency="NGN" onCurrencyChange={() => {}} />
      
      <TransactionDetailSheet 
        key={selectedTxn?.id || "empty"}
        isOpen={!!selectedTxn} 
        onClose={() => setSelectedTxn(null)} 
        onSaved={refreshData}
        transaction={
          selectedTxn ? {
            id: selectedTxn.id,
            merchant: selectedTxn.description_clean || selectedTxn.description_raw,
            amount: selectedTxn.amount_minor / 100,
            categoryName: selectedTxn.category_name || "Uncategorized",
            categoryIcon: "CreditCard", // fallback
            accountName: selectedTxn.account?.name || "Account",
            date: new Date(selectedTxn.date).toLocaleDateString(),
            accountId: selectedTxn.account_id,
            direction: selectedTxn.direction,
            descriptionRaw: selectedTxn.description_raw,
          } : null
        }
      />
    </main>
  );
}