import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Code2, Play, Lightbulb, Timer, MemoryStick, Sparkles } from "lucide-react";
import { generateDsaProblem } from "@/lib/ai.functions";
import { Loading } from "@/components/Loading";

export const Route = createFileRoute("/_authenticated/dsa-practice")({
  component: DsaPractice,
});

type Difficulty = "Easy" | "Medium" | "Hard";

interface Problem {
  title: string;
  statement: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  hints: string[];
  optimalSolution: string;
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
}

function DsaPractice() {
  const gen = useServerFn(generateDsaProblem);
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [p, setP] = useState<Problem | null>(null);
  const [shownHints, setShownHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const load = async () => {
    setLoading(true);
    setP(null);
    setShownHints(0);
    setShowSolution(false);
    try {
      const r = await gen({ data: { difficulty, topic: topic || undefined } });
      setP(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <Code2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">DSA Practice</h1>
          <p className="text-sm text-muted-foreground">
            Fresh AI-generated coding problems with hints & optimal solutions.
          </p>
        </div>
      </header>

      <div className="glass-card p-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          {(["Easy", "Medium", "Hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`rounded-lg px-4 py-1.5 text-sm border transition-colors ${
                difficulty === d
                  ? "btn-gradient border-transparent"
                  : "border-border bg-white/5 hover:bg-white/10"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Optional topic — e.g. Arrays, Trees, DP…"
          className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-sm outline-none ring-focus"
        />
        <button
          onClick={load}
          disabled={loading}
          className="btn-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          <Play className="h-4 w-4" /> {loading ? "Generating…" : "Generate problem"}
        </button>
      </div>

      {loading && <Loading label="Cooking up a problem…" />}

      {p && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-xl font-bold">{p.title}</h2>
            <div className="prose prose-invert prose-sm max-w-none mt-3">
              <ReactMarkdown>{p.statement}</ReactMarkdown>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold mb-2">Examples</h3>
            <div className="space-y-3">
              {p.examples.map((ex, i) => (
                <div key={i} className="rounded-lg bg-white/5 border border-border p-3 text-sm font-mono">
                  <div><span className="text-muted-foreground">Input:</span> {ex.input}</div>
                  <div><span className="text-muted-foreground">Output:</span> {ex.output}</div>
                  {ex.explanation && (
                    <div className="mt-1 text-muted-foreground font-sans">↳ {ex.explanation}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold mb-2">Constraints</h3>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              {p.constraints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-accent" /> Hints
            </h3>
            <div className="space-y-2">
              {p.hints.slice(0, shownHints).map((h, i) => (
                <div key={i} className="text-sm text-muted-foreground rounded-lg bg-white/5 border border-border p-3">
                  <span className="text-accent font-medium">Hint {i + 1}: </span>{h}
                </div>
              ))}
              {shownHints < p.hints.length && (
                <button
                  onClick={() => setShownHints((n) => n + 1)}
                  className="text-sm text-primary hover:underline"
                >
                  Reveal hint {shownHints + 1}
                </button>
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Optimal solution
              </h3>
              <button
                onClick={() => setShowSolution((s) => !s)}
                className="text-sm text-primary hover:underline"
              >
                {showSolution ? "Hide" : "Reveal"}
              </button>
            </div>
            {showSolution && (
              <>
                <div className="prose prose-invert prose-sm max-w-none mt-3">
                  <ReactMarkdown>{p.optimalSolution}</ReactMarkdown>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-border px-2.5 py-1">
                    <Timer className="h-3.5 w-3.5 text-primary" /> Time: {p.timeComplexity}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-border px-2.5 py-1">
                    <MemoryStick className="h-3.5 w-3.5 text-primary" /> Space: {p.spaceComplexity}
                  </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none mt-4">
                  <ReactMarkdown>{p.explanation}</ReactMarkdown>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
