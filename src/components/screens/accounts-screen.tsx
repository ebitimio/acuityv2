"use client";

import { useEffect, useState } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Plus, Trash2, ArrowRightLeft, TrendingUp, Scale, Coins, Pencil } from "lucide-react";
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
import type { Account, Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function AccountsScreen({ onBack, userName = "there" }: { onBack: () => void, userName?: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [modal, setModal] = useState<"account" | "asset" | null>(null);
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

  const { fmt } = useCurrency();
  const toast = useToast();

  const load = async () => {
    clearDataCache();
    const [a, s] = await Promise.all([getAccounts(), getAssets()]);
    setAccounts(a);
    setAssets(s);
    if (checkinAccount) {
      const refreshed = a.find((x) => x.id === checkinAccount.id);
      if (refreshed) setCheckinAccount(refreshed);
    }
  };
  useEffect(() => { load(); }, []);

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
            <IconButton label="Add" onClick={() => setModal("account")}>
              <Plus size={18} />
            </IconButton>
          </div>
        }
      />

      <div className="px-4 pt-6 space-y-6">
        
        {/* Total Net Worth Hero */}
        <div className="p-6 rounded-[24px] bg-[#DE3121] shadow-xl text-center">
          <p className="text-[13px] text-black/70 mb-1 font-medium">Total Net Worth</p>
          <p className="text-[36px] font-bold tabular text-black">{fmt(netWorth)}</p>
        </div>

        {/* Stacked ATM Cards */}
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
                    cardholderName={userName} // <-- PASS THE NAME HERE
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Assets & Liabilities */}
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
            <Button variant="ghost" onClick={() => setIsCryptoOpen(true)} className="flex-1 h-11 text-[13px] border-[#DE3121]/20 text-[#DE3121]">
              <Coins size={14} className="mr-1" /> Add Crypto
            </Button>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <TransferSheet
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={load}
        accounts={accounts}
      />

      <CryptoSheet
        isOpen={isCryptoOpen}
        onClose={() => setIsCryptoOpen(false)}
        onSuccess={load}
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
        onSaved={load}
        account={checkinAccount ? { id: checkinAccount.id, name: checkinAccount.name, current_minor: checkinAccount.current_minor ?? checkinAccount.balance_minor } : null}
      />
    </div>
  );
}