import { HAND_CONNECTIONS } from "./hand-connections";
import type { HandLandmark } from "./types";

export type HandOverlayMode = "tracking" | "sign";

const STYLES: Record<
  HandOverlayMode,
  { fill: string; stroke: string; line: string; joint: string }
> = {
  tracking: {
    fill: "rgba(0, 194, 203, 0.15)",
    stroke: "rgba(0, 194, 203, 0.7)",
    line: "rgba(0, 194, 203, 0.9)",
    joint: "#00C2CB",
  },
  sign: {
    fill: "rgba(38, 194, 153, 0.2)",
    stroke: "rgba(38, 194, 153, 0.85)",
    line: "rgba(38, 194, 153, 0.95)",
    joint: "#26C299",
  },
};

const PALM = [0, 5, 9, 13, 17];
const JOINT_RADIUS = 3.5;
const LINE_WIDTH = 2;

function px(lm: HandLandmark, w: number, h: number) {
  return { x: lm.x * w, y: lm.y * h };
}

export function paintHandOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmark[],
  width: number,
  height: number,
  mode: HandOverlayMode = "tracking"
): void {
  const s = STYLES[mode];

  ctx.fillStyle = s.fill;
  ctx.beginPath();
  const p0 = px(landmarks[PALM[0]], width, height);
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i < PALM.length; i++) {
    const p = px(landmarks[PALM[i]], width, height);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = s.line;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = "round";
  for (const [a, b] of HAND_CONNECTIONS) {
    const pa = px(landmarks[a], width, height);
    const pb = px(landmarks[b], width, height);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  ctx.strokeStyle = s.stroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const pStart = px(landmarks[PALM[0]], width, height);
  ctx.moveTo(pStart.x, pStart.y);
  for (let i = 1; i < PALM.length; i++) {
    const p = px(landmarks[PALM[i]], width, height);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = s.joint;
  for (const lm of landmarks) {
    const { x, y } = px(lm, width, height);
    ctx.beginPath();
    ctx.arc(x, y, JOINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

const MAX_DISPLAY_WIDTH = 640;

export function drawCameraFrameWithOverlay(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  landmarks: HandLandmark[] | null,
  mode: HandOverlayMode = "tracking",
  mirror = true
): void {
  const srcW = video.videoWidth;
  const srcH = video.videoHeight;
  if (srcW === 0 || srcH === 0) return;

  const scale = Math.min(1, MAX_DISPLAY_WIDTH / srcW);
  const w = Math.round(srcW * scale);
  const h = Math.round(srcH * scale);

  const canvas = ctx.canvas;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  ctx.save();
  if (mirror) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();

  if (landmarks && landmarks.length > 0) {
    paintHandOverlay(ctx, landmarks, w, h, mode);
  }
}

export function clearHandOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}
