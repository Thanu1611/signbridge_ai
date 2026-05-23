"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Play, Volume2 } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function ElevenLabsPanel() {
  const router = useRouter();
  const { apiStatus, voiceType, language, showToast } = useApp();
  const [testing, setTesting] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setErrorDetail(null);
    try {
      const res = await fetch("/api/elevenlabs/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceType, language }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Test failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
      showToast("ElevenLabs connected — playing test audio", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Test failed";
      setErrorDetail(msg);
      showToast(msg, "error");
    } finally {
      setTesting(false);
    }
  };

  const openAgentSession = () => {
    router.push("/agent");
  };

  return (
    <div className="mt-4 space-y-3">
      {apiStatus.elevenlabs ? (
        <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <Volume2 className="h-4 w-4" />
          API key set — click <strong>Test TTS voice</strong> to verify permissions
        </p>
      ) : apiStatus.elevenlabsKeyMissing ? (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">Agent ID found — API key still required</p>
          <p className="mt-2 text-xs leading-relaxed">
            You added <code>ELEVENLABS_AGENT_ID</code>, but{" "}
            <code>ELEVENLABS_API_KEY</code> is missing from <code>.env.local</code>.
            The agent ID alone cannot connect — add your API key from{" "}
            <a
              href="https://elevenlabs.io/app/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              elevenlabs.io → API Keys
            </a>
            , then restart <code>npm run dev</code>.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">ElevenLabs not connected</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-xs">
            <li>
              Get an API key from{" "}
              <a
                href="https://elevenlabs.io/app/settings/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                elevenlabs.io → API Keys
              </a>
            </li>
            <li>
              Add to <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env.local</code>
              : <code className="block mt-1">ELEVENLABS_API_KEY=your_key</code>
            </li>
            <li>Optional: <code>ELEVENLABS_VOICE_ID</code> from Voice Library</li>
            <li>
              Enable permissions: <strong>Text to Speech</strong> (required) and{" "}
              <strong>Speech to Text</strong> (for Voice page)
            </li>
            <li>
              Copy the full key when created — it is only shown once. Do not use
              the Agent ID or voice ID as the API key.
            </li>
            <li>Restart <code>npm run dev</code></li>
          </ol>
        </div>
      )}

      <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <p className="font-medium text-slate-800 dark:text-slate-200">
          API key vs agent ID
        </p>
        <p className="mt-2 leading-relaxed">
          <strong>ELEVENLABS_API_KEY</strong> is required on the server for Speak buttons,
          transcription, and signing agent sessions. It must never be exposed in the browser.
        </p>
        <p className="mt-2 leading-relaxed">
          <strong>ELEVENLABS_AGENT_ID</strong> is optional — requires{" "}
          <strong>Conversational AI (convai_write)</strong> on your API key.
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-slate-500">
          <li>
            <strong>Text to Speech</strong> — Speak buttons (Translator, Emergency)
          </li>
          <li>
            <strong>Speech to Text</strong> — Voice-to-Text page
          </li>
          <li>
            <strong>Conversational AI</strong> — Open AI agent button only
          </li>
        </ul>
      </div>

      {apiStatus.elevenlabsAgent ? (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Bot className="h-4 w-4" />
            Agent ID configured
          </p>
          <p className="text-xs text-slate-500">
            Opening the agent needs <strong>convai_write</strong> on your API key. TTS and
            Voice pages work with different permissions.
          </p>
        </div>
      ) : apiStatus.elevenlabs ? (
        <p className="text-xs text-slate-500">
          Optional: add <code>ELEVENLABS_AGENT_ID</code> from{" "}
          <a
            href="https://elevenlabs.io/app/agents"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-cyan underline"
          >
            Agents dashboard
          </a>
        </p>
      ) : null}

      {apiStatus.elevenlabsError && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {apiStatus.elevenlabsError}
        </p>
      )}

      {errorDetail && (
        <p className="text-xs text-red-600 dark:text-red-400">{errorDetail}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={testConnection}
          disabled={testing || !apiStatus.elevenlabs}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-2.5 text-sm font-medium text-brand-blue transition hover:bg-brand-cyan/20 disabled:opacity-50 dark:text-brand-cyan"
        >
          {testing ? <LoadingSpinner size="sm" /> : <Play className="h-4 w-4" />}
          {testing ? "Generating…" : "Test TTS voice"}
        </button>

        {apiStatus.elevenlabsAgent && (
          <button
            type="button"
            onClick={openAgentSession}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-blue/30 bg-brand-blue/10 px-4 py-2.5 text-sm font-medium text-brand-blue transition hover:bg-brand-blue/20 dark:text-brand-cyan"
          >
            <Bot className="h-4 w-4" />
            Open AI agent
          </button>
        )}
      </div>
    </div>
  );
}
