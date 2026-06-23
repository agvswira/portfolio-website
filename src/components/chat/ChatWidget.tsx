"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuMessageCircle, LuX, LuSend } from "react-icons/lu";
import { PERSONAL } from "@/lib/constants";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Halo! Aku asisten virtualnya ${PERSONAL.name}. Mau tanya apa nih? 😊`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    // Placeholder for streaming assistant response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.slice(-10) }),
      });

      if (!res.ok || !res.body) throw new Error("Gagal terhubung.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const json = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = json.choices?.[0]?.delta?.content ?? "";
            full += delta;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: full };
              return copy;
            });
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Coba lagi nanti.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl border border-nord-border/60 overflow-hidden shadow-2xl"
            style={{ maxHeight: "min(520px, calc(100dvh - 120px))" }}
          >
            {/* Header */}
            <div className="glass flex items-center justify-between px-4 py-3 border-b border-nord-border/40">
              <div>
                <p className="text-sm font-semibold text-text-primary">Asisten Virtual</p>
                <p className="text-xs text-text-muted">{PERSONAL.name}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup chat"
                className="p-1.5 rounded-lg text-text-muted hover:text-frost hover:bg-bg-elevated transition-colors"
              >
                <LuX size={16} />
              </button>
            </div>

            {/* Messages — data-lenis-prevent stops Lenis from capturing scroll */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-bg-surface/90 backdrop-blur-md"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-frost text-bg-base rounded-br-sm"
                        : "bg-bg-elevated text-text-secondary rounded-bl-sm border border-nord-border/30"
                    }`}
                  >
                    {msg.content || (
                      <span className="flex gap-1 items-center text-text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="glass border-t border-nord-border/40 px-3 py-3 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Tanya sesuatu..."
                disabled={loading}
                className="flex-1 bg-bg-elevated border border-nord-border/50 rounded-xl px-3.5 py-2 text-sm text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-frost/50 transition-colors disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                aria-label="Kirim pesan"
                className="p-2.5 rounded-xl bg-frost text-bg-base hover:bg-frost-cyan disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <LuSend size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup chat" : "Buka chat dengan asisten virtual"}
        aria-expanded={open}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-13 h-13 rounded-full bg-frost text-bg-base shadow-lg hover:bg-frost-cyan hover:shadow-[0_0_24px_rgba(136,192,208,0.4)] transition-all duration-200 flex items-center justify-center"
        style={{ width: 52, height: 52 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <LuX size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <LuMessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </>
  );
}
