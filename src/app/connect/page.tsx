"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function MonoRedirect() {
  const [error, setError] = useState("");

  useEffect(() => {
    const getLink = async () => {
      try {
        const res = await fetch("/api/mono/create-link", { method: "POST" });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to generate link");
        
        // Redirect to the Mono URL
        window.location.href = data.url;
      } catch (e: any) {
        setError(e.message);
      }
    };
    
    getLink();
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0b0b0c] text-white">
      {error ? (
        <div className="text-center px-6">
          <p className="text-[var(--danger)] font-bold mb-2">Connection Failed</p>
          <p className="text-[14px] text-[var(--text-2)]">{error}</p>
        </div>
      ) : (
        <>
          <Loader2 className="animate-spin text-[var(--brand)] mb-4" size={32} />
          <p className="text-[15px] font-medium">Redirecting to Mono...</p>
        </>
      )}
    </div>
  );
}a