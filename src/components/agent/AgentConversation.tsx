"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Mic, PhoneOff } from "lucide-react";
import { Conversation } from "@elevenlabs/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

type SessionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

type ConversationSession = Awaited<ReturnType<typeof Conversation.startSession>>;

export function AgentConversation() {
  const conversationRef = useRef<ConversationSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [mode, setMode] = useState<"speaking" | "listening" | "idle">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const endSession = useCallback(async () => {
    const session = conversationRef.current;
    conversationRef.current = null;
    if (session) {
      try {
        await session.endSession();
      } catch {
        /* session may already be closed */
      }
    }
    setStatus("disconnected");
    setMode("idle");
  }, []);

  const startSession = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        throw new Error(
          "Microphone access denied. Allow microphone permission to talk with the agent."
        );
      }

      const res = await fetch("/api/elevenlabs/signed-url");
      const data = (await res.json()) as { signedUrl?: string; error?: string };
      if (!res.ok || !data.signedUrl) {
        throw new Error(data.error ?? "Could not get agent session URL");
      }

      const session = await Conversation.startSession({
        signedUrl: data.signedUrl,
        connectionType: "websocket",
        onConnect: () => setStatus("connected"),
        onDisconnect: () => {
          setStatus("disconnected");
          setMode("idle");
          conversationRef.current = null;
        },
        onError: (message) => {
          setError(typeof message === "string" ? message : "Agent connection error");
          setStatus("error");
        },
        onModeChange: ({ mode: nextMode }) => setMode(nextMode),
        onMessage: ({ message, source }) => {
          if (source === "ai" && message) {
            setLastMessage(message);
          }
        },
      });

      conversationRef.current = session;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to start agent session";
      setError(msg);
      setStatus("error");
      conversationRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      void endSession();
    };
  }, [endSession]);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-2xl border border-brand-border/50 bg-surface p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              isConnected || isConnecting ? "bg-brand-cyan/20" : "bg-slate-100 dark:bg-slate-800"
            )}
          >
            <Bot
              className={cn(
                "h-7 w-7",
                isConnected || isConnecting ? "text-brand-cyan" : "text-slate-400"
              )}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              SignBridge AI Agent
            </h2>
            <p className="text-sm text-slate-500">
              {status === "idle" && "Ready to connect"}
              {status === "connecting" && "Connecting…"}
              {status === "connected" &&
                (mode === "speaking"
                  ? "Agent is speaking"
                  : mode === "listening"
                    ? "Listening — speak now"
                    : "Connected")}
              {status === "disconnected" && "Session ended"}
              {status === "error" && "Connection failed"}
            </p>
          </div>
        </div>

        {lastMessage && status === "connected" && (
          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {lastMessage}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {!isConnected ? (
            <button
              type="button"
              onClick={startSession}
              disabled={isConnecting}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-50"
            >
              {isConnecting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              {isConnecting ? "Connecting…" : "Start conversation"}
            </button>
          ) : (
            <button
              type="button"
              onClick={endSession}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
            >
              <PhoneOff className="h-4 w-4" />
              End conversation
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Uses ElevenLabs Conversational AI over a secure WebSocket. Your API key
        stays on the server; only a short-lived signed URL is used in the browser.
      </p>
    </div>
  );
}
