import type { AppLanguage, GestureResult } from "@/types";
import type { HandLandmark } from "@/lib/mediapipe/types";
import { HAND_LANDMARK_COUNT } from "@/lib/mediapipe/types";
import {
  initSignPipeline,
  recognizeSign,
  resetSignPipeline,
  type SignDetection,
} from "@/lib/signs";

export type { HandLandmark };

export interface WristSample {
  x: number;
  t: number;
}

function detectionToGestureResult(detection: SignDetection): GestureResult {
  return {
    gesture: detection.wordId,
    detectedWord: detection.detectedWord,
    translatedText: detection.detectedWord,
    confidence: detection.confidenceScore,
    confidenceScore: detection.confidenceScore,
    timestamp: detection.timestamp,
  };
}

/** Initialize the sign recognition pipeline (vocabulary + providers). */
export async function initGestureClassifier(): Promise<void> {
  await initSignPipeline();
}

export function classifyGestureFromLandmarks(
  landmarks: HandLandmark[] | null,
  language: AppLanguage,
  wristHistory: WristSample[] = []
): GestureResult | null {
  if (!landmarks || landmarks.length < HAND_LANDMARK_COUNT) return null;

  // Sync wrapper — pipeline classify is async; used only in tests or sync paths.
  return null;
}

/** Primary entry — runs the scalable sign recognition pipeline. */
export async function classifyWithModel(
  landmarks: HandLandmark[],
  language: AppLanguage,
  wristHistory: WristSample[] = []
): Promise<GestureResult | null> {
  await initSignPipeline();

  const detection = await recognizeSign(landmarks, language, wristHistory, null);
  if (!detection) return null;

  return detectionToGestureResult(detection);
}

export function resetGestureClassifier(): void {
  resetSignPipeline();
}
