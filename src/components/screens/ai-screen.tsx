"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ArrowUp, Loader2, CheckCircle2,
  Plus, Wallet, PieChart, Copy, Check,
  AlertCircle, RefreshCw, XCircle, Menu, X, Mic, Trash2,
  TrendingUp, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/workspace";
import { useCurrency } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import type { HomeMetrics } from "@/lib/types";
import type { SafeToSpend } from "@/lib/supabase/database";
import { useToast } from "../ui/toast";
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

interface AIScreenProps {
  onBack: () => void;
  fullName?: string;
  safeToSpend: SafeToSpend | null;
  metrics: HomeMetrics;
  topCategory: string | null;
  daysUntilIncome: number;
  onDataChanged?: () => void;
}

const truncateTitle = (t: string) => {
  const s = t.trim().replace(/\s+/g, " ");
  return s.length > 40 ? s.slice(0, 40).trimEnd() + "…" : s;
};

/**
 * Living Acuity AI Companion
 * Expressive white pill eyes with organic blinking, gaze tracking,
 * and warm Acuity Ember radiant aura - inspired by companion AI aesthetics.
 */
function AcuityCompanion({
  isThinking = false,
  size = "large",
}: {
  isThinking?: boolean;
  size?: "large" | "compact";
}) {
  const [blinkState, setBlinkState] = useState(false);
  const [gaze, setGaze] = useState({ x: 0, y: 0, rotate: 7 });
  const [isWinking, setIsWinking] = useState(false);

  // Natural organic blinking (randomized delay with occasional double-blink)
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const scheduleBlink = () => {
      const delay = Math.random() * 2400 + 2600; // 2.6s - 5s
      timeout = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => {
          setBlinkState(false);
          // 25% chance of an expressive double-blink
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setBlinkState(true);
              setTimeout(() => {
                setBlinkState(false);
                scheduleBlink();
              }, 110);
            }, 90);
          } else {
            scheduleBlink();
          }
        }, 130);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Subtle gaze shift (looking around naturally)
  useEffect(() => {
    let gazeTimeout: NodeJS.Timeout;

    const scheduleGaze = () => {
      const delay = Math.random() * 3200 + 3000;
      gazeTimeout = setTimeout(() => {
        const randomX = (Math.random() - 0.5) * 8; // -4 to +4 px
        const randomY = (Math.random() - 0.5) * 6; // -3 to +3 px
        const randomRot = 7 + (Math.random() - 0.5) * 6; // 4 to 10 deg
        setGaze({ x: randomX, y: randomY, rotate: randomRot });
        scheduleGaze();
      }, delay);
    };

    scheduleGaze();
    return () => clearTimeout(gazeTimeout);
  }, []);

  const handleTap = () => {
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 300);
  };

  const isCompact = size === "compact";

  return (
    <div
      onClick={handleTap}
      className={cn(
        "relative flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95",
        isCompact ? "h-9 w-14" : "h-32 sm:h-36 w-full my-1"
      )}
      title="Acuity Personal AI • Tap to say hi!"
    >
      {/* Radiant Brand Ember Aura (Breathing Glow) */}
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.25, 1] : [1, 1.08, 1],
          opacity: isThinking ? [0.65, 0.95, 0.65] : [0.38, 0.58, 0.38],
        }}
        transition={{
          duration: isThinking ? 1.4 : 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute rounded-full pointer-events-none",
          isCompact ? "w-16 h-16 blur-md" : "w-48 h-48 sm:w-56 sm:h-56 blur-2xl"
        )}
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand) 45%, transparent) 0%, color-mix(in srgb, var(--brand) 16%, transparent) 46%, transparent 72%)",
        }}
      />

      {/* Eyes Container */}
      <motion.div
        animate={{
          x: gaze.x,
          y: gaze.y,
          rotate: gaze.rotate,
        }}
        transition={{ type: "spring", stiffness: 140, damping: 14 }}
        className={cn(
          "relative flex items-center z-10",
          isCompact ? "gap-2" : "gap-4 sm:gap-5"
        )}
      >
        {/* Left Eye */}
        <motion.div
          animate={{
            scaleY: isWinking || blinkState ? 0.08 : isThinking ? 0.55 : 1,
            scaleX: isThinking ? 1.1 : 1,
          }}
          transition={{ duration: 0.11 }}
          className={cn(
            "rounded-[10px] sm:rounded-[13px] bg-white shadow-[0_0_24px_rgba(255,255,255,0.7),0_0_10px_rgba(222,49,33,0.35)] origin-center",
            isCompact ? "w-2.5 h-6" : "w-6 h-13 sm:w-7 sm:h-14"
          )}
        />

        {/* Right Eye */}
        <motion.div
          animate={{
            scaleY: blinkState ? 0.08 : isThinking ? 0.55 : 1,
            scaleX: isThinking ? 1.1 : 1,
          }}
          transition={{ duration: 0.11 }}
          className={cn(
            "rounded-[10px] sm:rounded-[13px] bg-white shadow-[0_0_24px_rgba(255,255,255,0.7),0_0_10px_rgba(222,49,33,0.35)] origin-center",
            isCompact ? "w-2.5 h-6" : "w-6 h-13 sm:w-7 sm:h-14"
          )}
        />
      </motion.div>
    </div>
  );
}

