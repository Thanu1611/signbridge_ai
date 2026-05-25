import type { HandLandmark } from "./types";

/** Exponential smoothing so the finger overlay follows the hand fluidly. */
export function smoothLandmarks(
  previous: HandLandmark[] | null,
  next: HandLandmark[],
  alpha = 0.45
): HandLandmark[] {
  if (!previous || previous.length !== next.length) {
    return next.map((lm) => ({ ...lm }));
  }

  return next.map((lm, i) => ({
    x: previous[i].x + (lm.x - previous[i].x) * alpha,
    y: previous[i].y + (lm.y - previous[i].y) * alpha,
    z: previous[i].z + (lm.z - previous[i].z) * alpha,
  }));
}
