"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, Loader2, Sparkles, Image as ImageIcon, Mic, ArrowUpRight } from "lucide-react";
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

export function AIDrawer({ isOpen, onClose, userName = "there" }: { isOpen: boolean, onClose: () => void, userName?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const send = async (text: string) => {
    if (!text.trim() || isThinking) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
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
      if (!res.ok) throw new Error(data.error || "The AI encountered an error.");

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
        className="fixed inset-0 z-[100] flex flex-col h-[100dvh] bg-[#0b0b0c]"
      >
        {/* The Purple/Orange Gradient Header */}
        <div className="relative shrink-0 flex flex-col px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-8 bg-gradient-to-b from-[#DE3121] to-[#0b0b0c]">
          <div className="flex items-center justify-between mb-6">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
               {/* Hamburger icon placeholder */}
               <div className="w-5 h-0.5 bg-white mb-1 rounded-full" />
               <div className="w-5 h-0.5 bg-white mb-1 rounded-full" />
               <div className="w-5 h-0.5 bg-white rounded-full" />
            </button>
            <div className="h-10 w-10 rounded-full bg-black/20 border border-white/20 overflow-hidden">
              {/* User Profile Avatar */}
               <div className="flex h-full w-full items-center justify-center text-white font-bold text-[14px]">
                 {userName.charAt(0).toUpperCase()}
               </div>
            </div>
          </div>

          <h1 className="text-[34px] font-semibold text-white leading-tight">
            Hello {userName}<br/>May I help you?
          </h1>
        </div>

        {/* Suggestion Chips (only show if no messages) */}
        {messages.length === 0 && (
          <div className="flex-1 overflow-y-auto px-6 pt-2">
            <div className="flex items-center gap-2 mb-4 text-white/90">
              <Sparkles size={18} />
              <span className="text-[16px] font-semibold">Acuity AI</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => send("How much can I safely spend this week?")}
                className="flex flex-col justify-between rounded-2xl bg-[#1c1c1e] p-4 text-left border border-white/5 shadow-lg h-40"
              >
                <span className="text-[14px] text-white leading-snug">How much can I safely spend this week?</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                   <ArrowUpRight size={16} />
                </div>
              </button>
              
              <button 
                onClick={() => send("Where am I wasting the most money?")}
                className="flex flex-col justify-between rounded-2xl bg-[#1c1c1e] p-4 text-left border border-white/5 shadow-lg h-40"
              >
                <span className="text-[14px] text-white leading-snug">Where am I wasting the most money?</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                   <ArrowUpRight size={16} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Chat Area */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="flex flex-col gap-5 pt-4">
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
                        ? "rounded-tr-md bg-white text-black"
                        : "rounded-tl-md bg-[#1c1c1e] text-white border border-white/5"
                    )}
                  >
                    {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
                  </div>
                </motion.div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-3xl rounded-tl-md bg-[#1c1c1e] p-5 border border-white/5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" style={{ animationDelay: "120ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/50" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 bg-[#0b0b0c]">
          <div className="flex items-end gap-2 rounded-3xl bg-[#1c1c1e] p-2 border border-white/10 shadow-2xl">
            <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/50 hover:text-white transition-colors">
              <ImageIcon size={20} />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Enter a prompt here"
              className="flex-1 max-h-32 min-h-[40px] bg-transparent py-2.5 text-[15px] text-white outline-none placeholder:text-white/40 resize-none"
              rows={1}
            />

            <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/50 hover:text-white transition-colors">
              <Mic size={20} />
            </button>

            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isThinking}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black disabled:opacity-40 transition-transform active:scale-95"
            >
              {isThinking ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* Close Button for Mobile Navigation (Absolute) */}
        <button
          onClick={onClose}
          className="absolute right-4 top-[calc(env(safe-area-inset-top)+16px)] flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md z-50"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}