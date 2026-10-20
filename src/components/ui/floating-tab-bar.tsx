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
      {/* Theme-aware fade */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-32"
        style={{
          background:
            "linear-gradient(to top, var(--bg) 0%, color-mix(in srgb, var(--bg) 60%, transparent) 55%, transparent 100%)",
        }}
      />

      <div className="pointer-events-auto flex w-full max-w-[420px] items-center gap-3">
        <GlassSurface
          tier="thick"
          rim
          className="flex h-[56px] flex-1 items-center p-1.5"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                whileTap={{ scale: 0.88 }}
                transition={spring.snappy}
                className={cn(
                  "relative flex h-full flex-1 items-center justify-center rounded-full transition-colors",
                  active ? "text-[var(--text-1)]" : "text-[var(--text-3)] hover:text-[var(--text-2)]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-lens"
                    className="absolute inset-0 rounded-full border"
                    style={{
                      background: "var(--fill-2)",
                      borderColor: "var(--line-strong)",
                    }}
                    transition={spring.liquid}
                  />
                )}
                <Icon size={21} strokeWidth={active ? 2.25 : 2} className="relative" />
              </motion.button>
            );
          })}
        </GlassSurface>

        <button
          type="button"
          onClick={onAddClick}
          aria-label="Add"
          className="press flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full"
          style={{
            background: "var(--ink)",
            color: "var(--ink-on)",
            boxShadow: "var(--glass-shadow)",
          }}
        >
          <Plus size={26} strokeWidth={2.25} />
        </button>
      </div>
    </motion.nav>
  );
}