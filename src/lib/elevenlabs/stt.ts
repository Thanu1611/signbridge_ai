import type { AppLanguage } from "@/types";
import { getApiKey, isElevenLabsConfigured } from "./config";
import { parseElevenLabsError } from "./errors";

export { isElevenLabsConfigured };

const STT_MODEL = "scribe_v2";

export function sttLanguageCode(language: AppLanguage): string {
  return language === "ta" ? "ta" : "en";
}

export async function transcribeAudio(
  file: Blob,
  language: AppLanguage
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("ElevenLabs API key not configured");
  }

  const formData = new FormData();
  formData.append("file", file, "recording.webm");
  formData.append("model_id", STT_MODEL);
  formData.append("language_code", sttLanguageCode(language));
  formData.append("tag_audio_events", "false");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(parseElevenLabsError(response.status, errText));
  }

  const data = (await response.json()) as {
    text?: string;
    transcript?: string;
  };

  const text = data.text?.trim() ?? data.transcript?.trim() ?? "";
  if (!text) {
    throw new Error("No speech detected. Try speaking louder or longer.");
  }

  return text;
}
