import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { UserRound, Play, RotateCcw, Award, ThumbsUp, ThumbsDown, Lightbulb, Sparkles } from "lucide-react";
import { generateInterviewQuestion, evaluateInterviewAnswer } from "@/lib/ai.functions";
import { Loading } from "@/components/Loading";

export const Route = createFileRoute("/_authenticated/hr-interview")({
  component: HRInterview,
});

interface Feedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  tips: string[];
}

function HRInterview() {
  const genQ = useServerFn(generateInterviewQuestion);
  const evalA = useServerFn(evaluateInterviewAnswer);

  const [role, setRole] = useState("Software Engineer");
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [asked, setAsked] = useState<string[]>([]);
  const [loading, setLoading] = useState<"q" | "a" | null>(null);

  const start = async () => {
    setLoading("q");
    setFeedback(null);
    setAnswer("");
    try {
      const { question: q } = await genQ({ data: { role, previousQuestions: asked } });
      setQuestion(q);
      setAsked((a) => [...a, q]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load question");
    } finally {
      setLoading(null);
    }
  };

  const submit = async () => {
    if (!question || !answer.trim()) return;
    setLoading("a");
    try {
      const fb = await evalA({ data: { role, question, answer } });
      setFeedback(fb);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <UserRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">HR Interview Practice</h1>
          <p className="text-sm text-muted-foreground">
            Get realistic HR questions and instant AI-graded feedback.
          </p>
        </div>
      </header>

      <div className="glass-card p-5 space-y-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">Target role</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Frontend Developer, Product Manager"
            className="mt-1 w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm outline-none ring-focus"
          />
        </label>
        <div className="flex gap-2">
          <button
            onClick={start}
            disabled={loading === "q" || !role.trim()}
            className="btn-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {question ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {question ? "Next question" : "Start interview"}
          </button>
        </div>
      </div>

      {loading === "q" && <Loading label="Preparing a question…" />}

      {question && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-1" />
            <p className="font-medium">{question}</p>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            placeholder="Type your answer here..."
            className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm outline-none ring-focus resize-none"
          />
          <button
            onClick={submit}
            disabled={loading === "a" || !answer.trim()}
            className="btn-gradient rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading === "a" ? "Evaluating…" : "Submit answer"}
          </button>
        </div>
      )}

      {loading === "a" && <Loading label="Evaluating your answer…" />}

      {feedback && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card p-5 md:col-span-2 flex items-center gap-4">
            <div className="rounded-full bg-primary/15 p-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient">{feedback.score}/10</div>
              <div className="text-xs text-muted-foreground">Overall score</div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <ThumbsUp className="h-4 w-4 text-primary" /> Strengths
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              {feedback.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <ThumbsDown className="h-4 w-4 text-destructive" /> Weaknesses
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              {feedback.weaknesses.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5 md:col-span-2">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" /> Improved answer
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{feedback.improvedAnswer}</ReactMarkdown>
            </div>
          </div>

          <div className="glass-card p-5 md:col-span-2">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-accent" /> Tips
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              {feedback.tips.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
