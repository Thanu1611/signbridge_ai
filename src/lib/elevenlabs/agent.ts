import { getAgentId, getApiKey } from "./config";
import { parseElevenLabsError } from "./errors";

/**
 * Get a short-lived signed URL to start a Conversational AI session.
 * Requires ELEVENLABS_API_KEY (server-side) + ELEVENLABS_AGENT_ID.
 * The API key cannot be replaced by agent_id alone — ElevenLabs always
 * authenticates server requests with xi-api-key.
 */
export async function getAgentSignedUrl(): Promise<string> {
  const apiKey = getApiKey();
  const agentId = getAgentId();

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is required (even when using an agent)");
  }
  if (!agentId) {
    throw new Error("ELEVENLABS_AGENT_ID is not configured");
  }

  const params = new URLSearchParams({ agent_id: agentId });
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?${params}`,
    {
      headers: { "xi-api-key": apiKey },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(parseElevenLabsError(response.status, errText));
  }

  const data = (await response.json()) as { signed_url?: string };
  if (!data.signed_url) {
    throw new Error("No signed URL returned from ElevenLabs");
  }

  return data.signed_url;
}
