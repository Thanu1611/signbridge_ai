-- SignBridge AI — Neon Postgres schema
-- Run in Neon SQL Editor: https://console.neon.tech

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (auth + profile)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Translation history
CREATE TABLE IF NOT EXISTS translation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('sign_to_text', 'voice_to_text', 'emergency', 'learn')),
  detected_gesture TEXT,
  translated_text TEXT NOT NULL,
  confidence_score REAL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ta')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_translation_history_user_id
  ON translation_history(user_id);

CREATE INDEX IF NOT EXISTS idx_translation_history_created_at
  ON translation_history(created_at DESC);

-- Emergency phrases (optional DB-backed phrases; app also ships static copy)
CREATE TABLE IF NOT EXISTS emergency_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase_key TEXT NOT NULL,
  phrase_text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ta')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (phrase_key, language)
);

INSERT INTO emergency_phrases (phrase_key, phrase_text, language) VALUES
  ('need_help', 'I need help', 'en'),
  ('call_doctor', 'Call a doctor', 'en'),
  ('lost', 'I am lost', 'en'),
  ('write_down', 'Please write it down', 'en'),
  ('cannot_hear', 'I cannot hear', 'en'),
  ('call_family', 'Call my family', 'en')
ON CONFLICT DO NOTHING;
