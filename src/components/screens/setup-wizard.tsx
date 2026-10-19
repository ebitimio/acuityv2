"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Field, SelectField, Button } from "@/components/ui/form";
import {
  createAccount, addRecurringItem, updateWorkspaceBudget, getSetupStatus,
  type SetupStatus,
} from "@/lib/supabase/database";
import { useToast } from "@/components/ui/toast";

type Step = "account" | "income" | "bills" | "budget" | "done";

export function SetupWizard({
  isOpen,
  initialStep,
  onClose,
  onRefresh,
}: {
  isOpen: boolean;
  initialStep: Step;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [step, setStep] = useState<Step>(initialStep);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<SetupStatus | null>(null);

  // Account
  const [accName, setAccName] = useState("");
  const [accBank, setAccBank] = useState("");
  const [accType, setAccType] = useState("checking");
  const [accBalance, setAccBalance] = useState("");

  // Income
  const [incName, setIncName] = useState("");
  const [incAmount, setIncAmount] = useState("");
  const [incDay, setIncDay] = useState("25");

  // Bills
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDay, setBillDay] = useState("1");

  // Budget
  const [budgetAmount, setBudgetAmount] = useState("");

  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      getSetupStatus().then(setStatus).catch(() => {});
    }
  }, [isOpen, initialStep]);

  const saveAccount = async () => {
    if (!accName || !accBank || !accBalance) {
      toast("Fill in all fields", "err");
      return;
    }
    setBusy(true);
    try {
      await createAccount(accName, accBank, accType, parseFloat(accBalance), new Date().toISOString().slice(0, 10));
      toast("Account added");
      setAccName(""); setAccBank(""); setAccBalance("");
      const s = await getSetupStatus();
      setStatus(s);
      setStep("income");
    } catch (e: any) {
      toast(e.message ?? "Could not add", "err");
    } finally {
      setBusy(false);
    }
  };

  const saveIncome = async () => {
    if (!incName || !incAmount) {
      toast("Fill in all fields", "err");
      return;
    }
    setBusy(true);
    try {
      await addRecurringItem({
        account_id: null,
        name: incName,
        kind: "income",
        amount: parseFloat(incAmount),
        frequency: "monthly",
        day: parseInt(incDay),
      });
      toast("Income added");
      setIncName(""); setIncAmount("");
      const s = await getSetupStatus();
      setStatus(s);
      setStep("bills");
    } catch (e: any) {
      toast(e.message ?? "Could not add", "err");
    } finally {
      setBusy(false);
    }
  };

  const saveBill = async () => {
    if (!billName || !billAmount) {
      toast("Fill in all fields", "err");
      return;
    }
    setBusy(true);
    try {
      await addRecurringItem({
        account_id: null,
        name: billName,
        kind: "bill",
        amount: parseFloat(billAmount),
        frequency: "monthly",
        day: parseInt(billDay),
      });
      toast("Bill added");
      setBillName(""); setBillAmount("");
      const s = await getSetupStatus();
      setStatus(s);
      setStep("budget");
    } catch (e: any) {
      toast(e.message ?? "Could not add", "err");
    } finally {
      setBusy(false);
    }
  };

  const saveBudget = async () => {
    if (!budgetAmount) {
      toast("Enter a budget", "err");
      return;
    }
    setBusy(true);
    try {
      await updateWorkspaceBudget(Math.round(parseFloat(budgetAmount) * 100));
      toast("Budget set");
      setBudgetAmount("");
      setStep("done");
      onRefresh();
    } catch (e: any) {
      toast(e.message ?? "Could not save", "err");
    } finally {
      setBusy(false);
    }
  };

  const skip = () => {
    if (step === "account") setStep("income");
    else if (step === "income") setStep("bills");
    else if (step === "bills") setStep("budget");
    else if (step === "budget") setStep("done");
    else onClose();
  };

  const finish = () => {
    onRefresh();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={
      step === "account" ? "Add your first account"
      : step === "income" ? "Add your income"
      : step === "bills" ? "Add your bills"
      : step === "budget" ? "Set a monthly budget"
      : "You're set up!"
    }>
      {step === "account" && (
        <div className="space-y-3">
          <Field label="Account name" value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="Main Checking" />
          <Field label="Bank" value={accBank} onChange={(e) => setAccBank(e.target.value)} placeholder="GTBank" />
          <SelectField label="Type" value={accType} onChange={(e) => setAccType(e.target.value)}>
            <option value="checking">Current</option>
            <option value="savings">Savings</option>
            <option value="wallet">Wallet</option>
            <option value="dom">Domiciliary</option>
          </SelectField>
          <Field label="Current balance (₦)" type="number" value={accBalance} onChange={(e) => setAccBalance(e.target.value)} placeholder="0" />
          <Button onClick={saveAccount} loading={busy}>Continue</Button>
          <Button variant="ghost" onClick={skip}>Skip</Button>
        </div>
      )}

      {step === "income" && (
        <div className="space-y-3">
          <Field label="Income source" value={incName} onChange={(e) => setIncName(e.target.value)} placeholder="Salary" />
          <Field label="Amount (₦)" type="number" value={incAmount} onChange={(e) => setIncAmount(e.target.value)} />
          <Field label="Pay day (1-31)" type="number" value={incDay} onChange={(e) => setIncDay(e.target.value)} />
          <Button onClick={saveIncome} loading={busy}>Continue</Button>
          <Button variant="ghost" onClick={skip}>Skip</Button>
        </div>
      )}

      {step === "bills" && (
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--text-2)] mb-1">Add at least one regular bill. You can add more later.</p>
          <Field label="Bill name" value={billName} onChange={(e) => setBillName(e.target.value)} placeholder="Rent" />
          <Field label="Amount (₦)" type="number" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} />
          <Field label="Due day (1-31)" type="number" value={billDay} onChange={(e) => setBillDay(e.target.value)} />
          <Button onClick={saveBill} loading={busy}>Continue</Button>
          <Button variant="ghost" onClick={skip}>Skip</Button>
        </div>
      )}

      {step === "budget" && (
        <div className="space-y-3">
          <p className="text-[13px] text-[var(--text-2)] mb-1">Roughly how much will you spend this month?</p>
          <Field label="Monthly budget (₦)" type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} />
          <Button onClick={saveBudget} loading={busy}>Continue</Button>
          <Button variant="ghost" onClick={skip}>Skip</Button>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4 py-4 text-center">
          <p className="text-[15px]">
            {status?.is_complete
              ? "Everything is set up. Your dashboard is ready."
              : "Some steps are still pending. You can finish them any time from the checklist."}
          </p>
          <Button onClick={finish}>Open dashboard</Button>
        </div>
      )}
    </Modal>
  );
}