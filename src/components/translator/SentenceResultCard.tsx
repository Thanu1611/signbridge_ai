import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommittedSign } from "@/hooks/useSignSentence";

export function SentenceResultCard({
  sentence,
  words,
  className,
}: {
  sentence: string;
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
        Your sentence
      </div>
      {sentence ? (
        <>
          <p className="text-2xl font-semibold leading-snug text-slate-900 dark:text-white md:text-3xl">
            {sentence}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {words.length} sign{words.length === 1 ? "" : "s"} · Hold each sign steady
            ~1s to add the next word
          </p>
        </>
      ) : (
        <p className="text-slate-500">
          Sign one word at a time. Keep each sign steady for about a second, then
          change to the next sign to build a sentence.
        </p>
      )}
    </div>
  );
}
