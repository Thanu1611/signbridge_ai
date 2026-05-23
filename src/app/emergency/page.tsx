"use client";

import { AlertTriangle } from "lucide-react";
import {
  EmergencyPhraseCard,
  getEmergencyText,
} from "@/components/emergency/EmergencyPhraseCard";
import { EMERGENCY_PHRASES } from "@/lib/constants";
import { useApp } from "@/context/AppProvider";

export default function EmergencyPage() {
  const { language } = useApp();

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Emergency Communication
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Large, accessible buttons for urgent situations. Tap to display text and
            play audio instantly.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {EMERGENCY_PHRASES.map((phrase) => (
          <EmergencyPhraseCard
            key={phrase.key}
            phraseKey={phrase.key}
            text={getEmergencyText(phrase, language)}
          />
        ))}
      </div>
    </div>
  );
}
