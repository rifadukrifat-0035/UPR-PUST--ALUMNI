"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageSquare, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function URPChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hello! I am the URP Connect AI Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const userMsg: ChatMessage = { role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          input: userText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chatbot request failed: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data?.reply;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            typeof botReply === "string" && botReply.trim().length > 0
              ? botReply
              : "I could not generate a response just now. Please try again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I am having trouble connecting right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-emerald-600 p-4 text-white shadow-[0_0_40px_rgba(16,185,129,0.45)] transition-transform duration-200 hover:scale-110 hover:bg-emerald-500 active:scale-95"
          aria-label="Open URP chatbot"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {isOpen && (
        <div className="flex h-[500px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Bot size={20} /> <span>URP Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chatbot"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 p-4">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-md bg-emerald-600 text-white"
                      : "rounded-bl-md bg-slate-800 text-slate-100"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs italic text-emerald-400 animate-pulse">
                AI is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t border-white/10 bg-slate-900/80 p-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder="Ask anything about URP..."
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => void handleSend()}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-emerald-600 p-2 text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}