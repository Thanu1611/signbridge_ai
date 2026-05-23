export function parseElevenLabsError(status: number, body: string): string {
  try {
    const data = JSON.parse(body) as {
      detail?: { status?: string; message?: string } | string;
    };

    const detail = data.detail;
    const message =
      typeof detail === "object" && detail?.message
        ? detail.message
        : typeof detail === "string"
          ? detail
          : "";
    const statusCode =
      typeof detail === "object" && detail?.status ? detail.status : "";

    if (status === 401) {
      if (
        statusCode === "missing_permissions" ||
        message.includes("missing_permissions") ||
        message.includes("missing the permission")
      ) {
        if (message.includes("user_read")) {
          return "API key needs User Read permission (not required for this app — use Test TTS instead).";
        }
        if (message.includes("convai_write") || message.includes("convai")) {
          return "Enable Conversational AI (convai_write) on your API key in ElevenLabs → API Keys → Edit.";
        }
        if (message.includes("text_to_speech") || message.includes("tts")) {
          return "Enable Text to Speech on your API key in ElevenLabs → API Keys → Edit.";
        }
        if (message.includes("speech_to_text") || message.includes("stt")) {
          return "Enable Speech to Text on your API key for the Voice page.";
        }
        return message || "API key is missing a required permission.";
      }

      if (
        statusCode === "invalid_api_key" ||
        message.toLowerCase().includes("invalid api key")
      ) {
        return "Invalid API key. Copy a new key from elevenlabs.io → API Keys, paste into ELEVENLABS_API_KEY in .env.local, restart npm run dev.";
      }

      return (
        message ||
        "Unauthorized (401). Regenerate your API key and enable Text to Speech + Speech to Text permissions."
      );
    }

    return message || statusCode || `ElevenLabs error (${status})`;
  } catch {
    return body.length > 200 ? `ElevenLabs error (${status})` : body;
  }
}
