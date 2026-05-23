import { HAND_CONNECTIONS } from "./hand-connections";
import type { HandLandmark } from "./types";

const POINT_COLOR = "#00C2CB";
const LINE_COLOR = "rgba(0, 194, 203, 0.75)";
const POINT_RADIUS = 5;

/**
 * Draw 21 hand landmarks and skeleton on a canvas aligned with the video frame.
 */
export function drawHandOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmark[],
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 2;
  for (const [start, end] of HAND_CONNECTIONS) {
    const a = landmarks[start];
    const b = landmarks[end];
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.stroke();
  }

  ctx.fillStyle = POINT_COLOR;
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, POINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function clearHandOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}
