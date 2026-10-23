"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Delete } from "lucide-react";

interface PinLockScreenProps {
  mode: "setup" | "unlock";
  onComplete: (pin: string) => void;
  errorText?: string;
}

export function PinLockScreen({ mode, onComplete, errorText }: PinLockScreenProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [stage, setStage] = useState<"enter" | "confirm">("enter");

  useEffect(() => {
    if (errorText) {
      setPin("");
      setConfirmPin("");
      setStage("enter");
    }
  }, [errorText]);

  const handleKeyPress = (key: string) => {
    if (key === "backspace") {
      if (stage === "enter") setPin((p) => p.slice(0, -1));
      else setConfirmPin((p) => p.slice(0, -1));
      return;
    }
    
    if (stage === "enter" && pin.length < 4) {
      const next = pin + key;
      setPin(next);
      if (next.length === 4) {
        if (mode === "unlock") onComplete(next);
        else setTimeout(() => setStage("confirm"), 200);
      }
    } else if (stage === "confirm" && confirmPin.length < 4) {
      const next = confirmPin + key;
      setConfirmPin(next);
      if (next.length === 4) {
        if (next === pin) onComplete(next);
        else {
          setPin("");
          setConfirmPin("");
          setStage("enter");
        }
      }
    }
  };

  const currentPin = stage === "enter" ? pin : confirmPin;
  const title = mode === "setup" 
    ? (stage === "enter" ? "Create a 4-digit PIN" : "Confirm your PIN")
    : "Enter your PIN";

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[#0b0b0c] text-white">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm px-6">
        <h2 className="text-[24px] font-bold mb-2">{title}</h2>
        <p className="text-[14px] text-white/50 mb-10 text-center">
          {mode === "setup" 
            ? "This code keeps your data safe when your session times out." 
            : "Your session timed out. Enter your PIN to continue."}
        </p>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: currentPin.length === i + 1 ? 1.2 : 1,
                backgroundColor: currentPin.length > i ? "#DE3121" : "rgba(255,255,255,0.1)",
                borderColor: currentPin.length > i ? "#DE3121" : "rgba(255,255,255,0.2)",
              }}
              className="w-4 h-4 rounded-full border-2"
            />
          ))}
        </div>

        {errorText && (
          <p className="text-[#DE3121] text-[13px] font-medium mb-6">{errorText}</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"].map((key, i) => (
            <div key={i} className="flex items-center justify-center">
              {key === "" ? null : key === "backspace" ? (
                <button
                  onClick={() => handleKeyPress("backspace")}
                  className="flex h-16 w-16 items-center justify-center rounded-full active:bg-white/10"
                >
                  <Delete size={24} className="text-white/80" />
                </button>
              ) : (
                <button
                  onClick={() => handleKeyPress(key)}
                  className="flex h-16 w-16 items-center justify-center rounded-full text-[24px] font-medium active:bg-white/10"
                >
                  {key}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}