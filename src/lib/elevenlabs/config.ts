import type { AppLanguage } from "@/types";

export type VoicePreset = "default" | "calm" | "friendly";

const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM";

function sanitizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v || undefined;
}

export function getApiKey(): string | undefined {
  return sanitizeEnvValue(process.env.ELEVENLABS_API_KEY);
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(getApiKey());
}

/** Conversational AI agent ID (from ElevenLabs Agents dashboard) */
export function getAgentId(): string | undefined {
  return sanitizeEnvValue(process.env.ELEVENLABS_AGENT_ID);
}

export function isAgentConfigured(): boolean {
  return isElevenLabsConfigured() && Boolean(getAgentId());
}

export function resolveVoiceId(preset?: string): string {
  const key = preset ?? "default";
  const map: Record<string, string | undefined> = {
    default: sanitizeEnvValue(process.env.ELEVENLABS_VOICE_ID),
    calm: sanitizeEnvValue(process.env.ELEVENLABS_VOICE_ID_CALM),
    friendly: sanitizeEnvValue(process.env.ELEVENLABS_VOICE_ID_FRIENDLY),
  };
  return map[key] ?? sanitizeEnvValue(process.env.ELEVENLABS_VOICE_ID) ?? DEFAULT_VOICE;
}

export function resolveModelId(preset?: string): string {
  if (preset === "calm") return "eleven_turbo_v2_5";
  return "eleven_multilingual_v2";
}

export function resolveLanguageCode(language?: AppLanguage): string | undefined {
  if (language === "ta") return "ta";
  if (language === "en") return "en";
  return undefined;
}
