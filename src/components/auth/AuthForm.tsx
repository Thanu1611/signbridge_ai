"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { APP_NAME, LOGO_SRC } from "@/lib/constants";
import { LOGIN_REQUIRED_MESSAGE } from "@/lib/auth/access";
import { useApp } from "@/context/AppProvider";

function AuthFormInner({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, guestMode, setSessionUser } = useApp();
  const loginMessage = searchParams.get("message");
  const redirectFrom = searchParams.get("from");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body =
        mode === "signup"
          ? { email, password, fullName }
          : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Authentication failed");
      }

      setSessionUser(data.user);
      showToast(
        mode === "signup" ? "Account created! Welcome to SignBridge AI." : "Welcome back!",
        "success"
      );
      const destination =
        redirectFrom && redirectFrom.startsWith("/") && !redirectFrom.startsWith("/login")
          ? redirectFrom
          : "/translator";
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-50 via-background to-sky-100 px-4 dark:from-[#0a0a0a] dark:via-slate-950 dark:to-[#0a0a0a]">
      <div className="w-full max-w-md rounded-3xl border border-brand-border/50 bg-surface p-8 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src={LOGO_SRC}
            alt={`${APP_NAME} logo`}
            width={280}
            height={80}
            unoptimized
            className="h-auto w-full max-w-[280px] rounded-xl object-contain"
            priority
          />
          <p className="mt-4 text-slate-500">
            {mode === "login"
              ? "Sign in to unlock the full SignBridge AI experience"
              : "Create your account"}
          </p>
        </div>

        {mode === "login" && loginMessage && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {loginMessage === LOGIN_REQUIRED_MESSAGE
              ? loginMessage
              : decodeURIComponent(loginMessage)}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium text-slate-600">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <p className="text-slate-500">
            {mode === "login" ? (
              <>
                No account?{" "}
                <Link href="/signup" className="font-medium text-brand-cyan">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Have an account?{" "}
                <Link href="/login" className="font-medium text-brand-cyan">
                  Sign in
                </Link>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              guestMode();
              router.push("/translator");
            }}
            className="font-medium text-slate-600 hover:text-brand-cyan"
          >
            Try live sign translation as guest →
          </button>
          <Link href="/" className="block text-slate-400 hover:text-slate-600">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
        </div>
      }
    >
      <AuthFormInner mode={mode} />
    </Suspense>
  );
}
