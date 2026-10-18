"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
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
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (tabId === "advisor") onAdvisorClick();
  };

  return (
    <motion.div 
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: 120, opacity: 0 }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center px-4 pb-6 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"
    >
      <div className="flex items-center justify-between gap-3 w-full max-w-[420px] pointer-events-auto">
        
        <GlassSurface
          tier="regular"
          className="flex flex-1 items-center justify-between p-1.5 h-[64px] relative"
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
                {/* Liquid Drop Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="liquid-drop"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                  >
                    <motion.div 
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-white/20 rounded-full blur-sm"
                    />
                  </motion.div>
                )}
                
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                <span className="text-[11px] font-medium relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </GlassSurface>

        <button 
          type="button"
          onClick={onAddClick}
          className="h-[64px] w-[64px] shrink-0 active:scale-95 transition-transform cursor-pointer"
        >
          <GlassSurface tier="regular" className="flex h-full w-full items-center justify-center text-white hover:bg-white/10" rim={true}>
            <Plus size={28} strokeWidth={2} />
          </GlassSurface>
        </button>

      </div>
    </motion.div>
  );
}