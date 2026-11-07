"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Crown, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ConnectBankScreen } from "@/components/screens/connect-bank-screen";
import { Button } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import Connect from "@mono.co/connect.js";

export default function MonoConnectPage() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [userTier, setUserTier] = useState<"premium" | "basic">("basic");
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

        if (profile?.tier) {
          setUserTier(profile.tier as "premium" | "basic");
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first");

      const publicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;
      if (!publicKey) throw new Error("Mono is not configured");

      const connect = new Connect({
        key: publicKey,
        scope: "auth",
        data: {
          customer: {
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            email: user.email,
          },
        },
        onSuccess: async (data: any) => {
          try {
            const { data: ws } = await supabase.from("workspaces").select("id").limit(1).single();
            if (ws?.id) {
              await fetch("/api/mono/exchange", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  code: data.code,
                  customName: "Linked Bank Account",
                  workspaceId: ws.id,
                  accountType: "checking",
                }),
              });
            }
            toast("Bank connected successfully!");
            router.push("/");
          } catch (e: any) {
            toast(e.message || "Failed to link bank", "err");
          } finally {
            setIsConnecting(false);
          }
        },
        onClose: () => {
          setIsConnecting(false);
        },
      });

      connect.setup();
      connect.open();
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
      userTier={userTier}
    />
  );
}
