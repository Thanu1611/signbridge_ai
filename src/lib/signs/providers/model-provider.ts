import type { RecognitionContext, SignDetection, SignRecognizer } from "../types";

/**
 * Placeholder for future ML / API sign recognizers.
 *
 * Wire up here:
 * - TensorFlow.js / TFLite model (load weights, run predict on landmarkFrames)
 * - Sign-Speak or Hugging Face inference API
 * - Custom server route POST /api/sign/classify
 */
export const modelSignRecognizer: SignRecognizer = {
  name: "model-provider",

  async classify(_context: RecognitionContext): Promise<SignDetection | null> {
    // Return null until a model endpoint or client-side weights are configured.
    return null;
  },
};

export function setModelRecognizer(_recognizer: SignRecognizer): void {
  // Hook for runtime provider swap during integration testing.
}
