/**
 * Hand tracking via MediaPipe Hands (WASM).
 * Faster and smoother than CPU TensorFlow handpose for live video overlay.
 */

import { createHandsTracker, type HandsTracker } from "./hands-loader";
import type { HandLandmark, HandsResults } from "./types";
import { HAND_LANDMARK_COUNT } from "./types";

export type { HandLandmark };

let tracker: HandsTracker | null = null;
let trackerPromise: Promise<HandsTracker> | null = null;
let resultsHandler: ((results: HandsResults) => void) | null = null;

export async function initHandTracker(
  onResults: (results: HandsResults) => void
): Promise<HandsTracker> {
  resultsHandler = onResults;
  if (tracker) {
    return tracker;
  }
  if (!trackerPromise) {
    trackerPromise = createHandsTracker((results) => {
      resultsHandler?.(results);
    }).then((t) => {
      tracker = t;
      return t;
    });
  }
  return trackerPromise;
}

export async function getHandTracker(): Promise<HandsTracker> {
  if (tracker) return tracker;
  if (!trackerPromise) {
    throw new Error("Call initHandTracker before getHandTracker");
  }
  return trackerPromise;
}

export async function sendHandFrame(video: HTMLVideoElement): Promise<void> {
  const t = await getHandTracker();
  await t.sendFrame(video);
}

export function landmarksFromMediaPipe(
  results: HandsResults
): HandLandmark[] | null {
  const hand = results.multiHandLandmarks?.[0];
  if (!hand || hand.length < HAND_LANDMARK_COUNT) return null;
  return hand.slice(0, HAND_LANDMARK_COUNT).map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z,
  }));
}

export function closeHandLandmarker(): void {
  tracker?.close();
  tracker = null;
  trackerPromise = null;
  resultsHandler = null;
}

/** @deprecated Use initHandTracker + sendHandFrame */
export async function getHandLandmarker(): Promise<HandsTracker> {
  return initHandTracker(() => {});
}

/** @deprecated Use sendHandFrame */
export async function detectHandsInFrame(
  video: HTMLVideoElement
): Promise<null> {
  await sendHandFrame(video);
  return null;
}

/** @deprecated Use landmarksFromMediaPipe */
export function landmarksFromResult(
  _prediction: null,
  _frameWidth: number,
  _frameHeight: number
): HandLandmark[] | null {
  return null;
}
