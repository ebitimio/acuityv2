"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2 } from "lucide-react";

interface WorkspaceSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: { id: string; name: string }[];
  activeId: string | undefined;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onDelete: (w: { id: string; name: string }) => void;
}

export function WorkspaceSwitcher({
  isOpen,
  onClose,
  workspaces,
  activeId,
  onSwitch,
  onCreate,
  onDelete,
}: WorkspaceSwitcherProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="absolute left-4 right-4 top-[60px] z-50 rounded-2xl border border-[var(--line-strong)] bg-[var(--surface-3)] shadow-2xl overflow-hidden"
        >
          <div className="p-1.5">
            {workspaces.map((w) => {
              const isActive = w.id === activeId;
              const canDelete = workspaces.length > 1;
              return (
                <div
                  key={w.id}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors ${
                    isActive ? "bg-[#DE3121]/10" : "hover:bg-[var(--fill-1)]"
                  }`}
                >
                  <button
                    onClick={() => onSwitch(w.id)}
                    className="flex-1 flex items-center justify-between text-left min-w-0"
                  >
                    <span className={`truncate text-[14px] font-medium ${
                      isActive ? "text-[#DE3121]" : "text-[var(--text-1)]"
                    }`}>
                      {w.name}
                    </span>
                    {isActive && <Check size={14} className="text-[#DE3121] shrink-0" />}
                  </button>
                  {canDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(w); }}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-3)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors shrink-0"
                      aria-label={`Delete ${w.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-[var(--line)] p-1.5">
            <button
              onClick={() => { onClose(); onCreate(); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#DE3121] hover:bg-[#DE3121]/10 transition-colors"
            >
              <Plus size={14} />
              Create new workspace
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}