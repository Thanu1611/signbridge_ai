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
import { cn } from "@/lib/utils";

const mobileNav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/translator", label: "Translate", icon: Camera },
  { href: "/voice", label: "Voice", icon: Mic },
  { href: "/emergency", label: "SOS", icon: AlertTriangle },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/history", label: "History", icon: History },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const hideOnAuth =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (hideOnAuth) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border/50 bg-surface/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#0a0a0a]/95 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-2">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
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
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
