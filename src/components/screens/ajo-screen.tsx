"use client";

import { useEffect, useState } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Plus, ChevronLeft, X, Check, Users } from "lucide-react";
import { getAjoGroups, addAjoGroup, recordAjoPayment, deleteAjoGroup } from "@/lib/supabase/database";
import { useCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/toast";
import type { AjoGroup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function AjoScreen({ onBack }: { onBack: () => void }) {
  const [groups, setGroups] = useState<AjoGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<AjoGroup | null>(null);
  
  // Wizard states
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly");
  const [members, setMembers] = useState(10);
  const [myPosition, setMyPosition] = useState(1);
  
  // Member list state
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState("");

  const { fmt } = useCurrency();
  const toast = useToast();

  const load = async () => {
    const data = await getAjoGroups();
    setGroups(data);
    if (data.length > 0 && !activeGroup) {
      setActiveGroup(data[0]);
    }
  };
  
  useEffect(() => { load(); }, []);

  const openWizard = () => {
    setName("");
    setAmount("");
    setFrequency("monthly");
    setMembers(10);
    setMyPosition(1);
    setMemberNames([]);
    setNewMemberName("");
    setStep(1);
    setIsWizardOpen(true);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    if (memberNames.length >= members - 1) {
      toast(`You can only add ${members - 1} other members`, "err");
      return;
    }
    setMemberNames([...memberNames, newMemberName.trim()]);
    setNewMemberName("");
  };

  const handleRemoveMember = (index: number) => {
    setMemberNames(memberNames.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name || !amount) { toast("Please fill in all fields", "err"); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleCreate = async () => {
    try {
      await addAjoGroup({ 
        name, 
        contribution: parseFloat(amount), 
        frequency, 
        members, 
        position: myPosition,
        members_list: memberNames
      });
      toast("Ajo group created");
      setIsWizardOpen(false);
      load();
    } catch {
      toast("Could not create group", "err");
    }
  };

  const handlePayment = async (g: AjoGroup) => {
    await recordAjoPayment(g);
    toast("Payment recorded");
    load();
  };

  const handleDelete = async (g: AjoGroup) => {
    if (confirm(`Delete "${g.name}"?`)) {
      await deleteAjoGroup(g.id);
      if (activeGroup?.id === g.id) setActiveGroup(null);
      load();
    }
  };

  // Calculate next payout details
  const payoutAmount = activeGroup ? (activeGroup.contribution_minor / 100) * activeGroup.members : 0;
  const daysUntilPayout = activeGroup ? (activeGroup.my_position - activeGroup.paid_cycles) * (activeGroup.frequency === "weekly" ? 7 : 30) : 0;
  const payoutDate = new Date(Date.now() + daysUntilPayout * 86400000);

  return (
    <div className="min-h-[100dvh] pb-32 bg-[#0b0b0c]">
      <ScreenHeader 
        title="Ajo Tracker" 
        onBack={onBack} 
        right={<IconButton label="Create" onClick={openWizard}><Plus size={18} /></IconButton>} 
      />

      <div className="px-4 pt-4 space-y-6">
        
        {/* Group Selector */}
        {groups.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[var(--text-3)]">Your circle</p>
            <select
              value={activeGroup?.id || ""}
              onChange={(e) => setActiveGroup(groups.find(g => g.id === e.target.value) || null)}
              className="flex items-center gap-1 bg-transparent text-[16px] font-bold text-white outline-none appearance-none cursor-pointer"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#1c1c1e]">{g.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Active Group Dashboard */}
        {activeGroup ? (
          <>
            {/* Hero Card (Brand Red) */}
            <div className="rounded-[24px] bg-[#DE3121] p-6 text-black shadow-xl relative overflow-hidden">
              <p className="text-[13px] font-medium text-black/70">Next payout</p>
              <p className="text-[36px] font-bold tabular mt-1">{fmt(payoutAmount)}</p>
              
              <p className="text-[12px] text-black/70 mt-2">
                {activeGroup.name} receives on {payoutDate.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })} • in {daysUntilPayout} days
              </p>

              {/* Progress bar */}
              <div className="mt-4 flex gap-1">
                {Array.from({ length: activeGroup.members }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      i < activeGroup.paid_cycles ? "bg-black" : "bg-black/20"
                    )} 
                  />
                ))}
              </div>
              <p className="text-[11px] text-black/70 mt-2">
                {activeGroup.paid_cycles} of {activeGroup.members} have paid this month
              </p>

              <button 
                onClick={() => handlePayment(activeGroup)}
                className="mt-5 w-full rounded-full bg-black py-3 text-[14px] font-bold text-white active:scale-95 transition-transform"
              >
                Pay your {fmt(activeGroup.contribution_minor / 100)} contribution
              </button>
            </div>

            {/* This Month's Members List */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[15px] font-semibold text-white">This month</h3>
                <span className="text-[12px] text-[var(--text-3)]">See all {activeGroup.members}</span>
              </div>
              
              <div className="space-y-2">
                {/* You */}
                <div className="flex items-center justify-between rounded-2xl bg-[#1c1c1e] p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DE3121] text-white font-bold text-[14px]">Y</div>
                    <div>
                      <p className="text-[14px] font-semibold text-white">You</p>
                      <p className="text-[11px] text-[var(--text-3)]">Due {payoutDate.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold px-3 py-1 rounded-full",
                    activeGroup.paid_cycles >= activeGroup.my_position ? "bg-[#52c28a]/20 text-[#52c28a]" : "bg-[#F59E0B]/20 text-[#F59E0B]"
                  )}>
                    {activeGroup.paid_cycles >= activeGroup.my_position ? "Paid" : "Pending"}
                  </span>
                </div>

                {/* Other Members (from members_list) */}
                {activeGroup.members_list?.map((name, i) => {
                  const isReceiving = i + 2 === activeGroup.my_position;
                  const isPaid = i < activeGroup.paid_cycles;
                  return (
                    <div key={i} className="flex items-center justify-between rounded-2xl bg-[#1c1c1e] p-4 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-3)] text-white font-bold text-[14px]">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-white">{name}</p>
                          <p className="text-[11px] text-[var(--text-3)]">
                            {isReceiving ? "Receiving this month" : isPaid ? `Paid` : "Pending"}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[11px] font-bold px-3 py-1 rounded-full",
                        isReceiving ? "bg-[#DE3121]/20 text-[#DE3121]" :
                        isPaid ? "bg-[#52c28a]/20 text-[#52c28a]" : "bg-[#F59E0B]/20 text-[#F59E0B]"
                      )}>
                        {isReceiving ? "Receiving" : isPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button onClick={() => handleDelete(activeGroup)} className="w-full py-3 text-[13px] font-semibold text-[var(--danger)]">
              Delete this group
            </button>
          </>
        ) : (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto text-[var(--text-3)] mb-4" />
            <p className="text-[15px] font-semibold text-white">No Ajo groups yet</p>
            <p className="text-[13px] text-[var(--text-3)] mt-1 mb-6">Start a circle with friends or family.</p>
            <button onClick={openWizard} className="rounded-full bg-[#DE3121] px-6 py-2.5 text-[14px] font-bold text-white">
              Create an Ajo
            </button>
          </div>
        )}
      </div>

      {/* CREATE AJO WIZARD */}
      <AnimatePresence>
        {isWizardOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] flex flex-col bg-[#0b0b0c]"
          >
            {/* Wizard Header */}
            <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-4">
              <button onClick={() => setIsWizardOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                <ChevronLeft size={24} />
              </button>
              <p className="text-[14px] font-semibold text-white">Step {step} of 3</p>
              <div className="w-10" />
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2 px-4 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn("h-1 flex-1 rounded-full", s <= step ? "bg-[#DE3121]" : "bg-white/10")} />
              ))}
            </div>

            {/* Step Content */}
            <div className="flex-1 px-6 overflow-y-auto pb-24">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="text-[22px] font-bold text-white">Set the amount</h2>
                    <p className="text-[13px] text-[var(--text-3)] mt-1">How much does each person put in, and how often?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[13px] font-medium text-[var(--text-3)]">Circle Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Family Asusu"
                        className="mt-1 w-full h-14 rounded-2xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 text-[16px] text-white outline-none focus:border-[#DE3121]"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-[var(--text-3)]">Each person pays</label>
                      <div className="mt-1 flex items-center h-14 rounded-2xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 focus-within:border-[#DE3121]">
                        <span className="text-[20px] text-[var(--text-3)]">₦</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          className="w-full bg-transparent px-2 text-[22px] font-bold text-white outline-none placeholder:text-[var(--text-3)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-3)] mb-2">How often</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFrequency("weekly")}
                        className={cn("flex-1 h-12 rounded-xl text-[14px] font-semibold transition-colors", frequency === "weekly" ? "bg-[#DE3121] text-white" : "bg-[var(--surface-2)] text-[var(--text-2)]")}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => setFrequency("monthly")}
                        className={cn("flex-1 h-12 rounded-xl text-[14px] font-semibold transition-colors", frequency === "monthly" ? "bg-[#DE3121] text-white" : "bg-[var(--surface-2)] text-[var(--text-2)]")}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="text-[22px] font-bold text-white">How many people?</h2>
                    <p className="text-[13px] text-[var(--text-3)] mt-1">The more people, the bigger the payout.</p>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-2)] p-5 border border-[var(--line)]">
                    <div>
                      <p className="text-[14px] font-semibold text-white">People in the circle</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => { setMembers(Math.max(2, members - 1)); if (memberNames.length >= members - 1) setMemberNames(memberNames.slice(0, members - 2)); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white text-[18px]">-</button>
                      <span className="text-[24px] font-bold text-white w-8 text-center">{members}</span>
                      <button onClick={() => setMembers(Math.min(50, members + 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white text-[18px]">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-2)] p-5 border border-[var(--line)]">
                    <div>
                      <p className="text-[14px] font-semibold text-white">Your position</p>
                      <p className="text-[11px] text-[var(--text-3)]">When will you receive the payout?</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setMyPosition(Math.max(1, myPosition - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white text-[18px]">-</button>
                      <span className="text-[24px] font-bold text-white w-8 text-center">{myPosition}</span>
                      <button onClick={() => setMyPosition(Math.min(members, myPosition + 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white text-[18px]">+</button>
                    </div>
                  </div>

                  {/* Member Names Input */}
                  <div className="space-y-3">
                    <p className="text-[13px] font-medium text-[var(--text-3)]">Other members names</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                        placeholder="Enter name"
                        className="flex-1 h-12 rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 text-[15px] text-white outline-none focus:border-[#DE3121]"
                      />
                      <button onClick={handleAddMember} className="h-12 px-4 rounded-xl bg-[#DE3121] text-white font-bold text-[14px]">Add</button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {memberNames.map((m, i) => (
                        <div key={i} className="flex items-center gap-1.5 rounded-full bg-[var(--surface-3)] px-3 py-1.5 border border-[var(--line)]">
                          <span className="text-[13px] text-white">{m}</span>
                          <button onClick={() => handleRemoveMember(i)} className="text-[var(--text-3)] hover:text-white">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="text-[22px] font-bold text-white">You're all set!</h2>
                    <p className="text-[13px] text-[var(--text-3)] mt-1">Here is what your circle looks like.</p>
                  </div>

                  <div className="rounded-3xl bg-[#DE3121] p-6 text-black shadow-xl">
                    <p className="text-[13px] text-black/70">Each person receives</p>
                    <p className="text-[36px] font-bold tabular mt-1">{fmt(parseFloat(amount || "0") * members)}</p>
                    <p className="text-[12px] text-black/70 mt-2">
                      Each person receives once • Cycle lasts {members} {frequency === "weekly" ? "weeks" : "months"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="text-[var(--text-3)]">Contribution</span>
                      <span className="font-semibold text-white">{fmt(parseFloat(amount || "0"))} / {frequency}</span>
                    </div>
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="text-[var(--text-3)]">Members</span>
                      <span className="font-semibold text-white">{members} people</span>
                    </div>
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="text-[var(--text-3)]">Your position</span>
                      <span className="font-semibold text-white">Turn #{myPosition}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer Button (Raised above nav bar) */}
            <div className="shrink-0 px-6 pb-[calc(env(safe-area-inset-bottom)+90px)] pt-4 bg-[#0b0b0c]">
              {step < 3 ? (
                <button onClick={handleNext} className="w-full h-14 rounded-2xl bg-[#DE3121] text-[16px] font-bold text-white active:scale-95 transition-transform">
                  Continue
                </button>
              ) : (
                <button onClick={handleCreate} className="w-full h-14 rounded-2xl bg-[#DE3121] text-[16px] font-bold text-white active:scale-95 transition-transform">
                  Create Circle
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}