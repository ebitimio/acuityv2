"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, PieChart, Wallet, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "analytics", label: "Analytics", icon: PieChart },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "ai", label: "AI Advisor", icon: null },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface FloatingTabBarProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  onAddClick?: () => void;
  isHidden?: boolean;
}

export function FloatingTabBar({ activeTab, onTabChange, onAddClick, isHidden }: FloatingTabBarProps) {
  return (
    <motion.div
      initial={false}
      animate={{ y: isHidden ? 120 : 0, opacity: isHidden ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none"
    >
      <div className="relative flex w-full max-w-md items-center justify-between px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pointer-events-auto">
        
        <div className="flex flex-1 items-center justify-around rounded-full glass glass-thick [&::after]:hidden px-2 py-2 shadow-2xl shadow-black/60">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                aria-label={label}
                className={cn(
                  "relative flex h-12 w-14 items-center justify-center rounded-full transition-colors",
                  isActive ? "text-[var(--text-1)]" : "text-[var(--text-3)] hover:text-[var(--text-2)]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {Icon ? (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                ) : (
                  <div className="flex items-baseline">
                    <span className={cn("text-[18px] font-black tracking-tighter", isActive ? "text-[var(--text-1)]" : "text-[var(--text-3)]")}>A</span>
                    <span className={cn("text-[18px] font-black tracking-tighter", isActive ? "opacity-100" : "opacity-40")} style={{ color: "var(--brand)" }}>.</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {onAddClick && (
          <button
            onClick={onAddClick}
            className="ml-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full glass glass-regular glass-press [&::after]:hidden shadow-xl shadow-black/40"
            style={{ backgroundColor: "var(--brand)", color: "var(--brand-ink)" }}
            aria-label="Quick add"
          >
            <span className="absolute inset-0 pointer-events-none glass-specular opacity-50 rounded-full" />
            <Plus size={24} strokeWidth={3} className="relative z-10" />
          </button>
        )}
      </div>
    </motion.div>
  );
}