"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, Loader2, Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";

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

export function AIDrawer({ isOpen, onClose, fullName = "there" }: { isOpen: boolean, onClose: () => void, fullName?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { active: activeWs } = useWorkspace();

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
          workspaceId: activeWs?.id,
          workspaceName: activeWs?.name,
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

  const firstName = fullName.split(" ")[0];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[100] flex flex-col h-[100dvh] flowing-gradient"
      >
        <style>{`
          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .flowing-gradient {
            background: linear-gradient(135deg, #DE3121 0%, #0b0b0c 60%, #0b0b0c 100%);
            background-size: 200% 200%;
            animation: gradientFlow 8s ease infinite;
          }
        `}</style>

        <div className="relative shrink-0 flex flex-col px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-10">
          <button 
            onClick={onClose}
            className="absolute right-5 top-[calc(env(safe-area-inset-top)+16px)] flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white z-50 hover:bg-black/40 transition-colors"
          >
            <X size={18} />
          </button>

          <h1 className="text-[34px] font-semibold text-white leading-tight mt-6">
            Hello {firstName}<br/>May I help you?
          </h1>
          <p className="text-[12px] text-white/60 mt-2">
            Workspace: {activeWs?.name ?? "None"}
          </p>
        </div>

        {messages.length === 0 && (
          <div className="flex-1 overflow-y-auto px-6 pt-6">
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

        <div className="shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2">
          <div className="flex items-end gap-2 rounded-3xl bg-[#1c1c1e] p-2 border border-white/10 shadow-2xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about your money..."
              className="flex-1 max-h-32 min-h-[40px] bg-transparent px-4 py-2.5 text-[15px] text-white outline-none placeholder:text-white/40 resize-none"
              rows={1}
            />

            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isThinking}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black disabled:opacity-40 transition-transform active:scale-95"
            >
              {isThinking ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}