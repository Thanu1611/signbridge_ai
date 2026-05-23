"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { HistoryTable } from "@/components/history/HistoryTable";
import { useApp } from "@/context/AppProvider";
import {
  clearAllHistory,
  deleteHistoryItem,
  fetchUserHistory,
  getGuestHistory,
} from "@/lib/history";
import type { TranslationRecord } from "@/types";

export default function HistoryPage() {
  const { user, isGuest, showToast } = useApp();
  const [items, setItems] = useState<TranslationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      try {
        let data: TranslationRecord[];
        if (user && !isGuest) {
          data = (await fetchUserHistory(user.id)) as TranslationRecord[];
        } else {
          const guest = getGuestHistory();
          data = guest.map((g) => ({
            id: g.id,
            user_id: null,
            mode: g.mode,
            detected_gesture: g.detected_gesture,
            translated_text: g.translated_text,
            confidence_score: g.confidence_score,
            language: g.language,
            created_at: g.created_at,
          }));
        }
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) showToast("Could not load history", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [user, isGuest, showToast]);

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryItem(id, user?.id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Item deleted", "success");
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all translation history?")) return;
    try {
      await clearAllHistory(user?.id);
      setItems([]);
      showToast("History cleared", "success");
    } catch {
      showToast("Could not clear history", "error");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">History</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {isGuest
              ? "Guest mode — records stored on this device."
              : "Your saved translations from Neon."}
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        )}
      </header>
      <HistoryTable items={items} loading={loading} onDelete={handleDelete} />
    </div>
  );
}
