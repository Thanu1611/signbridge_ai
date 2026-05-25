"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const CameraTranslator = dynamic(
  () =>
    import("@/components/translator/CameraTranslator").then(
      (m) => m.CameraTranslator
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    ),
  }
);

export default function TranslatorPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Live Sign Translator
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Point your camera at sign gestures. Hold each sign steady to add words
          and build a sentence — text and voice update as you sign.
        </p>
      </header>
      <CameraTranslator />
    </div>
  );
}
