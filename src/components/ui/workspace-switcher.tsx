"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";

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
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      onDelete(confirmDelete);
      setConfirmDelete(null);
    }
  };

  return (
    <>
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
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(w); }}
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

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className="text-[var(--danger)]" />
                <h3 className="text-[16px] font-bold text-[var(--text-1)]">Delete workspace?</h3>
              </div>
              <p className="text-[13px] text-[var(--text-3)] mb-4">
                This will permanently delete <strong className="text-[var(--text-1)]">"{confirmDelete.name}"</strong> and all its data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-xl bg-[var(--fill-1)] py-2.5 text-[13px] font-semibold text-[var(--text-1)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-xl bg-[var(--danger)] py-2.5 text-[13px] font-semibold text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}