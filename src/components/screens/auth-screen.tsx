"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, Button } from "@/components/ui/form";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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
      className="w-full min-h-screen flex flex-col items-center justify-start px-6 relative overflow-y-auto"
      style={{
        background: "linear-gradient(160deg, #7a0e0e 0%, #b3391f 35%, #e87a1a 75%, #ffb347 100%)",
        backgroundAttachment: "fixed",
        minHeight: "100dvh",
        paddingTop: "calc(env(safe-area-inset-top) + 32px)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 32px)",
        margin: 0,
      }}
    >
      <div className="relative w-full h-[200px] flex items-center justify-center pointer-events-none shrink-0">
        <motion.div
          animate={{ rotate: -12, x: -25, y: 10 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-4 w-64 h-40 bg-gradient-to-tr from-[#2a0a0a] to-[#4a0e0e] rounded-3xl border border-white/10 shadow-2xl"
        />
        <motion.div
          animate={{ rotate: 8, x: 25, y: -10 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-0 w-64 h-40 bg-gradient-to-tr from-[#5a1a1a] to-[#8b1a1a] rounded-3xl border border-white/20 shadow-2xl z-10 overflow-hidden"
        >
          <div className="absolute top-5 left-5 text-white/80 font-bold italic text-sm z-10">VISA</div>
          <div className="absolute bottom-8 left-5 text-white/90 font-mono text-base tracking-widest z-10">
            •••• 4291
          </div>
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
        className="text-black font-black mt-2 mb-2 shrink-0"
        style={{
          fontSize: "clamp(40px, 12vw, 64px)",
          lineHeight: 1,
          letterSpacing: "-0.045em",
          fontWeight: 900,
        }}
      >
        ACUITY
      </motion.h1>

      <div className="w-full max-w-[340px] mt-4 shrink-0">
        <div className="flex flex-col items-center mb-5">
          <h2 className="text-[22px] font-bold text-white text-center">
            {mode === "login" ? "Welcome back." : mode === "signup" ? "Create Acuity." : "Verify Email."}
          </h2>
          <p className="text-[13px] text-white/80 mt-1 text-center">
            {mode === "login" ? "Sign in to access your AI wealth manager." : "Start tracking your finances today."}
          </p>
        </div>

        <div className="bg-black/70 backdrop-blur-2xl border border-white/15 rounded-3xl p-5">
          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode !== "otp" ? (
              <>
                <Field
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Field
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {mode === "signup" && password.length > 0 && (
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full ${password.length >= 1 ? "bg-[var(--danger)]" : "bg-white/10"}`} />
                    <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? "bg-[var(--warn)]" : "bg-white/10"}`} />
                    <div className={`h-1 flex-1 rounded-full ${isStrong ? "bg-[var(--gain)]" : "bg-white/10"}`} />
                  </div>
                )}
              </>
            ) : (
              <Field
                icon={Lock}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center font-mono tracking-[0.4em]"
              />
            )}

            {message && (
              <p className={`text-[12px] text-center ${message.includes("Check") ? "text-[var(--gain)]" : "text-[var(--warn)]"}`}>
                {message}
              </p>
            )}

            <Button loading={loading} type="submit">
              {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Verify Code"}
            </Button>
          </form>

          {mode !== "otp" && (
            <>
              <div className="flex items-center gap-4 my-3">
                <div className="h-px bg-white/15 flex-1" />
                <span className="text-[11px] text-white/50">or</span>
                <div className="h-px bg-white/15 flex-1" />
              </div>
              <button
                onClick={google}
                disabled={loading}
                className="w-full py-3 bg-white/10 border border-white/15 text-white rounded-full font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="text-center mt-3">
            {mode === "otp" ? (
              <button
                onClick={() => setMode("signup")}
                className="text-[12px] text-white/60 flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft size={12} /> Back
              </button>
            ) : (
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-[12px] text-white/60"
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}