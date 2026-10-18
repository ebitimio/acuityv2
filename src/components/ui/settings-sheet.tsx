"use client";

import { Drawer } from "vaul";
import { GlassSurface } from "./glass-surface";
import { X, LogOut, Globe, User, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  baseCurrency: string;
  onCurrencyChange: (currency: "NGN" | "USD") => void;
}

export function SettingsSheet({ isOpen, onClose, user, baseCurrency, onCurrencyChange }: SettingsSheetProps) {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
    router.refresh(); // Force a page reload to reset state
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" />
        
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[100] outline-none">
          <GlassSurface 
            tier="thick" 
            radius="36px 36px 0 0" 
            className="flex flex-col pt-3 pb-12 px-6 w-full max-w-md mx-auto max-h-[85vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-6" />

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[20px] font-semibold text-white">Settings</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[var(--brand)] to-[#0e5a2b] flex items-center justify-center text-[24px] font-bold text-white shadow-lg">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-[17px] font-semibold text-white">{user?.user_metadata?.full_name || "Acuity User"}</p>
                <p className="text-[13px] text-white/50">{user?.email}</p>
              </div>
            </div>

            {/* Preferences */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-white/60" />
                  <span className="text-[15px] text-white">Default Currency</span>
                </div>
                <div className="flex bg-[#17191A] rounded-full p-1 border border-white/5">
                  <button 
                    onClick={() => onCurrencyChange("NGN")}
                    className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${baseCurrency === "NGN" ? "bg-[var(--brand)] text-black" : "text-white/60"}`}
                  >
                    NGN
                  </button>
                  <button 
                    onClick={() => onCurrencyChange("USD")}
                    className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${baseCurrency === "USD" ? "bg-[var(--brand)] text-black" : "text-white/60"}`}
                  >
                    USD
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-white/60" />
                  <span className="text-[15px] text-white">Security & Privacy</span>
                </div>
                <span className="text-[13px] text-white/40">Standard</span>
              </div>
            </div>

            {/* Sign Out */}
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-full text-[16px] font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/20 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>

          </GlassSurface>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}