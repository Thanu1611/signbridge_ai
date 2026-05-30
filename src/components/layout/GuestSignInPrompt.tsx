"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";

export function GuestSignInPrompt() {
  const isAuthenticated = useIsAuthenticated();
  if (isAuthenticated) return null;

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-brand-cyan/20 dark:bg-brand-cyan/10">
      <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
        You&apos;re using the live sign translation preview. Sign in to unlock voice,
        emergency phrases, learning, and history.
      </p>
      <Link
        href="/login"
        className="shrink-0 rounded-full bg-brand-gradient px-4 py-2 text-center text-sm font-semibold text-white hover:opacity-90"
      >
        Sign in
      </Link>
    </div>
  );
}
