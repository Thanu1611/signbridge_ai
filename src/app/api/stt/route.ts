import { NextResponse } from "next/server";
import { isElevenLabsConfigured, transcribeAudio } from "@/lib/elevenlabs/stt";
import type { AppLanguage } from "@/types";

export async function POST(request: Request) {
  if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      {
        error:
          "ElevenLabs not configured. Add ELEVENLABS_API_KEY to .env.local for voice transcription.",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const language = (formData.get("language") as AppLanguage) || "en";
    const text = await transcribeAudio(file, language);

    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
