"use client";

import { useEffect, useState } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Plus, Trash2 } from "lucide-react";
import {
  getAccounts, createAccount, deleteAccount, getAssets, addAsset, deleteAsset,
} from "@/lib/supabase/database";
import { AccountCard } from "@/components/ui/account-card";
import { Modal } from "@/components/ui/modal";
import { Field, SelectField, Button } from "@/components/ui/form";
import { CurrencyField } from "@/components/ui/currency-field";
import { useCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/toast";
import type { Account, Asset } from "@/lib/types";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function AccountsScreen({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [modal, setModal] = useState<"account" | "asset" | null>(null);

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
    } catch (e: any) {
      toast(e.message ?? "Could not create", "err");
    }
  };

  const addA = async () => {
    if (!name || !balance) {
      toast("Name and value required", "err");
      return;
    }
    try {
      await addAsset(name, assetType, balance);
      toast("Added");
      setModal(null);
      setName(""); setBalance(0);
      load();
    } catch (e: any) {
      toast(e.message ?? "Could not add", "err");
    }
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

  const total = accounts.reduce((s, a) => s + (a.current_minor ?? a.balance_minor), 0) / 100;
  const totalAssets = assets.filter((a) => a.type === "asset").reduce((s, a) => s + a.value_minor, 0) / 100;
  const totalLiab = assets.filter((a) => a.type === "liability").reduce((s, a) => s + a.value_minor, 0) / 100;

  return (
    <div className="min-h-[100dvh] bg-black pb-32">
      <ScreenHeader
        title="Accounts"
        onBack={onBack}
        right={<IconButton label="Add" onClick={() => setModal("account")}><Plus size={18} /></IconButton>}
      />

      <div className="px-4 pt-6 space-y-6">
        <div className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-6 text-center">
          <p className="text-[13px] text-[var(--text-2)] mb-1">Liquid assets</p>
          <p className="text-[32px] font-bold tabular">{fmt(total)}</p>
        </div>

        <div>
          <h3 className="text-[15px] font-semibold mb-3 px-1">Accounts</h3>
          <div className="group-list">
            {accounts.map((a) => (
              <div key={a.id} className="relative">
                <AccountCard account={a} onClick={() => {}} />
                <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-[var(--text-3)]">
                  <span>Checked {a.balance_as_of}</span>
                  <button onClick={() => delAcc(a)} className="ml-2 text-[var(--danger)] p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {accounts.length === 0 && (
              <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)]">No accounts. Tap + to add one.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold">Offline assets & liabilities</h3>
            <button onClick={() => setModal("asset")} className="text-[13px] text-[var(--brand)]">+ Add</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-4">
              <p className="text-[11px] text-[var(--text-3)] mb-1">Assets</p>
              <p className="text-[16px] font-bold tabular">{fmt(totalAssets)}</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-4">
              <p className="text-[11px] text-[var(--text-3)] mb-1">Liabilities</p>
              <p className="text-[16px] font-bold tabular text-[var(--danger)]">−{fmt(totalLiab)}</p>
            </div>
          </div>
          <div className="group-list mt-3">
            {assets.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium">{a.name}</p>
                  <p className="text-[11px] text-[var(--text-3)] capitalize">{a.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular font-semibold">{fmt(a.value_minor / 100)}</span>
                  <button onClick={() => delA(a)} className="text-[var(--danger)]"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <p className="px-4 py-6 text-center text-[14px] text-[var(--text-3)]">No offline assets yet.</p>
            )}
          </div>
        </div>
      </div>

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
          <CurrencyField
            label="How much is in it right now?"
            value={balance}
            onChange={setBalance}
          />
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
    </div>
  );
}