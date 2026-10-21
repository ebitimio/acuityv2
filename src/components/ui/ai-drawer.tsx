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

function formatMessage(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("###")) {
      return (
        <p key={i} className="mt-3 mb-1 text-[15px] font-bold text-white first:mt-0">
          {line.replace(/^###\s*/, "")}
        </p>
      );
    }

    const parts = line.split(/(\*\*.*?\*\*)/g);
    const renderedParts = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });

    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="text-[15px] leading-relaxed">{renderedParts}</p>;
  });
}

export function AIDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your Acuity Advisor. I can see your real transactions, budgets, assets, and commitments. Ask me anything — like 'Can I afford a ₦32 million car in December?' or 'What are my total assets?'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // LOCK BODY SCROLL when the drawer is open to prevent the page jump
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
        // Fixed height, flex-col, no page scrolling
        className="fixed inset-0 z-[100] flex flex-col h-[100dvh] bg-[var(--bg)] overflow-hidden"
      >
        {/* Header - Fixed */}
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-[var(--line)] bg-gradient-to-b from-[var(--surface-2)] to-[var(--bg)] p-5 pt-[calc(env(safe-area-inset-top)+20px)]">
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

        {/* Chat Area - Only this scrolls */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 pb-6">
          <div className="flex flex-col gap-5">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-3xl p-4 text-[15px] leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "rounded-tr-md bg-[#DE3121] text-white"
                      : "rounded-tl-md border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-1)]"
                  )}
                >
                  {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
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
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="shrink-0 border-t border-[var(--line)] bg-[var(--bg)] p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
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