import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Heart,
  Mic,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { APP_NAME, TAGLINE } from "@/lib/constants";

const features = [
  {
    icon: Camera,
    title: "Live Sign Translation",
    description:
      "MediaPipe hand tracking and AI gesture classification turn signs into readable text and speech.",
  },
  {
    icon: Mic,
    title: "Voice-to-Text",
    description:
      "Spoken words appear as large, clear text so deaf and hearing-impaired users can follow conversations.",
  },
  {
    icon: Shield,
    title: "Emergency Phrases",
    description:
      "One-tap critical messages with instant audio for hospitals, transit, and urgent situations.",
  },
  {
    icon: BookOpen,
    title: "Learn Sign Language",
    description:
      "Beginner lessons, alphabet practice, and camera-based feedback to build confidence.",
  },
];

export default function HomePage() {
  return (
    <div className="pb-8">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue/15 via-background to-brand-cyan/10 px-4 py-16 dark:from-brand-blue/20 dark:via-[#0a0a0a] dark:to-brand-cyan/10 md:py-24 lg:px-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center animate-fade-in-up">
          <Image
            src="/logo.png"
            alt={`${APP_NAME} logo`}
            width={280}
            height={120}
            className="mx-auto h-auto w-full max-w-xs object-contain md:max-w-sm"
            priority
          />
          
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-brand-gradient md:text-5xl">
            {APP_NAME}
          </h1>
          <p className="mt-4 text-lg font-medium text-brand-cyan md:text-xl">{TAGLINE}</p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg">
            Millions of people communicate through sign language, yet everyday spaces
            still rely on voice. SignBridge AI bridges that gap with real-time gesture
            recognition, text, and natural speech.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/translator"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand-cyan/25 transition hover:scale-[1.02] sm:w-auto"
            >
              Start Translation
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/learn"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand-cyan/40 bg-surface px-8 py-4 text-lg font-bold text-brand-blue transition hover:bg-cyan-50 sm:w-auto dark:bg-slate-900 dark:text-brand-cyan dark:hover:bg-slate-800"
            >
              <BookOpen className="h-5 w-5" />
              Learn Sign Language
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">The problem</h2>
        <p className="mt-4 text-slate-600 leading-relaxed dark:text-slate-300">
          Hearing-impaired and speech-impaired individuals often struggle in schools,
          clinics, shops, and public transport where staff expect spoken communication.
          Misunderstandings delay care, isolate learners, and limit independence.
        </p>
        <h2 className="mt-10 text-2xl font-bold text-slate-900 dark:text-white">Our solution</h2>
        <p className="mt-4 text-slate-600 leading-relaxed dark:text-slate-300">
          SignBridge AI uses your device camera and microphone — no expensive hardware —
          to translate signs and speech into text and voice output. History syncs for
          logged-in users; guest mode keeps demos fast at competitions.
        </p>
      </section>

      <section className="bg-gradient-to-b from-cyan-50/50 to-transparent px-4 py-12 dark:from-slate-900/50 md:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Features</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-brand-border/50 bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cyan/15 text-brand-cyan">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 text-center md:py-16">
        <div className="rounded-3xl bg-brand-gradient p-8 text-white shadow-xl shadow-brand-cyan/20 md:p-12">
          <Heart className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">Impact</h2>
          <p className="mx-auto mt-4 max-w-xl text-cyan-50">
            Inclusive classrooms, safer emergencies, empowered families, and more
            patient-friendly healthcare — one gesture at a time.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">Education</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Healthcare</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Public service</span>
            </div>
          </div>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-brand-blue shadow-md hover:bg-cyan-50"
          >
            Learn more about our impact
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
