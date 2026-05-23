"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Mic, MicOff, Save } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { saveTranslation } from "@/lib/history";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type InputMode = "browser" | "elevenlabs" | "none";

function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognition)
  | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export default function VoicePage() {
  const { language, user, isGuest, showToast } = useApp();
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("none");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        const hasBrowser = Boolean(getSpeechRecognitionConstructor());
        const hasElevenLabs = Boolean(data.elevenlabs);
        if (hasBrowser) setInputMode("browser");
        else if (hasElevenLabs) setInputMode("elevenlabs");
        else setInputMode("none");
      })
      .catch(() => {
        setInputMode(getSpeechRecognitionConstructor() ? "browser" : "none");
      });
  }, []);

  const stopMediaStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const transcribeWithElevenLabs = useCallback(
    async (blob: Blob) => {
      setTranscribing(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", blob, "recording.webm");
        formData.append("language", language);

        const res = await fetch("/api/stt", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Transcription failed");
        }

        setText((prev) =>
          prev ? `${prev} ${data.text}`.trim() : (data.text as string)
        );
        setInterim("");
        showToast("Speech transcribed", "success");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Transcription failed";
        setError(msg);
      } finally {
        setTranscribing(false);
      }
    },
    [language, showToast]
  );

  const stopElevenLabsRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setListening(false);
      return;
    }

    setListening(false);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    stopMediaStream();
    mediaRecorderRef.current = null;

    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];

    if (blob.size < 1000) {
      setError("Recording too short. Speak for at least 1–2 seconds.");
      return;
    }

    await transcribeWithElevenLabs(blob);
  }, [stopMediaStream, transcribeWithElevenLabs]);

  const startElevenLabsRecording = useCallback(async () => {
    setError(null);
    setInterim("Recording… tap again when finished speaking");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setListening(true);
    } catch (e) {
      const msg =
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access."
          : e instanceof Error
            ? e.message
            : "Could not access microphone";
      setError(msg);
      setListening(false);
    }
  }, []);

  const startBrowserListening = useCallback(() => {
    setError(null);
    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setError("Browser speech recognition unavailable.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "ta" ? "ta-IN" : "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let partial = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else partial += transcript;
      }
      if (final) setText((prev) => (prev ? `${prev} ${final}` : final).trim());
      setInterim(partial);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed") {
        setError("Microphone permission denied. Please allow microphone access.");
      } else if (e.error === "network") {
        setError("Network error. Switching may require ElevenLabs in Settings.");
      } else {
        setError(`Speech error: ${e.error}`);
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [language]);

  const stopBrowserListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setInterim("");
  };

  const startListening = () => {
    if (inputMode === "elevenlabs") {
      void startElevenLabsRecording();
    } else if (inputMode === "browser") {
      startBrowserListening();
    } else {
      setError(
        "Voice input unavailable. Add ELEVENLABS_API_KEY to .env.local (Settings → API) or use Chrome/Edge."
      );
    }
  };

  const stopListening = () => {
    if (inputMode === "elevenlabs") {
      void stopElevenLabsRecording();
    } else {
      stopBrowserListening();
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      stopMediaStream();
    };
  }, [stopMediaStream]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await saveTranslation({
        mode: "voice_to_text",
        translatedText: text,
        language,
        userId: user?.id ?? null,
      });
      showToast(isGuest ? "Saved locally" : "Conversation saved", "success");
    } catch {
      showToast("Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  const modeHint =
    inputMode === "browser"
      ? "Live captions via your browser"
      : inputMode === "elevenlabs"
        ? "Record speech → transcribed with ElevenLabs"
        : "Configure ElevenLabs or use Chrome/Edge";

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Voice-to-Text
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Spoken words appear as large, readable text for deaf and hearing-impaired users.
        </p>
        <p className="mt-1 text-xs text-brand-cyan">{modeHint}</p>
      </header>

      <div className="rounded-3xl border border-brand-border/50 bg-surface p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:p-10">
        <div className="min-h-[200px] rounded-2xl bg-slate-50 p-6 dark:bg-slate-800">
          <p className="text-3xl font-semibold leading-relaxed text-slate-900 dark:text-white md:text-4xl">
            {text || interim || (
              <span className="text-slate-400">
                {inputMode === "elevenlabs"
                  ? "Tap mic to record, tap again to transcribe…"
                  : "Tap the microphone to start…"}
              </span>
            )}
          </p>
          {interim && (listening || transcribing) && (
            <p className="mt-4 text-xl text-slate-400 italic">{interim}</p>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {listening || transcribing ? (
            <button
              type="button"
              onClick={stopListening}
              disabled={transcribing}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-lg animate-pulse-soft disabled:opacity-50"
              aria-label="Stop"
            >
              <MicOff className="h-10 w-10" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startListening}
              disabled={inputMode === "none"}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan text-white shadow-lg transition hover:scale-105 disabled:opacity-50"
              aria-label="Start microphone"
            >
              <Mic className="h-10 w-10" />
            </button>
          )}
          {(listening || transcribing) && (
            <div className="flex items-center gap-2 text-sm text-brand-cyan">
              <LoadingSpinner size="sm" />
              {transcribing ? "Transcribing…" : "Listening…"}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setText("");
              setInterim("");
              setError(null);
            }}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
          >
            <Eraser className="h-4 w-4" />
            Clear
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim() || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save to history
          </button>
        </div>
      </div>
    </div>
  );
}
