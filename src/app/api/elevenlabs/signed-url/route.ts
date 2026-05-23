import { NextResponse } from "next/server";
import { getAgentSignedUrl } from "@/lib/elevenlabs/agent";
import { isAgentConfigured } from "@/lib/elevenlabs/config";

export async function GET() {
  if (!isAgentConfigured()) {
    return NextResponse.json(
      {
        error:
          "Agent not configured. Set both ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in .env.local",
      },
      { status: 503 }
    );
  }

  try {
    const signedUrl = await getAgentSignedUrl();
    return NextResponse.json({ signedUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to get agent session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
