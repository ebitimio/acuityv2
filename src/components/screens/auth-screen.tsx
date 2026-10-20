"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const supabase = createClient();
  const toast = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please fill in all fields", "err");
      return;
    }
    setIsLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast("Check your email to confirm your account");
      }
    } catch (err: any) {
      toast(err.message || "Authentication failed", "err");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast(err.message || "Google sign-in failed", "err");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0b0b0c] px-6 py-12 relative overflow-hidden">
      
      {/* The Black Card with Logo and Welcome Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm rounded-[32px] border border-white/10 bg-[#121213] p-8 shadow-2xl flex flex-col items-center text-center mb-8 relative"
      >
        {/* Logo inside the card */}
        <div className="flex items-baseline mb-2">
          <span className="text-[36px] font-black tracking-tighter text-white">ACUITY</span>
          <span className="text-[36px] font-black tracking-tighter" style={{ color: "#DE3121" }}>.</span>
        </div>
        
        <h1 className="text-[18px] font-semibold text-white mb-1">Welcome back.</h1>
        <p className="text-[13px] text-[var(--text-3)]">Sign in to access your AI wealth manager.</p>
      </motion.div>

      {/* Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full max-w-sm rounded-[32px] border border-white/10 bg-[#121213] p-6 shadow-2xl"
      >
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full h-14 rounded-2xl border border-white/10 bg-[#0b0b0c] pl-12 pr-4 text-[15px] text-white placeholder:text-[var(--text-3)] focus:border-[#DE3121] outline-none"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-14 rounded-2xl border border-white/10 bg-[#0b0b0c] pl-12 pr-4 text-[15px] text-white placeholder:text-[var(--text-3)] focus:border-[#DE3121] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl font-bold text-[15px] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#DE3121", color: "#0b0b0c" }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative bg-[#121213] px-3 text-[12px] text-[var(--text-3)]">or</span>
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading}
          className="w-full h-14 rounded-2xl border border-white/10 bg-[#0b0b0c] font-semibold text-[15px] text-white transition-colors hover:bg-white/5 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isGoogleLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-[13px] text-[var(--text-3)] hover:text-white transition-colors"
          >
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span className="font-semibold text-[var(--text-1)] underline decoration-white/20 underline-offset-4" style={{ color: "#DE3121" }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}