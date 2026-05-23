import { SettingsPanel } from "@/components/settings/SettingsPanel";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div>
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Theme, language, voice, API status, and profile.
        </p>
      </header>
      <SettingsPanel />
    </div>
  );
}
