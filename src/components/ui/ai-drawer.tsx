"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ArrowUp, Loader2, CheckCircle2, Search, FileText, 
  Pin, Plus, Wallet, PieChart, Receipt, Lightbulb, Copy, 
  AlertCircle, RefreshCw, XCircle, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";
import { useCurrency } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import type { HomeMetrics } from "@/lib/types";
import type { SafeToSpend } from "@/lib/supabase/database";
import { useToast } from "./toast";
import { 
  createTransaction, setBudget, addRecurringItem, bulkSetCategory, 
  transferFunds, getAccounts 
} from "@/lib/supabase/database";

interface Block {
  type: "chart" | "table" | "stat" | "action" | "suggestions";
  [key: string]: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  blocks?: Block[];
  status?: "ok" | "error";
  actionId?: string;
  actionStatus?: "pending" | "applied" | "cancelled" | "failed";
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fullName?: string;
  safeToSpend: SafeToSpend | null;
  metrics: HomeMetrics;
  topCategory: string | null;
  daysUntilIncome: number;
  onDataChanged?: () => void; // <-- NEW: called after confirm
}

const truncateTitle = (t: string) => {
  const s = t.trim().replace(/\s+/g, " ");
  return s.length > 40 ? s.slice(0, 40).trimEnd() + "…" : s;
};

