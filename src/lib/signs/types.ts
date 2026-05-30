import type { AppLanguage } from "@/types";
import type { HandLandmark } from "@/lib/mediapipe/types";
import type { WristSample } from "@/lib/gestures/gesture-classifier";

/** Unique id for a sign in the vocabulary — add new entries in vocabulary.ts */
export type SignWordId = string;

export interface SignDefinition {
  id: SignWordId;
  labels: Record<AppLanguage, string>;
  /** Optional tags for lesson grouping or model training */
  tags?: string[];
}

export interface SignDetection {
  wordId: SignWordId;
  detectedWord: string;
  confidenceScore: number;
  timestamp: number;
}

/** Optional body landmarks — wire MediaPipe Pose or an API model here later */
export type BodyLandmarks = Record<string, { x: number; y: number; z?: number }> | null;

export interface RecognitionContext {
  handLandmarks: HandLandmark[];
  wristHistory: WristSample[];
  /** Recent hand landmark frames for sequence models */
  landmarkFrames: HandLandmark[][];
  bodyLandmarks: BodyLandmarks;
  language: AppLanguage;
  timestamp: number;
}

export interface SignRecognizer {
  readonly name: string;
  classify(context: RecognitionContext): Promise<SignDetection | null>;
}

export interface CommittedSignWord {
  wordId: SignWordId;
  detectedWord: string;
  confidenceScore: number;
  timestamp: number;
}
