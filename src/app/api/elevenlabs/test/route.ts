import { NextResponse } from "next/server";
import { generateSpeech, isElevenLabsConfigured } from "@/lib/elevenlabs/tts";

export async function POST(request: Request) {
  if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 503 }
    );
  }

  try {
    const { voiceType, language } = await request.json().catch(() => ({}));
    const sample =
      language === "ta"
        ? "வணக்கம்! SignBridge AI உடன் இணைக்கப்பட்டுள்ளது."
        : "Hello! SignBridge AI is connected to ElevenLabs.";

    const audioBuffer = await generateSpeech({
      text: sample,
      voiceType,
      language,
    });

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Test failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
