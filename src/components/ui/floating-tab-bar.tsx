"use client";

import { motion } from "framer-motion";
import { Home, PieChart, Wallet, Sparkles, Plus } from "lucide-react";
import { GlassSurface } from "./glass-surface";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "analytics", label: "Analytics", icon: PieChart },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "advisor", label: "Advisor", icon: Sparkles },
] as const;

interface Props {
  activeTab: string;
  onTabChange: (id: string) => void;
  onAddClick: () => void;
  isHidden: boolean;
}

export function FloatingTabBar({ activeTab, onTabChange, onAddClick, isHidden }: Props) {
  return (
    <motion.nav
      aria-label="Main"
      initial={false}
      animate={{ y: isHidden ? 160 : 0 }}
      transition={spring.snappy}
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] flex justify-center px-4 pt-6"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)" }}
    >
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="pointer-events-auto flex w-full max-w-[420px] items-center gap-3">
        <GlassSurface
          tier="thick"
          rim
          className="flex h-[64px] flex-1 items-center p-1.5"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-current={active ? "page" : undefined}
                whileTap={{ scale: 0.88 }}
                transition={spring.snappy}
                className={cn(
                  "relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-full transition-colors",
                  active ? "text-[var(--brand)]" : "text-white/55 hover:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-lens"
                    className="absolute inset-0 rounded-full border border-[var(--brand)]/70"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 100%, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0.08) 70%, transparent 100%)",
                      boxShadow:
                        "0 0 16px rgba(249,115,22,0.35), inset 0 0 12px rgba(249,115,22,0.15)",
                    }}
                    transition={spring.liquid}
                  />
                )}
                <Icon size={21} strokeWidth={active ? 2.5 : 2} className="relative" />
                <span className="relative text-[10px] font-semibold">{tab.label}</span>
              </motion.button>
            );
          })}
        </GlassSurface>

        <GlassSurface
          as="button"
          interactive
          tier="thick"
          rim
          onClick={onAddClick}
          className="flex h-[64px] w-[64px] shrink-0 items-center justify-center text-white"
          tint="rgba(249,115,22,0.75)"
          aria-label="Add"
        >
          <Plus size={30} strokeWidth={2.5} />
        </GlassSurface>
      </div>
    </motion.nav>
  );
}