export type AppLanguage = "en" | "ta";

export type TranslationMode =
  | "sign_to_text"
  | "voice_to_text"
  | "emergency"
  | "learn";

export type GestureKey =
  | "hello"
  | "hi"
  | "peace"
  | "thank_you"
  | "yes"
  | "no"
  | "help"
  | "stop";

export interface GestureResult {
  gesture: GestureKey;
  translatedText: string;
  confidence: number;
}

export interface TranslationRecord {
  id: string;
  user_id: string | null;
  mode: TranslationMode;
  detected_gesture: string | null;
  translated_text: string;
  confidence_score: number | null;
  language: AppLanguage;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  preferred_language: AppLanguage;
  created_at: string;
}

export interface EmergencyPhrase {
  id: string;
  phrase_key: string;
  phrase_text: string;
  language: AppLanguage;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  preferred_language?: AppLanguage;
  created_at?: string;
}

export interface ApiStatus {
  database: boolean;
  elevenlabs: boolean;
  elevenlabsAgent?: boolean;
  elevenlabsKeyMissing?: boolean;
  elevenlabsError?: string;
}
