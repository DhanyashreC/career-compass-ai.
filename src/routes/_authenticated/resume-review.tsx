import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { FileText, Upload, Award, AlertTriangle, Sparkles, Target, Lightbulb, CheckCircle2 } from "lucide-react";
import { reviewResume } from "@/lib/ai.functions";
import { Loading } from "@/components/Loading";

export const Route = createFileRoute("/_authenticated/resume-review")({
  component: ResumeReview,
});

interface Review {
  atsScore: number;
  missingSkills: string[];
  grammarIssues: string[];
  betterSummary: string;
  betterProjects: string[];
  suggestions: string[];
  overallVerdict: string;
}



function ResumeReview() {
  const review = useServerFn(reviewResume);
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Review | null>(null);

 const submit = async () => {
  if (!resume.trim()) {
    toast.error("Please paste your resume.");
    return;
  }

  setLoading(true);
  setResult(null);

  try {
    const r = await review({
      data: {
        resume,
      },
    });

    setResult(r);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Review failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Resume Review</h1>
          <p className="text-sm text-muted-foreground">
            Upload your resume PDF for an ATS-focused AI review.
          </p>
        </div>
      </header>

      <div className="glass-card p-6">
        <textarea
  value={resume}
  onChange={(e) => setResume(e.target.value)}
  placeholder="Paste your complete resume here..."
  rows={18}
  className="w-full rounded-lg border border-border bg-white/5 px-4 py-3 text-sm outline-none ring-focus resize-none"
/>
        <button
          onClick={submit}
          disabled={!resume.trim() || loading}
          className="btn-gradient mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Analyzing your resume…" : "Review my resume"}
        </button>
      </div>

      {loading && <Loading label="Extracting and reviewing your resume…" />}

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card p-5 md:col-span-2 flex items-center gap-4">
            <div className="rounded-full bg-primary/15 p-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-gradient">{result.atsScore}/100</div>
              <div className="text-xs text-muted-foreground">ATS Score</div>
            </div>
            <div className="text-sm text-muted-foreground max-w-md text-right">
              {result.overallVerdict}
            </div>
          </div>

          <Section icon={Target} title="Missing skills" items={result.missingSkills} />
          <Section icon={AlertTriangle} title="Grammar issues" items={result.grammarIssues} />
          <div className="glass-card p-5 md:col-span-2">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" /> Better summary
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{result.betterSummary}</ReactMarkdown>
            </div>
          </div>
          <Section icon={CheckCircle2} title="Rewritten project bullets" items={result.betterProjects} />
          <Section icon={Lightbulb} title="Suggestions" items={result.suggestions} />
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Award;
  title: string;
  items: string[];
}) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {items.length ? (
        <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
          {items.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing critical found. ✨</p>
      )}
    </div>
  );
}
