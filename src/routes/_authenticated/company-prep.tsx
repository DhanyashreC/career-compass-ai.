import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Building2, Search, Briefcase, Code2, UserRound, DollarSign, Lightbulb } from "lucide-react";
import { companyPrep } from "@/lib/ai.functions";
import { Loading } from "@/components/Loading";

export const Route = createFileRoute("/_authenticated/company-prep")({
  component: CompanyPrepPage,
});

interface Prep {
  overview: string;
  interviewProcess: string;
  technicalQuestions: string[];
  hrQuestions: string[];
  salaryQuestions: string[];
  tips: string[];
}

function CompanyPrepPage() {
  const prep = useServerFn(companyPrep);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Prep | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const res = await prep({ data: { company, role: role || undefined } });
      setData(res);
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
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Company Preparation</h1>
          <p className="text-sm text-muted-foreground">
            Get a tailored placement brief for any company.
          </p>
        </div>
      </header>

      <form onSubmit={submit} className="glass-card p-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company (e.g. Google)"
            className="rounded-lg border border-border bg-white/5 px-3 py-2 text-sm outline-none ring-focus"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role (optional, e.g. SDE Intern)"
            className="rounded-lg border border-border bg-white/5 px-3 py-2 text-sm outline-none ring-focus"
          />
        </div>
        <button
          type="submit"
          disabled={!company.trim() || loading}
          className="btn-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          <Search className="h-4 w-4" /> {loading ? "Preparing…" : "Prepare"}
        </button>
      </form>

      {loading && <Loading label="Researching the company…" />}

      {data && (
        <div className="space-y-4">
          <Card icon={Building2} title="Company overview">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{data.overview}</ReactMarkdown>
            </div>
          </Card>
          <Card icon={Briefcase} title="Interview process">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{data.interviewProcess}</ReactMarkdown>
            </div>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <ListCard icon={Code2} title="Technical questions" items={data.technicalQuestions} />
            <ListCard icon={UserRound} title="HR questions" items={data.hrQuestions} />
            <ListCard icon={DollarSign} title="Salary questions" items={data.salaryQuestions} />
            <ListCard icon={Lightbulb} title="Tips" items={data.tips} />
          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </div>
  );
}

function ListCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Building2;
  title: string;
  items: string[];
}) {
  return (
    <Card icon={Icon} title={title}>
      <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </Card>
  );
}
