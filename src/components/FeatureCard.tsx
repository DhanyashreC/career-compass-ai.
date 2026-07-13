import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  accent?: string;
}

export function FeatureCard({ icon: Icon, title, description, to, accent }: Props) {
  return (
    <Link
      to={to}
      className="glass-card group relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:border-primary/40"
    >
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-60"
        style={{ background: accent ?? "var(--gradient-hero)" }}
      />
      <div className="relative">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
          Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
