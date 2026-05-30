"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GestureResult } from "@/types";

const STABLE_MS = 700;

export interface CommittedSign {
  gesture: string;
  text: string;
  confidence: number;
}

export function useSignSentence(gestureResult: GestureResult | null) {
  const [words, setWords] = useState<CommittedSign[]>([]);
  const stableRef = useRef<{ key: string; since: number } | null>(null);
  const lastCommittedKeyRef = useRef<string | null>(null);

  const sentence = words.map((w) => w.text).join(" ");

  const commitWord = useCallback((result: GestureResult) => {
    setWords((prev) => [
      ...prev,
      {
        gesture: result.gesture,
        text: result.translatedText,
        confidence: result.confidence,
      },
    ]);
    lastCommittedKeyRef.current = result.gesture;
  }, []);

  useEffect(() => {
    if (!gestureResult) {
      stableRef.current = null;
      lastCommittedKeyRef.current = null;
      return;
    }

    const key = gestureResult.gesture;
    const now = Date.now();

    if (stableRef.current?.key !== key) {
      stableRef.current = { key, since: now };
      return;
    }

    const heldMs = now - stableRef.current.since;
    if (heldMs >= STABLE_MS && lastCommittedKeyRef.current !== key) {
      commitWord(gestureResult);
    }
  }, [gestureResult, commitWord]);

  const undoLastWord = useCallback(() => {
    setWords((prev) => prev.slice(0, -1));
    lastCommittedKeyRef.current = null;
  }, []);

  const clearSentence = useCallback(() => {
    setWords([]);
    stableRef.current = null;
    lastCommittedKeyRef.current = null;
  }, []);

  return {
    words,
    sentence,
    undoLastWord,
    clearSentence,
  };
}
