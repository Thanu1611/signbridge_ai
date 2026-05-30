"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import type { AuthUser } from "@/types";
import { cn } from "@/lib/utils";

function userInitial(user: AuthUser): string {
  const name = user.full_name?.trim();
  if (name) return name.charAt(0).toUpperCase();
  return (user.email?.charAt(0) ?? "?").toUpperCase();
}

export function AccountMenu({ className }: { className?: string }) {
  const { user, signOut } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, close]);

  if (!user) return null;

  const initial = userInitial(user);
  const displayName = user.full_name?.trim() || user.email?.split("@")[0] || "Account";

  const handleLogout = async () => {
    close();
    await signOut();
    router.push("/login");
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white shadow-md shadow-brand-cyan/25 transition hover:opacity-90",
          open && "ring-2 ring-brand-cyan ring-offset-2 ring-offset-surface dark:ring-offset-[#0a0a0a]"
        )}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[11rem] overflow-hidden rounded-xl border border-brand-border/60 bg-surface py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="border-b border-brand-border/40 px-4 py-2.5 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {displayName}
          </p>
          <Link
            href="/settings"
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-cyan-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Settings className="h-4 w-4 text-brand-cyan" />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
