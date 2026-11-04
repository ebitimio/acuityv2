"use client";

import { motion } from "framer-motion";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Button } from "@/components/ui/form";
import {
  ShieldCheck,
  Lock,
  Landmark,
  RefreshCw,
  ArrowRight,
  Crown,
  Sparkles,
  CheckCircle2,
  EyeOff,
  Zap,
  Loader2,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectBankScreenProps {
  onBack: () => void;
  onProceed: () => void;
  isConnecting?: boolean;
}

export function ConnectBankScreen({
  onBack,
  onProceed,
  isConnecting = false,
}: ConnectBankScreenProps) {
  const steps = [
    {
      step: "1",
      title: "Choose Your Bank",
      description:
        "Select your institution from 20+ supported Nigerian commercial banks, digital banks, and fintechs (GTBank, Access Bank, Zenith, Kuda, OPay, and more).",
      icon: Landmark,
      color: "#e8a23b",
    },
    {
      step: "2",
      title: "Log in Securely via Mono",
      description:
        "Authenticate directly through Mono's encrypted portal with your bank credentials. Acuity never sees, collects, or stores your banking passwords, PINs, or BVN.",
      icon: ShieldCheck,
      color: "var(--brand)",
    },
    {
      step: "3",
      title: "Instant Automated Sync",
      description:
        "Your account balance and latest transactions sync automatically. Acuity AI categorizes expenses and updates your daily Safe-to-Spend limit in real time.",
      icon: RefreshCw,
      color: "#52c28a",
    },
  ];

  const securityPillars = [
    {
      icon: EyeOff,
      title: "100% Read-Only",
      desc: "Acuity can never move money, initiate debits, or authorize transfers.",
    },
    {
      icon: Lock,
      title: "256-Bit Bank Encryption",
      desc: "Your data is transmitted over end-to-end encrypted financial pipelines.",
    },
    {
      icon: CheckCircle2,
      title: "Revoke Access Anytime",
      desc: "You remain in complete control and can disconnect your account with one tap.",
    },
  ];

  return (
    <div className="min-h-[100dvh] pb-36 bg-[var(--bg)] relative overflow-x-hidden">
      <ScreenHeader title="Connect Bank Account" onBack={onBack} />

      <div className="max-w-md mx-auto px-5 pt-4 space-y-6">
        {/* Top Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)] border border-[var(--line-strong)] p-5 text-center shadow-xl"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-[var(--brand)]/15 blur-[50px] rounded-full pointer-events-none" />

          {/* Premium Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand)]/10 border border-[var(--brand)]/30 text-[11px] font-semibold text-[var(--brand)] mb-3">
            <Crown size={13} className="text-[var(--brand)]" />
            <span>Acuity Premium Feature</span>
          </div>

          {/* Connection Visual */}
          <div className="flex items-center justify-center gap-3 my-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#000000] border border-[var(--line-strong)] shadow-md">
              <span className="text-[20px] font-black text-white">A</span>
              <span className="text-[20px] font-black text-[var(--brand)]">.</span>
            </div>

            <div className="flex items-center gap-1 text-[var(--text-3)]">
              <span className="h-0.5 w-4 bg-[var(--line-strong)]" />
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)]/15 text-[var(--brand)] border border-[var(--brand)]/30">
                <Lock size={12} />
              </div>
              <span className="h-0.5 w-4 bg-[var(--line-strong)]" />
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#000000] border border-[var(--line-strong)] shadow-md text-[var(--brand)]">
              <Building2 size={22} />
            </div>
          </div>

          <h2 className="text-[20px] font-bold text-[var(--text-1)] tracking-tight">
            Connect Your Bank Account
          </h2>
          <p className="text-[13px] text-[var(--text-2)] mt-1 leading-relaxed max-w-[320px] mx-auto">
            Link your Nigerian financial institution to automatically sync balances and track daily spending without manual entry.
          </p>
        </motion.div>

        {/* What You Are About to Do */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[20px] bg-[var(--surface-2)] border border-[var(--line)] p-4.5 space-y-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
              <Zap size={13} />
            </div>
            <h3 className="text-[14px] font-semibold text-[var(--text-1)]">
              What You Are About to Do
            </h3>
          </div>
          <p className="text-[12.5px] text-[var(--text-2)] leading-relaxed pl-8">
            You will connect your Nigerian bank account to Acuity via <strong className="text-white">Mono</strong>, a CBN-regulated open banking platform. This allows Acuity to securely read your account balances and transactions so your <strong className="text-white">Safe to Spend</strong> and budgets stay accurate in real time.
          </p>
        </motion.div>

        {/* How It Works (Steps) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-[14px] font-semibold text-[var(--text-1)] px-1">
            How It Works
          </h3>

          <div className="space-y-2.5">
            {steps.map((s, index) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="flex items-start gap-3.5 rounded-[18px] bg-[var(--surface-2)] border border-[var(--line)] p-3.5"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white font-bold text-[13px]"
                    style={{
                      background: `color-mix(in srgb, ${s.color} 18%, transparent)`,
                      color: s.color,
                      border: `1px solid color-mix(in srgb, ${s.color} 35%, transparent)`,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[13.5px] font-semibold text-[var(--text-1)]">
                      {s.step}. {s.title}
                    </p>
                    <p className="text-[12px] text-[var(--text-2)] leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Security & Privacy First */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[20px] bg-[#000000] border border-[var(--line)] p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[var(--gain)]" />
            <h4 className="text-[13px] font-bold text-white uppercase tracking-wider">
              Bank-Grade Security & Privacy
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {securityPillars.map((p) => {
              const PIcon = p.icon;
              return (
                <div key={p.title} className="flex items-start gap-2.5">
                  <PIcon size={15} className="text-[var(--gain)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[12.5px] font-semibold text-white">{p.title}: </span>
                    <span className="text-[12px] text-[var(--text-2)] leading-relaxed">{p.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Regulatory note */}
        <p className="text-center text-[11px] text-[var(--text-3)] leading-relaxed px-4">
          Powered by Mono Technologies Nigeria Limited. Protected by 256-bit encryption. Acuity never stores your online banking login credentials or PINs.
        </p>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-5 pt-3 border-t border-[var(--line)]"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
          background: "color-mix(in srgb, var(--bg) 88%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-md mx-auto space-y-2">
          <Button
            onClick={onProceed}
            loading={isConnecting}
            className="w-full h-12 text-[15px] font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            {isConnecting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Launching Mono Connect...</span>
              </>
            ) : (
              <>
                <span>Proceed to Mono Connect</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isConnecting}
            className="w-full h-10 text-[13px] text-[var(--text-3)] hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