export function AIDrawer({ 
  isOpen, 
  onClose, 
  fullName = "there",
  safeToSpend,
  metrics,
  daysUntilIncome,
  onDataChanged
}: AIDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState("Checking your data...");
  const [streamingContent, setStreamingContent] = useState("");
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [vv, setVv] = useState<{ height: number; offsetTop: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);
  const bufferRef = useRef("");
  const { active: activeWs } = useWorkspace();
  const { fmt } = useCurrency();
  const toast = useToast();
  const supabase = createClient();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const v = window.visualViewport;
    if (!v) return;
    const update = () => setVv({ height: v.height, offsetTop: v.offsetTop });
    update();
    v.addEventListener("resize", update);
    v.addEventListener("scroll", update);
    return () => {
      v.removeEventListener("resize", update);
      v.removeEventListener("scroll", update);
    };
  }, []);

  // Load conversations list
  useEffect(() => {
    if (!isOpen || !activeWs?.id) return;
    
    const loadConversations = async () => {
      const { data } = await supabase
        .from("ai_chat_history")
        .select("conversation_id, created_at, content")
        .eq("workspace_id", activeWs.id)
        .eq("role", "user")
        .order("created_at", { ascending: true });
        
      if (data) {
        const unique = new Map<string, Conversation>();
        data.forEach((d: any) => {
          if (d.conversation_id && !unique.has(d.conversation_id)) {
            unique.set(d.conversation_id, {
              id: d.conversation_id,
              title: truncateTitle(d.content),
              created_at: d.created_at,
            });
          }
        });
        setConversations(Array.from(unique.values()).reverse());
      }
    };
    loadConversations();
  }, [isOpen, activeWs?.id, supabase]);

  // Load messages for the active conversation
  useEffect(() => {
    if (!isOpen || !activeWs?.id || !activeConvId) return;
    
    const loadHistory = async () => {
      const { data } = await supabase
        .from("ai_chat_history")
        .select("*")
        .eq("workspace_id", activeWs.id)
        .eq("conversation_id", activeConvId)
        .order("created_at", { ascending: true });
        
      if (data && data.length > 0) {
        setMessages(data.map(d => ({ 
          id: d.id, 
          role: d.role, 
          content: d.content,
          blocks: d.blocks || [],
          status: d.status || "ok",
          actionId: d.action_id,
          actionStatus: d.action_status
        })));
        setHasSentFirstMessage(true);
      } else {
        setMessages([]);
        setHasSentFirstMessage(false);
      }
    };
    loadHistory();
  }, [isOpen, activeWs?.id, activeConvId, supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: streamingContent ? "auto" : "smooth" });
  }, [messages, isThinking, streamingContent]);

  const saveMessageToDb = async (msg: Message) => {
    if (!activeWs?.id || !activeConvId) return;
    await supabase.from("ai_chat_history").insert({
      workspace_id: activeWs.id,
      conversation_id: activeConvId,
      role: msg.role,
      content: msg.content,
      blocks: msg.blocks || [],
      status: msg.status || "ok",
      action_id: msg.actionId,
      action_status: msg.actionStatus
    });
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveConvId(null);
    setHasSentFirstMessage(false);
    setIsSidebarOpen(false);
  };

  const send = async (text: string) => {
    if (!text.trim() || isThinking) return;
    
    let convId = activeConvId;
    if (!convId) {
      convId = crypto.randomUUID();
      setActiveConvId(convId);
      setConversations(prev => [{ id: convId!, title: truncateTitle(text), created_at: new Date().toISOString() }, ...prev]);
    }

    setHasSentFirstMessage(true);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsThinking(true);
    setThinkingLabel("Thinking...");
    setStreamingContent("");
    bufferRef.current = "";

    await supabase.from("ai_chat_history").insert({
      workspace_id: activeWs?.id,
      conversation_id: convId,
      role: "user",
      content: text,
    });

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
      let newBlocks: Block[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        bufferRef.current += chunk;
        
        // Split by double-newline (SSE frame boundary) not single
        const frames = bufferRef.current.split("\n\n");
        bufferRef.current = frames.pop() || "";

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") continue;
          
          try {
            const data = JSON.parse(dataStr);
            if (data.type === "thinking") {
              setThinkingLabel(data.label);
            } else if (data.type === "text") {
              currentText += data.content;
              setStreamingContent(currentText);
            } else if (data.type === "action") {
              newBlocks.push({ type: "action", ...data });
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          } catch (e) {
            console.error("Parse error", e, dataStr);
          }
        }
      }

      // Never save empty replies
      if (!currentText.trim() && newBlocks.length === 0) {
        throw new Error("empty_response");
      }

      const finalMsg: Message = { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: currentText,
        blocks: newBlocks,
        status: "ok"
      };
      setMessages((prev) => [...prev, finalMsg]);
      await saveMessageToDb(finalMsg);
      
    } catch (err: any) {
      console.error("AI send error:", err);
      // Don't save error to DB, just show it
      setMessages((prev) => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: "I couldn't complete that. Please check your connection and try again.", 
        status: "error" 
      }]);
    } finally {
      setIsThinking(false);
      setStreamingContent("");
    }
  };

  const handleActionConfirm = async (msgId: string, block: Block) => {
    try {
      const { action, payload } = block;
      
      if (action === "add_transaction") {
        const accounts = await getAccounts();
        const accountId = payload.account_id || accounts[0]?.id;
        if (!accountId) throw new Error("No account found");
        const direction = payload.direction === "credit" ? "credit" : "debit";
        
        await createTransaction({
          account_id: accountId,
          amount: Number(payload.amount) || 0,
          direction: direction,
          description: payload.description || "AI Transaction",
          category: payload.category || "Uncategorized",
          date: payload.date || new Date().toISOString(),
        });
      } else if (action === "set_budget") {
        await setBudget(payload.account_id || null, payload.category, (Number(payload.limit) || 0) * 100);
      } else if (action === "add_bill" || action === "add_income") {
        await addRecurringItem({
          account_id: payload.account_id || null,
          name: payload.name || "New Item",
          kind: action === "add_bill" ? "bill" : "income",
          amount: Number(payload.amount) || 0,
          frequency: payload.frequency || "monthly",
          day: Number(payload.day) || 1,
        });
      } else if (action === "recategorize") {
        await bulkSetCategory(payload.transaction_ids, payload.category);
      } else if (action === "transfer") {
        await transferFunds(payload.from_account_id, payload.to_account_id, (Number(payload.amount) || 0) * 100, payload.note, new Date().toISOString());
      }

      setMessages(prev => prev.map(m => 
        m.id === msgId 
          ? { ...m, actionStatus: "applied", blocks: m.blocks?.map(b => b.type === "action" ? { ...b, resolved: true } : b) } 
          : m
      ));
      toast("Action completed successfully");
      onDataChanged?.(); // <-- CRITICAL: refresh parent so header number updates
    } catch (e: any) {
      toast(e.message || "Action failed", "err");
    }
  };

  const handleActionCancel = (msgId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === msgId 
        ? { ...m, actionStatus: "cancelled", blocks: m.blocks?.map(b => b.type === "action" ? { ...b, resolved: true } : b) } 
        : m
    ));
    toast("Action cancelled");
  };

  const handlePinInsight = async (content: string) => {
    if (!activeWs?.id) return;
    try {
      await supabase.from("pinned_insights").insert({ workspace_id: activeWs.id, content });
      toast("Insight pinned to Home");
    } catch {
      toast("Could not pin insight", "err");
    }
  };

  const renderInline = (text: string) => {
    return text.split(/(\*\*.*?\*\*|₦[\d,]+(?:\.\d+)?)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-[var(--text-1)]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("₦")) {
        return <span key={i} className="tabular font-semibold text-[var(--brand)]">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const formatMessage = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return (
          <div key={i} className="flex items-start gap-2 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] mt-1.5 shrink-0" />
            <p className="text-[15px] leading-relaxed flex-1">{renderInline(line.trim().slice(2))}</p>
          </div>
        );
      }
      if (line.startsWith("###")) {
        return <p key={i} className="mt-3 mb-1 text-[15px] font-bold text-[var(--text-1)] first:mt-0">{line.replace(/^###\s*/, "")}</p>;
      }
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-[15px] leading-relaxed mb-1">{renderInline(line)}</p>;
    });
  };

  const firstName = fullName.split(" ")[0];
  const budgetUsedPct = metrics.budget_limit_minor > 0 
    ? Math.round((metrics.total_spent_minor / metrics.budget_limit_minor) * 100) 
    : 0;

  const suggestions = useMemo(() => [
    { title: "How much can I safely spend this week?", icon: Wallet, category: "Spending", show: true },
    { title: "Where am I wasting the most money?", icon: PieChart, category: "Insights", show: true },
    { title: `You've used ${budgetUsedPct}% of your budget. What should I cut?`, icon: Receipt, category: "Budget", show: budgetUsedPct > 80 },
    { title: `Payday in ${daysUntilIncome} days. How do I stretch what's left?`, icon: Lightbulb, category: "Planning", show: daysUntilIncome > 0 && daysUntilIncome <= 5 },
    { title: `Help me categorize my unreviewed transactions.`, icon: FileText, category: "Organize", show: metrics.uncategorized_count > 0 }
  ].filter(s => s.show).slice(0, 4), [budgetUsedPct, daysUntilIncome, metrics.uncategorized_count]);

  if (!isOpen || !mounted) return null;

  const kbOpen = vv ? (window.innerHeight - vv.height - vv.offsetTop > 80) : false;

  const frame: React.CSSProperties = vv
    ? { position: "fixed", top: vv.offsetTop, left: 0, right: 0, height: vv.height, zIndex: 100 }
    : { position: "fixed", inset: 0, zIndex: 100 };

  return createPortal(
    <AnimatePresence>
      {/* Full-screen opaque layer behind the drawer to hide the Home tab bar */}
      <div 
        className="fixed inset-0 bg-[var(--bg)]" 
        style={{ zIndex: 99 }} 
        aria-hidden 
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="flex flex-col bg-[var(--bg)] overflow-hidden"
        style={frame}
      >
        {/* Orbs */}
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
          className="relative z-10 shrink-0 flex items-center justify-between px-5 pb-4 border-b border-[var(--line)] bg-[var(--bg)]"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text-2)]">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-[20px] font-bold text-[var(--text-1)] leading-tight">
                {hasSentFirstMessage ? "Acuity AI" : `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${firstName}`}
              </h1>
              <p className="text-[12px] text-[var(--text-3)]">
                {hasSentFirstMessage && safeToSpend ? `${fmt(safeToSpend.daily_safe_minor / 100)} safe today` : "Ask anything about your money."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={startNewChat}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
              aria-label="New chat"
            >
              <Plus size={16} />
            </button>
            <button 
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-4" role="log" aria-live="polite">
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
                    <div 
                      className="max-w-[85%] rounded-[20px] rounded-tr-sm p-4 text-[15px] leading-relaxed shadow-sm" 
                      style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
                    >
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 mt-1">
                        <span className="text-[14px] font-black text-[var(--brand)]">A.</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {msg.content && (
                          <div className="rounded-[20px] rounded-tl-sm bg-[var(--surface-1)] p-4 text-[15px] leading-relaxed text-[var(--text-1)] border border-[var(--line)] shadow-sm">
                            {formatMessage(msg.content)}
                          </div>
                        )}

                        {msg.blocks?.map((block, idx) => {
                          if (block.type === "action") {
                            const isResolved = block.resolved || msg.actionStatus === "applied" || msg.actionStatus === "cancelled";
                            return (
                              <div key={idx} className="mt-3 rounded-[20px] border border-[var(--brand)]/30 bg-[var(--brand)]/5 overflow-hidden">
                                <div className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    {msg.actionStatus === "applied" ? (
                                      <CheckCircle2 size={16} className="text-[var(--gain)]" />
                                    ) : msg.actionStatus === "cancelled" ? (
                                      <XCircle size={16} className="text-[var(--text-3)]" />
                                    ) : (
                                      <AlertCircle size={16} className="text-[var(--brand)]" />
                                    )}
                                    <span className="text-[13px] font-bold text-[var(--brand)]">
                                      {msg.actionStatus === "applied" ? "Action Applied" : msg.actionStatus === "cancelled" ? "Action Cancelled" : "Confirm Action"}
                                    </span>
                                  </div>
                                  <p className="text-[14px] text-[var(--text-1)] leading-relaxed">{block.summary}</p>
                                  
                                  {!isResolved && (
                                    <div className="flex gap-2 mt-4">
                                      <button 
                                        onClick={() => handleActionConfirm(msg.id, block)}
                                        className="flex-1 rounded-xl bg-[var(--brand)] py-2.5 text-[13px] font-bold text-[var(--brand-ink)] active:scale-95 transition-transform"
                                      >
                                        Confirm
                                      </button>
                                      <button 
                                        onClick={() => handleActionCancel(msg.id)}
                                        className="flex-1 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] py-2.5 text-[13px] font-bold text-[var(--text-1)] active:scale-95 transition-transform"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}

                        {msg.status === "error" && (
                          <div className="flex items-center gap-2 mt-2 px-1">
                            <button 
                              onClick={() => send(messages[messages.length - 2]?.content || "Retry")} 
                              className="text-[11px] font-medium text-[var(--brand)] flex items-center gap-1"
                            >
                              <RefreshCw size={12} /> Retry
                            </button>
                          </div>
                        )}

                        {msg.status !== "error" && (
                          <div className="flex items-center gap-3 mt-2 px-1">
                            <button onClick={() => handlePinInsight(msg.content)} className="text-[11px] font-medium text-[var(--text-3)] hover:text-[var(--brand)] flex items-center gap-1">
                              <Pin size={12} /> Pin to Home
                            </button>
                            <button onClick={() => navigator.clipboard.writeText(msg.content)} className="text-[11px] font-medium text-[var(--text-3)] hover:text-[var(--text-1)] flex items-center gap-1">
                              <Copy size={12} /> Copy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {isThinking && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/10 mt-1">
                    <Loader2 size={14} className="text-[var(--brand)] animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {thinkingLabel && !streamingContent && (
                      <div className="rounded-[20px] rounded-tl-sm bg-[var(--surface-2)] border border-[var(--line)] p-4 shadow-sm w-fit">
                         <div className="flex items-center gap-3 text-[13px] text-[var(--text-2)] animate-pulse">
                            <Search size={14} className="text-[var(--text-3)]" />
                            {thinkingLabel}
                         </div>
                      </div>
                    )}
                    {streamingContent && (
                      <div className="rounded-[20px] rounded-tl-sm bg-[var(--surface-1)] p-4 text-[15px] leading-relaxed text-[var(--text-1)] border border-[var(--line)] shadow-sm">
                        {formatMessage(streamingContent)}
                        <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--brand)] animate-pulse align-middle" />
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
        <div 
          className="relative z-10 shrink-0 px-4 pt-2 bg-[var(--bg)] border-t border-[var(--line)]"
          style={{ paddingBottom: kbOpen ? 8 : "calc(env(safe-area-inset-bottom) + 8px)" }}
        >
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
              placeholder={hasSentFirstMessage ? "Ask a follow up..." : "Ask about your money..."}
              className="flex-1 max-h-32 min-h-[40px] bg-transparent px-4 py-2.5 text-[16px] text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)] resize-none"
              style={{ caretColor: "var(--brand)" }}
              rows={1}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-95",
                input.trim() && !isThinking ? "bg-[var(--brand)] text-[var(--brand-ink)]" : "bg-[var(--surface-3)] text-[var(--text-3)]"
              )}
            >
              {isThinking ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* History Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 z-[110]"
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.div 
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 left-0 bottom-0 w-[280px] bg-[var(--surface-1)] z-[120] flex flex-col border-r border-[var(--line)]"
                style={{
                  paddingTop: "calc(env(safe-area-inset-top) + 12px)",
                  paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
                }}
              >
                <div className="px-4 pb-3 border-b border-[var(--line)] flex justify-between items-center">
                  <span className="font-bold text-[var(--text-1)]">History</span>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)]"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  <button 
                    onClick={startNewChat}
                    className="w-full flex items-center gap-2 p-3 rounded-lg bg-[var(--brand)]/10 text-[var(--brand)] font-semibold text-sm mb-4"
                  >
                    <Plus size={16} /> New Chat
                  </button>
                  {conversations.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setActiveConvId(c.id); setIsSidebarOpen(false); }}
                      className={cn(
                        "w-full text-left p-3 rounded-lg text-sm truncate transition-colors",
                        activeConvId === c.id ? "bg-[var(--fill-2)] text-[var(--text-1)]" : "text-[var(--text-2)] hover:bg-[var(--fill-1)]"
                      )}
                    >
                      {c.title}
                    </button>
                  ))}
                  {conversations.length === 0 && (
                    <p className="text-center text-[var(--text-3)] text-sm mt-10">No past conversations</p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}