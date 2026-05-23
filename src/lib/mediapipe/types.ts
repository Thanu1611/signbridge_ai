/** Normalized hand landmark (x, y, z in [0, 1] relative to image). */
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export const HAND_LANDMARK_COUNT = 21;

export interface HandsResults {
  multiHandLandmarks?: HandLandmark[][];
  multiHandedness?: { label: string; score: number }[];
}
