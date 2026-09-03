"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, authHeaders } from "@/lib/api";
import type { Conversation, ConversationDetail } from "@/lib/types";

export default function ChatListPage() {
  return (
    <RequireAuth>
      <ChatList />
    </RequireAuth>
  );
}

function ChatList() {
  const { token, logout } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function loadConversations() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
          headers: authHeaders(token),
        });
        if (res.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load conversations");
        const data = await res.json();
        if (!cancelled) setConversations(data);
      } catch {
        if (!cancelled) setError("Something went wrong. Please check that the backend is running.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadConversations();
    return () => {
      cancelled = true;
    };
  }, [token, logout, router]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || starting) return;

    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ content: draft }),
      });
      if (res.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to start conversation");
      const data: ConversationDetail = await res.json();
      router.push(`/chat/${data.id}`);
    } catch {
      setError("Something went wrong. Please check that the backend is running.");
      setStarting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Chat with KelanaAI</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask questions and get answers grounded in KelanaAI&apos;s travel knowledge base.
        </p>
      </div>

      <form
        onSubmit={handleStart}
        className="mb-8 flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">Start a new conversation</span>
          <input
            required
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Plan a 5-day trip to Japan"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </label>
        <button
          type="submit"
          disabled={starting}
          className="rounded-lg bg-orange-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {starting ? "Starting..." : "Start chat"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading conversations...</p>}

      {!loading && conversations.length === 0 && (
        <p className="text-sm text-slate-500">No conversations yet. Start one above.</p>
      )}

      {!loading && conversations.length > 0 && (
        <ul className="flex flex-col gap-3">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={`/chat/${conversation.id}`}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md"
              >
                <span className="font-medium text-slate-900">{conversation.title}</span>
                <span className="text-xs text-slate-400">
                  {new Date(conversation.created_at).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
