"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import type { GestureKey } from "@/types";
import { cn } from "@/lib/utils";

export function LessonCard({
  title,
  description,
  signs,
  active,
  onSelect,
}: {
  title: string;
  description: string;
  signs: GestureKey[];
  active?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border p-5 text-left transition hover:shadow-md",
        active
          ? "border-brand-cyan bg-cyan-50 shadow-md dark:bg-cyan-950/30"
          : "border-brand-border/50 bg-surface dark:border-slate-700 dark:bg-slate-900"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cyan/15 text-brand-cyan">
          <BookOpen className="h-6 w-6" />
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </div>
      <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      {signs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {signs.map((s) => (
            <span
              key={s}
              className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium capitalize text-brand-blue dark:bg-slate-800 dark:text-brand-cyan"
            >
              {s.replace("_", " ")}
            </span>
          ))}
        </div>
      )}
      {signs.length === 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {["A", "B", "C", "D"].map((l) => (
            <div
              key={l}
              className="flex aspect-square items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-500 dark:bg-slate-800"
            >
              {l}
            </div>
          ))}
        </div>
      )}
    </button>
  );
}
