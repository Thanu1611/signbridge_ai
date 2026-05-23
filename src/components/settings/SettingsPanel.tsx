"use client";

import { useEffect } from "react";
import { CheckCircle, Moon, Sun, WifiOff } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { LANGUAGES, VOICE_OPTIONS } from "@/lib/constants";
import { ElevenLabsPanel } from "./ElevenLabsPanel";
import Link from "next/link";
import type { AppLanguage } from "@/types";

export function SettingsPanel() {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    voiceType,
    setVoiceType,
    user,
    isGuest,
    signOut,
    guestMode,
    apiStatus,
    refreshApiStatus,
    showToast,
  } = useApp();

  useEffect(() => {
    refreshApiStatus();
  }, [refreshApiStatus]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-2xl border border-brand-border/50 bg-surface p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h2>
        <button
          type="button"
          onClick={toggleTheme}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700"
        >
          <span className="flex items-center gap-2 font-medium">
            {theme === "light" ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-400" />
            )}
            {theme === "light" ? "Light mode" : "Dark mode"}
          </span>
          <span className="text-sm text-brand-cyan">Toggle</span>
        </button>
      </section>

      <section className="rounded-2xl border border-brand-border/50 bg-surface p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Language & Voice</h2>
        <label className="mt-4 block text-sm font-medium text-slate-600">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as AppLanguage)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          Sinhala support is planned for a future release.
        </p>

        <label className="mt-4 block text-sm font-medium text-slate-600">Voice type</label>
        <select
          value={voiceType}
          onChange={(e) => setVoiceType(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
        >
          {VOICE_OPTIONS.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-2xl border border-brand-border/50 bg-surface p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-bold">API connections</h2>
        <ul className="mt-4 space-y-3">
          <StatusRow label="Neon Database" connected={apiStatus.database} />
          <StatusRow label="ElevenLabs TTS" connected={apiStatus.elevenlabs} />
        </ul>
        <ElevenLabsPanel />
        <button
          type="button"
          onClick={() => {
            refreshApiStatus();
            showToast("Connection status refreshed", "info");
          }}
          className="mt-4 text-sm font-medium text-brand-cyan hover:underline"
        >
          Refresh status
        </button>
      </section>

      <section className="rounded-2xl border border-brand-border/50 bg-surface p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-bold">Profile</h2>
        {user && !isGuest ? (
          <div className="mt-4 space-y-3">
            <p className="text-slate-600">
              Signed in as <strong>{user.email}</strong>
            </p>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-slate-600">You are using guest mode. History is saved locally.</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
              >
                Sign in
              </Link>
              <button
                type="button"
                onClick={guestMode}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium"
              >
                Continue as guest
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusRow({ label, connected }: { label: string; connected: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
      <span className="font-medium">{label}</span>
      <span
        className={`flex items-center gap-1 text-sm ${connected ? "text-emerald-600" : "text-amber-600"}`}
      >
        {connected ? (
          <>
            <CheckCircle className="h-4 w-4" /> Connected
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" /> Not configured
          </>
        )}
      </span>
    </li>
  );
}
