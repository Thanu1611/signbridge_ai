"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Eraser, Hand, RotateCcw, Save } from "lucide-react";
import { GestureResultCard } from "./GestureResultCard";
import { SentenceResultCard } from "./SentenceResultCard";
import { TextToSpeechButton } from "./TextToSpeechButton";
import { useSignSentence } from "@/hooks/useSignSentence";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useHandTracking } from "@/hooks/useHandTracking";
import { HAND_LANDMARK_COUNT } from "@/lib/mediapipe/types";
import { SIGN_VOCABULARY } from "@/lib/signs";
import type { GestureResult } from "@/types";
import { useApp } from "@/context/AppProvider";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { gesturePhraseTexts } from "@/lib/tts-cache";
import { saveTranslation } from "@/lib/history";
import { cn } from "@/lib/utils";

export function CameraTranslator({
  onGesture,
}: {
  onGesture?: (result: GestureResult | null) => void;
} = {}) {
  const { language, user, isGuest, showToast, voiceType } = useApp();
  const [saving, setSaving] = useState(false);
  const { prefetch, stop: stopSpeech } = useTextToSpeech();

  const {
    videoRef,
    canvasRef,
    status,
    statusLabel,
    isActive,
    isLoading,
    error,
    landmarks,
    gestureResult,
    setGestureResult,
    signRecognized,
    startCamera,
    stopCamera,
  } = useHandTracking({ language, onGesture });

  const {
    words,
    rawSentence,
    naturalSentence,
    undoLastWord,
    clearSentence,
  } = useSignSentence(gestureResult, language);

  const speakText = naturalSentence.trim() || gestureResult?.detectedWord || "";

  useEffect(() => {
    void prefetch(gesturePhraseTexts(language), voiceType, language);
  }, [language, voiceType, prefetch]);

  useEffect(() => {
    if (!isActive) return;
    void prefetch(
      [...gesturePhraseTexts(language), "Hello, how are you?", "Thank you."],
      voiceType,
      language
    );
  }, [isActive, language, voiceType, prefetch]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const handleClearAll = () => {
    clearSentence();
    setGestureResult(null);
  };

  const handleSave = async () => {
    const text = naturalSentence.trim() || gestureResult?.detectedWord;
    if (!text) return;
    setSaving(true);
    try {
      await saveTranslation({
        mode: "sign_to_text",
        detectedGesture:
          words.length > 0
            ? words.map((w) => w.wordId).join(", ")
            : (gestureResult?.gesture ?? null),
        translatedText: text,
        confidenceScore:
          words.length > 0
            ? words.reduce((s, w) => s + w.confidenceScore, 0) / words.length
            : (gestureResult?.confidenceScore ?? null),
        language,
        userId: user?.id ?? null,
      });
      showToast(
        isGuest ? "Saved locally (sign in to sync to cloud)" : "Translation saved",
        "success"
      );
    } catch {
      showToast("Could not save translation", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-brand-border/50 bg-slate-900 shadow-lg dark:border-slate-700">
          <video
            ref={videoRef}
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            playsInline
            muted
            autoPlay={false}
            aria-hidden
          />
          <canvas
            ref={canvasRef}
            className={cn(
              "block aspect-[4/3] w-full max-h-[min(70vh,480px)] bg-slate-900 sm:max-h-[480px]",
              !isActive && !isLoading && "opacity-40"
            )}
            aria-label="Live camera with hand tracking overlay"
          />

          {!isActive && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/60 px-4 text-center">
              <Camera className="h-12 w-12 text-slate-500 sm:h-16 sm:w-16" />
              <p className="text-sm text-slate-400">Camera preview</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/70">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-slate-300">Loading camera & hand model…</p>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 text-sm",
            status === "hand_detected" &&
              signRecognized &&
              "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
            status === "hand_detected" &&
              !signRecognized &&
              "bg-cyan-50 text-cyan-900 dark:bg-cyan-950/40 dark:text-brand-cyan",
            status === "no_hand_detected" &&
              "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
            status === "loading" &&
              "bg-blue-50 text-brand-blue dark:bg-blue-950/40 dark:text-brand-cyan",
            status === "inactive" && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          )}
          role="status"
          aria-live="polite"
        >
          <Hand
            className={cn(
              "h-4 w-4 shrink-0",
              status === "hand_detected" &&
                signRecognized &&
                "text-emerald-600",
              status === "hand_detected" &&
                !signRecognized &&
                "text-brand-cyan",
              status === "no_hand_detected" && "text-amber-600"
            )}
          />
          <span>
            {status === "hand_detected" && signRecognized
              ? "✅ Sign Recognized"
              : statusLabel}
          </span>
          {landmarks && status === "hand_detected" && (
            <span className="text-xs opacity-80">
              · {landmarks.length}/{HAND_LANDMARK_COUNT} landmarks
              {signRecognized ? " · green = sign" : " · cyan = tracking"}
            </span>
          )}
        </div>

        {error && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
            role="alert"
          >
            <p className="font-medium">Camera error</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {isActive ? (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:flex-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <CameraOff className="h-4 w-4" />
              Stop camera
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              disabled={isLoading}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-50 sm:flex-none"
            >
              <Camera className="h-4 w-4" />
              Start camera
            </button>
          )}
        </div>

        <div className="rounded-xl border border-brand-border/40 bg-surface/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Supported signs ({SIGN_VOCABULARY.length} words)
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Hello · Hi · You · How · I · Good · Yes · No · Thank you · Please · Help ·
            Stop · Peace · Welcome — hold each sign steady, then switch to the next.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <GestureResultCard result={gestureResult} />
        <SentenceResultCard
          sentence={naturalSentence}
          rawSentence={rawSentence}
          words={words}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <TextToSpeechButton
            text={speakText}
            size="large"
            className="w-full sm:w-auto sm:min-w-[12rem]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={undoLastWord}
            disabled={words.length === 0}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="h-4 w-4" />
            Undo word
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            <Eraser className="h-4 w-4" />
            Clear all
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={(!naturalSentence.trim() && !gestureResult) || saving}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
