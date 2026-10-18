"use client";

import { useState, useEffect, useRef } from "react";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
import { GlassSurface } from "./glass-surface";
import { FileText, Check, X, UploadCloud } from "lucide-react";
import { importCsvStatement } from "@/lib/supabase/database";

const STEPS = [
  "Reading file...",
  "Cleaning narrations...",
  "Matching transfers...",
  "Categorizing...",
  "Done",
];

export function ImportSheet({ 
  isOpen, 
  onClose,
  onImportSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onImportSuccess: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep(0);
        setIsProcessing(false);
        setImportedCount(0);
        setErrorMessage("");
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isProcessing && currentStep < STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1200); 
      return () => clearTimeout(timer);
    }
  }, [isProcessing, currentStep]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCurrentStep(0);
    setErrorMessage("");

    try {
      const count = await importCsvStatement(file);
      setCurrentStep(STEPS.length - 1);
      setImportedCount(count);
    } catch (err: any) {
      console.error("Import failed:", err);
      setErrorMessage(err.message || "An unknown error occurred during import.");
      setIsProcessing(false); 
    }
  };

  const isDone = currentStep === STEPS.length - 1;

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none">
          <GlassSurface 
            tier="thick" 
            radius="36px 36px 0 0" 
            className="flex flex-col items-center pt-4 pb-32 px-6 w-full max-w-md mx-auto min-h-[520px] overflow-hidden"
          >
            
            {/* HEADER: Grabber and X button */}
            <div className="w-full flex items-center justify-between mb-6">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
              <button 
                onClick={onClose} 
                className="p-2 rounded-full bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* STATE 1: UPLOAD */}
            {!isProcessing && (
              <div className="flex flex-col items-center w-full h-full justify-center">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)]">
                    <UploadCloud size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-[17px] font-medium text-white">Upload Statement</p>
                    <p className="text-[13px] text-white/50 mt-1">CSV file</p>
                  </div>
                </button>

                {errorMessage && (
                  <p className="text-[13px] text-[var(--danger)] text-center mt-4 px-4">
                    {errorMessage}
                  </p>
                )}

                <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </div>
            )}

            {/* STATE 2: PROCESSING / ERROR / DONE */}
            {isProcessing && (
              <>
                <div className="relative mb-8 mt-4">
                  {!isDone && !errorMessage && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-4px] rounded-[32px] opacity-70 blur-md"
                      style={{ background: "conic-gradient(from 0deg, transparent 0%, #30d158 25%, #64d2ff 50%, transparent 75%)" }}
                    />
                  )}
                  
                  <div className={`relative w-24 h-24 bg-[#17191A] rounded-[28px] border flex items-center justify-center z-10 overflow-hidden ${
                    errorMessage ? "border-[var(--danger)]/50" : "border-white/10"
                  }`}>
                    <AnimatePresence mode="wait">
                      {isDone ? (
                        <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[var(--brand)]">
                          <Check size={40} strokeWidth={3} />
                        </motion.div>
                      ) : errorMessage ? (
                        <motion.div key="error" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[var(--danger)]">
                          <X size={40} strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <motion.div key="file" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-white/80">
                          <FileText size={40} strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="h-8 flex items-center justify-center mb-2 px-4">
                  <AnimatePresence mode="wait">
                    <motion.p key={errorMessage || currentStep} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className={`text-[17px] font-medium text-center ${errorMessage ? "text-[var(--danger)]" : "text-white"}`}>
                      {errorMessage ? "Import Failed" : STEPS[currentStep]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {errorMessage && (
                  <p className="text-[13px] text-white/60 text-center mb-6 px-4">
                    {errorMessage}
                  </p>
                )}

                {!errorMessage && (
                  <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden mb-8">
                    <motion.div 
                      className="h-full bg-[var(--brand)]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}

                <AnimatePresence>
                  {(isDone || errorMessage) && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full mt-auto">
                      {isDone && (
                        <div className="text-center mb-6">
                          <p className="text-[15px] text-white/70">Successfully imported</p>
                          <p className="text-[28px] font-bold text-[var(--brand)]">{importedCount} transactions</p>
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          if (isDone) onImportSuccess();
                          if (errorMessage) {
                            setIsProcessing(false);
                            setErrorMessage("");
                          } else {
                            onClose();
                          }
                        }}
                        className={`w-full font-semibold text-[17px] py-4 rounded-full active:scale-[0.98] transition-transform ${
                          errorMessage ? "bg-white/10 text-white" : "bg-white text-black"
                        }`}
                      >
                        {errorMessage ? "Try Again" : "View Transactions"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </GlassSurface>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}