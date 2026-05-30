import type { AppLanguage } from "@/types";
import type { HandLandmark } from "@/lib/mediapipe/types";
import type { WristSample } from "@/lib/gestures/gesture-classifier";
import { LandmarkFrameBuffer } from "./landmark-buffer";
import { modelSignRecognizer } from "./providers/model-provider";
import { ruleBasedSignRecognizer } from "./rule-based-recognizer";
import type { BodyLandmarks, RecognitionContext, SignDetection, SignRecognizer } from "./types";

const DEFAULT_RECOGNIZERS: SignRecognizer[] = [
  modelSignRecognizer,
  ruleBasedSignRecognizer,
];

let recognizers: SignRecognizer[] = [...DEFAULT_RECOGNIZERS];
let initialized = false;
const frameBuffer = new LandmarkFrameBuffer();

export async function initSignPipeline(): Promise<void> {
  initialized = true;
}

export function registerSignRecognizer(recognizer: SignRecognizer, priority: "high" | "low" = "high"): void {
  if (priority === "high") {
    recognizers = [recognizer, ...recognizers.filter((r) => r.name !== recognizer.name)];
  } else {
    recognizers = [...recognizers.filter((r) => r.name !== recognizer.name), recognizer];
  }
}

export function resetSignPipeline(): void {
  frameBuffer.clear();
}

function buildContext(
  handLandmarks: HandLandmark[],
  language: AppLanguage,
  wristHistory: WristSample[],
  bodyLandmarks: BodyLandmarks = null
): RecognitionContext {
  frameBuffer.push(handLandmarks);

  return {
    handLandmarks,
    wristHistory,
    landmarkFrames: frameBuffer.toArray(),
    bodyLandmarks,
    language,
    timestamp: Date.now(),
  };
}

/**
 * Run all registered recognizers; first non-null result wins.
 * Model provider is tried before rules so a future ML model takes priority.
 */
export async function recognizeSign(
  handLandmarks: HandLandmark[],
  language: AppLanguage,
  wristHistory: WristSample[] = [],
  bodyLandmarks: BodyLandmarks = null
): Promise<SignDetection | null> {
  if (!initialized) await initSignPipeline();

  const context = buildContext(handLandmarks, language, wristHistory, bodyLandmarks);

  for (const recognizer of recognizers) {
    const detection = await recognizer.classify(context);
    if (detection) return detection;
  }

  return null;
}

export { frameBuffer as landmarkFrameBuffer };
