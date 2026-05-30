import { Sparkles } from "lucide-react";
import type { GestureResult } from "@/types";
import { cn } from "@/lib/utils";

export function GestureResultCard({
  result,
  className,
}: {
  result: GestureResult | null;
  className?: string;
}) {
  if (!result) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-brand-border bg-surface/60 p-6 text-center dark:border-slate-700 dark:bg-slate-900/60",
          className
        )}
      >
        <p className="text-slate-500">
          Show a sign to the camera — current word appears here
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-border/50 bg-surface p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-sm text-brand-cyan">
        <Sparkles className="h-4 w-4" />
        Current sign
      </div>
      <p className="text-2xl font-bold capitalize text-slate-900 dark:text-white">
        {result.gesture.replace("_", " ")}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-800 dark:text-slate-100">
        {result.translatedText}
      </p>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Confidence</span>
          <span>{Math.round(result.confidence * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-cyan-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-300"
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
