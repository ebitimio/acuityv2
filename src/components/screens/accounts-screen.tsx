"use client";

import { useState, useEffect } from "react";
import { GlassSurface } from "@/components/ui/glass-surface";
import { NumberRoll } from "@/components/ui/number-roll";
import { AccountCard } from "@/components/ui/account-card";
import { ChevronLeft, Plus, X, Trash2, Landmark } from "lucide-react";
import { getAccounts, createAccount } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export function AccountsScreen({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  
  // Account Form State
  const [newName, setNewName] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [newBalance, setNewBalance] = useState("");

  // Asset Form State
  const [assetType, setAssetType] = useState<"asset" | "liability">("asset");
  const [assetName, setAssetName] = useState("");
  const [assetValue, setAssetValue] = useState("");

  const supabase = createClient();

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async () => {
    if (!newName || !newInstitution) return;
    try {
      await createAccount(newName, newInstitution, "checking", parseFloat(newBalance) || 0);
      await fetchAccounts();
      setIsAddAccountOpen(false);
      setNewName("");
      setNewInstitution("");
      setNewBalance("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure? This will delete all transactions in this account.")) return;
    await supabase.from("accounts").delete().eq("id", id);
    fetchAccounts();
  };

  const handleAddAsset = async () => {
    if (!assetName || !assetValue) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data: ws } = await supabase.from("workspaces").select("id").eq("owner_id", user?.id).single();
    if (ws) {
      await supabase.from("assets").insert({
        workspace_id: ws.id,
        name: assetName,
        type: assetType,
        value_minor: Math.round(parseFloat(assetValue) * 100),
      });
    }
    setIsAddAssetOpen(false);
    setAssetName("");
    setAssetValue("");
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance_minor, 0) / 100;

  return (
    <div className="min-h-[100dvh] bg-black pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} className="text-white" />
          </button>
          <h1 className="text-[17px] font-semibold text-white">Accounts</h1>
        </div>
        <button onClick={() => setIsAddAccountOpen(true)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* Total Wealth Summary Card */}
        <GlassSurface tier="thick" radius={28} className="p-6 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[var(--brand)]/20 blur-[60px] rounded-full pointer-events-none" />
          <p className="text-[13px] text-white/60 mb-2">Total Liquid Assets</p>
          <div className="text-[34px] font-bold text-white tracking-tight">
            <NumberRoll value={totalBalance} currency="₦" />
          </div>
        </GlassSurface>

        {/* Account List */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[15px] font-semibold text-white">Connected Accounts</h3>
            <span className="text-[13px] text-white/50">{accounts.length} total</span>
          </div>

          {isLoading ? (
            <div className="text-center text-white/50 py-10">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center text-white/50 py-10">
              No accounts yet. Click the + to add one.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {accounts.map((account) => (
                <div key={account.id} className="relative group">
                  <AccountCard 
                    name={account.name}
                    institution={account.institution}
                    balance={account.balance_minor / 100}
                    currency="₦"
                    lastImported="Just now"
                    color={account.type === "savings" ? "#30D158" : "#FF9F0A"}
                    icon={account.type === "savings" ? "🛡️" : "🏦"}
                  />
                  <button 
                    onClick={() => handleDeleteAccount(account.id)}
                    className="absolute top-1/2 -translate-y-1/2 right-12 p-2 text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offline Assets & Liabilities */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button 
            onClick={() => { setAssetType("asset"); setIsAddAssetOpen(true); }}
            className="bg-[#17191A] p-4 rounded-2xl border border-white/5 text-left hover:bg-[#1A1C1D] transition-colors"
          >
            <span className="text-[13px] text-white/60 block mb-1">Offline Assets</span>
            <span className="text-[17px] font-semibold text-white tabular block">₦0.00</span>
            <span className="text-[12px] text-white/40 mt-1 block">Tap to add</span>
          </button>
          
          <button 
            onClick={() => { setAssetType("liability"); setIsAddAssetOpen(true); }}
            className="bg-[#17191A] p-4 rounded-2xl border border-white/5 text-left hover:bg-[#1A1C1D] transition-colors"
          >
            <span className="text-[13px] text-white/60 block mb-1">Liabilities</span>
            <span className="text-[17px] font-semibold text-[var(--danger)] tabular block">-₦0.00</span>
            <span className="text-[12px] text-white/40 mt-1 block">Tap to add</span>
          </button>
        </div>

      </div>

      {/* --- ADD ACCOUNT MODAL --- */}
      <AnimatePresence>
        {isAddAccountOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-sm">
              <GlassSurface tier="thick" radius={28} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[18px] font-semibold text-white">Add Account</h2>
                  <button onClick={() => setIsAddAccountOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
                </div>
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="Account Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--brand)]" />
                  <input type="text" placeholder="Institution" value={newInstitution} onChange={(e) => setNewInstitution(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--brand)]" />
                  <input type="number" placeholder="Starting Balance" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--brand)]" />
                  <button onClick={handleAddAccount} className="w-full py-3 mt-2 bg-[var(--brand)] text-black font-semibold rounded-xl">Create Account</button>
                </div>
              </GlassSurface>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD ASSET/LIABILITY MODAL --- */}
      <AnimatePresence>
        {isAddAssetOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-sm">
              <GlassSurface tier="thick" radius={28} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[18px] font-semibold text-white">
                    Add {assetType === "asset" ? "Asset" : "Liability"}
                  </h2>
                  <button onClick={() => setIsAddAssetOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
                </div>
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="Name (e.g. Land in Lekki)" value={assetName} onChange={(e) => setAssetName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--brand)]" />
                  <input type="number" placeholder="Value (₦)" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[var(--brand)]" />
                  <button onClick={handleAddAsset} className="w-full py-3 mt-2 bg-[var(--brand)] text-black font-semibold rounded-xl">Save</button>
                </div>
              </GlassSurface>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}