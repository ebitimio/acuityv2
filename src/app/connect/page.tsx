"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Crown, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConnectBankScreen } from "@/components/screens/connect-bank-screen";
import { Button } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export default function MonoConnectPage() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
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

        setStatus("ready");
      } catch (err) {
        console.error("Access check error:", err);
        router.replace("/");
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

  return (
    <ConnectBankScreen
      onBack={() => router.push("/")}
      onProceed={handleProceed}
      isConnecting={isConnecting}
    />
  );
}
