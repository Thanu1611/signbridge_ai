import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL in .env.local" },
      { status: 503 }
    );
  }

  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const sql = getDb();
    const passwordHash = await bcrypt.hash(password, 10);

    const rows = await sql`
      INSERT INTO users (email, password_hash, full_name, preferred_language)
      VALUES (${email.toLowerCase().trim()}, ${passwordHash}, ${fullName ?? null}, 'en')
      RETURNING id, email, full_name, preferred_language, created_at
    `;

    const user = rows[0];
    await createSession({ userId: user.id, email: user.email });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        preferred_language: user.preferred_language,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Signup failed";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
