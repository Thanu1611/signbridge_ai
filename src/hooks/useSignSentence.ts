"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppLanguage } from "@/types";
import type { GestureResult } from "@/types";
import { buildNaturalSentence, buildRawSentence, type CommittedSignWord } from "@/lib/signs";

const STABLE_MS = 700;
const COOLDOWN_MS = 1500;
const MIN_CONFIDENCE = 0.75;

export interface CommittedSign {
  gesture: string;
  text: string;
  confidence: number;
  wordId: string;
  detectedWord: string;
  confidenceScore: number;
  timestamp: number;
}

function toCommittedSign(result: GestureResult): CommittedSignWord {
  return {
    wordId: result.gesture,
    detectedWord: result.detectedWord,
    confidenceScore: result.confidenceScore,
    timestamp: result.timestamp,
  };
}

export function useSignSentence(
  gestureResult: GestureResult | null,
  language: AppLanguage
) {
  const [words, setWords] = useState<CommittedSignWord[]>([]);
  const stableRef = useRef<{ key: string; since: number } | null>(null);
  const lastCommittedKeyRef = useRef<string | null>(null);
  const cooldownUntilRef = useRef<number>(0);

  const rawSentence = useMemo(() => buildRawSentence(words), [words]);
  const naturalSentence = useMemo(
    () => buildNaturalSentence(words, language),
    [words, language]
  );

  const commitWord = useCallback((result: GestureResult) => {
    const entry = toCommittedSign(result);
    setWords((prev) => [...prev, entry]);
    lastCommittedKeyRef.current = result.gesture;
    cooldownUntilRef.current = Date.now() + COOLDOWN_MS;
  }, []);

  useEffect(() => {
    if (!gestureResult) {
      stableRef.current = null;
      lastCommittedKeyRef.current = null;
      return;
    }

    if (gestureResult.confidenceScore < MIN_CONFIDENCE) {
      return;
    }

    const key = gestureResult.gesture;
    const now = Date.now();

    if (now < cooldownUntilRef.current && lastCommittedKeyRef.current === key) {
      return;
    }

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
    cooldownUntilRef.current = 0;
  }, []);

  const clearSentence = useCallback(() => {
    setWords([]);
    stableRef.current = null;
    lastCommittedKeyRef.current = null;
    cooldownUntilRef.current = 0;
  }, []);

  const legacyWords: CommittedSign[] = words.map((word) => ({
    gesture: word.wordId,
    text: word.detectedWord,
    confidence: word.confidenceScore,
    wordId: word.wordId,
    detectedWord: word.detectedWord,
    confidenceScore: word.confidenceScore,
    timestamp: word.timestamp,
  }));

  return {
    words: legacyWords,
    signWords: words,
    sentence: naturalSentence,
    rawSentence,
    naturalSentence,
    undoLastWord,
    clearSentence,
  };
}
