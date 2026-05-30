import type { AppLanguage } from "@/types";
import type { SignDefinition, SignWordId } from "./types";

/**
 * Central sign vocabulary — add new signs here to extend recognition.
 * Rule-based and future ML/API providers read from this registry.
 */
export const SIGN_VOCABULARY: SignDefinition[] = [
  { id: "hello", labels: { en: "Hello", ta: "வணக்கம்" }, tags: ["greeting"] },
  { id: "hi", labels: { en: "Hi", ta: "வணக்கம்" }, tags: ["greeting"] },
  { id: "you", labels: { en: "You", ta: "நீங்கள்" }, tags: ["pronoun"] },
  { id: "how", labels: { en: "How", ta: "எப்படி" }, tags: ["question"] },
  { id: "i", labels: { en: "I", ta: "நான்" }, tags: ["pronoun"] },
  { id: "good", labels: { en: "Good", ta: "நல்ல" }, tags: ["adjective"] },
  { id: "yes", labels: { en: "Yes", ta: "ஆம்" }, tags: ["response"] },
  { id: "no", labels: { en: "No", ta: "இல்லை" }, tags: ["response"] },
  { id: "thank_you", labels: { en: "Thank you", ta: "நன்றி" }, tags: ["greeting"] },
  { id: "please", labels: { en: "Please", ta: "தயவு செய்து" }, tags: ["polite"] },
  { id: "help", labels: { en: "Help", ta: "உதவி" }, tags: ["emergency"] },
  { id: "stop", labels: { en: "Stop", ta: "நிறுத்து" }, tags: ["emergency"] },
  { id: "peace", labels: { en: "Peace", ta: "அமைதி" }, tags: ["greeting"] },
  { id: "welcome", labels: { en: "Welcome", ta: "வரவேற்கிறோம்" }, tags: ["greeting"] },
];

const vocabularyMap = new Map<SignWordId, SignDefinition>(
  SIGN_VOCABULARY.map((entry) => [entry.id, entry])
);

export function getSignDefinition(wordId: SignWordId): SignDefinition | undefined {
  return vocabularyMap.get(wordId);
}

export function getSignLabel(wordId: SignWordId, language: AppLanguage): string {
  return vocabularyMap.get(wordId)?.labels[language] ?? wordId.replace(/_/g, " ");
}

export function allSignLabels(language: AppLanguage): string[] {
  return SIGN_VOCABULARY.map((entry) => entry.labels[language]);
}

export function isKnownSignWord(wordId: string): wordId is SignWordId {
  return vocabularyMap.has(wordId);
}
