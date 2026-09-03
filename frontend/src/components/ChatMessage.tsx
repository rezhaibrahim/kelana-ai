import type { Message } from "@/lib/types";

function formatTime(isoString: string) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ring-1 ${
            isUser
              ? "bg-orange-500 text-white ring-orange-500/10"
              : "bg-white text-slate-700 ring-slate-900/5"
          }`}
        >
          {message.content}
        </div>
        <span className="px-1 text-xs text-slate-400">{formatTime(message.created_at)}</span>
      </div>
    </div>
  );
}
