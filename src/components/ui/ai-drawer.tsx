"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your Acuity Advisor. I can see your real transactions and budget. Ask me anything — like 'How much did I spend on food this month?' or 'Can I afford a ₦50,000 watch?'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const send = async () => {
    if (!input.trim() || isThinking) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "The AI encountered an error.");
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: data.response },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: `Sorry, I ran into an issue: ${err.message}` },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)]"
      >
        {/* Modern Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-[var(--line)] bg-gradient-to-b from-[var(--surface-2)] to-[var(--bg)] p-5 pt-[calc(env(safe-area-inset-top)+20px)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DE3121]/10 text-[#DE3121] shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[var(--text-1)]">Acuity Advisor</h2>
              <p className="text-[12px] font-medium text-[#DE3121]">Active AI Copilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fill-1)] text-[var(--text-2)] transition-colors hover:bg-[var(--fill-2)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="relative z-10 flex flex-1 flex-col gap-5 overflow-y-auto p-6 pb-24">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-3xl p-4 text-[15px] leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "rounded-tr-md bg-[#DE3121] text-white"
                    : "rounded-tl-md border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-1)]"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {isThinking && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-1.5 rounded-3xl rounded-tl-md border border-[var(--line)] bg-[var(--surface-2)] p-5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-3)]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-3)]" style={{ animationDelay: "120ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-3)]" style={{ animationDelay: "240ms" }} />
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[var(--bg)]/90 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface-1)] p-2 shadow-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about your money..."
              className="flex-1 bg-transparent px-4 text-[15px] text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)]"
            />
            <button
              onClick={send}
              disabled={!input.trim() || isThinking}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DE3121] text-white transition-transform active:scale-95 disabled:opacity-40"
            >
              {isThinking ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}