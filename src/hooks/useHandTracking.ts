"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  classifyWithModel,
  initGestureClassifier,
  type WristSample,
} from "@/lib/gestures/gesture-classifier";
import { clearHandOverlay, drawHandOverlay } from "@/lib/mediapipe/draw-hand";
import {
  closeHandLandmarker,
  detectHandsInFrame,
  getHandLandmarker,
  landmarksFromResult,
} from "@/lib/mediapipe/hand-landmarker";
import type { HandLandmark } from "@/lib/mediapipe/types";
import type { AppLanguage, GestureResult } from "@/types";

export type CameraTrackingStatus =
  | "inactive"
  | "loading"
  | "hand_detected"
  | "no_hand_detected";

export const TRACKING_STATUS_LABEL: Record<CameraTrackingStatus, string> = {
  inactive: "Camera inactive",
  loading: "Camera loading",
  hand_detected: "Hand detected",
  no_hand_detected: "No hand detected",
};

function mapCameraError(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
        return "Camera permission denied. Allow camera access in your browser settings, then try again.";
      case "NotFoundError":
        return "No camera found on this device.";
      case "NotReadableError":
        return "Camera is in use by another app. Close other apps using the camera and try again.";
      case "SecurityError":
        return "Camera requires a secure connection (HTTPS or localhost).";
      default:
        return error.message || "Could not access the camera.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Could not access the camera.";
}

export interface UseHandTrackingOptions {
  language: AppLanguage;
  onGesture?: (result: GestureResult | null) => void;
}

export function useHandTracking({ language, onGesture }: UseHandTrackingOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const wristHistoryRef = useRef<WristSample[]>([]);
  const lastVideoTimeRef = useRef(-1);
  const runningRef = useRef(false);

  const [status, setStatus] = useState<CameraTrackingStatus>("inactive");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<HandLandmark[] | null>(null);
  const [gestureResult, setGestureResult] = useState<GestureResult | null>(null);

  useEffect(() => {
    initGestureClassifier();
  }, []);

  const stopCamera = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    wristHistoryRef.current = [];
    lastVideoTimeRef.current = -1;

    const video = videoRef.current;
    if (video) video.srcObject = null;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      clearHandOverlay(ctx, canvas.width, canvas.height);
    }

    setIsActive(false);
    setIsLoading(false);
    setLandmarks(null);
    setGestureResult(null);
    setStatus("inactive");
  }, []);

  const processLandmarks = useCallback(
    async (points: HandLandmark[], w: number, h: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      canvas.width = w;
      canvas.height = h;
      setLandmarks(points);
      drawHandOverlay(ctx, points, w, h);

      const now = Date.now();
      wristHistoryRef.current.push({ x: points[0].x, t: now });
      wristHistoryRef.current = wristHistoryRef.current.filter(
        (s) => now - s.t < 1200
      );

      const classified = await classifyWithModel(
        points,
        language,
        wristHistoryRef.current
      );
      if (classified) {
        setGestureResult(classified);
        onGesture?.(classified);
      }
      setStatus("hand_detected");
    },
    [language, onGesture]
  );

  const startCamera = useCallback(async () => {
    if (isLoading || isActive) return;

    const video = videoRef.current;
    if (!video) {
      setError("Video element not ready.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setStatus("loading");

    try {
      closeHandLandmarker();

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported in this browser.");
      }

      const [, stream] = await Promise.all([
        getHandLandmarker(),
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        }),
      ]);

      streamRef.current = stream;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      runningRef.current = true;
      setIsActive(true);
      setStatus("no_hand_detected");

      let detecting = false;

      const detectLoop = () => {
        if (!runningRef.current) return;

        const w = video.videoWidth;
        const h = video.videoHeight;

        if (video.readyState >= 2 && w > 0 && h > 0 && !detecting) {
          const time = video.currentTime;
          if (time !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = time;
            detecting = true;

            void detectHandsInFrame(video)
              .then((hand) => {
                if (!runningRef.current) return;
                const points = landmarksFromResult(hand, w, h);
                const overlay = canvasRef.current;
                const octx = overlay?.getContext("2d");

                if (points && octx && overlay) {
                  void processLandmarks(points, w, h);
                } else if (overlay && octx) {
                  overlay.width = w;
                  overlay.height = h;
                  clearHandOverlay(octx, w, h);
                  setLandmarks(null);
                  setStatus("no_hand_detected");
                }
              })
              .catch(() => {
                /* skip bad frame */
              })
              .finally(() => {
                detecting = false;
              });
          }
        }

        rafRef.current = requestAnimationFrame(detectLoop);
      };

      detectLoop();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : mapCameraError(e);
      setError(msg.includes("Camera") ? mapCameraError(e) : msg);
      stopCamera();
    } finally {
      setIsLoading(false);
    }
  }, [isActive, isLoading, processLandmarks, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      closeHandLandmarker();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    status,
    statusLabel: TRACKING_STATUS_LABEL[status],
    isActive,
    isLoading,
    error,
    landmarks,
    gestureResult,
    setGestureResult,
    startCamera,
    stopCamera,
  };
}
