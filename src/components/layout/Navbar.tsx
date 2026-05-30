"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { GUEST_NAV_ITEMS } from "@/lib/auth/access";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const isLanding = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border/60 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#0a0a0a]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-[4.5rem] md:px-6">
        <BrandLogo size="nav" showText={false} className="shrink-0" />

        {!isAuthenticated && (
          <nav
            aria-label="Guest navigation"
            className={cn(
              "hidden flex-1 items-center justify-center gap-1 md:flex",
              !isLanding && "lg:hidden"
            )}
          >
            {GUEST_NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-brand-cyan/15 text-brand-blue dark:text-brand-cyan"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  {item.label === "Live Sign Translation"
                    ? "Sign Translation"
                    : item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <AuthHeader />
      </div>
    </header>
  );
}
