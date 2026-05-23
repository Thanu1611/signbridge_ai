/**
 * Hand tracking via @tensorflow-models/handpose (CPU / WebGL optional).
 * No MediaPipe WASM — avoids gl_texture_buffer errors on Windows.
 */

import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import type * as handposeTypes from "@tensorflow-models/handpose";
import type { HandLandmark } from "./types";
import { HAND_LANDMARK_COUNT } from "./types";

export type { HandLandmark };

type HandPoseModel = handposeTypes.HandPose;

let model: HandPoseModel | null = null;
let modelPromise: Promise<HandPoseModel> | null = null;

async function loadHandPose(): Promise<HandPoseModel> {
  await tf.setBackend("cpu");
  await tf.ready();
  const handpose = await import("@tensorflow-models/handpose");
  return handpose.load();
}

export async function getHandLandmarker(): Promise<HandPoseModel> {
  if (model) return model;
  if (!modelPromise) {
    modelPromise = loadHandPose().then((m) => {
      model = m;
      return m;
    });
  }
  return modelPromise;
}

export function closeHandLandmarker(): void {
  model = null;
  modelPromise = null;
}

export type HandDetection = handposeTypes.AnnotatedPrediction | null;

export async function detectHandsInFrame(
  video: HTMLVideoElement
): Promise<HandDetection> {
  const handModel = await getHandLandmarker();
  const predictions = await handModel.estimateHands(video, true);
  return predictions[0] ?? null;
}

export function landmarksFromResult(
  prediction: HandDetection,
  frameWidth: number,
  frameHeight: number
): HandLandmark[] | null {
  if (!prediction?.landmarks || frameWidth === 0 || frameHeight === 0) {
    return null;
  }
  const lm = prediction.landmarks;
  if (lm.length < HAND_LANDMARK_COUNT) return null;

  return lm.slice(0, HAND_LANDMARK_COUNT).map((coords) => ({
    x: coords[0] / frameWidth,
    y: coords[1] / frameHeight,
    z: (coords[2] ?? 0) / frameWidth,
  }));
}
