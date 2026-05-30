"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Camera,
  History,
  Home,
  Mic,
} from "lucide-react";
import { getNavItems } from "@/lib/auth/access";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";
import { cn } from "@/lib/utils";

const iconMap = {
  Home,
  Camera,
  Mic,
  AlertTriangle,
  BookOpen,
  History,
} as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const hideOnAuth =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (hideOnAuth) return null;

  const navItems = getNavItems(isAuthenticated);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border/50 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#0a0a0a]/95 lg:hidden">
      <div
        className={cn(
          "mx-auto flex max-w-lg items-center justify-around px-1 py-2",
          navItems.length <= 2 && "max-w-xs"
        )}
      >
        {navItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const shortLabel =
            item.label === "Live Sign Translation"
              ? "Translate"
              : item.label === "Emergency"
                ? "SOS"
                : item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[3rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium transition",
                active ? "text-brand-cyan" : "text-slate-500"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              {shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
