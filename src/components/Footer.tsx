import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>PlaceMate AI — Your placement co-pilot.</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} PlaceMate AI. Crafted for aspiring engineers.
        </p>
      </div>
    </footer>
  );
}
