"use client";

import { useEffect } from "react";
import { Volume2 } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useApp } from "@/context/AppProvider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

export function TextToSpeechButton({
  text,
  className,
  size = "default",
}: {
  text: string;
  className?: string;
  size?: "default" | "large";
}) {
  const { speak, loading, error } = useTextToSpeech();
  const { voiceType, language, showToast } = useApp();

  const handleSpeak = async () => {
    await speak(text, voiceType, language);
  };

  useEffect(() => {
    if (error) {
      showToast(
        "Using browser voice — configure ElevenLabs for premium audio",
        "info"
      );
    }
  }, [error, showToast]);

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={!text.trim() || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50",
        size === "large" ? "px-6 py-4 text-lg" : "px-4 py-2.5 text-sm",
        className
      )}
    >
      {loading ? (
        <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
      ) : (
        <Volume2 className={size === "large" ? "h-6 w-6" : "h-4 w-4"} />
      )}
      {loading ? "Generating…" : "Speak"}
    </button>
  );
}
