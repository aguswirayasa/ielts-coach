"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";

type ChatRole = "user" | "assistant";
interface ChatMessage {
  role: ChatRole;
  content: string;
}

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Good evening, Master. I am Yoru, at your service. Ask me anything about IELTS.",
};

// Trim history to the last 20 messages before sending, roles user/assistant only.
function toHistory(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-20);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function handleSend() {
    const message = input.trim();
    if (!message || streaming) return;

    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setError(null);

    const history = toHistory(messages);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Request failed");
      }

      let reply = "";
      setMessages([...next, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: reply };
          return copy;
        });
      }
    } catch (err) {
      console.error("[chat] send failed:", err);
      setError(
        "Yoru could not reach the model, Master. Check the connection and try again."
      );
    } finally {
      setStreaming(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    handleSend();
  }

  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-[28rem] flex-col lg:h-[calc(100vh-9rem)]">
      <PageHeader
        title="Chat with Yoru"
        description="Ask me anything about IELTS, Master. I am at your service."
      />

      {/* Scrollable message list */}
      <div
        ref={scrollRef}
        className="mt-6 flex flex-1 flex-col gap-3 overflow-y-auto pr-1"
      >
        <AnimatePresence initial={false}>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={spring}
            layout
            className={cn(
              "flex w-full",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%]",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground"
              )}
            >
              {m.content || "\u00A0"}
            </div>
          </motion.div>
        ))}
        </AnimatePresence>

        {error && (
          <div className="flex w-full justify-start">
            <div className="max-w-[85%] rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm leading-relaxed text-destructive sm:max-w-[70%]">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input row: translucent composer, chrome floats over content */}
      <form
        onSubmit={onFormSubmit}
        className="glass-card mt-4 flex items-end gap-2 rounded-2xl border border-white/[0.06] p-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={streaming}
          placeholder={streaming ? "Yoru is thinking..." : "Ask Yoru about IELTS..."}
          rows={2}
          className="min-h-11 max-h-40 flex-1 resize-none border-transparent bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
          aria-label="Message Yoru"
        />
        <Button
          type="submit"
          size="lg"
          disabled={streaming || input.trim().length === 0}
          className="h-11 shrink-0 px-5"
        >
          {streaming ? "Thinking" : "Send"}
        </Button>
      </form>
    </div>
  );
}
