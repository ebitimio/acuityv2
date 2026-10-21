"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, Sparkles, Loader2 } from "lucide-react";
import { Modal } from "./modal"; // Using your existing Modal
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

  return (
    <Modal open={isOpen} onClose={onClose} title="Acuity Advisor">
      {/* 
        The Modal handles the background lock and safe areas.
        We set a fixed height (70vh) so it acts as a bottom sheet.
        The flex-col ensures the header stays top, chat scrolls, input stays bottom.
      */}
      <div className="flex flex-col h-[70dvh] min-h-0 overflow-hidden -mx-6 -mb-[calc(20px+env(safe-area-inset-bottom))]">
        
        {/* Chat Area - Only this scrolls */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="flex flex-col gap-5 pt-2">
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

        {/* Input Area - Fixed at bottom of the sheet */}
        <div className="shrink-0 border-t border-[var(--line)] bg-[var(--bg)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface-1)] p-2 shadow-lg">
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
      </div>
    </Modal>
  );
}