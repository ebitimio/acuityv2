"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, PieChart, Wallet, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "analytics", label: "Analytics", icon: PieChart },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "ai", label: "AI Advisor", icon: Sparkles },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface FloatingTabBarProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  onAddClick?: () => void;
  isHidden?: boolean;
  // New prop to track if the user has scrolled up on a sub-page
  forceMiniMode?: boolean; 
}

export function FloatingTabBar({ 
  activeTab, 
  onTabChange, 
  onAddClick, 
  isHidden,
  forceMiniMode = false
}: FloatingTabBarProps) {
  const isHome = activeTab === "home";
  
  // The pill shrinks if:
  // 1. We are on a sub-page (not home) AND
  // 2. The user has scrolled up to reveal the nav (forceMiniMode)
  const isMini = !isHome && forceMiniMode;

  return (
    <motion.div
      initial={false}
      animate={{ y: isHidden ? 120 : 0, opacity: isHidden ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none"
    >
      <div className="relative flex w-full max-w-md items-center justify-between px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pointer-events-auto">
        
        {/* Main Nav Pill */}
        <motion.div 
          layout
          className={cn(
            "flex items-center rounded-full border border-white/10 bg-[#1c1c1e]/95 px-2 py-2 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-300",
            isMini ? "w-auto justify-start" : "flex-1 justify-around"
          )}
        >
          <AnimatePresence mode="popLayout">
            {tabs.map(({ id, label, icon: Icon }) => {
              // If in mini mode, only show the Home tab
              if (isMini && id !== "home") return null;
              
              const isActive = activeTab === id;
              return (
                <motion.button
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={() => onTabChange(id)}
                  aria-label={label}
                  className={cn(
                    "relative flex h-12 w-14 items-center justify-center rounded-full transition-colors shrink-0",
                    isActive ? "text-white" : "text-white/40 hover:text-white/70"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Floating Add Button */}
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="ml-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-xl shadow-black/40 transition-transform active:scale-95"
            style={{ backgroundColor: "#DE3121" }}
            aria-label="Quick add"
          >
            <Plus size={24} strokeWidth={3} style={{ color: "#0b0b0c" }} />
          </button>
        )}
      </div>
    </motion.div>
  );
}