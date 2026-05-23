"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import type { TranslationRecord } from "@/types";
import { formatDateTime, cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function HistoryTable({
  items,
  loading,
  onDelete,
}: {
  items: TranslationRecord[];
  loading?: boolean;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.translated_text.toLowerCase().includes(q) ||
        item.detected_gesture?.toLowerCase().includes(q) ||
        item.mode.toLowerCase().includes(q)
    );
  }, [items, query]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-border bg-surface/60 p-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
          No translations yet
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Use the translator or voice page, then save your results here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search history…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-brand-border/50 bg-surface py-3 pl-10 pr-4 text-sm outline-none ring-brand-cyan focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((item) => (
          <HistoryCard key={item.id} item={item} onDelete={onDelete} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-brand-border/50 bg-surface shadow-sm dark:border-slate-700 dark:bg-slate-900 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-cyan-50/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Mode</th>
              <th className="px-4 py-3 font-semibold">Gesture</th>
              <th className="px-4 py-3 font-semibold">Text</th>
              <th className="px-4 py-3 font-semibold">Conf.</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="border-t border-cyan-50 dark:border-slate-800"
              >
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {formatDateTime(item.created_at)}
                </td>
                <td className="px-4 py-3 capitalize">{item.mode.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 capitalize">
                  {item.detected_gesture?.replace(/_/g, " ") ?? "—"}
                </td>
                <td className="max-w-xs truncate px-4 py-3 font-medium">
                  {item.translated_text}
                </td>
                <td className="px-4 py-3">
                  {item.confidence_score != null
                    ? `${Math.round(item.confidence_score * 100)}%`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && query && (
        <p className="text-center text-sm text-slate-500">No matches for &quot;{query}&quot;</p>
      )}
    </div>
  );
}

function HistoryCard({
  item,
  onDelete,
}: {
  item: TranslationRecord;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-brand-border/50 bg-surface p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {item.translated_text}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatDateTime(item.created_at)} · {item.mode.replace(/_/g, " ")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {item.detected_gesture && (
        <span
          className={cn(
            "mt-2 inline-block rounded-full bg-cyan-100 px-2 py-0.5 text-xs capitalize text-brand-blue"
          )}
        >
          {item.detected_gesture.replace(/_/g, " ")}
        </span>
      )}
    </div>
  );
}
