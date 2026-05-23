import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { getAgentId } from "@/lib/elevenlabs/config";
import { isElevenLabsConfigured } from "@/lib/elevenlabs/tts";

export async function GET() {
  const hasKey = isElevenLabsConfigured();
  const agentId = getAgentId();

  return NextResponse.json({
    database: isDatabaseConfigured(),
    // Key present = configured; use "Test TTS voice" for a live permission check
    elevenlabs: hasKey,
    elevenlabsStt: hasKey,
    elevenlabsAgent: Boolean(hasKey && agentId),
    elevenlabsKeyMissing: Boolean(agentId && !hasKey),
  });
}
