"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCall?: string;
}

export function AIDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your Acuity Advisor. I've analyzed your recent statements. Your fuel spend is up 28% this month. Want me to show you where you can cut back?",
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

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: "tool-" + Date.now(), role: "assistant", content: "", toolCall: "Checking your Groceries spend..." },
      ]);
    }, 800);

    setTimeout(() => {
      setMessages((prev) => {
        const withoutTool = prev.filter((m) => !m.toolCall);
        return [
          ...withoutTool,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Based on the last 30 days, you spent ₦45,000 at Shoprite. If you switch to bulk buying at the local market, you could save roughly ₦12,000/month.",
          },
        ];
      });
      setIsThinking(false);
    }, 2800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)]">
      <div className="relative z-10 flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg)] p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-[var(--text-1)]">Acuity Advisor</h2>
            <p className="text-[12px] text-[var(--brand)]">Active AI Copilot</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--fill-1)] text-[var(--text-2)]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.toolCall ? (
              <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--fill-1)] px-3 py-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--text-3)] border-t-[var(--text-1)]" />
                <span className="text-[12px] font-medium text-[var(--text-2)]">{msg.toolCall}</span>
              </div>
            ) : (
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-4 text-[14px] leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-tr-sm bg-[var(--ink)] text-[var(--ink-on)]"
                    : "rounded-tl-sm border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-1)]"
                }`}
              >
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {isThinking && messages[messages.length - 1]?.toolCall === undefined && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-tl-sm border border-[var(--line)] bg-[var(--surface-2)] p-4">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-3)]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-3)]" style={{ animationDelay: "120ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-3)]" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="relative z-10 border-t border-[var(--line)] bg-[var(--bg)] p-4 pb-8">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-1)] p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your money..."
            className="flex-1 bg-transparent px-4 text-[14px] text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)]"
          />
          <button
            onClick={send}
            disabled={!input.trim() || isThinking}
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--ink-on)] disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}