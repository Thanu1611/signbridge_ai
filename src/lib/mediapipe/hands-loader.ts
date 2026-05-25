/* MediaPipe Hands — WASM, optimized for real-time finger tracking in the browser */

import type { HandsResults } from "./types";

export type { HandLandmark, HandsResults } from "./types";
export { HAND_LANDMARK_COUNT } from "./types";

const HANDS_PKG_VERSION = "0.4.1675469240";
const HANDS_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${HANDS_PKG_VERSION}`;

interface HandsInstance {
  setOptions(options: Record<string, unknown>): void;
  onResults(callback: (results: HandsResults) => void): void;
  send(inputs: { image: HTMLVideoElement }): Promise<void>;
  close(): void;
}

type HandsConstructor = new (config: {
  locateFile: (file: string) => string;
}) => HandsInstance;

export interface HandsTracker {
  sendFrame(video: HTMLVideoElement): Promise<void>;
  close(): void;
}

async function loadHandsConstructor(): Promise<HandsConstructor> {
  const handsMod = await import("@mediapipe/hands");
  const Hands = (handsMod as { Hands?: HandsConstructor }).Hands;
  if (!Hands) {
    throw new Error("MediaPipe Hands failed to load");
  }
  return Hands;
}

/**
 * MediaPipe Hands tracker (no Camera util — use your own video stream + canvas).
 */
export async function createHandsTracker(
  onResults: (results: HandsResults) => void
): Promise<HandsTracker> {
  if (typeof window === "undefined") {
    throw new Error("MediaPipe Hands can only load in the browser");
  }

  const Hands = await loadHandsConstructor();

  const hands = new Hands({
    locateFile: (file) => `${HANDS_CDN}/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.55,
    minTrackingConfidence: 0.55,
    selfieMode: true,
  });
  hands.onResults(onResults);

  let closed = false;

  return {
    async sendFrame(video: HTMLVideoElement) {
      if (closed || video.readyState < 2 || video.videoWidth === 0) return;
      await hands.send({ image: video });
    },
    close() {
      closed = true;
      hands.close();
    },
  };
}
