"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Password updated successfully. Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setMessage(err.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0b0b0c] px-6">
      <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-[#121213] p-8 shadow-2xl">
        <h1 className="text-[22px] font-bold text-white mb-2 text-center">Reset Password</h1>
        <p className="text-[13px] text-white/50 mb-6 text-center">Enter your new password below.</p>
        
        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              className="w-full h-14 rounded-2xl border border-white/10 bg-[#0b0b0c] pl-12 pr-4 text-[15px] text-white outline-none focus:border-[#DE3121]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl font-bold text-[15px] text-black flex items-center justify-center gap-2"
            style={{ backgroundColor: "#DE3121" }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-[13px] text-[#DE3121]">{message}</p>}
      </div>
    </div>
  );
}