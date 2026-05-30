import { NextResponse } from "next/server";
import { generateSpeech, isElevenLabsConfigured } from "@/lib/elevenlabs/tts";
import type { AppLanguage } from "@/types";

export async function POST(request: Request) {
  if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      {
        error:
          "ElevenLabs not configured. Add ELEVENLABS_API_KEY to .env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  try {
    const { text, voiceType, language, lowLatency } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const audioBuffer = await generateSpeech({
      text,
      voiceType,
      language: language as AppLanguage | undefined,
      lowLatency: Boolean(lowLatency),
    });

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
