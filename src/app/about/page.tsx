import {
  GraduationCap,
  HeartPulse,
  Landmark,
  Lightbulb,
  Rocket,
  Users,
} from "lucide-react";

const useCases = [
  {
    icon: GraduationCap,
    title: "Education",
    text: "Teachers and peers understand sign gestures in classrooms without dedicated interpreters on site.",
  },
  {
    icon: HeartPulse,
    title: "Healthcare",
    text: "Patients communicate symptoms quickly in clinics and waiting rooms using emergency phrases and live translation.",
  },
  {
    icon: Landmark,
    title: "Public service",
    text: "Transport, banks, and government counters become more inclusive with voice-to-text and sign-to-speech tools.",
  },
  {
    icon: Users,
    title: "Inclusion & families",
    text: "Families bridge communication gaps at home while learners build sign vocabulary through guided lessons.",
  },
];

const future = [
  "Sinhala language support (UI, phrases, gestures, and voice)",
  "Custom TensorFlow.js models trained on Sri Lankan sign datasets",
  "Offline mode for low-connectivity regions",
  "Wearable camera integration",
  "Two-way conversation mode with hearing users",
  "Community phrase packs and institutional dashboards",
];

export const metadata = {
  title: "About & Impact",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          About & Impact
        </h1>
        <p className="mt-2 text-lg text-brand-cyan">
          Not everyone speaks with voice — but everyone deserves to be heard.
        </p>
      </header>

      <section className="rounded-2xl border border-brand-border/50 bg-surface p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
        <h2 className="text-xl font-bold">The real-world problem</h2>
        <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
          Communication barriers affect education outcomes, healthcare safety, and
          daily independence for deaf and hard-of-hearing communities. Many public
          spaces lack sign interpreters, and generic voice assistants rarely understand
          sign input.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-border/50 bg-surface p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
        <h2 className="text-xl font-bold">How SignBridge AI helps</h2>
        <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
          SignBridge AI combines browser-based camera access, MediaPipe hand tracking,
          modular gesture classification, multilingual text output, and ElevenLabs
          speech synthesis — all in a mobile-friendly web app built for the Yarl Geek
          Challenge Junior.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-6">Use cases</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {useCases.map((u) => (
            <div
              key={u.title}
              className="rounded-2xl border border-brand-border/50 bg-surface p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <u.icon className="h-8 w-8 text-brand-cyan" />
              <h3 className="mt-3 font-bold">{u.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{u.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-gradient-to-r from-brand-blue/15 to-cyan-100/50 p-6 dark:from-brand-blue/10 dark:to-slate-900 md:p-8">
        <div className="flex items-center gap-3">
          <Rocket className="h-8 w-8 text-brand-cyan" />
          <h2 className="text-xl font-bold">Future enhancements</h2>
        </div>
        <ul className="mt-4 space-y-2">
          {future.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-slate-600 dark:text-slate-300"
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
