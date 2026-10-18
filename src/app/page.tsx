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
import { RefreshCw, ChevronRight, CalendarDays, FileText, Users, ShieldAlert, LayoutGrid, ArrowLeftRight, Eye, Bell, Plus, TrendingUp, TrendingDown } from "lucide-react";

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
  const totalIncomeNGN = metrics.total_income_minor / 100;
  const budgetLimitNGN = metrics.budget_limit_minor / 100;

  return (
    <main className="min-h-[100dvh] bg-black relative overflow-x-hidden flex flex-col">
      
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
        // --- NEW HOME DASHBOARD ---
        <div className="flex-1 overflow-y-auto pb-32">
          
          {/* VIBRANT HERO SECTION */}
          <div className="relative pt-14 pb-8 px-4 rounded-b-[40px] overflow-hidden" style={{ background: "linear-gradient(160deg, #FF6B00 0%, #FF9F0A 50%, #FFD60A 100%)" }}>
            
            {/* Top Bar Overlay */}
            <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center text-black/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <Users size={16} className="text-black/70" />
                </div>
                <span className="text-[13px] font-medium">Welcome, {session.user?.user_metadata?.full_name?.split(" ")[0] || "User"}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveScreen("analytics")} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <Eye size={16} className="text-black/70" />
                </button>
                <button onClick={() => setIsSettingsOpen(true)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <Bell size={16} className="text-black/70" />
                </button>
              </div>
            </div>

            {/* Net Worth */}
            <div className="mt-8 px-2 text-black">
              <p className="text-[13px] opacity-70 mb-1">Total Balance</p>
              <div className="text-[48px] font-bold tracking-tight flex items-start gap-1">
                <span className="text-[28px] mt-2">₦</span>
                <NumberRoll value={netWorthNGN} currency="" />
              </div>
              <p className="text-[13px] opacity-70 mt-1">Primary account •••• 4291</p>
            </div>

            {/* Quick Action Pills */}
            <div className="flex gap-2 mt-6 px-2">
              <button onClick={() => setActiveScreen("budget")} className="flex-1 py-2.5 bg-white/30 backdrop-blur-md rounded-xl text-[13px] font-semibold text-black flex items-center justify-center gap-1.5 hover:bg-white/40 transition-colors">
                <TrendingUp size={14} /> Monitoring
              </button>
              <button onClick={() => setIsImportOpen(true)} className="flex-1 py-2.5 bg-black/20 backdrop-blur-md rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 hover:bg-black/30 transition-colors">
                <ArrowLeftRight size={14} /> Add Fund
              </button>
            </div>
          </div>

          {/* HORIZONTAL CARDS */}
          <div className="px-4 -mt-6">
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
              <div className="snap-start shrink-0 w-[160px] h-[180px] rounded-3xl bg-gradient-to-b from-[#3a0d0d] to-[#1a0505] border border-white/10 p-4 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><LayoutGrid size={20} className="text-white/80" /></div>
                <div>
                  <p className="text-[15px] font-semibold text-white">Cards</p>
                  <p className="text-[11px] text-white/50 mt-1">All your cards in one place.</p>
                </div>
              </div>
              <div className="snap-start shrink-0 w-[160px] h-[180px] rounded-3xl bg-gradient-to-b from-[#0d1a3a] to-[#050a1a] border border-white/10 p-4 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><ShieldAlert size={20} className="text-white/80" /></div>
                <div>
                  <p className="text-[15px] font-semibold text-white">Savings</p>
                  <p className="text-[11px] text-white/50 mt-1">Money set aside for later.</p>
                </div>
              </div>
              <div className="snap-start shrink-0 w-[160px] h-[180px] rounded-3xl bg-gradient-to-b from-[#0d3a1a] to-[#051a0a] border border-white/10 p-4 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><TrendingDown size={20} className="text-white/80" /></div>
                <div>
                  <p className="text-[15px] font-semibold text-white">Investments</p>
                  <p className="text-[11px] text-white/50 mt-1">Grow your wealth.</p>
                </div>
              </div>
            </div>
          </div>

          {/* MONTHLY EXPENSES */}
          <div className="px-4 mt-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[17px] font-semibold text-white">Monthly expenses</h3>
              <span className="text-[13px] font-medium text-[var(--brand)]">↓ ₦{totalSpentNGN.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center bg-[#17191A] rounded-3xl p-5 border border-white/5">
              <div className="text-center">
                <p className="text-[11px] text-white/50 mb-1">Transactions</p>
                <p className="text-[15px] font-semibold text-white">₦{totalSpentNGN.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] text-white/50 mb-1">Income</p>
                <p className="text-[15px] font-semibold text-white">₦{totalIncomeNGN.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] text-white/50 mb-1">Other</p>
                <p className="text-[15px] font-semibold text-white">₦0</p>
              </div>
            </div>
          </div>

          {/* NEEDS REVIEW */}
          {metrics.uncategorized_count > 0 && (
            <div className="px-4 mt-4">
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
            </div>
          )}

          {/* RECENT TRANSACTIONS */}
          <div className="px-4 mt-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-[17px] font-semibold text-white">Recent</h3>
              <button className="text-[13px] text-[var(--brand)] font-medium">See all</button>
            </div>
            
            <GlassSurface tier="thin" radius={24} className="overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <ArrowLeftRight size={20} className="text-white/40" />
                  </div>
                  <p className="text-[15px] text-white/60">No transactions yet.</p>
                  <button onClick={() => setIsImportOpen(true)} className="text-[13px] font-medium text-[var(--brand)] bg-[var(--brand)]/10 px-4 py-2 rounded-full">
                    Import statement
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

      <FloatingTabBar 
        activeTab={activeScreen === "budget" ? "home" : activeScreen}
        onTabChange={handleTabChange}
        onAddClick={() => setIsImportOpen(true)} 
        onAdvisorClick={() => setIsAdvisorOpen(true)}
      />
      
      <ImportSheet isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImportSuccess={refreshData}/>
      <AIDrawer isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} />
      
      <SettingsSheet isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={session.user} />
      
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
            categoryIcon: "CreditCard",
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