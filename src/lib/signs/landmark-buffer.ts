import type { HandLandmark } from "@/lib/mediapipe/types";

const DEFAULT_CAPACITY = 24;

/** Ring buffer of recent hand landmark frames for temporal / sequence models */
export class LandmarkFrameBuffer {
  private frames: HandLandmark[][] = [];
  private readonly capacity: number;

  constructor(capacity = DEFAULT_CAPACITY) {
    this.capacity = capacity;
  }

  push(landmarks: HandLandmark[]): void {
    this.frames.push(landmarks.map((point) => ({ ...point })));
    if (this.frames.length > this.capacity) {
      this.frames.shift();
    }
  }

  clear(): void {
    this.frames = [];
  }

  toArray(): HandLandmark[][] {
    return this.frames.map((frame) => frame.map((point) => ({ ...point })));
  }

  get length(): number {
    return this.frames.length;
  }
}
