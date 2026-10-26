"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Eye, Bell, Shield, Wallet, Briefcase, HelpCircle,
  LogOut, Trash2, RefreshCw, Moon, FileText, MessageSquare, Info,
  ArrowLeft, Sun, Lock, User, KeyRound, Palette
} from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { useWorkspace } from "@/lib/workspace";
import { useTheme, type AccentColor } from "@/lib/theme";
import { useToast } from "./toast";
import { cn } from "@/lib/utils";
import { Modal } from "./modal";
import { clearDataCache, updateProfile, updatePassword } from "@/lib/supabase/database";
import { Button } from "./form";
import { PinLockScreen } from "@/components/screens/pin-lock-screen";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: { 
    email?: string; 
    id?: string; 
    created_at?: string;
    app_metadata?: { provider?: string };
  } | null;
  onSignOut: () => void;
  profileName: string;
  onNameUpdated: (name: string) => void;
}

type SubView = "main" | "edit-profile" | "change-password" | "change-pin" | "privacy" | "terms" | "help";

export function SettingsSheet({ isOpen, onClose, user, onSignOut, profileName, onNameUpdated }: SettingsSheetProps) {
  const { currency, setCurrency, rate, hidden, toggleHidden } = useCurrency();
  const { active: activeWs, deleteWorkspace, workspaces } = useWorkspace();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const toast = useToast();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [billReminders, setBillReminders] = useState(true);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [view, setView] = useState<SubView>("main");

  const [editName, setEditName] = useState(profileName);
  const [savingName, setSavingName] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const isGoogleUser = user?.app_metadata?.provider === "google";

  useEffect(() => {
    try {
      setPushEnabled(localStorage.getItem("acuity:push_notifications") !== "0");
      setWeeklySummary(localStorage.getItem("acuity:weekly_summary") !== "0");
      setBudgetAlerts(localStorage.getItem("acuity:budget_alerts") !== "0");
      setBillReminders(localStorage.getItem("acuity:bill_reminders") !== "0");
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem("acuity:push_notifications", pushEnabled ? "1" : "0");
      localStorage.setItem("acuity:weekly_summary", weeklySummary ? "1" : "0");
      localStorage.setItem("acuity:budget_alerts", budgetAlerts ? "1" : "0");
      localStorage.setItem("acuity:bill_reminders", billReminders ? "1" : "0");
    } catch {}
  }, [pushEnabled, weeklySummary, budgetAlerts, billReminders]);

  useEffect(() => {
    if (isOpen) {
      setEditName(profileName);
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen, profileName]);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(editName);
      onNameUpdated(editName);
      toast("Profile updated");
      setView("main");
    } catch (e: any) {
      toast(e.message || "Could not update profile", "err");
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      toast("Password must be at least 6 characters", "err");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "err");
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword(newPassword);
      toast("Password updated");
      setNewPassword("");
      setConfirmPassword("");
      setView("main");
    } catch (e: any) {
      toast(e.message || "Could not update password", "err");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleClearCache = () => {
    clearDataCache();
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

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" })
    : "Recently";

  if (view === "change-pin") {
    return (
      <PinLockScreen 
        mode="setup" 
        onComplete={(pin) => {
          localStorage.setItem("acuity:pin", pin);
          toast("PIN updated successfully");
          setView("main");
        }} 
      />
    );
  }

  if (view === "edit-profile") {
    return (
      <Modal open={isOpen} onClose={() => setView("main")} title="Edit Profile">
        <div className="space-y-4 pb-6">
          <button onClick={() => setView("main")} className="flex items-center gap-1 text-[var(--brand)] text-[13px] font-medium">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex justify-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--brand)] text-white text-[36px] font-bold">
                {editName.charAt(0).toUpperCase() || "U"}
              </div>
              {isGoogleUser && (
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[var(--surface-2)]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-3)]">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 w-full h-12 rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 text-[15px] text-[var(--text-1)] outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-3)]">Email</label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="mt-1 w-full h-12 rounded-xl border border-[var(--line)] bg-[var(--surface-1)] px-4 text-[15px] text-[var(--text-3)] outline-none"
            />
          </div>
          <Button onClick={handleSaveName} loading={savingName} className="w-full h-12">
            Save Changes
          </Button>
        </div>
      </Modal>
    );
  }

  if (view === "change-password") {
    return (
      <Modal open={isOpen} onClose={() => setView("main")} title="Change Password">
        <div className="space-y-4 pb-6">
          <button onClick={() => setView("main")} className="flex items-center gap-1 text-[var(--brand)] text-[13px] font-medium">
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-3)]">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="mt-1 w-full h-12 rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 text-[15px] text-[var(--text-1)] outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-3)]">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="mt-1 w-full h-12 rounded-xl border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 text-[15px] text-[var(--text-1)] outline-none focus:border-[var(--brand)]"
            />
          </div>
          <Button onClick={handleSavePassword} loading={savingPassword} className="w-full h-12">
            Update Password
          </Button>
        </div>
      </Modal>
    );
  }

  if (view === "privacy" || view === "terms" || view === "help") {
    return (
      <Modal open={isOpen} onClose={() => setView("main")} title={
        view === "privacy" ? "Privacy Policy" : 
        view === "terms" ? "Terms of Service" : "Help & FAQ"
      }>
        <div className="pb-6 text-[13px] leading-relaxed text-[var(--text-2)]">
          <button onClick={() => setView("main")} className="mb-4 flex items-center gap-1 text-[var(--brand)] font-medium">
            <ArrowLeft size={14} /> Back to Settings
          </button>
          
          {view === "privacy" && (
            <>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">1. Information We Collect</h3>
              <p className="mb-4">Acuity collects information you provide directly: your name, email, financial data (accounts, transactions, budgets), and usage data. We use Supabase for secure data storage.</p>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">2. How We Use It</h3>
              <p className="mb-4">Your data is used solely to provide the service: calculating Safe to Spend, generating insights, and giving AI advice. We never sell your data to third parties.</p>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">3. Security</h3>
              <p className="mb-4">All data is encrypted in transit and at rest. We use Row Level Security (RLS) so only you can access your own data.</p>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">4. AI Processing</h3>
              <p>When you use the Acuity AI, your financial context is sent to OpenAI for processing. We do not store conversation history on our servers.</p>
            </>
          )}

          {view === "terms" && (
            <>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">1. Acceptance</h3>
              <p className="mb-4">By using Acuity, you agree to these terms. If you do not agree, please do not use the app.</p>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">2. Not Financial Advice</h3>
              <p className="mb-4">Acuity is a tracking and insight tool. It does not provide regulated financial, investment, or legal advice. All decisions are yours.</p>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">3. Accuracy</h3>
              <p className="mb-4">You are responsible for the accuracy of the data you enter. Acuity is not liable for decisions made based on incorrect data.</p>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">4. Your Account</h3>
              <p>You are responsible for maintaining the security of your login credentials.</p>
            </>
          )}

          {view === "help" && (
            <>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">Getting Started</h3>
              <p className="mb-4">Add a bank account, then set your monthly income and bills in the Setup checklist on the Home screen. Acuity will then calculate your daily Safe to Spend.</p>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">Managing Budgets</h3>
              <p className="mb-4">Go to the Budget screen to set category limits. Your total monthly budget is the sum of all categories.</p>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">The AI Advisor</h3>
              <p className="mb-4">Tap the AI tab in the bottom nav. Ask it anything about your money.</p>
              <h3 className="text-[16px] font-bold text-[var(--text-1)] mb-2">Need more help?</h3>
              <p>Email us at support@acuity.app</p>
            </>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6 pb-6 overflow-y-auto max-h-[75dvh]">

        {/* PROFILE CARD */}
        <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-white text-[20px] font-bold">
                {profileName.charAt(0).toUpperCase()}
              </div>
              {isGoogleUser && (
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[var(--surface-2)]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-[var(--text-1)] truncate capitalize flex items-center gap-2">
                {profileName}
                {isGoogleUser && (
                  <span className="text-[10px] font-normal text-[var(--text-3)] normal-case">
                    (Google)
                  </span>
                )}
              </p>
              <p className="text-[12px] text-[var(--text-3)] truncate">
                {user?.email ?? "no email"}
              </p>
              <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                {activeWs?.name ?? "No workspace"} · Member since {memberSince}
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setView("edit-profile")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--fill-1)] py-2 text-[12px] font-semibold text-[var(--text-1)]"
            >
              <User size={13} /> Edit Profile
            </button>
            {!isGoogleUser && (
              <button
                onClick={() => setView("change-password")}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--fill-1)] py-2 text-[12px] font-semibold text-[var(--text-1)]"
              >
                <Lock size={13} /> Password
              </button>
            )}
            <button
              onClick={() => setView("change-pin")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--fill-1)] py-2 text-[12px] font-semibold text-[var(--text-1)]"
            >
              <KeyRound size={13} /> Change PIN
            </button>
          </div>
        </div>

        <Section title="Money & Currency">
          <Row icon={Wallet} label="Currency" value={currency} onClick={() => setCurrency(currency === "NGN" ? "USD" : "NGN")} chevron />
          <Row icon={RefreshCw} label="Exchange Rate" value={`₦${rate.toLocaleString()} / $1`} />
          <Row icon={Eye} label="Hide balances" toggle toggleValue={hidden} onToggle={toggleHidden} />
        </Section>

        <Section title="Notifications">
          <Row icon={Bell} label="Push notifications" toggle toggleValue={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
          <Row icon={FileText} label="Weekly spending summary" toggle toggleValue={weeklySummary} onToggle={() => setWeeklySummary(!weeklySummary)} />
          <Row icon={Bell} label="Budget alerts (90%)" toggle toggleValue={budgetAlerts} onToggle={() => setBudgetAlerts(!budgetAlerts)} />
          <Row icon={Bell} label="Bill reminders" toggle toggleValue={billReminders} onToggle={() => setBillReminders(!billReminders)} />
        </Section>

        {/* APPEARANCE & COLOR THEME */}
        <Section title="Appearance">
          <div className="px-4 py-3.5 border-b border-[var(--line)]">
            <div className="flex items-center gap-3 mb-3">
              <Moon size={18} className="text-[var(--brand)]" />
              <span className="text-[14px] font-medium text-[var(--text-1)]">Display Mode</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["dark", "light", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl py-3 text-[11px] font-semibold capitalize transition-colors",
                    theme === t
                      ? "bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/30"
                      : "bg-[var(--fill-1)] text-[var(--text-2)] border border-transparent"
                  )}
                >
                  {t === "dark" && <Moon size={16} />}
                  {t === "light" && <Sun size={16} />}
                  {t === "system" && <RefreshCw size={16} />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3 mb-3">
              <Palette size={18} className="text-[var(--brand)]" />
              <span className="text-[14px] font-medium text-[var(--text-1)]">App Color</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["red", "lime", "grey"] as AccentColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl py-3 text-[11px] font-semibold capitalize transition-colors border",
                    accent === c
                      ? "bg-[var(--fill-2)] border-[var(--text-1)]"
                      : "bg-[var(--fill-1)] border-transparent"
                  )}
                >
                  <div 
                    className="h-5 w-5 rounded-full shadow-sm" 
                    style={{ 
                      backgroundColor: c === "red" ? "#DE3121" : c === "lime" ? "#D2F824" : "#4B5563" 
                    }} 
                  />
                  <span className={accent === c ? "text-[var(--text-1)]" : "text-[var(--text-2)]"}>
                    {c === "red" ? "Default" : c === "lime" ? "Lime" : "Grey"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Privacy & Security">
          <Row icon={RefreshCw} label="Clear cache" chevron onClick={handleClearCache} />
        </Section>

        <Section title="Workspace">
          <Row icon={Briefcase} label="Current workspace" value={activeWs?.name ?? "None"} />
          <Row icon={Trash2} label="Delete workspace" danger chevron onClick={() => setConfirmDelete(true)} />
        </Section>

        <Section title="About & Support">
          <Row icon={HelpCircle} label="Help & FAQ" chevron onClick={() => setView("help")} />
          <Row icon={FileText} label="Terms of Service" chevron onClick={() => setView("terms")} />
          <Row icon={Shield} label="Privacy Policy" chevron onClick={() => setView("privacy")} />
          <Row icon={MessageSquare} label="Contact support" chevron onClick={() => window.location.href = "mailto:support@acuity.app"} />
          <Row icon={Info} label="App version" value="1.0.0" />
        </Section>

        <button
          onClick={() => setConfirmSignOut(true)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 py-3.5 text-[15px] font-bold text-[var(--danger)]"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <AnimatePresence>
        {confirmSignOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setConfirmSignOut(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <LogOut size={20} className="text-[var(--danger)]" />
                <h3 className="text-[16px] font-bold text-[var(--text-1)]">Sign out?</h3>
              </div>
              <p className="text-[13px] text-[var(--text-3)] mb-4">
                Are you sure you want to sign out of Acuity?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmSignOut(false)}
                  className="flex-1 rounded-xl bg-[var(--fill-1)] py-2.5 text-[13px] font-semibold text-[var(--text-1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setConfirmSignOut(false); onSignOut(); }}
                  className="flex-1 rounded-xl bg-[var(--danger)] py-2.5 text-[13px] font-semibold text-white"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                This will permanently delete <strong className="text-[var(--text-1)]">{activeWs?.name}</strong> and all its data. This cannot be undone.
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
      <Icon size={18} className={danger ? "text-[var(--danger)]" : "text-[var(--brand)]"} />
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
            toggleValue ? "bg-[var(--brand)]" : "bg-[var(--fill-3)]"
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