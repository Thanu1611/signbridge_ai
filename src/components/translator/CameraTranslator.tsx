"use client";

import { useState } from "react";
import { Camera, CameraOff, Eraser, Hand, Save } from "lucide-react";
import { GestureResultCard } from "./GestureResultCard";
import { TextToSpeechButton } from "./TextToSpeechButton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useHandTracking } from "@/hooks/useHandTracking";
import { HAND_LANDMARK_COUNT } from "@/lib/mediapipe/types";
import type { GestureResult } from "@/types";
import { useApp } from "@/context/AppProvider";
import { saveTranslation } from "@/lib/history";
import { cn } from "@/lib/utils";

export function CameraTranslator({
  onGesture,
}: {
  onGesture?: (result: GestureResult | null) => void;
} = {}) {
  const { language, user, isGuest, showToast } = useApp();
  const [saving, setSaving] = useState(false);

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
    startCamera,
    stopCamera,
  } = useHandTracking({ language, onGesture });

  const handleSave = async () => {
    if (!gestureResult) return;
    setSaving(true);
    try {
      await saveTranslation({
        mode: "sign_to_text",
        detectedGesture: gestureResult.gesture,
        translatedText: gestureResult.translatedText,
        confidenceScore: gestureResult.confidence,
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
            className={cn(
              "aspect-[4/3] w-full max-h-[min(70vh,480px)] object-cover sm:max-h-[480px]",
              isActive && "scale-x-[-1]",
              !isActive && "opacity-40"
            )}
            playsInline
            muted
            autoPlay={false}
          />
          <canvas
            ref={canvasRef}
            className={cn(
              "pointer-events-none absolute inset-0 h-full w-full object-cover",
              isActive && "scale-x-[-1]"
            )}
            aria-hidden
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
              <p className="text-sm text-slate-300">Loading camera & hand model (CPU)…</p>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 text-sm",
            status === "hand_detected" &&
              "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
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
              status === "hand_detected" && "text-emerald-600",
              status === "no_hand_detected" && "text-amber-600"
            )}
          />
          <span>{statusLabel}</span>
          {landmarks && status === "hand_detected" && (
            <span className="text-xs opacity-80">
              · {landmarks.length}/{HAND_LANDMARK_COUNT} landmarks
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

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Demo signs: open palm → Hello · thumbs up → Yes · fist → Stop · two
          fingers → Peace · wave hand → Hi
        </p>
      </div>

      <div className="space-y-4">
        <GestureResultCard result={gestureResult} />
        <div className="flex flex-wrap gap-3">
          <TextToSpeechButton text={gestureResult?.translatedText ?? ""} />
          <button
            type="button"
            onClick={() => setGestureResult(null)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            <Eraser className="h-4 w-4" />
            Clear
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!gestureResult || saving}
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