export function AIScreen({
  onBack,
  fullName = "there",
  safeToSpend,
  metrics,
  daysUntilIncome,
  onDataChanged,
}: AIScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingLabel, setThinkingLabel] = useState("Checking your data...");
  const [streamingContent, setStreamingContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [greeting, setGreeting] = useState("Good day");
  const [convToDelete, setConvToDelete] = useState<string | null>(null);

  // Viewport tracking to prevent mobile keyboard jumps
  const [vvHeight, setVvHeight] = useState<number | null>(null);
  const [vvTop, setVvTop] = useState<number>(0);

  // Ref to flag that a conversation was created locally to prevent loadHistory race condition
  const isNewConvRef = useRef<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bufferRef = useRef("");

  const { active: activeWs } = useWorkspace();
  const { fmt } = useCurrency();
  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);

  // Time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    setGreeting(timeOfDay);
  }, []);

  // Keyboard jump prevention & visual viewport synchronization
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    const origPosition = document.body.style.position;
    const origWidth = document.body.style.width;
    const origHeight = document.body.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    const vv = window.visualViewport;
    const updateViewport = () => {
      if (vv) {
        setVvHeight(vv.height);
        setVvTop(vv.offsetTop);
      }
    };

    if (vv) {
      updateViewport();
      vv.addEventListener("resize", updateViewport);
      vv.addEventListener("scroll", updateViewport);
    }

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.position = origPosition;
      document.body.style.width = origWidth;
      document.body.style.height = origHeight;

      if (vv) {
        vv.removeEventListener("resize", updateViewport);
        vv.removeEventListener("scroll", updateViewport);
      }
    };
  }, []);

  // Load conversations list
  useEffect(() => {
    if (!activeWs?.id) return;

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
  }, [activeWs?.id, supabase]);

  // Load messages for the active conversation
  // FIX: Guard against wiping out local messages when a brand new conversation was just created
  useEffect(() => {
    if (!activeWs?.id || !activeConvId) return;

    if (isNewConvRef.current === activeConvId) {
      // Conversation was just created in send() - skip loading from DB
      isNewConvRef.current = null;
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      const { data, error } = await supabase
        .from("ai_chat_history")
        .select("*")
        .eq("workspace_id", activeWs.id)
        .eq("conversation_id", activeConvId)
        .order("created_at", { ascending: true });

      if (!isMounted) return;

      if (error) {
        console.error("Error loading history:", error);
        return;
      }

      if (data && data.length > 0) {
        setMessages(data.map(d => ({
          id: d.id,
          role: d.role,
          content: d.content || "", 
          blocks: d.blocks || [],
          status: d.status || "ok",
          actionId: d.action_id || undefined,
          actionStatus: d.action_status || undefined
        })));
      } else {
        // Only clear if no messages exist locally to avoid wiping active chats
        setMessages(prev => (prev.length > 0 ? prev : []));
      }
    };
    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [activeWs?.id, activeConvId, supabase]);

  // Scroll to bottom when new messages arrive or when streaming
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: streamingContent ? "auto" : "smooth" });
  }, [messages, isThinking, streamingContent]);

  const saveMessageToDb = async (msg: Message, convId: string) => {
    if (!activeWs?.id || !convId) return;
    
    const { error } = await supabase.from("ai_chat_history").insert({
      workspace_id: activeWs.id,
      conversation_id: convId,
      role: msg.role,
      content: msg.content,
    });

    if (error) {
      console.error("Error saving message to DB:", error);
    }
  };

  const confirmDelete = async () => {
    if (!convToDelete || !activeWs?.id) return;

    try {
      const { error } = await supabase
        .from("ai_chat_history")
        .delete()
        .eq("workspace_id", activeWs.id)
        .eq("conversation_id", convToDelete);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== convToDelete));
      
      if (activeConvId === convToDelete) {
        setMessages([]);
        setActiveConvId(null);
      }
      setConvToDelete(null);
      toast("Conversation deleted");
    } catch (err: any) {
      toast("Failed to delete conversation", "err");
    }
  };

  const startNewChat = () => {
    isNewConvRef.current = null;
    setMessages([]);
    setActiveConvId(null);
    setInput("");
    setIsSidebarOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInputFocus = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || isThinking) return;

    let convId = activeConvId;
    if (!convId) {
      convId = crypto.randomUUID();
      // Record that this is a new local conversation to prevent loadHistory race condition
      isNewConvRef.current = convId;
      setActiveConvId(convId);
      setConversations(prev => [
        { id: convId!, title: truncateTitle(text), created_at: new Date().toISOString() },
        ...prev
      ]);
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsThinking(true);
    setThinkingLabel("Consulting financial model...");
    setStreamingContent("");
    bufferRef.current = "";

    await saveMessageToDb(userMsg, convId); 

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
      
      await saveMessageToDb(finalMsg, convId);

    } catch (err: any) {
      console.error("AI send error:", err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I couldn't complete that calculation. Please check your connection and try again.",
        status: "error"
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
      setStreamingContent("");
    }
  };

  const handleActionConfirm = async (msgId: string, block: Block) => {
    try {
      const { action, payload } = block;

      if (action === "add_transaction" || action === "add_bill" || action === "add_income") {
        let finalAccountId = payload.account_id;
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalAccountId);
        
        if (!finalAccountId || !isUUID) {
          const accounts = await getAccounts();
          const matched = accounts.find(a => 
            a.name.toLowerCase().includes(String(finalAccountId).toLowerCase()) || 
            String(finalAccountId).toLowerCase().includes(a.name.toLowerCase()) ||
            (finalAccountId === "main_account_id" && a.name.toLowerCase().includes("main"))
          );

          if (!matched) {
            throw new Error("Could not identify the account. Please specify the account name exactly.");
          }
          finalAccountId = matched.id;
        }

        if (action === "add_transaction") {
          const direction = payload.direction === "credit" ? "credit" : "debit";
          
          await createTransaction({
            account_id: finalAccountId,
            amount: Number(payload.amount) || 0,
            direction: direction,
            description: payload.description || "AI Transaction",
            category: payload.category || "Uncategorized",
            date: payload.date || new Date().toISOString(),
          });
        } else {
          await addRecurringItem({
            account_id: finalAccountId,
            name: payload.name || "New Item",
            kind: action === "add_bill" ? "bill" : "income",
            amount: Number(payload.amount) || 0,
            frequency: payload.frequency || "monthly",
            day: Number(payload.day) || 1,
          });
        }
      } else if (action === "set_budget") {
        await setBudget(payload.account_id || null, payload.category, (Number(payload.limit) || 0) * 100);
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
      toast("Action applied to your books");
      onDataChanged?.();
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
    if (!content) return null;
    const lines = content.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        return (
          <div key={i} className="flex items-start gap-2.5 mt-1.5 first:mt-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] mt-2 shrink-0 shadow-sm shadow-[var(--brand)]/40" />
            <p className="text-[15px] leading-relaxed flex-1 text-[var(--text-1)]">{renderInline(trimmed.slice(2))}</p>
          </div>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const numberMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
        return (
          <div key={i} className="flex items-start gap-2.5 mt-1.5 first:mt-0">
            <span className="text-[13px] font-bold text-[var(--brand)] mt-0.5 shrink-0 tabular">{numberMatch?.[1]}.</span>
            <p className="text-[15px] leading-relaxed flex-1 text-[var(--text-1)]">{renderInline(numberMatch?.[2] || "")}</p>
          </div>
        );
      }
      if (line.startsWith("###")) {
        return <p key={i} className="mt-3.5 mb-1.5 text-[15px] font-bold text-[var(--text-1)] first:mt-0 tracking-tight">{line.replace(/^###\s*/, "")}</p>;
      }
      if (trimmed === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-[15px] leading-relaxed mb-1.5 text-[var(--text-1)]">{renderInline(line)}</p>;
    });
  };

  const firstName = fullName.split(" ")[0];
  
  const dailySafeAmount = safeToSpend?.daily_safe_minor ? safeToSpend.daily_safe_minor / 100 : 0;
  const budgetUsedPct = metrics && metrics.budget_limit_minor > 0
    ? Math.round((metrics.total_spent_minor / metrics.budget_limit_minor) * 100)
    : 0;

  const suggestions = useMemo(() => {
    return [
      {
        title: "How much can I safely spend this week?",
        subtitle: "Safe-to-Spend & cash runway",
        icon: Wallet,
        color: "text-amber-400 bg-amber-400/10",
      },
      {
        title: "Where am I spending the most money?",
        subtitle: "Breakdown of top expense categories",
        icon: PieChart,
        color: "text-rose-400 bg-rose-400/10",
      },
      {
        title: daysUntilIncome > 0
          ? `Payday in ${daysUntilIncome} days. How do I stretch what's left?`
          : "How do I optimize my budget this month?",
        subtitle: "Cash buffer calculation",
        icon: TrendingUp,
        color: "text-emerald-400 bg-emerald-400/10",
      },
      {
        title: metrics?.uncategorized_count && metrics.uncategorized_count > 0
          ? `Help me review ${metrics.uncategorized_count} uncategorized transactions`
          : "Audit my recent transactions and bank fees",
        subtitle: "Transaction hygiene & intelligence",
        icon: Zap,
        color: "text-sky-400 bg-sky-400/10",
      }
    ];
  }, [daysUntilIncome, metrics]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.24 } }}
      exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.16 } }}
      className="fixed inset-x-0 z-50 flex flex-col bg-[var(--bg)] overflow-hidden select-none"
      style={{
        position: "fixed",
        top: vvTop,
        left: 0,
        right: 0,
        height: vvHeight ? `${vvHeight}px` : "100dvh",
        maxHeight: vvHeight ? `${vvHeight}px` : "100dvh",
        touchAction: "pan-y",
      }}
    >
      {/* Ambient Radial Gradient Glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "-15%",
            right: "-20%",
            width: "80vmax",
            height: "80vmax",
            background: "radial-gradient(closest-side, color-mix(in srgb, var(--brand) 12%, transparent), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-25%",
            width: "60vmax",
            height: "60vmax",
            background: "radial-gradient(closest-side, rgba(255, 107, 74, 0.05), transparent 75%)",
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header
        className="relative z-20 shrink-0 flex items-center justify-between px-4 pb-2.5 border-b border-white/5 bg-[var(--bg)]/80 backdrop-blur-xl"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 10px)" }}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            aria-label="Back to dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] border border-white/10 text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-all active:scale-95 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open chat history"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] border border-white/10 text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-all active:scale-95 shadow-sm"
          >
            <Menu size={18} />
          </button>
          
          <div className="flex items-center gap-2 ml-1">
            <div className="flex items-baseline">
              <span className="text-[19px] font-black tracking-tight text-[var(--text-1)]">ACUITY</span>
              <span className="text-[19px] font-black tracking-tight text-[var(--brand)]">.</span>
            </div>
            
            {/* Branded Monogram Badge */}
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-white/10 shadow-sm">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--brand)] text-[8px] font-black text-black leading-none">
                A
              </span>
              <span className="text-[10px] font-bold text-[var(--text-2)] tracking-wider uppercase">Personal CFO</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="flex h-9 items-center gap-1.5 px-3 rounded-full bg-[var(--surface-2)] border border-white/10 text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-all active:scale-95 text-xs font-semibold shadow-sm"
          >
            <Plus size={15} className="text-[var(--brand)]" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <main
        className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && !isThinking ? (
          <div className="flex flex-col justify-start max-w-xl mx-auto py-3">
            {/* Top Greeting Header */}
            <div className="mb-4 space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--brand)]/30 mb-2 shadow-sm">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand)] text-[9px] font-black text-black leading-none shadow-sm shadow-[var(--brand)]/30">
                  A
                </span>
                <span className="text-[12px] font-bold text-[var(--text-1)] tracking-tight">
                  Acuity Personal CFO
                </span>
              </div>

              <h1 className="text-[32px] sm:text-[38px] font-extrabold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-white via-neutral-200 to-[var(--brand)] bg-clip-text text-transparent">
                  {greeting}, {firstName}
                </span>
              </h1>
              <p className="text-[15px] sm:text-[17px] text-[var(--text-3)] font-normal leading-relaxed">
                Your personal AI partner watching your money so you don't have to.
              </p>
            </div>

            {/* Living Acuity Companion (Animated Blinking Eyes in Ember Aura) */}
            <AcuityCompanion isThinking={isThinking} size="large" />

            {/* Financial Status Quick Pulse Cards */}
            <div className="rounded-[22px] bg-[var(--surface-2)]/90 border border-white/10 p-4 mb-4 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-3)]">
                  Live Financial Pulse
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--gain)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gain)] animate-pulse" />
                  Realtime Active
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col p-2.5 rounded-xl bg-[var(--surface-3)]/60 border border-white/5">
                  <span className="text-[11px] text-[var(--text-3)] mb-0.5">Safe Today</span>
                  <span className="text-[13px] font-bold text-[var(--brand)] tabular truncate">
                    {dailySafeAmount > 0 ? fmt(dailySafeAmount) : "Calculating"}
                  </span>
                </div>

                <div className="flex flex-col p-2.5 rounded-xl bg-[var(--surface-3)]/60 border border-white/5">
                  <span className="text-[11px] text-[var(--text-3)] mb-0.5">Payday</span>
                  <span className="text-[13px] font-bold text-[var(--text-1)] truncate">
                    {daysUntilIncome > 0 ? `In ${daysUntilIncome}d` : "Upcoming"}
                  </span>
                </div>

                <div className="flex flex-col p-2.5 rounded-xl bg-[var(--surface-3)]/60 border border-white/5">
                  <span className="text-[11px] text-[var(--text-3)] mb-0.5">Budget</span>
                  <span className={cn(
                    "text-[13px] font-bold tabular truncate",
                    budgetUsedPct > 85 ? "text-[var(--danger)]" : "text-[var(--gain)]"
                  )}>
                    {budgetUsedPct}% used
                  </span>
                </div>
              </div>
            </div>

            {/* Prompt Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestions.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => send(s.title)}
                    className="flex flex-col justify-between p-3.5 rounded-[18px] bg-[var(--surface-2)]/80 hover:bg-[var(--surface-3)] border border-white/8 text-left transition-all active:scale-[0.98] group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", s.color)}>
                        <Icon size={16} />
                      </div>
                      <ArrowUp size={15} className="text-[var(--text-3)] group-hover:text-[var(--brand)] transition-colors rotate-45" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[var(--text-1)] leading-snug mb-0.5">
                        {s.title}
                      </p>
                      <p className="text-[11.5px] text-[var(--text-3)]">
                        {s.subtitle}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
              >
                {msg.role === "user" ? (
                  /* User Bubble */
                  <div className="max-w-[85%] rounded-[22px] rounded-br-sm bg-[var(--surface-2)] border border-white/10 px-4 py-3 text-[15px] leading-relaxed text-white shadow-sm">
                    {msg.content}
                  </div>
                ) : (
                  /* Assistant Response */
                  <div className="w-full flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] mt-0.5 shadow-md shadow-[var(--brand)]/20">
                      <span className="text-[13px] font-black text-[var(--brand-ink)]">A.</span>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      {msg.content && (
                        <div className="text-[15px] leading-relaxed text-[var(--text-1)]">
                          {formatMessage(msg.content)}
                        </div>
                      )}

                      {/* Interactive Action Proposal Cards */}
                      {msg.blocks?.map((block, idx) => {
                        if (block.type === "action") {
                          const isResolved = block.resolved || msg.actionStatus === "applied" || msg.actionStatus === "cancelled";
                          return (
                            <div key={idx} className="mt-3.5 rounded-[20px] border border-[var(--brand)]/35 bg-[var(--surface-2)] p-4 shadow-sm overflow-hidden">
                              <div className="flex items-center gap-2 mb-2">
                                {msg.actionStatus === "applied" ? (
                                  <CheckCircle2 size={16} className="text-[var(--gain)]" />
                                ) : msg.actionStatus === "cancelled" ? (
                                  <XCircle size={16} className="text-[var(--text-3)]" />
                                ) : (
                                  <AlertCircle size={16} className="text-[var(--brand)]" />
                                )}
                                <span className="text-[13px] font-bold text-[var(--text-1)]">
                                  {msg.actionStatus === "applied" ? "Action Applied" : msg.actionStatus === "cancelled" ? "Action Cancelled" : "Confirm Financial Action"}
                                </span>
                              </div>

                              <p className="text-[14px] text-[var(--text-2)] leading-relaxed">
                                {block.summary}
                              </p>
                              
                              {!isResolved && (
                                <div className="flex items-center gap-2 mt-4">
                                  <button
                                    onClick={() => handleActionConfirm(msg.id, block)}
                                    className="flex-1 rounded-xl bg-[var(--brand)] py-2.5 text-[13px] font-bold text-[var(--brand-ink)] hover:brightness-110 active:scale-95 transition-all shadow-sm shadow-[var(--brand)]/25"
                                  >
                                    Confirm Action
                                  </button>
                                  <button
                                    onClick={() => handleActionCancel(msg.id)}
                                    className="flex-1 rounded-xl bg-[var(--surface-3)] border border-white/10 py-2.5 text-[13px] font-bold text-[var(--text-2)] hover:text-[var(--text-1)] active:scale-95 transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}

                      {/* Assistant Message Actions (Copy & Retry) */}
                      <div className="flex items-center gap-3 mt-3">
                        {msg.status === "error" ? (
                          <button
                            onClick={() => send(messages[messages.length - 2]?.content || "Retry")}
                            className="text-[12px] font-medium text-[var(--brand)] hover:underline flex items-center gap-1.5"
                          >
                            <RefreshCw size={13} /> Retry calculation
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="text-[12px] font-medium text-[var(--text-3)] hover:text-[var(--text-1)] flex items-center gap-1.5 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check size={13} className="text-[var(--gain)]" />
                                <span className="text-[var(--gain)]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Thinking & Streaming State with Expressive Mini Companion */}
            {isThinking && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <AcuityCompanion isThinking={true} size="compact" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  {thinkingLabel && !streamingContent && (
                    <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--brand)] animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                      {thinkingLabel}
                    </div>
                  )}
                  {streamingContent && (
                    <div className="text-[15px] leading-relaxed text-[var(--text-1)]">
                      {formatMessage(streamingContent)}
                      <span className="inline-block w-2 h-4 ml-1 bg-[var(--brand)] animate-pulse align-middle" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            <div ref={endRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Floating Capsule Composer - Polished Borders & Seamless Background */}
      <footer
        className="relative z-20 shrink-0 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)] bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/95 to-transparent"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 rounded-[30px] bg-[var(--surface-2)]/90 backdrop-blur-2xl p-1.5 pl-4 border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.4)] focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/25 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onFocus={handleInputFocus}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask your CFO anything..."
              className="flex-1 max-h-32 min-h-[42px] bg-transparent py-2.5 text-[15px] sm:text-[16px] leading-[1.4] text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)] resize-none"
              style={{
                caretColor: "var(--brand)",
                fontSize: "16px", // Ensures iOS Safari does not auto-zoom
              }}
              rows={1}
            />
            <div className="flex items-center gap-1.5 shrink-0 pr-1">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-colors"
                title="Voice input"
              >
                <Mic size={19} />
              </button>
              
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim() || isThinking}
                aria-label="Send message"
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 shadow-sm",
                  input.trim() && !isThinking
                    ? "bg-[var(--brand)] text-[var(--brand-ink)] shadow-[var(--brand)]/25"
                    : "bg-[var(--surface-3)] text-[var(--text-3)] cursor-not-allowed opacity-50"
                )}
              >
                {isThinking ? (
                  <Loader2 size={18} className="animate-spin text-[var(--brand)]" />
                ) : (
                  <ArrowUp size={19} strokeWidth={2.8} />
                )}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* History Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[290px] bg-[var(--surface-1)] z-[120] flex flex-col border-r border-white/10 shadow-2xl"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 12px)",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
              }}
            >
              <div className="px-4 pb-3 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[16px] text-[var(--text-1)]">Chat History</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors"
                  aria-label="Close history"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3">
                <button
                  onClick={startNewChat}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[var(--brand)]/10 hover:bg-[var(--brand)]/15 border border-[var(--brand)]/20 text-[var(--brand)] font-semibold text-sm transition-colors active:scale-98"
                >
                  <Plus size={16} /> New Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "group w-full flex items-center justify-between p-3 rounded-xl text-sm transition-colors cursor-pointer",
                      activeConvId === c.id
                        ? "bg-[var(--surface-2)] text-[var(--text-1)] font-medium border border-white/10"
                        : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]"
                    )}
                    onClick={() => {
                      setActiveConvId(c.id);
                      setIsSidebarOpen(false);
                    }}
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConvToDelete(c.id);
                      }}
                      className="text-[var(--text-3)] hover:text-[var(--danger)] p-1 rounded-lg transition-colors shrink-0 opacity-70 group-hover:opacity-100"
                      title="Delete conversation"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <p className="text-[13px] text-[var(--text-3)]">No past conversations yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {convToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setConvToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[24px] bg-[var(--surface-2)] border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--danger)]/15">
                  <AlertCircle size={20} className="text-[var(--danger)]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[var(--text-1)]">Delete conversation?</h3>
                  <p className="text-[13px] text-[var(--text-3)]">This cannot be undone.</p>
                </div>
              </div>
              
              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={() => setConvToDelete(null)}
                  className="flex-1 rounded-xl bg-[var(--surface-3)] py-2.5 text-[14px] font-semibold text-[var(--text-1)] active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-[var(--danger)] py-2.5 text-[14px] font-semibold text-white active:scale-95 transition-transform"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
