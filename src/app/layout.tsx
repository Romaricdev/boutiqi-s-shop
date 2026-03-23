import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";

import "@/styles/globals.css";

/** Google Sans Flex : pas dans `next/font` (Next 14) — chargement via Google Fonts (aucun paquet npm). */
const googleSansFlexHref =
  "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@8..144,100..900&display=swap";

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
    <html lang="fr" className={fontDisplay.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleSansFlexHref} rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
