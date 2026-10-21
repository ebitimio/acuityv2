"use client";

import { useEffect, useState } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Plus, Trash2, RefreshCw, ArrowRightLeft, Landmark, Wallet, TrendingUp, Scale } from "lucide-react";
import {
  getAccounts, createAccount, deleteAccount, getAssets, addAsset, deleteAsset,
} from "@/lib/supabase/database";
import { Modal } from "@/components/ui/modal";
import { Field, SelectField, Button } from "@/components/ui/form";
import { CurrencyField } from "@/components/ui/currency-field";
import { BalanceCheckinSheet } from "@/components/ui/balance-checkin-sheet";
import { TransferSheet } from "@/components/ui/transfer-sheet";
import { useCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/toast";
import type { Account, Asset } from "@/lib/types";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function AccountsScreen({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [modal, setModal] = useState<"account" | "asset" | null>(null);
  const [checkinAccount, setCheckinAccount] = useState<Account | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState("checking");
  const [balance, setBalance] = useState(0);
  const [balanceAsOf, setBalanceAsOf] = useState(todayISO());
  const [assetType, setAssetType] = useState<"asset" | "liability">("asset");

  const { fmt } = useCurrency();
  const toast = useToast();

  const load = async () => {
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

  const addA = async () => {
    if (!name || !balance) { toast("Name and value required", "err"); return; }
    try {
      await addAsset(name, assetType, balance);
      toast("Added");
      setModal(null);
      setName(""); setBalance(0);
      load();
    } catch (e: any) { toast(e.message ?? "Could not add", "err"); }
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

  const totalLiquid = accounts.reduce((s, a) => s + (a.current_minor ?? a.balance_minor), 0) / 100;
  const totalAssets = assets.filter((a) => a.type === "asset").reduce((s, a) => s + a.value_minor, 0) / 100;
  const totalLiab = -(assets.filter((a) => a.type === "liability").reduce((s, a) => s + a.value_minor, 0) / 100);
  const netWorth = totalLiquid + totalAssets + totalLiab;

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
        
        {/* Hero Net Worth Card */}
        <div className="p-6 rounded-[24px] bg-[#1c1c1e] border border-white/5 shadow-xl text-center">
          <p className="text-[13px] text-white/60 mb-1">Total Net Worth</p>
          <p className="text-[36px] font-bold tabular text-white">{fmt(netWorth)}</p>
        </div>

        {/* Accounts List */}
        <div>
          <h3 className="text-[15px] font-semibold mb-3 px-1 text-[var(--text-1)]">Your Accounts</h3>
          <div className="space-y-3">
            {accounts.map((a) => {
              const bal = (a.current_minor ?? a.balance_minor) / 100;
              return (
                <div key={a.id} className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                      <Landmark size={18} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[var(--text-1)]">{a.name}</p>
                      <p className="text-[11px] text-[var(--text-3)]">{a.institution} · {a.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-bold tabular text-[var(--text-1)]">{fmt(bal)}</p>
                    <div className="flex gap-2 justify-end mt-1">
                      <button onClick={() => setCheckinAccount(a)} className="text-[var(--brand)]"><RefreshCw size={12} /></button>
                      <button onClick={() => delAcc(a)} className="text-[var(--danger)]"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
            {accounts.length === 0 && (
              <p className="text-center py-6 text-[14px] text-[var(--text-3)]">No accounts yet.</p>
            )}
          </div>
        </div>

        {/* Assets & Liabilities */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-[var(--text-1)]">Offline Assets & Liabilities</h3>
            <button onClick={() => setModal("asset")} className="text-[13px] text-[var(--brand)] font-medium">+ Add</button>
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
                <div>
                  <p className="text-[14px] font-medium text-[var(--text-1)]">{a.name}</p>
                  <p className="text-[11px] capitalize text-[var(--text-3)]">{a.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-semibold tabular text-[var(--text-1)]">{fmt(a.value_minor / 100)}</span>
                  <button onClick={() => delA(a)} className="text-[var(--danger)]"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <p className="text-center py-6 text-[14px] text-[var(--text-3)]">No offline assets yet.</p>
            )}
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

      <Modal open={modal === "asset"} onClose={() => setModal(null)} title="Add Asset / Liability">
        <div className="space-y-3">
          <SelectField label="Type" value={assetType} onChange={(e) => setAssetType(e.target.value as "asset" | "liability")}>
            <option value="asset">Asset (adds to net)</option>
            <option value="liability">Liability (subtracts from net)</option>
          </SelectField>
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Land in Lekki" />
          <CurrencyField label="Value" value={balance} onChange={setBalance} />
          <Button onClick={addA}>Save</Button>
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