import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const links = [
    { to: "/hr-interview", label: "HR Interview" },
    { to: "/resume-review", label: "Resume" },
    { to: "/company-prep", label: "Companies" },
    { to: "/dsa-practice", label: "DSA" },
    { to: "/chat", label: "AI Chat" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-gradient">PlaceMate AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {user &&
            links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                activeProps={{ className: "px-3 py-1.5 rounded-lg text-sm text-foreground bg-white/10" }}
              >
                {l.label}
              </Link>
            ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <button
              onClick={signOut}
              className="ring-focus inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : (
            <Link to="/auth" className="ring-focus btn-gradient rounded-lg px-4 py-1.5 text-sm font-medium">
              Sign in
            </Link>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 px-4 py-3 space-y-1">
          {user &&
            links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          {user ? (
            <button
              onClick={signOut}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block btn-gradient rounded-lg px-3 py-2 text-sm text-center"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
