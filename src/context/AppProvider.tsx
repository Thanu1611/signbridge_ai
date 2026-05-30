"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AppLanguage, ApiStatus, AuthUser } from "@/types";

function normalizeLanguage(value: string | null): AppLanguage {
  if (value === "ta") return "ta";
  return "en";
}

interface AppContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  voiceType: string;
  setVoiceType: (v: string) => void;
  user: AuthUser | null;
  isGuest: boolean;
  guestMode: () => void;
  signOut: () => Promise<void>;
  setSessionUser: (user: AuthUser | null) => void;
  apiStatus: ApiStatus;
  refreshApiStatus: () => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  clearToast: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const LANG_KEY = "signbridge_language";
const THEME_KEY = "signbridge_theme";
const THEME_LIGHT_DEFAULT_KEY = "signbridge_light_default_v1";
const VOICE_KEY = "signbridge_voice";
const GUEST_KEY = "signbridge_guest";

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [voiceType, setVoiceType] = useState("default");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    database: false,
    elevenlabs: false,
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    const savedVoice = localStorage.getItem(VOICE_KEY);
    const guest = localStorage.getItem(GUEST_KEY) === "true";

    queueMicrotask(() => {
      if (savedLang) {
        const lang = normalizeLanguage(savedLang);
        setLanguageState(lang);
        if (savedLang !== lang) localStorage.setItem(LANG_KEY, lang);
      }

      // One-time switch to light theme as the app default
      if (!localStorage.getItem(THEME_LIGHT_DEFAULT_KEY)) {
        localStorage.setItem(THEME_KEY, "light");
        localStorage.setItem(THEME_LIGHT_DEFAULT_KEY, "1");
      }

      const themePref = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
      const activeTheme = themePref === "dark" ? "dark" : "light";
      setTheme(activeTheme);
      document.documentElement.classList.remove("dark");
      if (activeTheme === "dark") document.documentElement.classList.add("dark");

      if (savedVoice) setVoiceType(savedVoice);
      setIsGuest(guest);
    });
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then(({ user: sessionUser }) => {
        if (sessionUser) {
          setUser(sessionUser);
          setIsGuest(false);
          localStorage.removeItem(GUEST_KEY);
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.classList.remove("dark");
      if (next === "dark") document.documentElement.classList.add("dark");
      return next;
    });
  }, []);

  const setVoiceTypeHandler = useCallback((v: string) => {
    setVoiceType(v);
    localStorage.setItem(VOICE_KEY, v);
  }, []);

  const guestMode = useCallback(() => {
    setIsGuest(true);
    setUser(null);
    localStorage.setItem(GUEST_KEY, "true");
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(
      () => {}
    );
  }, []);

  const setSessionUser = useCallback((sessionUser: AuthUser | null) => {
    setUser(sessionUser);
    setIsGuest(!sessionUser);
    if (sessionUser) localStorage.removeItem(GUEST_KEY);
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setIsGuest(true);
    localStorage.setItem(GUEST_KEY, "true");
  }, []);

  const refreshApiStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setApiStatus({
        database: Boolean(data.database),
        elevenlabs: Boolean(data.elevenlabs),
        elevenlabsAgent: Boolean(data.elevenlabsAgent),
        elevenlabsKeyMissing: Boolean(data.elevenlabsKeyMissing),
        elevenlabsError: data.elevenlabsError,
      });
    } catch {
      setApiStatus({ database: false, elevenlabs: false });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshApiStatus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshApiStatus]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  const clearToast = useCallback(() => setToast(null), []);

  const value: AppContextValue = {
    language,
    setLanguage,
    theme,
    toggleTheme,
    voiceType,
    setVoiceType: setVoiceTypeHandler,
    user,
    isGuest,
    guestMode,
    signOut,
    setSessionUser,
    apiStatus,
    refreshApiStatus,
    showToast,
    toast,
    clearToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
