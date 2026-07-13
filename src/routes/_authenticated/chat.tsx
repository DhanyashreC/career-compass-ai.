import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Bot, Send, User, Sparkles, Trash2 } from "lucide-react";
import { chatCompletion } from "@/lib/ai.functions";
import { Loading } from "@/components/Loading";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatPage,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

function ChatPage() {
  const chat = useServerFn(chatCompletion);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const next: Message[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await chat({ data: { messages: next } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)]">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Chat Coach</h1>
            <p className="text-sm text-muted-foreground">Ask anything about your placement prep.</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg border border-border px-3 py-1.5"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        )}
      </header>

      <div className="glass-card flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="text-sm max-w-sm">
              Hi! I'm your placement coach. Try asking things like{" "}
              <em>"How do I answer 'tell me about yourself'?"</em> or{" "}
              <em>"Make me a 4-week DSA plan"</em>.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <Loading label="Thinking…" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your AI coach…"
          className="flex-1 rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm outline-none ring-focus"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          <Send className="h-4 w-4" /> Send
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, content }: Message) {
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`rounded-lg p-2 shrink-0 ${
          isUser ? "bg-accent/20" : "bg-primary/10"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-accent" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-primary/15 border border-primary/20"
            : "bg-white/5 border border-border"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
