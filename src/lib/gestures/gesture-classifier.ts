import type { AppLanguage, GestureKey, GestureResult } from "@/types";
import { GESTURE_TRANSLATIONS } from "@/lib/constants";
import type { HandLandmark } from "@/lib/mediapipe/types";
import { HAND_LANDMARK_COUNT } from "@/lib/mediapipe/types";

export type { HandLandmark };

export interface WristSample {
  x: number;
  t: number;
}

let tfReady = false;

/**
 * Placeholder for future TensorFlow.js model loading.
 * Intentionally does NOT import @tensorflow/tfjs here — WebGL backend
 * conflicts with MediaPipe on Windows (gl_texture_buffer errors).
 */
export async function initGestureClassifier(): Promise<void> {
  tfReady = true;
}

function landmarkDistance(a: HandLandmark, b: HandLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function isFingerExtended(
  landmarks: HandLandmark[],
  tip: number,
  mcp: number
): boolean {
  const wrist = landmarks[0];
  return (
    landmarkDistance(landmarks[tip], wrist) >
    landmarkDistance(landmarks[mcp], wrist) * 1.12
  );
}

function isThumbExtended(landmarks: HandLandmark[]): boolean {
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const indexMcp = landmarks[5];
  const thumbOutward =
    Math.abs(thumbTip.x - indexMcp.x) > Math.abs(thumbIp.x - indexMcp.x);
  const thumbRaised = thumbTip.y < thumbIp.y - 0.03;
  return thumbOutward && thumbRaised;
}

function detectWavingMotion(history: WristSample[]): boolean {
  if (history.length < 8) return false;
  const xs = history.map((s) => s.x);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  const span = max - min;
  if (span < 0.08) return false;

  let directionChanges = 0;
  for (let i = 2; i < xs.length; i++) {
    const prev = xs[i - 1] - xs[i - 2];
    const curr = xs[i] - xs[i - 1];
    if (prev * curr < 0) directionChanges++;
  }
  return directionChanges >= 3;
}

/**
 * Rule-based demo classifier from 21 MediaPipe landmarks.
 * Swap implementation in `classifyWithModel` when a TF.js model is ready.
 */
export function classifyGestureFromLandmarks(
  landmarks: HandLandmark[] | null,
  language: AppLanguage,
  wristHistory: WristSample[] = []
): GestureResult | null {
  if (!landmarks || landmarks.length < HAND_LANDMARK_COUNT) return null;

  const index = isFingerExtended(landmarks, 8, 5);
  const middle = isFingerExtended(landmarks, 12, 9);
  const ring = isFingerExtended(landmarks, 16, 13);
  const pinky = isFingerExtended(landmarks, 20, 17);
  const thumb = isThumbExtended(landmarks);

  const extendedCount = [index, middle, ring, pinky].filter(Boolean).length;
  const palmOpen = extendedCount >= 4;
  const closedFist = extendedCount === 0 && !thumb;
  const peaceSign = index && middle && !ring && !pinky;
  const thumbsUp = thumb && extendedCount === 0;

  let gesture: GestureKey;
  let confidence: number;

  if (detectWavingMotion(wristHistory)) {
    gesture = "hi";
    confidence = 0.82;
  } else if (peaceSign) {
    gesture = "peace";
    confidence = 0.84;
  } else if (thumbsUp) {
    gesture = "yes";
    confidence = 0.86;
  } else if (closedFist) {
    gesture = "stop";
    confidence = 0.8;
  } else if (palmOpen) {
    gesture = "hello";
    confidence = 0.88;
  } else {
    return null;
  }

  return {
    gesture,
    translatedText: GESTURE_TRANSLATIONS[gesture][language],
    confidence,
  };
}

/**
 * Entry point for classification — replace body with model.predict() later.
 */
export async function classifyWithModel(
  landmarks: HandLandmark[],
  language: AppLanguage,
  wristHistory: WristSample[] = []
): Promise<GestureResult | null> {
  await initGestureClassifier();
  return classifyGestureFromLandmarks(landmarks, language, wristHistory);
}
