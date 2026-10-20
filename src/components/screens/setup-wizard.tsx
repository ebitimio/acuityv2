"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../ui/modal";
import { Button } from "../ui/form";
import { useWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "../ui/toast";

type Step = "account" | "income" | "bills";

interface SetupWizardProps {
  isOpen: boolean;
  initialStep?: Step;
  onClose: () => void;
  onRefresh: () => void;
}

export function SetupWizard({ isOpen, initialStep = "account", onClose, onRefresh }: SetupWizardProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    accountName: "",
    accountBalance: "",
    bank: "",
    income: "",
    bills: "",
  });

  const { active: activeWs } = useWorkspace();
  const supabase = createClient();
  const toast = useToast();

  const handleNext = async () => {
    if (step === "account" && !form.accountName.trim()) {
      toast("Enter an account name", "err");
      return;
    }
    if (step === "income" && !form.income) {
      toast("Enter your income", "err");
      return;
    }

    if (step === "bills") {
      await handleSave();
      return;
    }

    const nextMap: Record<Step, Step> = {
      account: "income",
      income: "bills",
      bills: "bills",
    };
    setStep(nextMap[step]);
  };

  const handleSave = async () => {
    if (!activeWs) return;
    setIsSaving(true);

    try {
      if (form.accountName && form.accountBalance) {
        await supabase.from("accounts").insert({
          workspace_id: activeWs.id,
          name: form.accountName,
          bank_name: form.bank,
          account_type: "Current",
          balance_minor: Math.round(parseFloat(form.accountBalance) * 100),
        });
      }

      if (form.income) {
        await supabase.from("transactions").insert({
          workspace_id: activeWs.id,
          amount_minor: Math.round(parseFloat(form.income) * 100),
          direction: "credit",
          category_name: "Income",
          transaction_date: new Date().toISOString().split("T")[0],
        });
      }

      onRefresh();
      toast("Setup complete!");
      onClose();
    } catch (e: any) {
      console.error(e);
      toast(e.message || "Failed to save setup", "err");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title="Setup">
      <div className="flex flex-col h-[70dvh] bg-[var(--bg)] -mx-6 -mt-6 rounded-t-3xl">
        <div className="flex-1 overflow-y-auto px-6 pt-6">
          <AnimatePresence mode="wait">
            {step === "account" && (
              <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-[20px] font-semibold text-[var(--text-1)]">Add your first account</h2>
                <div>
                  <label className="text-[13px] font-medium text-[var(--text-3)]">Account name</label>
                  <input
                    type="text"
                    value={form.accountName}
                    onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                    placeholder="e.g. Main Checking"
                    className="mt-1 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3 text-[15px] text-[var(--text-1)] focus:border-[var(--brand)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[var(--text-3)]">Bank</label>
                  <input
                    type="text"
                    value={form.bank}
                    onChange={(e) => setForm({ ...form, bank: e.target.value })}
                    placeholder="e.g. GTBank"
                    className="mt-1 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3 text-[15px] text-[var(--text-1)] focus:border-[var(--brand)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[var(--text-3)]">Current balance</label>
                  <input
                    type="number"
                    value={form.accountBalance}
                    onChange={(e) => setForm({ ...form, accountBalance: e.target.value })}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3 text-[15px] text-[var(--text-1)] focus:border-[var(--brand)] outline-none"
                  />
                </div>
              </motion.div>
            )}

            {step === "income" && (
              <motion.div key="income" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-[20px] font-semibold text-[var(--text-1)]">What's your monthly income?</h2>
                <p className="text-[14px] text-[var(--text-3)]">This helps us calculate your Safe to Spend.</p>
                <div>
                  <label className="text-[13px] font-medium text-[var(--text-3)]">Monthly income</label>
                  <input
                    type="number"
                    value={form.income}
                    onChange={(e) => setForm({ ...form, income: e.target.value })}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3 text-[15px] text-[var(--text-1)] focus:border-[var(--brand)] outline-none"
                  />
                </div>
              </motion.div>
            )}

            {step === "bills" && (
              <motion.div key="bills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-[20px] font-semibold text-[var(--text-1)]">Any recurring bills?</h2>
                <p className="text-[14px] text-[var(--text-3)]">Rent, subscriptions, etc. You can add more later.</p>
                <div>
                  <label className="text-[13px] font-medium text-[var(--text-3)]">Estimated bills</label>
                  <input
                    type="number"
                    value={form.bills}
                    onChange={(e) => setForm({ ...form, bills: e.target.value })}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3 text-[15px] text-[var(--text-1)] focus:border-[var(--brand)] outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 pb-8 pt-4 border-t border-[var(--line)]">
          <div className="flex gap-2">
            {step !== "account" && (
              <Button variant="ghost" onClick={() => setStep("account")} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={handleNext} loading={isSaving} className="flex-[2]">
              {step === "bills" ? "Finish setup" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}