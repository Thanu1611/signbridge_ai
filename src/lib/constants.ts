import type { AppLanguage, GestureKey } from "@/types";

export const APP_NAME = "SignBridge AI";
export const TAGLINE =
  "Not everyone speaks with voice — but everyone deserves to be heard.";
/** Logo asset path — update filename when replacing the image to bust cache */
export const LOGO_SRC = "/signbridge-logo.png";
export const PRIMARY_COLOR = "#00C2CB";
export const BRAND_BLUE = "#0047AB";
export const BRAND_CYAN = "#00C2CB";
export const BRAND_TEAL = "#26C299";

/** Supported now — Sinhala planned for a future release */
export const LANGUAGES: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
];

export const VOICE_OPTIONS = [
  { id: "default", label: "Warm & Clear (Default)" },
  { id: "calm", label: "Calm Narrator" },
  { id: "friendly", label: "Friendly Guide" },
];

export const GESTURE_TRANSLATIONS: Record<
  GestureKey,
  Record<AppLanguage, string>
> = {
  hello: {
    en: "Hello",
    ta: "வணக்கம்",
  },
  hi: {
    en: "Hi",
    ta: "வணக்கம்",
  },
  peace: {
    en: "Peace",
    ta: "அமைதி",
  },
  thank_you: {
    en: "Thank you",
    ta: "நன்றி",
  },
  yes: {
    en: "Yes",
    ta: "ஆம்",
  },
  no: {
    en: "No",
    ta: "இல்லை",
  },
  help: {
    en: "I need help",
    ta: "எனக்கு உதவி தேவை",
  },
  stop: {
    en: "Stop",
    ta: "நிறுத்து",
  },
  you: {
    en: "You",
    ta: "நீங்கள்",
  },
  how: {
    en: "How",
    ta: "எப்படி",
  },
  i: {
    en: "I",
    ta: "நான்",
  },
  good: {
    en: "Good",
    ta: "நல்ல",
  },
  please: {
    en: "Please",
    ta: "தயவு செய்து",
  },
  welcome: {
    en: "Welcome",
    ta: "வரவேற்கிறோம்",
  },
};

export const EMERGENCY_PHRASES = [
  { key: "need_help", en: "I need help", ta: "எனக்கு உதவி தேவை" },
  { key: "call_doctor", en: "Call a doctor", ta: "மருத்துவரை அழைக்கவும்" },
  { key: "lost", en: "I am lost", ta: "நான் வழி தவறிவிட்டேன்" },
  { key: "write_down", en: "Please write it down", ta: "தயவு செய்து எழுதுங்கள்" },
  { key: "cannot_hear", en: "I cannot hear", ta: "என்னால் கேட்க முடியாது" },
  { key: "call_family", en: "Call my family", ta: "என் குடும்பத்தை அழைக்கவும்" },
] as const;

/** @deprecated Use getNavItems() from lib/auth/access.ts */
export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/translator", label: "Translate", icon: "Camera" },
  { href: "/voice", label: "Voice", icon: "Mic" },
  { href: "/emergency", label: "Emergency", icon: "AlertTriangle" },
  { href: "/learn", label: "Learn", icon: "BookOpen" },
  { href: "/history", label: "History", icon: "History" },
  { href: "/about", label: "About", icon: "Info" },
] as const;

export const LESSONS = [
  {
    id: "basics",
    title: "Beginner Basics",
    description: "Start with greetings and simple responses.",
    signs: ["hello", "hi", "peace", "thank_you", "yes", "no"] as GestureKey[],
  },
  {
    id: "alphabet",
    title: "Alphabet Signs",
    description: "Learn A–Z finger spelling foundations.",
    signs: [] as GestureKey[],
  },
  {
    id: "daily",
    title: "Daily Phrases",
    description: "Common phrases for everyday communication.",
    signs: ["help", "stop", "yes"] as GestureKey[],
  },
];
