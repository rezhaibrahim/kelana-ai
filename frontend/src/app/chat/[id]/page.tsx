"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ChatMessage from "@/components/ChatMessage";
import TypingIndicator from "@/components/TypingIndicator";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, authHeaders } from "@/lib/api";
import type { Message, SendMessageResponse } from "@/lib/types";

export default function ChatDetailPage() {
  return (
    <RequireAuth>
      <ChatDetail />
    </RequireAuth>
  );
}

function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const { token, logout } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function loadConversation() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}`, {
          headers: authHeaders(token),
        });
        if (res.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        if (res.status === 404) {
          if (!cancelled) setError("Conversation not found.");
          return;
        }
        if (!res.ok) throw new Error("Failed to load conversation");
        const data = await res.json();
        if (!cancelled) {
          setTitle(data.title);
          setMessages(data.messages);
        }
      } catch {
        if (!cancelled) setError("Something went wrong. Please check that the backend is running.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadConversation();
    return () => {
      cancelled = true;
    };
  }, [id, token, logout, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    const content = draft;
    setDraft("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ content }),
      });
      if (res.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      if (res.status === 404) {
        setError("Conversation not found.");
        return;
      }
      if (!res.ok) throw new Error("Failed to send message");
      const data: SendMessageResponse = await res.json();
      setMessages((prev) => [...prev, data.user_message, data.assistant_message]);
    } catch {
      setError("Something went wrong. Please check that the backend is running.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-4 py-6 sm:px-6">
      <div className="mb-4">
        <Link href="/chat" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to conversations
        </Link>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          {loading ? "Loading..." : title ?? "Conversation"}
        </h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-slate-50 p-4">
        {loading && <p className="text-sm text-slate-500">Loading messages...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading &&
          messages.map((message) => <ChatMessage key={message.id} message={message} />)}

        {sending && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          required
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a follow-up question..."
          disabled={sending}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-orange-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}
