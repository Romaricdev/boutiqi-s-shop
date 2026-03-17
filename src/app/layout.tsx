import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";

import "@/styles/globals.css";

const fontBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fontDisplay = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boutiki — Commerce simplifié",
  description:
    "Créez votre boutique en ligne, partagez un lien sur WhatsApp et recevez des commandes. SaaS pour commerçants camerounais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fontBody.variable} ${fontDisplay.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
