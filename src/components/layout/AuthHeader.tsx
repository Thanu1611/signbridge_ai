"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Info, LogOut, Settings } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import type { AuthUser } from "@/types";
import { cn } from "@/lib/utils";

function userInitial(user: AuthUser): string {
  const name = user.full_name?.trim();
  if (name) return name.charAt(0).toUpperCase();
  return (user.email?.charAt(0) ?? "?").toUpperCase();
}

/**
 * Guest: Login button. Authenticated: profile initial + Settings / About / Logout.
 */
export function AuthHeader({ className }: { className?: string }) {
  const { user, isGuest, signOut } = useApp();
  const router = useRouter();
  const signedIn = Boolean(user && !isGuest);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  const handleLogout = async () => {
    close();
    await signOut();
    router.push("/login");
  };

  const handleSettings = () => {
    close();
    router.push("/settings");
  };

  const handleAbout = () => {
    close();
    router.push("/about");
  };

  if (!signedIn || !user) {
    return (
      <Link
        href="/login"
        className={cn(
          "inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-brand-cyan/10 px-4 py-2 text-sm font-semibold text-brand-blue transition hover:bg-brand-cyan/20 dark:text-brand-cyan",
          className
        )}
      >
        Login
      </Link>
    );
  }

  const initial = userInitial(user);

  return (
    <div ref={menuRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white shadow-md shadow-brand-cyan/25 transition hover:opacity-90 md:h-11 md:w-11",
          open &&
            "ring-2 ring-brand-cyan ring-offset-2 ring-offset-surface dark:ring-offset-[#0a0a0a]"
        )}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[10.5rem] overflow-hidden rounded-xl border border-brand-border/60 bg-surface py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleSettings}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-cyan-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Settings className="h-4 w-4 shrink-0 text-brand-cyan" />
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleAbout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-cyan-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Info className="h-4 w-4 shrink-0 text-brand-cyan" />
            About
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
