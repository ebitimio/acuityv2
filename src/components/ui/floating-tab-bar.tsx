"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, PieChart, Wallet, Sparkles, Plus } from "lucide-react";
import { GlassSurface } from "./glass-surface";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "analytics", label: "Analytics", icon: PieChart },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "advisor", label: "Advisor", icon: Sparkles },
];

interface FloatingTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAddClick: () => void;
  onAdvisorClick: () => void;
}

export function FloatingTabBar({ activeTab, onTabChange, onAddClick, onAdvisorClick }: FloatingTabBarProps) {
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (tabId === "advisor") onAdvisorClick();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center px-4 pb-6 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
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
                  "relative flex flex-1 flex-col items-center justify-center h-full gap-1 rounded-full transition-colors cursor-pointer",
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
                
                {/* SPECIAL GLOW FOR ADVISOR */}
                {tab.id === "advisor" ? (
                  <motion.div 
                    animate={{ 
                      background: [
                        "conic-gradient(from 0deg, #30D158, #64D2FF, #AF52DE, #30D158)",
                        "conic-gradient(from 360deg, #30D158, #64D2FF, #AF52DE, #30D158)"
                      ] 
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full p-[1px] flex items-center justify-center mb-0.5 relative z-10"
                  >
                    <div className="w-full h-full rounded-full bg-[#17191A] flex items-center justify-center">
                      <Icon size={18} strokeWidth={2.5} className="text-white" />
                    </div>
                  </motion.div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                )}
                
                <span className="text-[11px] font-medium relative z-10">
                  {tab.label}
                </span>
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
    </div>
  );
}