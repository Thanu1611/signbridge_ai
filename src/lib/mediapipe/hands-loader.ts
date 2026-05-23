/* MediaPipe Hands — browser-only, WASM assets from CDN */

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

interface CameraInstance {
  start(): Promise<void>;
  stop(): Promise<void>;
}

type HandsConstructor = new (config: {
  locateFile: (file: string) => string;
}) => HandsInstance;

type CameraConstructor = new (
  video: HTMLVideoElement,
  options: {
    onFrame: () => Promise<void>;
    width?: number;
    height?: number;
    facingMode?: "user" | "environment";
  }
) => CameraInstance;

export interface HandsSession {
  start(video: HTMLVideoElement): Promise<void>;
  stop(): Promise<void>;
}

async function loadMediaPipeModules(): Promise<{
  Hands: HandsConstructor;
  Camera: CameraConstructor;
}> {
  const [handsMod, cameraMod] = await Promise.all([
    import("@mediapipe/hands"),
    import("@mediapipe/camera_utils"),
  ]);

  const Hands = (handsMod as { Hands?: HandsConstructor }).Hands;
  const Camera = (cameraMod as { Camera?: CameraConstructor }).Camera;

  if (!Hands || !Camera) {
    throw new Error("MediaPipe modules failed to load");
  }

  return { Hands, Camera };
}

/**
 * Creates a MediaPipe Hands session with selfie-mode for front cameras.
 * Uses @mediapipe/camera_utils for a stable frame loop.
 */
export async function createHandsSession(
  onResults: (results: HandsResults) => void
): Promise<HandsSession> {
  if (typeof window === "undefined") {
    throw new Error("MediaPipe Hands can only load in the browser");
  }

  const { Hands, Camera } = await loadMediaPipeModules();

  const hands = new Hands({
    locateFile: (file) => `${HANDS_CDN}/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    selfieMode: true,
  });
  hands.onResults(onResults);

  let camera: CameraInstance | null = null;
  let processing = false;

  return {
    async start(video: HTMLVideoElement) {
      camera = new Camera(video, {
        onFrame: async () => {
          if (processing) return;
          processing = true;
          try {
            if (video.readyState >= 2 && video.videoWidth > 0) {
              await hands.send({ image: video });
            }
          } catch {
            /* skip frame on transient send errors */
          } finally {
            processing = false;
          }
        },
        width: 1280,
        height: 720,
        facingMode: "user",
      });
      await camera.start();
    },
    async stop() {
      await camera?.stop();
      camera = null;
      hands.close();
    },
  };
}

/** @deprecated Use createHandsSession */
export async function createHandsDetector(
  onResults: (results: HandsResults) => void
): Promise<HandsInstance> {
  const { Hands } = await loadMediaPipeModules();
  const hands = new Hands({
    locateFile: (file) => `${HANDS_CDN}/${file}`,
  });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    selfieMode: true,
  });
  hands.onResults(onResults);
  return hands;
}
