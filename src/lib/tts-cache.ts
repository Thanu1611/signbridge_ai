/** Client-side cache for TTS audio blobs (shared across hook instances). */

import { allSignLabels } from "@/lib/signs";
import type { AppLanguage } from "@/types";

const blobUrlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

export function ttsCacheKey(
  text: string,
  voiceType?: string,
  language?: string
): string {
  return `${language ?? "en"}|${voiceType ?? "default"}|${text.trim()}`;
}

export function getCachedTtsUrl(key: string): string | undefined {
  return blobUrlCache.get(key);
}

function storeBlob(key: string, blob: Blob): string {
  const existing = blobUrlCache.get(key);
  if (existing) return existing;

  const url = URL.createObjectURL(blob);
  blobUrlCache.set(key, url);
  return url;
}

export function clearTtsCache(): void {
  for (const url of blobUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  blobUrlCache.clear();
  inflight.clear();
}

export async function fetchTtsToCache(
  text: string,
  voiceType?: string,
  language?: string,
  signal?: AbortSignal,
  lowLatency = true
): Promise<string | null> {
  const key = ttsCacheKey(text, voiceType, language);
  const cached = getCachedTtsUrl(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceType, language, lowLatency }),
        signal,
      });

      if (!res.ok) return null;

      const blob = await res.blob();
      return storeBlob(key, blob);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return null;
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

export async function prefetchTtsPhrases(
  texts: string[],
  voiceType?: string,
  language?: string
): Promise<void> {
  const unique = [...new Set(texts.map((t) => t.trim()).filter(Boolean))];
  await Promise.all(
    unique.map((text) => fetchTtsToCache(text, voiceType, language, undefined, true))
  );
}

/** Unique translated strings used by the live sign vocabulary. */
export function gesturePhraseTexts(language: AppLanguage): string[] {
  return [...new Set(allSignLabels(language))];
}
