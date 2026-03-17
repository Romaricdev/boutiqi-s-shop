import { ArrowRight } from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";
import { SectionEyebrow, SectionSub, SectionTitle } from "./section-heading";

const steps = [
  {
    num: "01",
    title: "Créez votre catalogue",
    desc: "Ajoutez vos produits avec photo, prix et description depuis votre téléphone. 5 minutes pour tout configurer.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Partagez votre lien",
    desc: "Un lien unique pour votre boutique. Partagez-le sur votre statut WhatsApp et vos groupes. Vos clients commandent directement.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Suivez vos commandes",
    desc: "Recevez les commandes en temps réel dans votre dashboard. Changez les statuts, contactez vos clients sur WhatsApp.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative bg-white py-24 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-warm-200" />

      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal>
          <SectionEyebrow text="Comment ça marche" />
        </ScrollReveal>
        <ScrollReveal>
          <SectionTitle>
            Trois étapes.
            <br />
            <em className="text-brand-500">C&apos;est tout.</em>
          </SectionTitle>
        </ScrollReveal>
        <ScrollReveal>
          <SectionSub>
            Pas de formation, pas de technicien. Si vous avez WhatsApp, vous avez
            Boutiki.
          </SectionSub>
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <div className="grid gap-px overflow-hidden rounded-xl bg-warm-200 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="group relative bg-white px-8 py-10 transition-all duration-300 hover:bg-warm-50 md:px-9"
              >
                <div className="font-display text-[56px] leading-none tracking-[-2px] text-[#D8F3DC] transition-colors duration-300 group-hover:text-brand-200">
                  {s.num}
                </div>
                <div className="mb-5 mt-5 grid size-12 place-items-center rounded-xl bg-brand-50 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500">
                  <div className="transition-all duration-300 [&_svg]:group-hover:stroke-white">
                    {s.icon}
                  </div>
                </div>
                <div className="text-lg font-bold tracking-[-0.3px] text-warm-900">
                  {s.title}
                </div>
                <div className="mt-2.5 text-sm leading-relaxed text-warm-500">
                  {s.desc}
                </div>
                <div className="absolute bottom-5 right-5 grid size-8 place-items-center rounded-full bg-brand-50 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500">
                  <ArrowRight className="size-3.5 text-brand-500 transition-colors duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
