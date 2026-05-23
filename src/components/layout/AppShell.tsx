"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { ToastNotification } from "@/components/ui/ToastNotification";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isAuth =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuth) {
    return (
      <>
        {children}
        <ToastNotification />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-cyan-50/40 via-background to-sky-50/30 dark:from-[#0a0a0a] dark:via-slate-950 dark:to-[#0a0a0a]">
      <Navbar />
      <div className="flex flex-1">
        {!isLanding && <Sidebar />}
        <main
          className={`flex-1 pb-24 lg:pb-8 ${isLanding ? "" : "px-4 py-6 md:px-8"}`}
        >
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <ToastNotification />
    </div>
  );
}
