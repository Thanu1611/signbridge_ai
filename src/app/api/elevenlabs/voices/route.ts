import { NextResponse } from "next/server";
import { fetchVoices, isElevenLabsConfigured } from "@/lib/elevenlabs/tts";

export async function GET() {
  if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 503 }
    );
  }

  try {
    const voices = await fetchVoices();
    return NextResponse.json({ voices });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load voices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
