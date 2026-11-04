"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Crown, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConnectBankScreen } from "@/components/screens/connect-bank-screen";
import { Button } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export default function MonoConnectPage() {
  const [status, setStatus] = useState<"loading" | "not_premium" | "ready">("loading");
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  useEffect(() => {
    async function checkAccess() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("tier")
          .eq("id", user.id)
          .single();

        if (!profile || profile.tier !== "premium") {
          setStatus("not_premium");
          return;
        }

        setStatus("ready");
      } catch (err) {
        console.error("Access check error:", err);
        setStatus("not_premium");
      }
    }

    checkAccess();
  }, [router, supabase]);

  const handleProceed = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/mono/create-link", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to generate Mono link");

      // Redirect to the Mono Connect account page
      window.location.href = data.url;
    } catch (e: unknown) {
      setIsConnecting(false);
      const msg = e instanceof Error ? e.message : "Failed to connect to Mono";
      toast(msg, "err");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0b0b0c] text-white">
        <Loader2 className="animate-spin text-[var(--brand)] mb-4" size={32} />
        <p className="text-[14px] text-[var(--text-2)] font-medium">
          Verifying account status...
        </p>
      </div>
    );
  }

  if (status === "not_premium") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0b0b0c] text-white px-6">
        <div className="w-full max-w-sm rounded-[24px] bg-[var(--surface-2)] border border-[var(--line-strong)] p-6 text-center space-y-5 shadow-2xl">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[var(--brand)]/10 relative">
            <Crown size={32} className="text-[var(--brand)]" />
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--brand)] text-[9px] font-black text-black">A.</span>
          </div>

          <div>
            <h2 className="text-[20px] font-bold text-white">Acuity Premium Feature</h2>
            <p className="text-[13px] text-[var(--text-2)] mt-2 leading-relaxed">
              Automated bank connection via Mono is available exclusively on <strong className="text-white">Acuity Premium</strong>. Upgrade your account to automatically sync balances and track real-time spending.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={() => {
                toast("Payment gateway coming soon!");
              }}
              className="w-full h-12 text-[15px] font-bold"
            >
              Upgrade for ₦2,500 / month
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center gap-1.5 text-[13px]"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ConnectBankScreen
      onBack={() => router.push("/")}
      onProceed={handleProceed}
      isConnecting={isConnecting}
    />
  );
}
