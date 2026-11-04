"use client";

import { motion } from "framer-motion";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Button } from "@/components/ui/form";
import {
  ShieldCheck,
  Lock,
  Landmark,
  ArrowRight,
  Crown,
  EyeOff,
  Zap,
  Loader2,
  Building2,
  Check,
} from "lucide-react";

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
  const features = [
    {
      title: "All Major Institutions",
      subtitle: "Supports GTBank, Access, Zenith, Kuda, OPay, and 20+ more.",
      icon: Landmark,
      color: "#e8a23b",
    },
    {
      title: "End-to-End Encrypted",
      subtitle: "Direct login via Mono. Acuity never sees your passwords or PIN.",
      icon: ShieldCheck,
      color: "var(--brand)",
    },
    {
      title: "Real-Time Balance & Pacing",
      subtitle: "Transactions sync automatically to keep Safe-to-Spend accurate.",
      icon: Zap,
      color: "#52c28a",
    },
  ];

  return (
    <div className="min-h-[100dvh] pb-36 bg-[#000000] text-white relative overflow-x-hidden selection:bg-[var(--brand)] selection:text-white">
      <ScreenHeader title="Connect Bank" onBack={onBack} />

      <div className="max-w-md mx-auto px-5 pt-4 space-y-5">
        {/* Apple-style Hero Graphic Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[26px] bg-[#121214] border border-white/[0.08] p-6 text-center shadow-2xl"
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-36 bg-[var(--brand)]/12 blur-[60px] rounded-full pointer-events-none" />

          {/* Premium Tag Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-medium tracking-wide text-white/80 mb-4 shadow-sm">
            <Crown size={12} className="text-[var(--brand)]" />
            <span className="uppercase text-[9.5px] tracking-wider font-semibold">Acuity Premium</span>
          </div>

          {/* Symmetrical Emblem Bridge */}
          <div className="flex items-center justify-center gap-3.5 my-3">
            {/* Acuity Monogram Squircle */}
            <div className="flex h-13 w-13 items-center justify-center rounded-[18px] bg-[#1a1a1c] border border-white/10 shadow-lg">
              <div className="flex items-baseline">
                <span className="text-[20px] font-black tracking-tight text-white">A</span>
                <span className="text-[20px] font-black tracking-tight text-[var(--brand)]">.</span>
              </div>
            </div>

            {/* Encrypted Connector */}
            <div className="flex items-center gap-1.5 text-white/20">
              <span className="h-[1.5px] w-4 bg-white/15 rounded-full" />
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.05] border border-white/15 text-[var(--brand)] shadow-sm">
                <Lock size={12} strokeWidth={2.5} />
              </div>
              <span className="h-[1.5px] w-4 bg-white/15 rounded-full" />
            </div>

            {/* Bank Squircle */}
            <div className="flex h-13 w-13 items-center justify-center rounded-[18px] bg-[#1a1a1c] border border-white/10 shadow-lg text-white/90">
              <Building2 size={22} strokeWidth={1.8} />
            </div>
          </div>

          <h2 className="text-[22px] font-bold text-white tracking-tight mt-3">
            Connect Your Bank
          </h2>
          <p className="text-[13.5px] text-white/60 mt-1.5 leading-relaxed max-w-[290px] mx-auto">
            Link your account to automatically sync balances and track daily spending with bank-grade security.
          </p>
        </motion.div>

        {/* Apple Inset Grouped List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[22px] bg-[#121214] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden shadow-xl"
        >
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3.5 p-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] shadow-sm"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${item.color} 14%, transparent)`,
                    color: item.color,
                    border: `1px solid color-mix(in srgb, ${item.color} 25%, transparent)`,
                  }}
                >
                  <Icon size={19} strokeWidth={2} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[14px] font-semibold text-white tracking-tight">
                    {item.title}
                  </p>
                  <p className="text-[12px] text-white/50 leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Privacy & Trust Inset Callout (Apple Style) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[20px] bg-[#121214]/60 border border-white/[0.06] p-4 flex items-start gap-3.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
            <EyeOff size={15} strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[13px] font-semibold text-white tracking-tight">
              Strictly Read-Only Access
            </p>
            <p className="text-[12px] text-white/50 leading-relaxed">
              Acuity cannot move funds or execute transactions. You retain full control and can disconnect anytime.
            </p>
          </div>
        </motion.div>

        {/* Discreet Regulatory Caption */}
        <p className="text-center text-[11px] text-white/35 leading-relaxed px-4 pt-1">
          Licensed open banking infrastructure powered by Mono. Protected by 256-bit bank encryption.
        </p>
      </div>

      {/* Apple-style Frosted Floating Action Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-5 pt-3.5 border-t border-white/[0.08]"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
          background: "rgba(10, 10, 12, 0.82)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="max-w-md mx-auto space-y-2">
          <button
            type="button"
            onClick={onProceed}
            disabled={isConnecting}
            className="w-full h-12 rounded-full text-[15px] font-bold tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-[rgba(222,49,33,0.35)] active:scale-[0.98] transition-all disabled:opacity-50 text-black hover:opacity-95"
            style={{
              background: "#DE3121",
              backgroundColor: "#DE3121",
              color: "#000000",
            }}
          >
            {isConnecting ? (
              <>
                <Loader2 size={16} className="animate-spin text-black" strokeWidth={2.5} />
                <span className="text-black font-bold">Connecting with Mono...</span>
              </>
            ) : (
              <>
                <span className="text-black font-bold">Connect with Mono</span>
                <ArrowRight size={16} strokeWidth={2.5} className="text-black" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={isConnecting}
            className="w-full h-9 flex items-center justify-center text-[13px] font-medium text-white/45 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
