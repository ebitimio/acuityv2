"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, Eye, Bell, Shield, Wallet, Briefcase, HelpCircle,
  LogOut, Trash2, RefreshCw, Moon, FileText, MessageSquare, Info
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { useWorkspace } from "@/lib/workspace";
import { useToast } from "./toast";
import { cn } from "@/lib/utils";
import { Modal } from "./modal";
import { clearDataCache } from "@/lib/supabase/database";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email?: string; id?: string } | null;
  onSignOut: () => void;
}

export function SettingsSheet({ isOpen, onClose, user, onSignOut }: SettingsSheetProps) {
  const { currency, setCurrency, rate, hidden, toggleHidden } = useCurrency();
  const { active: activeWs, deleteWorkspace, workspaces } = useWorkspace();
  const toast = useToast();

  // Notification settings (persisted in localStorage)
  const [pushEnabled, setPushEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("acuity:push_notifications") !== "0";
  });
  const [weeklySummary, setWeeklySummary] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("acuity:weekly_summary") !== "0";
  });
  const [budgetAlerts, setBudgetAlerts] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("acuity:budget_alerts") !== "0";
  });
  const [billReminders, setBillReminders] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("acuity:bill_reminders") !== "0";
  });
  const [biometric, setBiometric] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("acuity:biometric") === "1";
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  // Persist notification settings whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("acuity:push_notifications", pushEnabled ? "1" : "0");
      localStorage.setItem("acuity:weekly_summary", weeklySummary ? "1" : "0");
      localStorage.setItem("acuity:budget_alerts", budgetAlerts ? "1" : "0");
      localStorage.setItem("acuity:bill_reminders", billReminders ? "1" : "0");
      localStorage.setItem("acuity:biometric", biometric ? "1" : "0");
    } catch {}
  }, [pushEnabled, weeklySummary, budgetAlerts, billReminders, biometric]);

  const profileName = user?.email?.split("@")[0]?.split(".")[0] || "User";
  const profileInitial = profileName.charAt(0).toUpperCase();

  const handleClearCache = () => {
    clearDataCache();
    try {
      // Also clear local storage preferences (except currency)
      const currency = localStorage.getItem("acuity:currency");
      const rate = localStorage.getItem("acuity:rate");
      localStorage.clear();
      if (currency) localStorage.setItem("acuity:currency", currency);
      if (rate) localStorage.setItem("acuity:rate", rate);
    } catch {}
    toast("Cache cleared");
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWs) return;
    if (workspaces.length <= 1) {
      toast("You need at least one workspace", "err");
      setConfirmDelete(false);
      return;
    }
    try {
      await deleteWorkspace(activeWs.id);
      toast(`Deleted "${activeWs.name}"`);
      onClose();
      window.location.href = "/";
    } catch (e: any) {
      toast(e.message || "Could not delete", "err");
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6 pb-6 overflow-y-auto max-h-[75dvh]">

        {/* PROFILE */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DE3121] text-white text-[20px] font-bold">
            {profileInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-[var(--text-1)] truncate capitalize">
              {profileName}
            </p>
            <p className="text-[12px] text-[var(--text-3)] truncate">
              {user?.email ?? "no email"}
            </p>
          </div>
        </div>

        {/* MONEY & CURRENCY */}
        <Section title="Money & Currency">
          <Row
            icon={Wallet}
            label="Currency"
            value={currency}
            onClick={() => setCurrency(currency === "NGN" ? "USD" : "NGN")}
            chevron
          />
          <Row
            icon={RefreshCw}
            label="Exchange Rate"
            value={`₦${rate.toLocaleString()} / $1`}
          />
          <Row
            icon={Eye}
            label="Hide balances"
            toggle
            toggleValue={hidden}
            onToggle={toggleHidden}
          />
        </Section>

        {/* NOTIFICATIONS (Preferences only — actual notifications live in Bell icon) */}
        <Section title="Notifications">
          <Row
            icon={Bell}
            label="Push notifications"
            toggle
            toggleValue={pushEnabled}
            onToggle={() => setPushEnabled(!pushEnabled)}
          />
          <Row
            icon={FileText}
            label="Weekly spending summary"
            toggle
            toggleValue={weeklySummary}
            onToggle={() => setWeeklySummary(!weeklySummary)}
          />
          <Row
            icon={Bell}
            label="Budget alerts (90%)"
            toggle
            toggleValue={budgetAlerts}
            onToggle={() => setBudgetAlerts(!budgetAlerts)}
          />
          <Row
            icon={Bell}
            label="Bill reminders"
            toggle
            toggleValue={billReminders}
            onToggle={() => setBillReminders(!billReminders)}
          />
        </Section>

        {/* PRIVACY & SECURITY */}
        <Section title="Privacy & Security">
          <Row
            icon={Shield}
            label="Biometric login"
            toggle
            toggleValue={biometric}
            onToggle={() => setBiometric(!biometric)}
          />
          <Row
            icon={Moon}
            label="Theme"
            value="Dark"
            chevron
            onClick={() => toast("Theme switching coming soon")}
          />
          <Row
            icon={RefreshCw}
            label="Clear cache"
            chevron
            onClick={handleClearCache}
          />
        </Section>

        {/* FINANCIAL PREFERENCES */}
        <Section title="Financial Preferences">
          <Row
            icon={Wallet}
            label="Current workspace"
            value={activeWs?.name ?? "None"}
          />
          <Row
            icon={Briefcase}
            label="Payday cycle"
            value="Day 27"
            chevron
            onClick={() => toast("Manage on Budget screen")}
          />
        </Section>

        {/* WORKSPACE */}
        <Section title="Workspace">
          <Row
            icon={Trash2}
            label="Delete workspace"
            danger
            chevron
            onClick={() => setConfirmDelete(true)}
          />
        </Section>

        {/* ABOUT & SUPPORT */}
        <Section title="About & Support">
          <Row
            icon={HelpCircle}
            label="Help & FAQ"
            chevron
            onClick={() => toast("Opening help center...")}
          />
          <Row
            icon={MessageSquare}
            label="Contact support"
            chevron
            onClick={() => toast("Support ticket opened")}
          />
          <Row
            icon={Info}
            label="App version"
            value="1.0.0"
          />
        </Section>

        {/* SIGN OUT */}
        <button
          onClick={() => {
            if (confirm("Sign out of Acuity?")) onSignOut();
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 py-3.5 text-[15px] font-bold text-[var(--danger)]"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Delete workspace confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setConfirmDelete(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Trash2 size={20} className="text-[var(--danger)]" />
                <h3 className="text-[16px] font-bold text-[var(--text-1)]">Delete workspace?</h3>
              </div>
              <p className="text-[13px] text-[var(--text-3)] mb-4">
                This will permanently delete <strong className="text-[var(--text-1)]">{activeWs?.name}</strong> and all its transactions, budgets, and data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-xl bg-[var(--fill-1)] py-2.5 text-[13px] font-semibold text-[var(--text-1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkspace}
                  className="flex-1 rounded-xl bg-[var(--danger)] py-2.5 text-[13px] font-semibold text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

/* ---------- SUB-COMPONENTS ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        {title}
      </p>
      <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] overflow-hidden divide-y divide-[var(--line)]">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  chevron,
  toggle,
  toggleValue,
  onToggle,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string;
  chevron?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  danger?: boolean;
}) {
  const isClickable = chevron || onClick;
  const Wrapper = isClickable ? "button" : "div";

  return (
    <Wrapper
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
        isClickable && "hover:bg-[var(--fill-1)]"
      )}
    >
      <Icon size={18} className={danger ? "text-[var(--danger)]" : "text-[#DE3121]"} />
      <span className={cn(
        "flex-1 text-[14px] font-medium",
        danger ? "text-[var(--danger)]" : "text-[var(--text-1)]"
      )}>
        {label}
      </span>
      {value && (
        <span className="text-[13px] text-[var(--text-3)]">{value}</span>
      )}
      {toggle && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            toggleValue ? "bg-[#DE3121]" : "bg-[var(--fill-3)]"
          )}
        >
          <motion.div
            animate={{ x: toggleValue ? 22 : 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
          />
        </button>
      )}
      {chevron && !toggle && (
        <ChevronRight size={16} className="text-[var(--text-3)]" />
      )}
    </Wrapper>
  );
}