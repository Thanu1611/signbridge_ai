"use client";

import { CheckCircle, Info, X, XCircle } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { cn } from "@/lib/utils";

export function ToastNotification() {
  const { toast, clearToast } = useApp();
  if (!toast) return null;

  const Icon =
    toast.type === "success"
      ? CheckCircle
      : toast.type === "error"
        ? XCircle
        : Info;

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3 shadow-lg md:bottom-8 md:left-auto md:right-8 md:translate-x-0",
        toast.type === "success" && "bg-emerald-600 text-white",
        toast.type === "error" && "bg-red-600 text-white",
        toast.type === "info" && "bg-slate-800 text-white"
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={clearToast}
        className="rounded-lg p-1 hover:bg-white/20"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
