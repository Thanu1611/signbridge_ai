import type { AppLanguage, TranslationMode } from "@/types";

export interface SaveTranslationInput {
  mode: TranslationMode;
  detectedGesture?: string | null;
  translatedText: string;
  confidenceScore?: number | null;
  language: AppLanguage;
  userId?: string | null;
}

const GUEST_HISTORY_KEY = "signbridge_guest_history";

export interface GuestHistoryItem {
  id: string;
  mode: TranslationMode;
  detected_gesture: string | null;
  translated_text: string;
  confidence_score: number | null;
  language: AppLanguage;
  created_at: string;
}

export function getGuestHistory(): GuestHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as GuestHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestHistory(item: Omit<GuestHistoryItem, "id" | "created_at">) {
  const list = getGuestHistory();
  const entry: GuestHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  list.unshift(entry);
  localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(list.slice(0, 100)));
  return entry;
}

export function deleteGuestHistoryItem(id: string) {
  const list = getGuestHistory().filter((h) => h.id !== id);
  localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(list));
}

export function clearGuestHistory() {
  localStorage.removeItem(GUEST_HISTORY_KEY);
}

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}

export async function saveTranslation(input: SaveTranslationInput) {
  if (!input.userId) {
    return saveGuestHistory({
      mode: input.mode,
      detected_gesture: input.detectedGesture ?? null,
      translated_text: input.translatedText,
      confidence_score: input.confidenceScore ?? null,
      language: input.language,
    });
  }

  const res = await apiFetch("/api/history", {
    method: "POST",
    body: JSON.stringify({
      mode: input.mode,
      detectedGesture: input.detectedGesture ?? null,
      translatedText: input.translatedText,
      confidenceScore: input.confidenceScore ?? null,
      language: input.language,
    }),
  });

  if (res.status === 401) {
    return saveGuestHistory({
      mode: input.mode,
      detected_gesture: input.detectedGesture ?? null,
      translated_text: input.translatedText,
      confidence_score: input.confidenceScore ?? null,
      language: input.language,
    });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to save translation");
  }

  const { data } = await res.json();
  return data;
}

export async function fetchUserHistory(_userId: string) {
  const res = await apiFetch("/api/history");
  if (res.status === 401) return getGuestHistory();
  if (!res.ok) throw new Error("Failed to load history");
  const { data } = await res.json();
  return data ?? [];
}

export async function deleteHistoryItem(id: string, userId?: string | null) {
  if (!userId) {
    deleteGuestHistoryItem(id);
    return;
  }

  const res = await apiFetch(`/api/history/${id}`, { method: "DELETE" });
  if (res.status === 401) {
    deleteGuestHistoryItem(id);
    return;
  }
  if (!res.ok) throw new Error("Failed to delete item");
}

export async function clearAllHistory(userId?: string | null) {
  if (!userId) {
    clearGuestHistory();
    return;
  }

  const res = await apiFetch("/api/history", { method: "DELETE" });
  if (res.status === 401) {
    clearGuestHistory();
    return;
  }
  if (!res.ok) throw new Error("Failed to clear history");
}
