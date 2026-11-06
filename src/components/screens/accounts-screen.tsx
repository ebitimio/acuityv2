"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Plus, Trash2, ArrowRightLeft, TrendingUp, Scale, Coins, Pencil, Link as LinkIcon, Loader2, Crown } from "lucide-react";
import {
  getAccounts, createAccount, deleteAccount, getAssets, addAsset, updateAsset, deleteAsset, clearDataCache,
} from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/modal";
import { Field, SelectField, Button } from "@/components/ui/form";
import { CurrencyField } from "@/components/ui/currency-field";
import { DatePickerField } from "@/components/ui/date-picker";
import { BalanceCheckinSheet } from "@/components/ui/balance-checkin-sheet";
import { TransferSheet } from "@/components/ui/transfer-sheet";
import { CryptoSheet } from "@/components/ui/crypto-sheet";
import { StackedAccountCard } from "@/components/ui/stacked-account-card";
import { ConnectBankScreen } from "@/components/screens/connect-bank-screen";
import { useCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/lib/workspace";
import type { Account, Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

import Connect from '@mono.co/connect.js';

const todayISO = () => new Date().toISOString().slice(0, 10);

export function AccountsScreen({ 
  onBack, 
  userName = "there",
  autoOpenAddAccount,
  onAutoOpenHandled,
  onConnectIntroChange
}: { 
  onBack: () => void, 
  userName?: string,
  autoOpenAddAccount?: boolean,
  onAutoOpenHandled?: () => void,
  onConnectIntroChange?: (isOpen: boolean) => void
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [modal, setModal] = useState<"account" | "asset" | "premium_locked" | "name_linked_account" | null>(null);
  const [showConnectIntro, setShowConnectIntro] = useState(false);
  const [userTier, setUserTier] = useState<"premium" | "basic">("basic");
  
  const setConnectIntro = (open: boolean) => {
    setShowConnectIntro(open);
    onConnectIntroChange?.(open);
  };

  useEffect(() => {
    async function loadUserTier() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("tier").eq("id", user.id).single();
          if (profile?.tier) setUserTier(profile.tier as "premium" | "basic");
        }
      } catch {}
    }
    loadUserTier();
  }, []);
  
  const [linkedCode, setLinkedCode] = useState<string | null>(null);
  const [linkedAccountName, setLinkedAccountName] = useState("");
  const [linkedAccountType, setLinkedAccountType] = useState("checking");

  const [checkinAccount, setCheckinAccount] = useState<Account | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCryptoOpen, setIsCryptoOpen] = useState(false);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSavingLink, setIsSavingLink] = useState(false);
  
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState("checking");
  const [balance, setBalance] = useState(0);
  const [balanceAsOf, setBalanceAsOf] = useState(todayISO());
  const [assetType, setAssetType] = useState<"asset" | "liability">("asset");

  const { fmt } = useCurrency();
  const toast = useToast();
  const { active: activeWs } = useWorkspace();
  const supabase = createClient();

  const publicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;

  useEffect(() => {
    if (autoOpenAddAccount) {
      setModal("account");
      onAutoOpenHandled?.();
    }
  }, [autoOpenAddAccount, onAutoOpenHandled]);

  const load = async () => {
    if (!activeWs?.id) return;
    clearDataCache();
    const [a, s] = await Promise.all([getAccounts(), getAssets()]);
    setAccounts(a);
    setAssets(s);
    if (checkinAccount) {
      const refreshed = a.find((x) => x.id === checkinAccount.id);
      if (refreshed) setCheckinAccount(refreshed);
    }
  };

  useEffect(() => { 
    setAccounts([]);
    setAssets([]);
    setExpandedCard(null);
    load(); 
  }, [activeWs?.id]);

  const handleConnectBank = () => {
    // Enabled for both premium and basic users
    setConnectIntro(true);
  };

  const handleLaunchMono = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!publicKey) {
      toast("Mono API key missing", "err");
      return;
    }

    setIsConnecting(true);
    
    try {
      const connect = new Connect({
        key: publicKey,
        scope: "auth",
        data: {
          customer: {
            name: userName,
            email: user.email,
          }
        },
        onSuccess: (data: any) => {
          setLinkedCode(data.code);
          setLinkedAccountName(""); 
          setLinkedAccountType("checking");
          setConnectIntro(false);
          
          // FIX: Delay the modal opening so the Mono widget fully closes first
          setTimeout(() => {
            setIsConnecting(false);
            setModal("name_linked_account");
          }, 500);
        },
        onClose: () => {
          setIsConnecting(false);
        },
      });
      
      connect.setup();
      connect.open();
      
    } catch (err: any) {
      setIsConnecting(false);
      toast(err.message || "Failed to launch Mono", "err");
    }
  };

  const saveLinkedAccount = async () => {
    if (!linkedCode || !linkedAccountName.trim()) {
      toast("Please enter a name for the account", "err");
      return;
    }
    if (!activeWs?.id) {
      toast("No active workspace found", "err");
      return;
    }

    setIsSavingLink(true);
    try {
      const res = await fetch("/api/mono/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: linkedCode, 
          customName: linkedAccountName,
          workspaceId: activeWs.id,
          accountType: linkedAccountType 
        }),
      });
      const resData = await res.json();
      
      if (resData.error) throw new Error(resData.error);
      
      toast("Account linked successfully!");
      setModal(null);
      setLinkedCode(null);
      setLinkedAccountName("");
      load(); 
    } catch (e: any) {
      toast(e.message || "Failed to link account", "err");
    } finally {
      setIsSavingLink(false);
    }
  };

  const addAcc = async () => {
    if (!name || !institution || !balance) {
      toast("Name, bank, and current balance are required", "err");
      return;
    }
    try {
      await createAccount(name, institution, type, balance, balanceAsOf);
      toast("Account created");
      setModal(null);
      setName(""); setInstitution(""); setBalance(0); setBalanceAsOf(todayISO());
      load();
    } catch (e: any) { toast(e.message ?? "Could not create", "err"); }
  };

  const saveAsset = async () => {
    if (!name || !balance) { toast("Name and value required", "err"); return; }
    try {
      if (editingAssetId) {
        await updateAsset(editingAssetId, name, assetType, balance);
        toast("Asset updated");
      } else {
        await addAsset(name, assetType, balance);
        toast("Asset added");
      }
      setModal(null);
      setName(""); setBalance(0); setEditingAssetId(null);
      load();
    } catch (e: any) { toast(e.message ?? "Could not save", "err"); }
  };

  const delAcc = async (a: Account) => {
    if (!confirm(`Delete ${a.name}? This will delete all its transactions.`)) return;
    await deleteAccount(a.id);
    load();
  };

  const delA = async (a: Asset) => {
    if (!confirm(`Delete ${a.name}?`)) return;
    await deleteAsset(a.id);
    load();
  };

  const openEditAsset = (a: Asset) => {
    setEditingAssetId(a.id);
    setName(a.name);
    setAssetType(a.type);
    setBalance(a.value_minor / 100);
    setModal("asset");
  };

  const totalLiquid = accounts.reduce((s, a) => s + (a.current_minor ?? a.balance_minor), 0) / 100;
  const totalAssets = assets.filter((a) => a.type === "asset").reduce((s, a) => s + a.value_minor, 0) / 100;
  const totalLiab = -(assets.filter((a) => a.type === "liability").reduce((s, a) => s + a.value_minor, 0) / 100);
  const netWorth = totalLiquid + totalAssets + totalLiab;

  const isAnyExpanded = expandedCard !== null;

  if (showConnectIntro) {
    const screen = (
      <ConnectBankScreen
        onBack={() => setConnectIntro(false)}
        onProceed={handleLaunchMono}
        isConnecting={isConnecting}
        userTier={userTier}
      />
    );
    return typeof document !== "undefined" ? createPortal(screen, document.body) : screen;
  }

  return (
    <div className="min-h-[100dvh] pb-32">
      <ScreenHeader
        title="Accounts"
        onBack={onBack}
        right={
          <div className="flex gap-2">
            <IconButton label="Transfer" onClick={() => setIsTransferOpen(true)}>
              <ArrowRightLeft size={16} />
            </IconButton>
            <button 
              onClick={handleConnectBank}
              disabled={isConnecting}
              className="press flex h-9 px-3 items-center justify-center rounded-full text-[12px] font-bold gap-1 disabled:opacity-50 text-black"
              style={{ background: "#DE3121", color: "#000000" }}
            >
              {isConnecting ? <Loader2 size={14} className="animate-spin text-black" /> : <LinkIcon size={14} className="text-black" />}
              <span className="text-black">{isConnecting ? "Connecting..." : "Connect"}</span>
            </button>
            <button 
              data-setup-btn="add-account" 
              onClick={() => setModal("account")} 
              className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-2)]"
              style={{ background: "var(--fill-1)" }}
            >
              <Plus size={18} />
            </button>
          </div>
        }
      />

      <div className="px-4 pt-6 space-y-6">
        
        <div className="p-6 rounded-[24px] shadow-xl text-center" style={{ background: "var(--brand)" }}>
          <p className="text-[13px] text-black/70 mb-1 font-medium">Total Net</p>
          <p className="text-[36px] font-bold tabular text-black">{fmt(netWorth)}</p>
        </div>

        <div>
          <h3 className="text-[15px] font-semibold mb-3 px-1 text-[var(--text-1)]">Your Accounts</h3>
          <div className="relative flex flex-col">
            {accounts.map((a, index) => {
              const bal = (a.current_minor ?? a.balance_minor) / 100;
              const isExpanded = expandedCard === a.id;
              
              return (
                <div 
                  key={a.id} 
                  className={cn(
                    "w-full px-2 transition-all duration-300",
                    index > 0 && !isAnyExpanded ? "-mt-10" : "mt-3"
                  )}
                  style={{ zIndex: isExpanded ? 50 : 10 - index }}
                >
                  <StackedAccountCard 
                    account={a} 
                    balance={bal} 
                    fmt={fmt} 
                    isExpanded={isExpanded || !isAnyExpanded}
                    onClick={() => setExpandedCard(isExpanded ? null : a.id)}
                    onCheckBalance={() => setCheckinAccount(a)}
                    onDelete={() => delAcc(a)}
                    cardholderName={userName}
                  />
                </div>
              );
            })}
            {accounts.length === 0 && (
              <p className="text-center py-6 text-[14px] text-[var(--text-3)]">No accounts yet. Add one above.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-[var(--text-1)]">Offline Assets & Liabilities</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 rounded-2xl bg-[#1c1c1e] border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-[var(--gain)]" />
                <p className="text-[11px] text-white/60">Assets</p>
              </div>
              <p className="text-[16px] font-bold tabular text-white">{fmt(totalAssets)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1c1c1e] border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Scale size={14} className="text-[var(--danger)]" />
                <p className="text-[11px] text-white/60">Liabilities</p>
              </div>
              <p className="text-[16px] font-bold tabular text-[var(--danger)]">{fmt(totalLiab)}</p>
            </div>
          </div>

          <div className="group-list">
            {assets.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  {a.name.toLowerCase() === "bitcoin" || a.name.toLowerCase() === "ethereum" ? (
                    <Coins size={16} className="text-[var(--brand)]" />
                  ) : null}
                  <div>
                    <p className="text-[14px] font-medium text-[var(--text-1)]">{a.name}</p>
                    <p className="text-[11px] capitalize text-[var(--text-3)]">{a.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-semibold tabular text-[var(--text-1)]">{fmt(a.value_minor / 100)}</span>
                  <button onClick={() => openEditAsset(a)} className="text-[var(--brand)]"><Pencil size={14} /></button>
                  <button onClick={() => delA(a)} className="text-[var(--danger)]"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <p className="text-center py-6 text-[14px] text-[var(--text-3)]">No offline assets yet.</p>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <Button variant="ghost" onClick={() => { setEditingAssetId(null); setName(""); setBalance(0); setAssetType("asset"); setModal("asset"); }} className="flex-1 h-11 text-[13px]">
              + Add Asset / Liability
            </Button>
            <Button variant="ghost" onClick={() => setIsCryptoOpen(true)} className="flex-1 h-11 text-[13px] border-[var(--brand)]/20 text-[var(--brand)]">
              <Coins size={14} className="mr-1" /> Add Crypto
            </Button>
          </div>
        </div>
      </div>

      <TransferSheet
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={() => { load(); }}
        accounts={accounts}
      />

      <CryptoSheet
        isOpen={isCryptoOpen}
        onClose={() => setIsCryptoOpen(false)}
        onSuccess={() => { load(); }}
      />

      <Modal open={modal === "account"} onClose={() => setModal(null)} title="Add Account">
        <div className="space-y-3">
          <div className="rounded-[20px] border border-white/10 bg-[#151517] p-3.5 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-black border border-white/10 shadow-inner">
                <div className="flex items-baseline">
                  <span className="text-[15px] font-black tracking-tight text-white">A</span>
                  <span className="text-[15px] font-black tracking-tight text-[var(--brand)]">.</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-white tracking-tight truncate">Connect Bank Automatically</p>
                <p className="text-[11.5px] text-white/50 truncate">Live balance sync via Mono (Premium)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setModal(null);
                handleConnectBank();
              }}
              className="press px-3.5 py-1.5 shrink-0 rounded-full text-[12px] font-bold tracking-tight shadow-sm hover:opacity-95 transition-opacity text-black"
              style={{ backgroundColor: "#DE3121", color: "#000000" }}
            >
              Connect
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[var(--line)]"></div>
            <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-[var(--text-3)] font-medium">Or add manually</span>
            <div className="flex-grow border-t border-[var(--line)]"></div>
          </div>

          <Field label="Account name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Checking" />
          <Field label="Bank / institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. GTBank" />
          <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="checking">Current</option>
            <option value="savings">Savings</option>
            <option value="wallet">Wallet</option>
            <option value="dom">Domiciliary</option>
          </SelectField>
          <CurrencyField label="Current balance" value={balance} onChange={setBalance} />
          <DatePickerField label="As of date" value={balanceAsOf} onChange={setBalanceAsOf} />
          <Button onClick={addAcc} disabled={!name || !institution || !balance}>Create account</Button>
        </div>
      </Modal>

      <Modal 
        open={modal === "asset"} 
        onClose={() => { setModal(null); setEditingAssetId(null); setName(""); setBalance(0); }} 
        title={editingAssetId ? "Edit Asset / Liability" : "Add Asset / Liability"}
      >
        <div className="space-y-3">
          <SelectField label="Type" value={assetType} onChange={(e) => setAssetType(e.target.value as "asset" | "liability")}>
            <option value="asset">Asset (adds to net)</option>
            <option value="liability">Liability (subtracts from net)</option>
          </SelectField>
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Land in Lekki" />
          <CurrencyField label="Value" value={balance} onChange={setBalance} />
          <Button onClick={saveAsset}>{editingAssetId ? "Update Asset" : "Save"}</Button>
        </div>
      </Modal>

      <BalanceCheckinSheet
        isOpen={!!checkinAccount}
        onClose={() => setCheckinAccount(null)}
        onSaved={() => { load(); }}
        account={checkinAccount ? { id: checkinAccount.id, name: checkinAccount.name, current_minor: checkinAccount.current_minor ?? checkinAccount.balance_minor } : null}
      />

      {/* --- PREMIUM LOCKED MODAL --- */}
      <Modal open={modal === "premium_locked"} onClose={() => setModal(null)} title="Premium Feature">
        <div className="flex flex-col items-center py-6 space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)]/10 relative">
            <Crown size={32} className="text-[var(--brand)]" />
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--brand)] text-[9px] font-black text-black">A.</span>
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[var(--text-1)]">Upgrade to Acuity Premium</h3>
            <p className="text-[13px] text-[var(--text-2)] mt-2 max-w-[280px] mx-auto leading-relaxed">
              Connect your bank to automatically track your spending, categorize transactions with AI, and see your real-time balance.
            </p>
          </div>
          <div className="w-full pt-4 space-y-2">
            <Button 
              onClick={() => {
                setModal(null);
                toast("Payment gateway coming soon!");
              }} 
              className="w-full h-12 text-[15px] font-bold"
            >
              Upgrade for ₦2,500 / month
            </Button>
            <Button variant="ghost" onClick={() => setModal(null)} className="w-full">
              Maybe later
            </Button>
          </div>
        </div>
      </Modal>

      {/* --- NAME LINKED ACCOUNT MODAL --- */}
      <Modal open={modal === "name_linked_account"} onClose={() => setModal(null)} title="Name Your Account">
        <div className="space-y-4 pb-4">
          <p className="text-[13px] text-[var(--text-2)] mb-2">
            Bank linked successfully! What would you like to call this account?
          </p>
          <Field 
            label="Account Name" 
            value={linkedAccountName} 
            onChange={(e) => setLinkedAccountName(e.target.value)} 
            placeholder="e.g. Main GTBank" 
            autoFocus
          />
          
          <SelectField 
            label="Account Type" 
            value={linkedAccountType} 
            onChange={(e) => setLinkedAccountType(e.target.value)}
          >
            <option value="checking">Current</option>
            <option value="savings">Savings</option>
            <option value="wallet">Wallet</option>
            <option value="dom">Domiciliary</option>
          </SelectField>

          <Button onClick={saveLinkedAccount} loading={isSavingLink} disabled={!linkedAccountName.trim()} className="w-full mt-2">
            Save Account
          </Button>
        </div>
      </Modal>
    </div>
  );
}