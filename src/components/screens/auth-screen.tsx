"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassSurface } from "@/components/ui/glass-surface";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup" | "otp">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  // Password strength logic
  const isPasswordStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : isPasswordStrong ? 3 : 2;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        if (!isPasswordStrong) {
          setMessage("Password must be 8+ characters, with a number and a capital letter.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMode("otp");
        setMessage("We sent a 6-digit code to your email.");
      } else if (mode === "otp") {
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
        if (error) throw error;
        // Success! Supabase onAuthStateChange will handle the redirect
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- 3D LOOPING CARD ANIMATION --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <motion.div
          animate={{ rotateX: [0, 20, 0, -20, 0], rotateY: [0, 0, 30, 0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-64 h-40 bg-gradient-to-tr from-[var(--brand)] to-[#0e5a2b] rounded-2xl shadow-2xl border border-white/20"
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        >
          <div className="absolute top-4 left-4 text-white/50 font-bold italic">VISA</div>
          <div className="absolute bottom-4 right-4 text-white/80 text-lg font-mono tracking-widest">•••• 4291</div>
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--brand)]/20 flex items-center justify-center mb-4 border border-[var(--brand)]/30">
            <span className="text-[var(--brand)] font-bold text-3xl">A</span>
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight text-center">
            {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Acuity" : "Verify Email"}
          </h1>
        </div>

        <GlassSurface tier="thick" radius={28} className="p-6">
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            
            {mode !== "otp" ? (
              <>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[var(--brand)] transition-colors">
                  <Mail size={20} className="text-white/40" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30 text-[15px]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[var(--brand)] transition-colors">
                    <Lock size={20} className="text-white/40" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30 text-[15px]"
                    />
                  </div>
                  
                  {/* Password Strength Bar */}
                  {mode === "signup" && password.length > 0 && (
                    <div className="flex gap-1 px-1">
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 1 ? "bg-[var(--danger)]" : "bg-white/10"}`} />
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 2 ? "bg-[var(--warn)]" : "bg-white/10"}`} />
                      <div className={`h-1 flex-1 rounded-full ${passwordStrength >= 3 ? "bg-[var(--brand)]" : "bg-white/10"}`} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[var(--brand)] transition-colors">
                <Lock size={20} className="text-white/40" />
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30 text-[20px] tracking-[0.5em] text-center font-mono"
                />
              </div>
            )}

            {message && (
              <p className={`text-[13px] text-center px-2 ${message.includes("sent") ? "text-[var(--brand)]" : "text-[var(--warn)]"}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-[var(--brand)] text-black rounded-full font-semibold text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 
                mode === "login" ? "Sign In" : 
                mode === "signup" ? "Create Account" : "Verify Code"}
            </button>
          </form>

          {mode !== "otp" && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[13px] text-white/40">or</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                type="button"
                className="w-full py-3.5 bg-white text-black rounded-full font-medium text-[15px] flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <div className="text-center mt-6 flex flex-col gap-2">
            {mode === "otp" ? (
              <button onClick={() => setMode("signup")} className="text-[14px] text-white/50 flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-[14px] text-[var(--brand)] font-medium"
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            )}
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}