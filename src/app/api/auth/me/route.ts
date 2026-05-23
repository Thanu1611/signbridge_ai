import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ user: null });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, email, full_name, preferred_language, created_at
      FROM users
      WHERE id = ${session.userId}
      LIMIT 1
    `;

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
