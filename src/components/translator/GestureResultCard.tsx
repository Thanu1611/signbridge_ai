import { Sparkles } from "lucide-react";
import type { GestureResult } from "@/types";
import { cn } from "@/lib/utils";

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

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
          Show a sign to the camera — detected word appears here
        </p>
      </div>
    );
  }

  const confidence = Math.round(result.confidenceScore * 100);

  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-border/50 bg-surface p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-sm text-brand-cyan">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Current detection
        </span>
        <span className="text-xs text-slate-500">{formatTimestamp(result.timestamp)}</span>
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Detected word
      </p>
      <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
        {result.detectedWord}
      </p>

      <p className="mt-3 text-xs text-slate-500">
        Sign id: <span className="font-mono">{result.gesture}</span>
      </p>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Confidence score</span>
          <span className="font-semibold text-brand-blue dark:text-brand-cyan">
            {confidence}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-cyan-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-300"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
