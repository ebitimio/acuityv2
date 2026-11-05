"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ArrowRight,
  ArrowDown,
  Loader2,
  ShieldCheck,
  Lock,
  Landmark,
  CheckCircle2,
  X,
} from "lucide-react";
import { MetallicGyroscope } from "@/components/ui/metallic-gyroscope";

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
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] min-h-[100dvh] bg-[#050507] text-white overflow-y-auto overflow-x-hidden selection:bg-[var(--brand)] selection:text-white flex flex-col justify-between">
      {/* Top Ambient Glow Halo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[360px] h-[360px] rounded-full pointer-events-none blur-[95px] opacity-45"
        style={{
          background: "radial-gradient(circle, rgba(222,49,33,0.28) 0%, rgba(152,197,185,0.1) 50%, transparent 80%)",
        }}
      />

      {/* Top Header Bar with Acuity Branding */}
      <div className="relative z-30 flex items-center justify-between px-6 pt-6 pb-2">
        {/* Frosted Circular Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isConnecting}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/90 hover:text-white active:scale-95 transition-all shadow-sm disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>

        {/* Center Acuity Wordmark */}
        <div className="flex items-baseline select-none">
          <span className="text-[19px] font-black tracking-tight text-white">ACUITY</span>
          <span className="text-[19px] font-black tracking-tight text-[var(--brand)]">.</span>
        </div>

        {/* Step Flow Indicators (Left pill active white, Right pill muted) */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1 w-6 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          <span className="h-1 w-6 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-5 py-2">
        {/* 3D Volumetric Metallic Gyroscope Hero with Embossed Acuity "A." Medallion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-center"
        >
          <MetallicGyroscope />
        </motion.div>

        {/* Branded Pill Tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-1"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white shadow-sm backdrop-blur-md">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand)] text-[8.5px] font-black text-black">
              A.
            </span>
            <span className="text-[10px] font-bold tracking-wider text-white uppercase">
              ACUITY. DIRECT BANK SYNC
            </span>
          </div>
        </motion.div>

        {/* Headline Typography with Acuity Wordmark & Soft Mint Accent */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mt-3 mb-5"
        >
          <h1 className="text-[26px] sm:text-[30px] font-bold text-white tracking-tight leading-[1.18]">
            Connect your bank to <span className="font-black text-white">ACUITY<span className="text-[var(--brand)]">.</span></span>
            <br />
            <span className="text-[#98c5b9] bg-gradient-to-r from-[#98c5b9] via-[#cbf2e7] to-[#7ebba9] bg-clip-text text-transparent font-medium">
              fuel your financial intelligence
            </span>
          </h1>
        </motion.div>

        {/* Explainer Feature Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative"
        >
          <div className="rounded-[24px] bg-[#111114]/90 border border-white/[0.08] p-4.5 sm:p-5 space-y-4 shadow-2xl backdrop-blur-xl">
            {/* Item 1: Direct Bank Integration */}
            <div className="flex items-start gap-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 shadow-md mt-0.5"
                style={{
                  background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #cbd5e1 45%, #475569 85%, #0f172a 100%)",
                }}
              >
                <Landmark size={18} className="text-black" strokeWidth={2.3} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[14px] font-bold text-white tracking-tight">
                  Direct Institutional Link
                </p>
                <p className="text-[12px] text-white/55 leading-relaxed">
                  Authenticate with GTBank, Zenith, Access, Kuda, OPay & 20+ institutions via Mono's official portal.
                </p>
              </div>
            </div>

            {/* Item 2: Strictly Read-Only Encryption */}
            <div className="flex items-start gap-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 shadow-md mt-0.5"
                style={{
                  background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #cbd5e1 45%, #475569 85%, #0f172a 100%)",
                }}
              >
                <ShieldCheck size={18} className="text-black" strokeWidth={2.3} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[14px] font-bold text-white tracking-tight">
                  Strictly Read-Only & 256-Bit TLS
                </p>
                <p className="text-[12px] text-white/55 leading-relaxed">
                  Acuity never sees or stores your banking passwords or PIN. Protected by 256-bit bank encryption.
                </p>
              </div>
            </div>

            {/* Item 3: Autonomous Acuity CFO Engine */}
            <div className="flex items-start gap-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 shadow-md mt-0.5"
                style={{
                  background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #cbd5e1 45%, #475569 85%, #0f172a 100%)",
                }}
              >
                {/* Acuity Signature Monogram Inside Badge */}
                <div className="flex items-baseline tracking-tighter">
                  <span className="text-[14px] font-black text-black leading-none">A</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-[var(--brand)] ml-0.5" />
                </div>
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[14px] font-bold text-white tracking-tight">
                  Autonomous Acuity CFO Engine
                </p>
                <p className="text-[12px] text-white/55 leading-relaxed">
                  Balances stream automatically to keep daily Safe-to-Spend limits, runway alerts, and AI CFO advice live.
                </p>
              </div>
            </div>
          </div>

          {/* Subtly Floating Down Arrow Circle */}
          <div className="flex justify-center -mt-3.5 relative z-10">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#18181b] border border-white/[0.12] text-white/60 shadow-lg backdrop-blur-md">
              <ArrowDown size={13} strokeWidth={2.4} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Action Area */}
      <div className="relative z-30 max-w-md mx-auto w-full px-5 pt-3 pb-8 space-y-3">
        {/* High-Contrast Pristine White Action Button */}
        <button
          type="button"
          onClick={onProceed}
          disabled={isConnecting}
          className="w-full h-13 rounded-full text-[15px] font-bold tracking-tight flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-2xl bg-white hover:bg-white/95 text-black disabled:opacity-60 cursor-pointer"
        >
          {isConnecting ? (
            <>
              <Loader2 size={18} className="animate-spin text-black" strokeWidth={2.5} />
              <span>Connecting with Mono...</span>
            </>
          ) : (
            <>
              <span>Connect with Mono</span>
              <ArrowRight size={17} strokeWidth={2.5} className="text-black" />
            </>
          )}
        </button>

        {/* Disclaimer with Underlined Terms Link */}
        <p className="text-center text-[11.5px] text-white/45 leading-relaxed">
          By proceeding, you agree to our{" "}
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="text-white/80 underline underline-offset-2 hover:text-white transition-colors cursor-pointer"
          >
            terms and conditions
          </button>
        </p>
      </div>

      {/* Interactive Terms & Security Sheet / Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-[26px] bg-[#121215] border border-white/10 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-[var(--brand)]" />
                  <h3 className="text-[16px] font-bold text-white">Bank Sync Terms & Security</h3>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-[12.5px] text-white/70 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Licensed Open Banking Partner</strong>
                    All bank integrations are facilitated securely via Mono Technologies, an open banking provider operating under CBN-compliant financial data protocols.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Strictly Read-Only Access</strong>
                    Acuity only reads financial account balances and transaction histories. Acuity has zero ability to initiate transfers, withdrawals, or modify your banking funds.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Zero Credential Storage</strong>
                    Your banking usernames, passwords, hardware tokens, and PINs are handled exclusively by your bank and are never accessible, transmitted to, or stored on Acuity servers.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Instant Revocation Anytime</strong>
                    You retain 100% control over your data. You may unlink any connected bank account at any time with a single tap from the Accounts dashboard.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-full h-11 rounded-full bg-white text-black font-bold text-[14px] hover:bg-white/90 active:scale-95 transition-all cursor-pointer"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
