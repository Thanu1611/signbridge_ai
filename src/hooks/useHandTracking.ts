"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  classifyWithModel,
  initGestureClassifier,
  type WristSample,
} from "@/lib/gestures/gesture-classifier";
import {
  drawCameraFrameWithOverlay,
  type HandOverlayMode,
} from "@/lib/mediapipe/draw-hand";
import {
  closeHandLandmarker,
  initHandTracker,
  landmarksFromMediaPipe,
  sendHandFrame,
} from "@/lib/mediapipe/hand-landmarker";
import { smoothLandmarks } from "@/lib/mediapipe/smooth-landmarks";
import type { HandLandmark } from "@/lib/mediapipe/types";
import type { AppLanguage, GestureResult } from "@/types";

export type CameraTrackingStatus =
  | "inactive"
  | "loading"
  | "hand_detected"
  | "no_hand_detected";

export const TRACKING_STATUS_LABEL: Record<CameraTrackingStatus, string> = {
  inactive: "🔴 Camera Offline",
  loading: "🟢 Camera Active",
  hand_detected: "🤖 AI Detecting Sign...",
  no_hand_detected: "🟢 Camera Active",
};

const TRACK_INTERVAL_MS = 40;
const CLASSIFY_INTERVAL_MS = 180;

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
  const runningRef = useRef(false);
  const trackingBusyRef = useRef(false);
  const lastTrackAtRef = useRef(0);
  const lastClassifyAtRef = useRef(0);
  const smoothLandmarksRef = useRef<HandLandmark[] | null>(null);
  const overlayLandmarksRef = useRef<HandLandmark[] | null>(null);
  const overlayModeRef = useRef<HandOverlayMode>("tracking");
  const classifyGenerationRef = useRef(0);

  const [status, setStatus] = useState<CameraTrackingStatus>("inactive");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<HandLandmark[] | null>(null);
  const [gestureResult, setGestureResult] = useState<GestureResult | null>(null);
  const [signRecognized, setSignRecognized] = useState(false);

  useEffect(() => {
    initGestureClassifier();
  }, []);

  const runClassification = useCallback(
    async (points: HandLandmark[]) => {
      const gen = ++classifyGenerationRef.current;
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

      if (gen !== classifyGenerationRef.current) return;

      overlayModeRef.current = classified ? "sign" : "tracking";
      setSignRecognized(Boolean(classified));
      if (classified) {
        setGestureResult(classified);
        onGesture?.(classified);
      }
    },
    [language, onGesture]
  );

  const scheduleClassification = useCallback(
    (points: HandLandmark[]) => {
      const now = performance.now();
      if (now - lastClassifyAtRef.current < CLASSIFY_INTERVAL_MS) return;
      lastClassifyAtRef.current = now;
      void runClassification(points);
    },
    [runClassification]
  );

  const renderLiveFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !runningRef.current) return;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawCameraFrameWithOverlay(
      ctx,
      video,
      overlayLandmarksRef.current,
      overlayModeRef.current
    );
  }, []);

  const stopCamera = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    wristHistoryRef.current = [];
    smoothLandmarksRef.current = null;
    overlayLandmarksRef.current = null;
    overlayModeRef.current = "tracking";
    trackingBusyRef.current = false;
    classifyGenerationRef.current += 1;

    const video = videoRef.current;
    if (video) video.srcObject = null;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    closeHandLandmarker();

    setIsActive(false);
    setIsLoading(false);
    setLandmarks(null);
    setGestureResult(null);
    setSignRecognized(false);
    setStatus("inactive");
  }, []);

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

      await initHandTracker((results) => {
        const raw = landmarksFromMediaPipe(results);

        if (raw) {
          const smoothed = smoothLandmarks(smoothLandmarksRef.current, raw, 0.5);
          smoothLandmarksRef.current = smoothed;
          overlayLandmarksRef.current = smoothed;
          setLandmarks(smoothed);
          setStatus("hand_detected");
          scheduleClassification(smoothed);
        } else {
          smoothLandmarksRef.current = null;
          overlayLandmarksRef.current = null;
          overlayModeRef.current = "tracking";
          setLandmarks(null);
          setSignRecognized(false);
          setStatus("no_hand_detected");
        }
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      runningRef.current = true;
      setIsActive(true);
      setStatus("no_hand_detected");

      const loop = (now: number) => {
        if (!runningRef.current) return;

        renderLiveFrame();

        if (
          !trackingBusyRef.current &&
          now - lastTrackAtRef.current >= TRACK_INTERVAL_MS &&
          video.readyState >= 2 &&
          video.videoWidth > 0
        ) {
          lastTrackAtRef.current = now;
          trackingBusyRef.current = true;
          void sendHandFrame(video)
            .catch(() => {})
            .finally(() => {
              trackingBusyRef.current = false;
            });
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : mapCameraError(e);
      setError(msg.includes("Camera") ? mapCameraError(e) : msg);
      stopCamera();
    } finally {
      setIsLoading(false);
    }
  }, [
    isActive,
    isLoading,
    renderLiveFrame,
    scheduleClassification,
    stopCamera,
  ]);

  useEffect(() => {
    return () => {
      stopCamera();
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
    signRecognized,
    startCamera,
    stopCamera,
  };
}
