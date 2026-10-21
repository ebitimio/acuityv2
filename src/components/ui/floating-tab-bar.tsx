"use client";

import { motion } from "framer-motion";
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
        <div 
          className={cn(
            "flex items-center rounded-full border border-white/10 bg-[#1c1c1e]/95 px-2 py-2 shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden transition-all duration-400 ease-in-out",
            // The container shrinks to just fit the Home button when in mini mode
            isMini ? "w-[60px]" : "flex-1"
          )}
        >
          {/* Home Button - Always visible */}
          <button
            onClick={() => onTabChange("home")}
            aria-label="Home"
            className={cn(
              "relative flex h-12 w-14 shrink-0 items-center justify-center rounded-full transition-colors",
              activeTab === "home" ? "text-white" : "text-white/40 hover:text-white/70"
            )}
          >
            {activeTab === "home" && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-white/10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Home size={20} strokeWidth={activeTab === "home" ? 2.5 : 2} />
          </button>

          {/* Sliding Drawer for the rest of the icons */}
          <div 
            className={cn(
              "grid transition-all duration-400 ease-in-out",
              // When mini, width is 0fr and it's clipped. When full, it's 1fr.
              isMini ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100"
            )}
          >
            <div className="overflow-hidden flex items-center justify-around">
              {tabs.slice(1).map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    aria-label={label}
                    className={cn(
                      "relative flex h-12 w-14 shrink-0 items-center justify-center rounded-full transition-colors",
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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