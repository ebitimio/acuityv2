"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";

interface Message { id: string; role: "user" | "assistant"; content: string }

export function AIDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hi! I'm your Acuity Advisor. Ask me anything about your spending, budgets or accounts." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.map(m => ({ role: m.role, content: m.content })) }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...history, { id: Date.now().toString(), role: "assistant", content: data.response }]);
    } catch (e: any) {
      setMessages([...history, { id: Date.now().toString(), role: "assistant", content: "Sorry, I couldn't reach the AI. Please try again." }]);
    } finally { setBusy(false); }
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 28 }} className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)]"><Sparkles size={20} /></div>
          <div><h2 className="text-[17px] font-semibold">Acuity Advisor</h2><p className="text-[13px] text-[var(--brand)]">AI Wealth Manager</p></div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-4 text-[15px] leading-relaxed rounded-2xl ${m.role === "user" ? "bg-[var(--brand)] text-white rounded-tr-sm" : "bg-[#17191A] text-white rounded-tl-sm"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><div className="p-4 bg-[#17191A] rounded-2xl rounded-tl-sm flex gap-1"><span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" /><span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-100" /><span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-200" /></div></div>}
        <div ref={endRef} />
      </div>

      <div className="p-4 pb-8 bg-black border-t border-white/10">
        <div className="flex items-center gap-2 p-2 bg-[#17191A] border border-white/10 rounded-full">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about your money..." className="flex-1 bg-transparent text-[15px] px-4 outline-none placeholder:text-white/30" />
          <button onClick={send} disabled={!input.trim() || busy} className="w-10 h-10 rounded-full bg-[var(--brand)] flex items-center justify-center text-white disabled:opacity-50"><Send size={18} /></button>
        </div>
      </div>
    </motion.div>
  );
}