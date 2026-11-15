import type { Metadata } from "next";
import { Anton, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { ConfigBanner } from "@/components/layout/config-banner";
import { SumoAuthProvider } from "@/components/providers/privy-provider";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUMO — Heavyweight quests for old wallets",
  description:
    "Three tasks. One wallet. Zero mercy. SUMO opens for X logins with an EVM wallet older than 3 years. Connect X, prove the wallet, clear three lifts.",
  openGraph: {
    title: "SUMO — Heavyweight quests for old wallets",
    description:
      "Three tasks. One wallet. Zero mercy. The quest board that only opens for wallets older than 3 years.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SUMO — Heavyweight quests for old wallets",
    description: "Three tasks. One wallet. Zero mercy.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Public env var: safe to read on the server, inlined into the client bundle.
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  return (
    <html
      lang="en"
      className={`${anton.variable} ${grotesk.variable} ${jetbrains.variable}`}
    >
      <body className="bg-void font-body text-paper antialiased">
        <SumoAuthProvider appId={appId}>
          {!appId ? <ConfigBanner /> : null}
          {children}
        </SumoAuthProvider>
      </body>
    </html>
  );
}
