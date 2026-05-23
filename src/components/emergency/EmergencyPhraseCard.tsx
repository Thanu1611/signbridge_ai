"use client";

import { TextToSpeechButton } from "@/components/translator/TextToSpeechButton";
import type { AppLanguage } from "@/types";

export function EmergencyPhraseCard({
  phraseKey,
  text,
}: {
  phraseKey: string;
  text: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-border/50 bg-surface p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xl font-bold leading-snug text-slate-900 dark:text-white md:text-2xl">
        {text}
      </p>
      <TextToSpeechButton text={text} size="large" className="w-full" />
      <span className="text-xs text-slate-400">{phraseKey.replace(/_/g, " ")}</span>
    </div>
  );
}

export function getEmergencyText(
  phrase: { key: string; en: string; ta: string },
  language: AppLanguage
): string {
  return phrase[language] ?? phrase.en;
}
