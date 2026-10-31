"use client";

import { useEffect, useState } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Plus, Trash2, ArrowRightLeft, TrendingUp, Scale, Coins, Pencil, Link as LinkIcon, Loader2 } from "lucide-react";
import {
  getAccounts, createAccount, deleteAccount, getAssets, addAsset, updateAsset, deleteAsset, clearDataCache,
} from "@/lib/supabase/database";
import { Modal } from "@/components/ui/modal";
import { Field, SelectField, Button } from "@/components/ui/form";
import { CurrencyField } from "@/components/ui/currency-field";
import { BalanceCheckinSheet } from "@/components/ui/balance-checkin-sheet";
import { TransferSheet } from "@/components/ui/transfer-sheet";
import { CryptoSheet } from "@/components/ui/crypto-sheet";
import { StackedAccountCard } from "@/components/ui/stacked-account-card";
import { useCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/lib/workspace";
import type { Account, Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function AccountsScreen({ 
  onBack, 
  userName = "there",
  autoOpenAddAccount,
  onAutoOpenHandled
}: { 
  onBack: () => void, 
  userName?: string,
  autoOpenAddAccount?: boolean,
  onAutoOpenHandled?: () => void
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [modal, setModal] = useState<"account" | "asset" | "connect" | null>(null);
  const [checkinAccount, setCheckinAccount] = useState<Account | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCryptoOpen, setIsCryptoOpen] = useState(false);
  
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState("checking");
  const [balance, setBalance] = useState(0);
  const [balanceAsOf, setBalanceAsOf] = useState(todayISO());
  const [assetType, setAssetType] = useState<"asset" | "liability">("asset");

  // --- NEW: Mono API State ---
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loginForm, setLoginForm] = useState<any>({});
  const [otp, setOtp] = useState("");
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  // ---------------------------

  const { fmt } = useCurrency();
  const toast = useToast();
  const { active: activeWs } = useWorkspace();

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

  // --- NEW: Mono Flow Handlers ---
  const handleOpenConnect = () => {
    setModal("connect");
    setSelectedInstitution(null);
    setSession(null);
    setLoginForm({});
    setOtp("");
    setRequiresOtp(false);
    
    // Fetch institutions
    fetch("/api/mono/institutions")
      .then(res => res.json())
      .then(data => setInstitutions(data.data || []))
      .catch(() => toast("Failed to load banks", "err"));
  };

  const handleSelectBank = async (inst: any) => {
    setSelectedInstitution(inst);
    setIsConnecting(true);
    try {
      const res = await fetch("/api/mono/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionId: inst._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start session");
      setSession(data);
    } catch (e: any) {
      toast(e.message, "err");
      setSelectedInstitution(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogin = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/mono/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.data.session_id, credentials: loginForm }),
      });
      const data = await res.json();
      
      if (data.data?.responseCode === 102) {
        setRequiresOtp(true); 
      } else if (data.data?.responseCode === 99) {
        await exchangeCode(data.data.code);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (e: any) {
      toast(e.message, "err");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCommit = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/mono/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId: session.data.session_id, 
          userInput: { otp } 
        }),
      });
      const data = await res.json();
      if (data.data?.code) {
        await exchangeCode(data.data.code);
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (e: any) {
      toast(e.message, "err");
    } finally {
      setIsConnecting(false);
    }
  };

  const exchangeCode = async (code: string) => {
    const res = await fetch("/api/mono/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error("Failed to sync account");
    
    toast("Bank linked successfully!");
    setModal(null);
    load();
  };
  // --------------------------------

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
              onClick={handleOpenConnect}
              className="press flex h-9 px-3 items-center justify-center rounded-full text-[12px] font-bold gap-1"
              style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
            >
              <LinkIcon size={14} /> Connect Bank
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

      {/* --- EXISTING MODALS --- */}
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
          <Field label="Account name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Checking" />
          <Field label="Bank / institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. GTBank" />
          <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="checking">Current</option>
            <option value="savings">Savings</option>
            <option value="wallet">Wallet</option>
            <option value="dom">Domiciliary</option>
          </SelectField>
          <CurrencyField label="Current balance" value={balance} onChange={setBalance} />
          <Field label="As of date" type="date" value={balanceAsOf} onChange={(e) => setBalanceAsOf(e.target.value)} />
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

      {/* --- NEW: MONO API FLOW MODAL --- */}
      <Modal open={modal === "connect"} onClose={() => setModal(null)} title="Connect Bank">
        <div className="space-y-4 pb-4">
          
          {!selectedInstitution ? (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-[13px] text-[var(--text-2)] mb-2">Select your bank to link:</p>
              {institutions.length === 0 && <p className="text-center text-[13px] py-4">Loading banks...</p>}
              {institutions.map((inst: any) => (
                <button
                  key={inst._id}
                  onClick={() => handleSelectBank(inst)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  {/* Assuming inst.logo is a URL, if not we just use initial */}
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center p-1">
                    <img src={inst.logo || `https://ui-avatars.com/api/?name=${inst.name}`} alt={inst.name} className="h-full object-contain" />
                  </div>
                  <span className="font-semibold text-[14px] text-[var(--text-1)]">{inst.name}</span>
                </button>
              ))}
            </div>
          ) : requiresOtp ? (
            <div className="space-y-4">
              <p className="text-[13px] text-[var(--text-2)]">Enter the OTP sent to your phone.</p>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full p-3 border border-[var(--line-strong)] rounded-xl bg-[var(--surface-1)] text-[var(--text-1)]"
              />
              <Button onClick={handleCommit} loading={isConnecting} className="w-full">Submit OTP</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] text-[var(--text-2)]">Log in to {selectedInstitution.name}</p>
              {/* Render dynamic fields from Mono */}
              {session?.data?.ui?.form?.map((field: any) => (
                <Field
                  key={field.name}
                  label={field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  type={field.type === "password" ? "password" : "text"}
                  placeholder={field.hint || `Enter your ${field.name}`}
                  onChange={(e: any) => setLoginForm({ ...loginForm, [field.name]: e.target.value })}
                />
              ))}
              <Button onClick={handleLogin} loading={isConnecting} className="w-full">Login</Button>
              <Button variant="ghost" onClick={() => setSelectedInstitution(null)} className="w-full">Back to Banks</Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}