"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function AiChatWidget({ mode, compact }: { mode?: "partner"; compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: messages, mode }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (res.ok) {
      setMessages([...nextMessages, { role: "assistant", content: data.result }]);
    } else {
      setError(data?.error ?? "응답 생성 중 오류가 발생했습니다.");
    }
  }

  return (
    <div
      className={
        (compact ? "flex h-[320px] flex-col" : "flex h-[500px] flex-col") +
        " rounded-2xl border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      }
    >
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] whitespace-pre-line rounded-2xl bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                : "mr-auto max-w-[80%] whitespace-pre-line rounded-2xl bg-surface-muted px-3.5 py-2 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
            }
          >
            {m.content}
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-sm text-neutral-400">궁금한 점을 물어보세요.</p>
        )}
        {error && <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-neutral-100 p-3 dark:border-neutral-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-xl border border-neutral-200 bg-surface-muted px-3 py-2 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "..." : "전송"}
        </button>
      </form>
    </div>
  );
}
