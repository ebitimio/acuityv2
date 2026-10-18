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
      content: "Hi there! I'm your Acuity Advisor. I've analyzed your recent statements. Ask me anything about your spending!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userText = input;
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: userText };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content })) 
        }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.response,
        }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I ran into an error trying to access your data. Please try again.",
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  const lastUserMessageId = [...messages].reverse().find(m => m.role === "user")?.id;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10 bg-black relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-white">Acuity Advisor</h2>
            <p className="text-[13px] text-[var(--brand)]">Active AI Copilot</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white/70 hover:text-white cursor-pointer z-50">
          <X size={20} />
        </button>
      </div>

      {/* Chat Area - Added pb-32 for bottom padding */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 flex flex-col gap-6 relative z-10">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const isTheProcessingMessage = isThinking && msg.id === lastUserMessageId;

          return (
            <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`relative max-w-[85%] ${isTheProcessingMessage ? "rounded-2xl rounded-tr-sm" : ""}`}>
                
                {/* Glow on the active user message while AI is thinking */}
                {isTheProcessingMessage && (
                  <div className="absolute -inset-[2px] rounded-2xl rounded-tr-sm overflow-hidden pointer-events-none z-0">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-50%] opacity-90 blur-[4px]"
                      style={{ 
                        background: "conic-gradient(from 0deg, transparent 0%, #30d158 40%, #64d2ff 80%, transparent 100%)" 
                      }}
                    />
                  </div>
                )}

                <div className={`relative p-4 text-[15px] leading-relaxed z-10 ${
                  isUser 
                    ? "bg-[var(--brand)] text-black rounded-2xl rounded-tr-sm" 
                    : "bg-[#17191A] text-white border border-white/5 rounded-2xl rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking dots */}
        {isThinking && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="p-4 bg-[#17191A] border border-white/5 rounded-2xl rounded-tl-sm flex gap-1">
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-100" />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        
        {/* Added scroll-mb-32 to ensure the last message clears the input */}
        <div ref={messagesEndRef} className="scroll-mb-32 h-1" />
      </div>

      {/* Composer */}
      <div className="p-4 pb-8 bg-black border-t border-white/10 relative z-10 absolute bottom-0 left-0 right-0">
        <div className="max-w-2xl mx-auto w-full">
          <div className="relative flex items-center gap-2 p-2 bg-[#17191A] border border-white/10 rounded-full z-10 w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your money..."
              className="flex-1 bg-transparent text-white text-[15px] px-4 outline-none placeholder:text-white/30"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="w-10 h-10 shrink-0 rounded-full bg-[var(--brand)] flex items-center justify-center text-black disabled:opacity-50 transition-opacity cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}