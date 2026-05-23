"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const AgentConversation = dynamic(
  () =>
    import("@/components/agent/AgentConversation").then(
      (m) => m.AgentConversation
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    ),
  }
);

export default function AgentPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/settings"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-cyan"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          AI Agent
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Voice conversation with your ElevenLabs agent. Allow microphone access
          when prompted.
        </p>
      </header>
      <AgentConversation />
    </div>
  );
}
