"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function MonoRedirect() {
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;
    if (!publicKey) return;

    // Construct the Mono Hosted Connect URL
    // We point the redirect_url back to our callback page
    const redirectUrl = `${window.location.origin}/connect/callback`;
    const monoUrl = `https://connect.withmono.com/?key=${publicKey}&redirect_url=${encodeURIComponent(redirectUrl)}`;

    // Redirect the whole window
    window.location.href = monoUrl;
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0b0b0c] text-white">
      <Loader2 className="animate-spin text-[var(--brand)] mb-4" size={32} />
      <p className="text-[15px] font-medium">Redirecting to Mono...</p>
    </div>
  );
}