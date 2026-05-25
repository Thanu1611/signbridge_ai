/**
 * Server-side ElevenLabs text-to-speech helper.
 * Called from API routes only — never import in client components.
 */

import type { AppLanguage } from "@/types";
import {
  getApiKey,
  isElevenLabsConfigured,
  resolveLanguageCode,
  resolveModelId,
  resolveVoiceId,
} from "./config";
import { parseElevenLabsError } from "./errors";

export { isElevenLabsConfigured };

export interface TtsOptions {
  text: string;
  voiceType?: string;
  language?: AppLanguage;
  /** Faster model for live translator (slightly less natural, lower latency). */
  lowLatency?: boolean;
}

export async function generateSpeech(
  options: TtsOptions
): Promise<ArrayBuffer> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("ElevenLabs API key not configured");
  }

  const voiceId = resolveVoiceId(options.voiceType);
  const modelId = options.lowLatency
    ? "eleven_turbo_v2_5"
    : resolveModelId(options.voiceType);
  const languageCode = resolveLanguageCode(options.language);

  const body: Record<string, unknown> = {
    text: options.text.slice(0, 500),
    model_id: modelId,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  };

  if (languageCode) {
    body.language_code = languageCode;
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(parseElevenLabsError(response.status, errText));
  }

  return response.arrayBuffer();
}

export async function verifyElevenLabsConnection(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, error: "ELEVENLABS_API_KEY not set" };
  }

  try {
    // Verify with a minimal TTS call — matches what the app actually uses.
    // Avoids /v1/user which requires user_read (often disabled on restricted keys).
    await generateSpeech({ text: "OK" });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Connection failed";
    if (message.includes("401") || message.includes("missing_permissions")) {
      return {
        ok: false,
        error:
          "API key lacks Text-to-Speech permission. In ElevenLabs → API Keys, enable Text to Speech (and Speech to Text for voice input).",
      };
    }
    return { ok: false, error: message };
  }
}

export async function fetchVoices(): Promise<
  { voice_id: string; name: string }[]
> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch voices (${res.status})`);
  }

  const data = (await res.json()) as {
    voices?: { voice_id: string; name: string }[];
  };
  return data.voices ?? [];
}
