"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { LessonCard } from "@/components/learn/LessonCard";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const CameraTranslator = dynamic(
  () =>
    import("@/components/translator/CameraTranslator").then(
      (m) => m.CameraTranslator
    ),
  { ssr: false, loading: () => <LoadingSpinner size="lg" /> }
);
import { LESSONS, GESTURE_TRANSLATIONS } from "@/lib/constants";
import { useApp } from "@/context/AppProvider";
import type { GestureKey, GestureResult } from "@/types";

export default function LearnPage() {
  const { language } = useApp();
  const [activeLesson, setActiveLesson] = useState(LESSONS[0].id);
  const [practiceSign, setPracticeSign] = useState<GestureKey | null>("hello");
  const [lastResult, setLastResult] = useState<GestureResult | null>(null);

  const lesson = LESSONS.find((l) => l.id === activeLesson) ?? LESSONS[0];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Learn Sign Language
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Beginner lessons with placeholder media cards and camera practice mode.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {LESSONS.map((l) => (
          <LessonCard
            key={l.id}
            title={l.title}
            description={l.description}
            signs={l.signs}
            active={activeLesson === l.id}
            onSelect={() => setActiveLesson(l.id)}
          />
        ))}
      </section>

      {lesson.signs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold">Practice a sign</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.signs.map((sign) => (
              <button
                key={sign}
                type="button"
                onClick={() => setPracticeSign(sign)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                  practiceSign === sign
                    ? "bg-brand-gradient text-white"
                    : "bg-cyan-100 text-brand-blue dark:bg-slate-800 dark:text-brand-cyan"
                }`}
              >
                {sign.replace("_", " ")}
              </button>
            ))}
          </div>
          {practiceSign && (
            <div className="mt-4 rounded-2xl border border-brand-border/50 bg-surface p-6 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500">Target sign</p>
              <p className="text-2xl font-bold capitalize">
                {practiceSign.replace("_", " ")} —{" "}
                {GESTURE_TRANSLATIONS[practiceSign][language]}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 text-slate-400 dark:from-slate-800 dark:to-slate-900"
                  >
                    Video / image placeholder {n}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold">Camera practice</h2>
        <p className="mt-2 text-sm text-slate-500">
          Perform the selected sign in front of the camera. We&apos;ll tell you if it
          matches.
        </p>
        {practiceSign && lastResult && (
          <div
            className={`mt-4 flex items-center gap-3 rounded-2xl p-4 ${
              lastResult.gesture === practiceSign
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50"
                : "bg-amber-50 text-amber-800 dark:bg-amber-950/50"
            }`}
          >
            {lastResult.gesture === practiceSign ? (
              <>
                <Check className="h-6 w-6" /> Great match! Keep practicing.
              </>
            ) : (
              <>
                <X className="h-6 w-6" />
                Detected &quot;{lastResult.gesture.replace("_", " ")}&quot; — try
                again for &quot;{practiceSign.replace("_", " ")}&quot;.
              </>
            )}
          </div>
        )}
        <div className="mt-6">
          <CameraTranslator onGesture={setLastResult} />
        </div>
      </section>
    </div>
  );
}
