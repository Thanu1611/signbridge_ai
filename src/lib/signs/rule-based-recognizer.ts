import type { WristSample } from "@/lib/gestures/gesture-classifier";
import type { HandLandmark } from "@/lib/mediapipe/types";
import { HAND_LANDMARK_COUNT } from "@/lib/mediapipe/types";
import { getSignLabel } from "./vocabulary";
import type { RecognitionContext, SignDetection, SignRecognizer, SignWordId } from "./types";

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
  if (max - min < 0.08) return false;

  let directionChanges = 0;
  for (let i = 2; i < xs.length; i++) {
    const prev = xs[i - 1] - xs[i - 2];
    const curr = xs[i] - xs[i - 1];
    if (prev * curr < 0) directionChanges++;
  }
  return directionChanges >= 3;
}

interface FingerState {
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
  thumb: boolean;
  extendedCount: number;
  palmOpen: boolean;
  closedFist: boolean;
  peaceSign: boolean;
  indexOnly: boolean;
  threeFingers: boolean;
  thumbsUp: boolean;
  wristY: number;
  wristX: number;
  handCenterY: number;
}

function analyzeFingers(landmarks: HandLandmark[]): FingerState {
  const index = isFingerExtended(landmarks, 8, 5);
  const middle = isFingerExtended(landmarks, 12, 9);
  const ring = isFingerExtended(landmarks, 16, 13);
  const pinky = isFingerExtended(landmarks, 20, 17);
  const thumb = isThumbExtended(landmarks);
  const extendedCount = [index, middle, ring, pinky].filter(Boolean).length;

  return {
    index,
    middle,
    ring,
    pinky,
    thumb,
    extendedCount,
    palmOpen: extendedCount >= 4,
    closedFist: extendedCount === 0 && !thumb,
    peaceSign: index && middle && !ring && !pinky,
    indexOnly: index && !middle && !ring && !pinky && !thumb,
    threeFingers: index && middle && ring && !pinky,
    thumbsUp: thumb && extendedCount === 0,
    wristY: landmarks[0].y,
    wristX: landmarks[0].x,
    handCenterY: landmarks[9].y,
  };
}

function buildDetection(
  wordId: SignWordId,
  confidenceScore: number,
  context: RecognitionContext
): SignDetection {
  return {
    wordId,
    detectedWord: getSignLabel(wordId, context.language),
    confidenceScore,
    timestamp: context.timestamp,
  };
}

/**
 * Rule-based word recognizer from MediaPipe hand landmarks.
 * Replace or augment with `modelSignRecognizer` when a trained model is ready.
 */
export const ruleBasedSignRecognizer: SignRecognizer = {
  name: "rule-based",

  async classify(context: RecognitionContext): Promise<SignDetection | null> {
    const { handLandmarks, wristHistory } = context;
    if (handLandmarks.length < HAND_LANDMARK_COUNT) return null;

    const f = analyzeFingers(handLandmarks);

    if (detectWavingMotion(wristHistory)) {
      return buildDetection("hi", 0.84, context);
    }

    if (f.palmOpen && f.wristY < 0.38 && f.extendedCount === 4) {
      return buildDetection("thank_you", 0.87, context);
    }

    if (f.palmOpen && f.wristY < 0.34) {
      return buildDetection("help", 0.85, context);
    }

    if (f.indexOnly && f.handCenterY < 0.45) {
      return buildDetection("you", 0.82, context);
    }

    if (f.indexOnly && f.handCenterY >= 0.5) {
      return buildDetection("i", 0.81, context);
    }

    if (f.threeFingers) {
      return buildDetection("how", 0.8, context);
    }

    if (f.peaceSign) {
      return buildDetection("peace", 0.86, context);
    }

    if (f.thumbsUp && f.wristY < 0.55) {
      return buildDetection("good", 0.88, context);
    }

    if (f.thumbsUp) {
      return buildDetection("yes", 0.87, context);
    }

    if (f.indexOnly) {
      return buildDetection("no", 0.83, context);
    }

    if (f.closedFist) {
      return buildDetection("stop", 0.82, context);
    }

    if (f.palmOpen && f.handCenterY > 0.55) {
      return buildDetection("please", 0.79, context);
    }

    if (f.palmOpen && f.wristY >= 0.38 && f.wristY <= 0.62) {
      return buildDetection("welcome", 0.8, context);
    }

    if (f.palmOpen) {
      return buildDetection("hello", 0.9, context);
    }

    return null;
  },
};
