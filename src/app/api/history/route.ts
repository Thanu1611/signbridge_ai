import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import type { AppLanguage, TranslationMode } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, user_id, mode, detected_gesture, translated_text,
             confidence_score, language, created_at
      FROM translation_history
      WHERE user_id = ${session.userId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ data: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const mode = body.mode as TranslationMode;
    const translatedText = body.translatedText as string;
    const detectedGesture = body.detectedGesture ?? null;
    const confidenceScore = body.confidenceScore ?? null;
    const language = (body.language as AppLanguage) ?? "en";

    if (!mode || !translatedText) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql`
      INSERT INTO translation_history (
        user_id, mode, detected_gesture, translated_text, confidence_score, language
      )
      VALUES (
        ${session.userId},
        ${mode},
        ${detectedGesture},
        ${translatedText},
        ${confidenceScore},
        ${language}
      )
      RETURNING id, user_id, mode, detected_gesture, translated_text,
                confidence_score, language, created_at
    `;

    return NextResponse.json({ data: rows[0] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    await sql`DELETE FROM translation_history WHERE user_id = ${session.userId}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to clear history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
