import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageSquare,
  FileText,
  Building2,
  Code2,
  Bot,
  UserRound,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Gemini · Built for placements
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Your <span className="text-gradient">AI Placement</span> Assistant
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Ace HR interviews, polish your resume, decode company processes, and crack DSA — all in
              one intelligent workspace.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/auth" className="btn-gradient rounded-xl px-6 py-3 text-sm font-semibold inline-flex items-center gap-2">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/chat"
                className="rounded-xl border border-border bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10"
              >
                Try AI Chat
              </Link>
            </div>
          </div>

          {/* stat strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { k: "5+", v: "AI Modules" },
              { k: "24/7", v: "Available" },
              { k: "1000s", v: "Q&A patterns" },
              { k: "Instant", v: "Feedback" },
            ].map((s) => (
              <div key={s.v} className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-gradient">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to get placed</h2>
            <p className="mt-3 text-muted-foreground">
              Six purpose-built AI tools to take you from resume to offer letter.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={UserRound}
              title="HR Interview Practice"
              description="Get role-specific HR questions, scored feedback and improved answers."
              to="/hr-interview"
            />
            <FeatureCard
              icon={FileText}
              title="Resume Review"
              description="Upload your PDF and get ATS score, missing skills and rewritten sections."
              to="/resume-review"
            />
            <FeatureCard
              icon={Building2}
              title="Company Preparation"
              description="Deep-dive brief on any company: process, tech, HR and salary questions."
              to="/company-prep"
            />
            <FeatureCard
              icon={Code2}
              title="DSA Practice"
              description="Fresh coding problems with hints, optimal solutions and complexity."
              to="/dsa-practice"
            />
            <FeatureCard
              icon={Bot}
              title="AI Chat Coach"
              description="Ask anything about your career, prep plan or interview strategy."
              to="/chat"
            />
            <div className="glass-card p-6 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: "var(--gradient-hero)" }}
              />
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">More coming soon</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Aptitude, group discussions and mock offers — on the roadmap.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
