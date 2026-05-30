import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommittedSign } from "@/hooks/useSignSentence";

export function SentenceResultCard({
  sentence,
  rawSentence,
  words,
  className,
}: {
  sentence: string;
  rawSentence?: string;
  words: CommittedSign[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-border/50 bg-surface p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-sm text-brand-cyan">
        <MessageSquareText className="h-4 w-4" />
        Natural sentence
      </div>

      {sentence ? (
        <>
          <p className="text-2xl font-semibold leading-snug text-slate-900 dark:text-white md:text-3xl">
            {sentence}
          </p>

          {rawSentence && rawSentence !== sentence && (
            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Raw signs
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {rawSentence}
              </p>
            </div>
          )}

          <p className="mt-3 text-xs text-slate-500">
            {words.length} sign{words.length === 1 ? "" : "s"} committed · Hold each sign
            steady ~0.7s · 1.5s cooldown prevents duplicates
          </p>
        </>
      ) : (
        <p className="text-slate-500">
          Sign one word at a time. Hold each sign steady, then change to the next sign
          to build a sentence. Example: Hello → You → How becomes &ldquo;Hello, how are
          you?&rdquo;
        </p>
      )}
    </div>
  );
}
