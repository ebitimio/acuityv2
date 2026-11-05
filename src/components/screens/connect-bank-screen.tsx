"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ArrowRight,
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
    <div className="fixed inset-0 z-[100] h-[100dvh] max-h-[100dvh] bg-[#050507] text-white overflow-hidden flex flex-col justify-between selection:bg-[var(--brand)] selection:text-white">
      {/* Top Ambient Glow Halo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none blur-[90px] opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(222,49,33,0.25) 0%, rgba(152,197,185,0.1) 50%, transparent 80%)",
        }}
      />

      {/* Top Header Bar with Acuity Branding */}
      <div className="relative z-30 flex items-center justify-between px-6 pt-5 pb-1 shrink-0">
        {/* Frosted Circular Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isConnecting}
          aria-label="Go back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/90 hover:text-white active:scale-95 transition-all shadow-sm disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft size={19} strokeWidth={2.4} />
        </button>

        {/* Center Acuity Wordmark */}
        <div className="flex items-baseline select-none">
          <span className="text-[18px] font-black tracking-tight text-white">ACUITY</span>
          <span className="text-[18px] font-black tracking-tight text-[var(--brand)]">.</span>
        </div>

        {/* Step Flow Indicators (Left pill active white, Right pill muted) */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1 w-5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
          <span className="h-1 w-5 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Main Content Area (Fitted Proportionally - Zero Scroll) */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-5 py-0 min-h-0">
        {/* 3D Volumetric Metallic Gyroscope Hero with Embossed Acuity "A." Medallion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-center shrink-0"
        >
          <MetallicGyroscope />
        </motion.div>

        {/* Branded Pill Tag */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-0.5 shrink-0"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white shadow-sm backdrop-blur-md">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--brand)] text-[8px] font-black text-black">
              A.
            </span>
            <span className="text-[9.5px] font-bold tracking-wider text-white uppercase">
              ACUITY. DIRECT BANK SYNC
            </span>
          </div>
        </motion.div>

        {/* Headline Typography with Acuity Wordmark & Soft Mint Accent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mt-2 mb-3 shrink-0"
        >
          <h1 className="text-[22px] sm:text-[25px] font-bold text-white tracking-tight leading-[1.16]">
            Connect your bank to <span className="font-black text-white">ACUITY<span className="text-[var(--brand)]">.</span></span>
            <br />
            <span className="text-[#98c5b9] bg-gradient-to-r from-[#98c5b9] via-[#cbf2e7] to-[#7ebba9] bg-clip-text text-transparent font-medium text-[15px] sm:text-[17px]">
              fuel your financial intelligence
            </span>
          </h1>
        </motion.div>

        {/* Explainer Feature Card (Compact Fitted Glass Container) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="w-full shrink-0"
        >
          <div className="rounded-[22px] bg-[#111114]/90 border border-white/[0.08] p-3.5 sm:p-4 space-y-3 shadow-2xl backdrop-blur-xl">
            {/* Item 1: Direct Bank Integration */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 shadow-sm mt-0.5"
                style={{
                  background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #cbd5e1 45%, #475569 85%, #0f172a 100%)",
                }}
              >
                <Landmark size={15} className="text-black" strokeWidth={2.4} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[13px] font-bold text-white tracking-tight">
                  Direct Institutional Link
                </p>
                <p className="text-[11.5px] text-white/55 leading-snug">
                  Authenticate with GTBank, Zenith, Access, Kuda, OPay & 20+ institutions via Mono.
                </p>
              </div>
            </div>

            {/* Item 2: Strictly Read-Only Encryption */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 shadow-sm mt-0.5"
                style={{
                  background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #cbd5e1 45%, #475569 85%, #0f172a 100%)",
                }}
              >
                <ShieldCheck size={15} className="text-black" strokeWidth={2.4} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[13px] font-bold text-white tracking-tight">
                  Strictly Read-Only & 256-Bit TLS
                </p>
                <p className="text-[11.5px] text-white/55 leading-snug">
                  Acuity never sees or stores passwords or PINs. Protected by 256-bit bank encryption.
                </p>
              </div>
            </div>

            {/* Item 3: Autonomous Acuity CFO Engine */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 shadow-sm mt-0.5"
                style={{
                  background: "radial-gradient(circle at 32% 32%, #ffffff 0%, #cbd5e1 45%, #475569 85%, #0f172a 100%)",
                }}
              >
                <div className="flex items-baseline tracking-tighter">
                  <span className="text-[12px] font-black text-black leading-none">A</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-[var(--brand)] ml-0.5" />
                </div>
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[13px] font-bold text-white tracking-tight">
                  Autonomous Acuity CFO Engine
                </p>
                <p className="text-[11.5px] text-white/55 leading-snug">
                  Balances stream into live Safe-to-Spend limits, runway alerts, and AI CFO advice.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Action Area (Always Visible - No Scroll) */}
      <div className="relative z-30 max-w-md mx-auto w-full px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+14px)] pb-4 space-y-2 shrink-0">
        {/* High-Contrast Pristine White Action Button */}
        <button
          type="button"
          onClick={onProceed}
          disabled={isConnecting}
          className="w-full h-12 rounded-full text-[14.5px] font-bold tracking-tight flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xl bg-white hover:bg-white/95 text-black disabled:opacity-60 cursor-pointer"
        >
          {isConnecting ? (
            <>
              <Loader2 size={17} className="animate-spin text-black" strokeWidth={2.5} />
              <span>Connecting with Mono...</span>
            </>
          ) : (
            <>
              <span>Connect with Mono</span>
              <ArrowRight size={16} strokeWidth={2.5} className="text-black" />
            </>
          )}
        </button>

        {/* Disclaimer with Underlined Terms Link */}
        <p className="text-center text-[11px] text-white/45 leading-relaxed">
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
