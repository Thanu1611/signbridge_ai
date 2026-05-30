import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppProvider";
import { AppShell } from "@/components/layout/AppShell";
import { APP_NAME, TAGLINE } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: TAGLINE,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.ico",
  },
  keywords: [
    "sign language",
    "accessibility",
    "AI translation",
    "deaf communication",
    "Yarl Geek Challenge",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k="signbridge_light_default_v1",t=localStorage.getItem("signbridge_theme");if(!localStorage.getItem(k)){localStorage.setItem("signbridge_theme","light");localStorage.setItem(k,"1");t="light";}document.documentElement.classList.remove("dark");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){document.documentElement.classList.remove("dark");}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
