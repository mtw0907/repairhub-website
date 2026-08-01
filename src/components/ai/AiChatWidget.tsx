"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function AiChatWidget({ mode }: { mode?: "partner" }) {
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
    <div className="flex h-[500px] flex-col rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] whitespace-pre-line rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
                : "mr-auto max-w-[80%] whitespace-pre-line rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
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
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {loading ? "..." : "전송"}
        </button>
      </form>
    </div>
  );
}
