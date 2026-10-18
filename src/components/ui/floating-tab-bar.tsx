"use client";

import { motion } from "framer-motion";
import { Home, PieChart, Wallet, Sparkles, Plus } from "lucide-react";
import { GlassSurface } from "./glass-surface";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "analytics", label: "Analytics", icon: PieChart },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "advisor", label: "", icon: Sparkles },
];

interface FloatingTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAddClick: () => void;
  onAdvisorClick: () => void;
  isHidden: boolean;
}

export function FloatingTabBar({ activeTab, onTabChange, onAddClick, onAdvisorClick, isHidden }: FloatingTabBarProps) {
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (tabId === "advisor") onAdvisorClick();
  };

  return (
    <motion.div 
      initial={{ y: 0 }}
      animate={{ y: isHidden ? 120 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center px-4 pb-6 pt-2 pointer-events-none"
    >
      <div className="flex items-center justify-between gap-3 w-full max-w-[420px] pointer-events-auto">
        
        <GlassSurface
          tier="regular"
          className="flex flex-1 items-center justify-between p-1.5 h-[64px]"
          rim={true}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center h-full rounded-full transition-colors cursor-pointer",
                  isActive ? "text-white" : "text-white/50 hover:text-white/80"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-lens"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: "spring", stiffness: 520, damping: 38 }}
                  />
                )}
                
                {tab.id === "advisor" ? (
                  <motion.div 
                    animate={{ 
                      background: [
                        "conic-gradient(from 0deg, #7a0e0e, #e87a1a, #ffb347, #7a0e0e)",
                        "conic-gradient(from 360deg, #7a0e0e, #e87a1a, #ffb347, #7a0e0e)"
                      ] 
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-full p-[1.5px] flex items-center justify-center relative z-10"
                  >
                    <div className="w-full h-full rounded-full bg-[#0E0F10] flex items-center justify-center">
                      <Icon size={20} strokeWidth={2.5} className="text-white" />
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10 mb-1" />
                    <span className="text-[11px] font-medium relative z-10">
                      {tab.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </GlassSurface>

        <button 
          type="button"
          onClick={onAddClick}
          className="h-[64px] w-[64px] shrink-0 active:scale-95 transition-transform cursor-pointer"
        >
          <GlassSurface
            tier="regular"
            className="flex h-full w-full items-center justify-center text-white hover:bg-white/10"
            rim={true}
          >
            <Plus size={28} strokeWidth={2} />
          </GlassSurface>
        </button>

      </div>
    </motion.div>
  );
}