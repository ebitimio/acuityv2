"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";
import { spring } from "@/lib/motion";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const isStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        if (!isStrong) throw new Error("Password must be 8+ characters, with a number and a capital letter.");
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMode("otp");
        setMessage("Check your email for the 6-digit code.");
      } else {
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
        if (error) throw error;
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
    setLoading(false);
  };

  return (
    <div
      className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background: "var(--bg)",
        paddingTop: "calc(env(safe-area-inset-top) + 16px)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
      }}
    >
      {/* Faint teal ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: "-20%",
          right: "-20%",
          width: "80vmax",
          height: "80vmax",
          background:
            "radial-gradient(closest-side, var(--brand-soft), transparent 70%)",
        }}
      />

      {/* Floating neutral glass tiles */}
      <div className="relative z-10 mb-6 flex h-[140px] w-full shrink-0 items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: -10, x: -22, y: 8 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute"
        >
          <GlassSurface
            tier="thick"
            radius={22}
            className="h-[120px] w-[180px]"
          />
        </motion.div>
        <motion.div
          animate={{ rotate: 6, x: 22, y: -8 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute"
        >
          <GlassSurface
            tier="regular"
            radius={22}
            className="h-[120px] w-[180px]"
          />
        </motion.div>
      </div>

      {/* Wordmark */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring.soft, delay: 0.1 }}
        className="relative z-10 shrink-0 font-black"
        style={{
          fontSize: "clamp(36px, 12vw, 56px)",
          lineHeight: 1,
          letterSpacing: "-0.045em",
          fontWeight: 900,
          color: "var(--text-1)",
        }}
      >
        ACUITY
      </motion.h1>

      {/* Subtitle */}
      <div className="relative z-10 mt-2 mb-4 flex shrink-0 flex-col items-center">
        <h2 className="text-center text-[18px] font-bold text-[var(--text-1)]">
          {mode === "login" ? "Welcome back." : mode === "signup" ? "Create Acuity." : "Verify Email."}
        </h2>
        <p className="mt-1 text-center text-[12px] text-[var(--text-2)]">
          {mode === "login" ? "Sign in to access your AI wealth manager." : "Start tracking your finances today."}
        </p>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.smooth, delay: 0.2 }}
        className="relative z-10 w-full max-w-[340px] shrink-0"
      >
        <GlassSurface tier="thick" radius={24} className="p-4">
          <form onSubmit={submit} className="flex flex-col gap-2.5">
            {mode !== "otp" ? (
              <>
                <label className="field">
                  <Mail size={18} className="shrink-0 text-[var(--text-3)]" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  <Lock size={18} className="shrink-0 text-[var(--text-3)]" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                {mode === "signup" && password.length > 0 && (
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full ${password.length >= 1 ? "bg-[var(--danger)]" : "bg-[var(--fill-2)]"}`} />
                    <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? "bg-[var(--warn)]" : "bg-[var(--fill-2)]"}`} />
                    <div className={`h-1 flex-1 rounded-full ${isStrong ? "bg-[var(--gain)]" : "bg-[var(--fill-2)]"}`} />
                  </div>
                )}
              </>
            ) : (
              <label className="field">
                <Lock size={18} className="shrink-0 text-[var(--text-3)]" />
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center font-mono tracking-[0.4em]"
                />
              </label>
            )}

            {message && (
              <p
                className={`text-center text-[11px] ${
                  message.includes("Check") ? "text-[var(--gain)]" : "text-[var(--warn)]"
                }`}
              >
                {message}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
              className="btn btn-primary mt-1 !h-[46px] !text-[14px]"
            >
              {loading ? "₦" : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Verify Code"}
            </motion.button>
          </form>

          {mode !== "otp" && (
            <>
              <div className="my-2.5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--line)]" />
                <span className="text-[10px] text-[var(--text-3)]">or</span>
                <div className="h-px flex-1 bg-[var(--line)]" />
              </div>
              <motion.button
                onClick={google}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                transition={spring.snappy}
                className="w-full rounded-full border border-[var(--line)] bg-[var(--fill-1)] py-2.5 text-[13px] font-medium text-[var(--text-1)] flex items-center justify-center gap-2 hover:bg-[var(--fill-2)] transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </motion.button>
            </>
          )}

          <div className="mt-2.5 text-center">
            {mode === "otp" ? (
              <button
                onClick={() => setMode("signup")}
                className="mx-auto flex items-center justify-center gap-1 text-[11px] text-[var(--text-3)]"
              >
                <ArrowLeft size={11} /> Back
              </button>
            ) : (
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-[11px] text-[var(--text-3)]"
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            )}
          </div>
        </GlassSurface>
      </motion.div>
    </div>
  );
}
