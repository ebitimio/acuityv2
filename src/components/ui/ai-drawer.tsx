"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ArrowUp, Loader2, ArrowUpRight, CheckCircle2, Search, FileText, 
  Pin, Plus, MessageSquare, Wallet, PieChart, Receipt, Lightbulb, Copy, RotateCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";
import { useCurrency } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import type { HomeMetrics, SafeToSpend } from "@/lib/supabase/database";
import { useToast } from "./toast";
import { NumberRoll } from "./number-roll";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fullName?: string;
  safeToSpend: SafeToSpend | null;
  metrics: HomeMetrics;
  topCategory: string | null;
  daysUntilIncome: number;
}

export function AIDrawer({ 
  isOpen, 
  onClose, 
  fullName = "there",
  safeToSpend,
  metrics,
  topCategory,
  daysUntilIncome
}: AIDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);
  const { active: activeWs } = useWorkspace();
  const { fmt } = useCurrency();
  const toast = useToast();
  const supabase = createClient();

  // Load chat history on mount
  useEffect(() => {
    if (!isOpen || !activeWs?.id) return;
    
    const loadHistory = async () => {
      const { data } = await supabase
        .from("ai_chat_history")
        .select("*")
        .eq("workspace_id", activeWs.id)
        .order("created_at", { ascending: true })
        .limit(50);
        
      if (data && data.length > 0) {
        setMessages(data.map(d => ({ id: d.id, role: d.role, content: d.content })));
        setHasSentFirstMessage(true);
      }
    };
    loadHistory();
  }, [isOpen, activeWs?.id, supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, streamingContent]);

  const saveMessageToDb = async (role: "user" | "assistant", content: string) => {
    if (!activeWs?.id) return;
    await supabase.from("ai_chat_history").insert({
      workspace_id: activeWs.id,
      role,
      content,
    });
  };

  const send = async (text: string) => {
    if (!text.trim() || isThinking) return;
    
    setHasSentFirstMessage(true);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsThinking(true);
    setThinkingSteps([]);
    setStreamingContent("");

    await saveMessageToDb("user", text);

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

      if (!res.ok) throw new Error("Failed to connect to AI");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let currentText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.type === "thinking") {
                setThinkingSteps(prev => [...prev, data.label]);
              } else if (data.type === "text") {
                currentText += data.content;
                setStreamingContent(currentText);
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              console.error("Parse error", e);
            }
          }
        }
      }

      // Finalize the message
      const finalMsg: Message = { id: Date.now().toString(), role: "assistant", content: currentText };
      setMessages((prev) => [...prev, finalMsg]);
      await saveMessageToDb("assistant", currentText);
      
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: `Sorry, I ran into an issue: ${err.message}` },
      ]);
    } finally {
      setIsThinking(false);
      setStreamingContent("");
      setThinkingSteps([]);
    }
  };

  const handlePinInsight = async (content: string) => {
    if (!activeWs?.id) return;
    try {
      await supabase.from("pinned_insights").insert({
        workspace_id: activeWs.id,
        content,
      });
      toast("Insight pinned to Home");
    } catch {
      toast("Could not pin insight", "err");
    }
  };

  const formatMessage = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("###")) {
        return (
          <p key={i} className="mt-3 mb-1 text-[15px] font-bold text-[var(--text-1)] first:mt-0">
            {line.replace(/^###\s*/, "")}
          </p>
        );
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="font-bold text-[var(--text-1)]">{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-[15px] leading-relaxed">{renderedParts}</p>;
    });
  };

  const firstName = fullName.split(" ")[0];

  // Dynamic Suggestion Logic
  const budgetUsedPct = metrics.budget_limit_minor > 0 
    ? Math.round((metrics.total_spent_minor / metrics.budget_limit_minor) * 100) 
    : 0;

  const suggestions = [
    { 
      title: "How much can I safely spend this week?", 
      icon: Wallet, 
      category: "Spending",
      show: true 
    },
    { 
      title: "Where am I wasting the most money?", 
      icon: PieChart, 
      category: "Insights",
      show: true 
    },
    { 
      title: `You've used ${budgetUsedPct}% of your budget. What should I cut?`, 
      icon: Receipt, 
      category: "Budget",
      show: budgetUsedPct > 80 
    },
    { 
      title: `Payday in ${daysUntilIncome} days. How do I stretch what's left?`, 
      icon: Lightbulb, 
      category: "Planning",
      show: daysUntilIncome > 0 && daysUntilIncome <= 5 
    },
    { 
      title: `Help me categorize my unreviewed transactions.`, 
      icon: FileText, 
      category: "Organize",
      show: metrics.uncategorized_count > 0 
    }
  ].filter(s => s.show).slice(0, 4);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[100] flex flex-col h-[100dvh] bg-[var(--bg)] overflow-hidden"
      >
        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }} 
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[100px] opacity-20" 
            style={{ background: "var(--brand)" }} 
          />
          <motion.div 
            animate={{ x: [0, -40, 0], y: [0, 60, 0] }} 
            transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-10" 
            style={{ background: "var(--brand)" }} 
          />
        </div>

        {/* Header */}
        <div 
          className="relative z-10 shrink-0 flex items-center justify-between px-5 pb-4 border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)]/10">
              <div className="absolute inset-0 rounded-full bg-[var(--brand)]/20 animate-pulse" />
              <span className="text-[18px] font-black text-[var(--brand)] relative z-10">A.</span>
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[var(--text-1)] leading-tight">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {firstName}
              </h1>
              <p className="text-[12px] text-[var(--text-3)]">Ask anything about your money.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setMessages([]); setHasSentFirstMessage(false); }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
            >
              <Plus size={16} />
            </button>
            <button 
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Context Strip (Collapses after first message) */}
        <AnimatePresence>
          {!hasSentFirstMessage && (
            <motion.div 
              initial={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative z-10 shrink-0 overflow-hidden border-b border-[var(--line)] bg-[var(--surface-1)]/50 backdrop-blur-sm"
            >
              <div className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button onClick={() => send("How much can I safely spend today?")} className="flex shrink-0 flex-col items-start gap-1 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] px-4 py-2.5">
                  <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">Safe to spend</span>
                  <span className="text-[16px] font-bold text-[var(--brand)] tabular">
                    {safeToSpend ? fmt(safeToSpend.daily_safe_minor / 100) : "₦0"}
                  </span>
                </button>
                
                <button onClick={() => send("When is my next payday?")} className="flex shrink-0 flex-col items-start gap-1 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] px-4 py-2.5">
                  <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">Days to payday</span>
                  <span className="text-[16px] font-bold text-[var(--text-1)] tabular">
                    {daysUntilIncome} days
                  </span>
                </button>

                <button onClick={() => send("Am I on track with my budget?")} className="flex shrink-0 flex-col items-start gap-1 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] px-4 py-2.5">
                  <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">Budget used</span>
                  <span className="text-[16px] font-bold text-[var(--text-1)] tabular">
                    {budgetUsedPct}%
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-4">
          {messages.length === 0 && !isThinking ? (
            <div className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-2 mb-2 text-[var(--text-1)]">
                <span className="text-[14px] font-semibold">Try asking</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.button 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => send(s.title)}
                      className="flex flex-col justify-between rounded-[20px] bg-[var(--surface-2)] p-4 text-left border border-[var(--line)] shadow-sm h-36 hover:bg-[var(--fill-1)] transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)]/10">
                        <Icon size={16} className="text-[var(--brand)]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-wider">{s.category}</span>
                        <p className="text-[13px] text-[var(--text-1)] leading-snug mt-0.5">{s.title}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 pt-6">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[85%] rounded-[20px] rounded-tr-sm p-4 text-[15px] leading-relaxed text-white shadow-sm" style={{ background: "var(--brand)" }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 mt-1">
                        <span className="text-[14px] font-black text-[var(--brand)]">A.</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="rounded-[20px] rounded-tl-sm bg-[var(--surface-1)] p-4 text-[15px] leading-relaxed text-[var(--text-1)] border border-[var(--line)] shadow-sm">
                          {formatMessage(msg.content)}
                        </div>
                        <div className="flex items-center gap-3 mt-2 px-1">
                          <button onClick={() => handlePinInsight(msg.content)} className="text-[11px] font-medium text-[var(--text-3)] hover:text-[var(--brand)] flex items-center gap-1">
                            <Pin size={12} /> Pin to Home
                          </button>
                          <button onClick={() => navigator.clipboard.writeText(msg.content)} className="text-[11px] font-medium text-[var(--text-3)] hover:text-[var(--text-1)] flex items-center gap-1">
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* THINKING UI */}
              {isThinking && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 mt-1">
                    <Loader2 size={14} className="text-[var(--brand)] animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {thinkingSteps.length > 0 && !streamingContent && (
                      <div className="rounded-[20px] rounded-tl-sm bg-[var(--surface-2)] border border-[var(--line)] p-4 shadow-sm w-fit">
                        <div className="space-y-2">
                          <AnimatePresence mode="popLayout">
                            {thinkingSteps.map((step, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-[13px] text-[var(--text-2)]"
                              >
                                {step.includes("Analyzing") ? <Search size={14} className="text-[var(--text-3)]" /> : <FileText size={14} className="text-[var(--text-3)]" />}
                                {step}
                                {idx !== thinkingSteps.length - 1 ? (
                                  <CheckCircle2 size={14} className="text-[var(--text-3)] ml-auto" />
                                ) : (
                                  <Loader2 size={14} className="animate-spin ml-auto text-[var(--brand)]" />
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {streamingContent && (
                      <div className="rounded-[20px] rounded-tl-sm bg-[var(--surface-1)] p-4 text-[15px] leading-relaxed text-[var(--text-1)] border border-[var(--line)] shadow-sm">
                        {formatMessage(streamingContent)}
                        <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--brand)] animate-pulse align-middle" />
                      </div>
                    )}

                    {thinkingSteps.length === 0 && !streamingContent && (
                      <div className="rounded-[20px] rounded-tl-sm bg-[var(--surface-2)] p-4 border border-[var(--line)] w-fit shadow-sm">
                        <span className="text-[13px] text-[var(--text-3)] animate-pulse">Checking your data...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              <div ref={endRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="relative z-10 shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2 bg-[var(--bg)]/80 backdrop-blur-md border-t border-[var(--line)]">
          <div className="flex items-end gap-2 rounded-[28px] bg-[var(--surface-2)] p-2 border border-[var(--line-strong)] shadow-sm focus-within:border-[var(--brand)] transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={messages.length > 0 ? "Ask a follow up..." : "Ask about your money..."}
              className="flex-1 max-h-32 min-h-[40px] bg-transparent px-4 py-2.5 text-[15px] text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)] resize-none"
              rows={1}
            />

            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isThinking}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-95",
                input.trim() && !isThinking ? "bg-[var(--brand)] text-[var(--brand-ink)]" : "bg-[var(--surface-3)] text-[var(--text-3)]"
              )}
            >
              {isThinking ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}