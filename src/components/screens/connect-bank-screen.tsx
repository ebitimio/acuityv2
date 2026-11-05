"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Crown,
  Zap,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { MetallicGyroscope } from "@/components/ui/metallic-gyroscope";
import { AcuityCompanion } from "@/components/ui/acuity-companion";

interface ConnectBankScreenProps {
  onBack: () => void;
  onProceed: () => void;
  isConnecting?: boolean;
  userTier?: "premium" | "basic" | null;
}

export function ConnectBankScreen({
  onBack,
  onProceed,
  isConnecting = false,
  userTier = null,
}: ConnectBankScreenProps) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [currentTier, setCurrentTier] = useState<"premium" | "basic">(userTier || "basic");
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync prop changes
  useEffect(() => {
    if (userTier) {
      setCurrentTier(userTier);
    }
  }, [userTier]);

  // Load current user tier from database
  useEffect(() => {
    async function fetchTier() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("tier")
          .eq("id", user.id)
          .single();

        if (profile?.tier) {
          setCurrentTier(profile.tier as "premium" | "basic");
        }
      } catch {
        // Fallback to basic
      }
    }

    fetchTier();
  }, []);

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (showSubscriptionModal || showTermsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSubscriptionModal, showTermsModal]);

  // Primary action button handler:
  // - If premium: proceed to Mono
  // - If basic: display the Acuity Premium subscription pop-up immediately
  const handleConnectClick = () => {
    // If connecting is already active, ignore extra taps
    if (isConnecting) return;

    // Check currently known tier
    if (currentTier === "premium") {
      onProceed();
      return;
    }

    // Basic user: open the Acuity Premium subscription modal instantly!
    setShowSubscriptionModal(true);
  };

  // Handler when user taps Upgrade: notifies user that payment gateway is coming soon
  const handleUpgradeToPremium = () => {
    setShowSubscriptionModal(false);
    toast("Payment gateway coming soon! Subscriptions are launching shortly.", "ok");
  };

  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] max-h-[100dvh] bg-[#050507] text-white overflow-hidden flex flex-col justify-between selection:bg-[var(--brand)] selection:text-white">
      {/* Top Header Bar (Safe Area Positioned - Crystal Clear, Never Faded) */}
      <header
        className="relative z-30 flex items-center justify-between px-6 pb-2 shrink-0"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 44px) + 12px)",
        }}
      >
        {/* High-Contrast Frosted Circular Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isConnecting}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 text-white active:scale-95 transition-all shadow-md disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        {/* Center: Clean & Unobstructed (Matching the Grey Reference - No Dynamic Island Collisions) */}
        <div className="flex-1" />

        {/* Step Flow Indicators (Left pill active white, Right pill muted) */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-6 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
          <span className="h-1.5 w-6 rounded-full bg-white/25" />
        </div>
      </header>

      {/* Main Content Area (Fitted Proportionally - Zero Scroll) */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-5 py-0 min-h-0">
        {/* 1:1 Reference 3D Gyroscope with Embossed Acuity "A." Bullion Medallion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-center shrink-0"
        >
          <MetallicGyroscope />
        </motion.div>

        {/* Branded Category Pill Tag */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-1 shrink-0"
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

        {/* Headline Typography (Matching the Grey Reference with Mint Gradient) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mt-2.5 mb-3 shrink-0"
        >
          <h1 className="text-[23px] sm:text-[26px] font-bold text-white tracking-tight leading-[1.16]">
            Connect your bank to <span className="font-black text-white">ACUITY<span className="text-[var(--brand)]">.</span></span>
            <br />
            <span className="text-[#98c5b9] bg-gradient-to-r from-[#98c5b9] via-[#cbf2e7] to-[#7ebba9] bg-clip-text text-transparent font-medium text-[15px] sm:text-[17px]">
              fuel your financial intelligence
            </span>
          </h1>
        </motion.div>

        {/* Explainer Feature Card (Compact Inset Container - 100% Fits Screen) */}
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

      {/* Bottom Sticky Action Area (Always Visible - No Scroll) */}
      <div className="relative z-30 max-w-md mx-auto w-full px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+14px)] pb-4 space-y-2 shrink-0">
        {/* High-Contrast Pristine White Action Button */}
        <button
          type="button"
          onClick={handleConnectClick}
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

      {/* ============================================================== */}
      {/* ACUITY PREMIUM SUBSCRIPTION POP-UP (Teleported to Document.body)*/}
      {/* ============================================================== */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showSubscriptionModal && (
            <div
              key="sub-modal-backdrop"
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
              onClick={() => setShowSubscriptionModal(false)}
            >
              <motion.div
                key="sub-modal-card"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-[32px] bg-[#111114] border border-white/15 p-6 shadow-2xl relative overflow-hidden text-center space-y-4"
              >
                {/* Radiant Ambient Ember Glow */}
                <div
                  className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none blur-[65px] opacity-40"
                  style={{
                    background: "radial-gradient(circle, rgba(222,49,33,0.45) 0%, transparent 70%)",
                  }}
                />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(false)}
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/70 hover:text-white transition-all cursor-pointer"
                  aria-label="Close subscription modal"
                >
                  <X size={16} />
                </button>

                {/* Living Acuity Mascot Centerpiece */}
                <div className="relative pt-2 flex flex-col items-center">
                  <div className="relative">
                    <AcuityCompanion size="compact" hasCap={true} isSpeaking={true} />
                  </div>

                  {/* Symmetrical Luxury Crown Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white shadow-sm mt-3">
                    <Crown size={12} className="text-[#f59e0b]" />
                    <span className="text-[10px] font-black tracking-wider uppercase">
                      ACUITY. PREMIER
                    </span>
                  </div>
                </div>

                {/* Headline & Value Proposition */}
                <div>
                  <h2 className="text-[20px] font-bold text-white tracking-tight leading-snug">
                    Unlock Automated Bank Sync
                  </h2>
                  <p className="text-[12px] text-white/60 mt-1 leading-relaxed px-2">
                    Live multi-bank integration is an institutional feature exclusive to{" "}
                    <strong className="text-white">Acuity Premium</strong>.
                  </p>
                </div>

                {/* Benefits Group */}
                <div className="rounded-[18px] bg-white/[0.04] border border-white/[0.08] p-3 text-left space-y-2">
                  <div className="flex items-center gap-2.5 text-[11.5px] text-white/85">
                    <Zap size={13} className="text-[var(--brand)] shrink-0" />
                    <span>Real-time balance feeds for 20+ Nigerian banks</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11.5px] text-white/85">
                    <ShieldCheck size={13} className="text-[#52c28a] shrink-0" />
                    <span>Strictly read-only 256-bit bank encryption</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11.5px] text-white/85">
                    <Sparkles size={13} className="text-[#e8a23b] shrink-0" />
                    <span>Autonomous daily Safe-to-Spend & AI CFO advice</span>
                  </div>
                </div>

                {/* Pricing Box */}
                <div className="rounded-[18px] bg-white/[0.06] border border-[var(--brand)]/40 p-3 flex items-center justify-between text-left">
                  <div>
                    <span className="text-[13px] font-bold text-white block">Monthly Access</span>
                    <span className="text-[10.5px] text-white/50">Cancel anytime with 1 tap</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[17px] font-black text-white">₦2,500</span>
                    <span className="text-[10.5px] text-white/50"> / mo</span>
                  </div>
                </div>

                {/* Upgrade Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleUpgradeToPremium}
                    className="w-full h-11 rounded-full bg-white hover:bg-white/95 text-black font-bold text-[14px] flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Upgrade to Premium • ₦2,500/mo</span>
                    <ArrowRight size={15} strokeWidth={2.5} className="text-black" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSubscriptionModal(false)}
                    className="w-full py-1 text-center text-[12px] font-medium text-white/45 hover:text-white transition-colors cursor-pointer"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Interactive Terms & Security Sheet / Modal (Teleported to Document.body) */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showTermsModal && (
            <div
              key="terms-modal-backdrop"
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
              onClick={() => setShowTermsModal(false)}
            >
              <motion.div
                key="terms-modal-card"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
