"use client";

import { useCallback, useRef, useState, type MutableRefObject } from "react";
import type { AppLanguage } from "@/types";
import {
  fetchTtsToCache,
  getCachedTtsUrl,
  prefetchTtsPhrases,
  ttsCacheKey,
} from "@/lib/tts-cache";

export interface SpeakOptions {
  /** Play browser voice immediately when audio is not cached yet (live translator). */
  instantOnMiss?: boolean;
  /** Request faster ElevenLabs model when fetching. */
  lowLatency?: boolean;
}

function stopCurrentPlayback(
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  objectUrlRef: MutableRefObject<string | null>
) {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current = null;
  }
  if (objectUrlRef.current) {
    objectUrlRef.current = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function playBrowserVoice(text: string, language?: string) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  if (language === "ta") utterance.lang = "ta-IN";
  else if (language === "en") utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

async function playCachedUrl(
  url: string,
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  objectUrlRef: MutableRefObject<string | null>,
  requestId: number,
  requestIdRef: MutableRefObject<number>
) {
  const audio = new Audio(url);
  audioRef.current = audio;
  objectUrlRef.current = url;
  audio.onended = () => {
    if (requestId === requestIdRef.current) {
      audioRef.current = null;
      objectUrlRef.current = null;
    }
  };
  await audio.play();
}

export function useTextToSpeech() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const prefetch = useCallback(
    async (texts: string[], voiceType?: string, language?: AppLanguage) => {
      await prefetchTtsPhrases(texts, voiceType, language);
    },
    []
  );

  const speak = useCallback(
    async (
      text: string,
      voiceType?: string,
      language?: AppLanguage,
      options?: SpeakOptions
    ) => {
      if (!text.trim()) return;

      const key = ttsCacheKey(text, voiceType, language);
      const lowLatency = options?.lowLatency ?? true;

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;
      const requestId = ++requestIdRef.current;

      stopCurrentPlayback(audioRef, objectUrlRef);
      setError(null);

      const cachedUrl = getCachedTtsUrl(key);
      if (cachedUrl) {
        try {
          await playCachedUrl(
            cachedUrl,
            audioRef,
            objectUrlRef,
            requestId,
            requestIdRef
          );
        } catch {
          if (requestId === requestIdRef.current) {
            playBrowserVoice(text, language);
          }
        }
        return;
      }

      if (options?.instantOnMiss) {
        playBrowserVoice(text, language);
        void fetchTtsToCache(text, voiceType, language, undefined, lowLatency);
        return;
      }

      setLoading(true);

      try {
        const url = await fetchTtsToCache(
          text,
          voiceType,
          language,
          signal,
          lowLatency
        );

        if (requestId !== requestIdRef.current) return;

        if (!url) {
          playBrowserVoice(text, language);
          return;
        }

        await playCachedUrl(
          url,
          audioRef,
          objectUrlRef,
          requestId,
          requestIdRef
        );
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        const message = e instanceof Error ? e.message : "Speech failed";
        if (requestId === requestIdRef.current) {
          setError(message);
          playBrowserVoice(text, language);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    requestIdRef.current += 1;
    stopCurrentPlayback(audioRef, objectUrlRef);
    setLoading(false);
  }, []);

  return { speak, prefetch, stop, loading, error };
}
