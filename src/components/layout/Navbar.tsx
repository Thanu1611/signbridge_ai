"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { useApp } from "@/context/AppProvider";

export function Navbar() {
  const { user, isGuest } = useApp();
  const signedIn = Boolean(user && !isGuest);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border/60 bg-surface/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#0a0a0a]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-[4.5rem] md:px-6">
        <BrandLogo size="nav" showText={false} className="[&_img]:h-20 [&_img]:md:h-25" />
        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-slate-600 dark:text-slate-300 md:inline">
                {user?.full_name?.trim() || user?.email?.split("@")[0]}
              </span>
              {/* Mobile & tablet: avatar menu (Settings + Log out) */}
              <AccountMenu className="lg:hidden" />
              <Link
                href="/settings"
                className="hidden items-center gap-1 rounded-full bg-brand-cyan/10 px-3 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-cyan/20 lg:flex dark:text-brand-cyan"
              >
                Settings
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 rounded-full bg-brand-cyan/10 px-3 py-2 text-sm font-medium text-brand-blue transition hover:bg-brand-cyan/20 dark:text-brand-cyan"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
