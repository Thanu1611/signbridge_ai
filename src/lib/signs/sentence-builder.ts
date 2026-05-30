import type { AppLanguage } from "@/types";
import { getSignLabel } from "./vocabulary";
import type { CommittedSignWord } from "./types";

type SentencePattern = {
  wordIds: string[];
  en: string;
  ta: string;
};

/** Ordered patterns — first match wins for natural sentence conversion */
const SENTENCE_PATTERNS: SentencePattern[] = [
  { wordIds: ["hello", "you", "how"], en: "Hello, how are you?", ta: "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?" },
  { wordIds: ["hi", "you", "how"], en: "Hi, how are you?", ta: "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?" },
  { wordIds: ["hello", "how", "you"], en: "Hello, how are you?", ta: "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?" },
  { wordIds: ["hello", "you"], en: "Hello to you.", ta: "உங்களுக்கு வணக்கம்." },
  { wordIds: ["i", "need", "help"], en: "I need help.", ta: "எனக்கு உதவி தேவை." },
  { wordIds: ["help", "please"], en: "Help, please.", ta: "தயவு செய்து உதவுங்கள்." },
  { wordIds: ["thank_you", "you"], en: "Thank you.", ta: "நன்றி." },
  { wordIds: ["good", "you"], en: "You are good.", ta: "நீங்கள் நல்லவர்." },
  { wordIds: ["welcome"], en: "Welcome.", ta: "வரவேற்கிறோம்." },
  { wordIds: ["thank_you"], en: "Thank you.", ta: "நன்றி." },
  { wordIds: ["hello"], en: "Hello.", ta: "வணக்கம்." },
  { wordIds: ["hi"], en: "Hi.", ta: "வணக்கம்." },
  { wordIds: ["help"], en: "I need help.", ta: "எனக்கு உதவி தேவை." },
  { wordIds: ["stop"], en: "Stop.", ta: "நிறுத்து." },
  { wordIds: ["yes"], en: "Yes.", ta: "ஆம்." },
  { wordIds: ["no"], en: "No.", ta: "இல்லை." },
];

function normalizeWordIds(words: CommittedSignWord[]): string[] {
  return words.map((word) => word.wordId.toLowerCase());
}

function matchesPattern(wordIds: string[], pattern: string[]): boolean {
  if (wordIds.length < pattern.length) return false;
  const slice = wordIds.slice(-pattern.length);
  return slice.every((id, index) => id === pattern[index]);
}

function fallbackSentence(words: CommittedSignWord[], language: AppLanguage): string {
  if (words.length === 0) return "";

  const text = words
    .map((word) => getSignLabel(word.wordId, language))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

/** Convert raw committed sign words into a natural spoken sentence */
export function buildNaturalSentence(
  words: CommittedSignWord[],
  language: AppLanguage
): string {
  if (words.length === 0) return "";

  const wordIds = normalizeWordIds(words);

  for (const pattern of SENTENCE_PATTERNS) {
    if (matchesPattern(wordIds, pattern.wordIds)) {
      return language === "ta" ? pattern.ta : pattern.en;
    }
  }

  return fallbackSentence(words, language);
}

export function buildRawSentence(words: CommittedSignWord[]): string {
  return words.map((word) => word.detectedWord).join(" ");
}
