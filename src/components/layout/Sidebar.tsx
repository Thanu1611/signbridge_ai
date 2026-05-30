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

export function Sidebar() {
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const navItems = getNavItems(isAuthenticated);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-brand-border/50 bg-surface/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 lg:block">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-brand-gradient text-white shadow-md shadow-brand-cyan/20"
                  : "text-slate-600 hover:bg-cyan-50 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
