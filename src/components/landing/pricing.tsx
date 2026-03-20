import { Check, X as XIcon } from "lucide-react";
import Link from "next/link";

import { ScrollReveal } from "./scroll-reveal";
import { SectionEyebrow, SectionSub, SectionTitle } from "./section-heading";

type Feature = { text: string; available: boolean };

const plans: {
  name: string;
  price: string;
  unit: string;
  featured: boolean;
  features: Feature[];
  cta: string;
  available: boolean;
}[] = [
  {
    name: "Pilote",
    price: "0",
    unit: "Gratuit — accès complet pendant la phase test",
    featured: true,
    available: true,
    features: [
      { text: "Catalogue produits illimité", available: true },
      { text: "Commandes illimitées", available: true },
      { text: "Page boutique publique", available: true },
      { text: "Dashboard & notifications temps réel", available: true },
      { text: "Suivi commande client", available: true },
      { text: "Intégration WhatsApp", available: true },
    ],
    cta: "Rejoindre le pilote",
  },
  {
    name: "Pro",
    price: "5 000",
    unit: "FCFA / mois — bientôt disponible",
    featured: false,
    available: false,
    features: [
      { text: "Tout le plan Pilote", available: true },
      { text: "Paiement Mobile Money intégré", available: true },
      { text: "Gestion de stock automatique", available: true },
      { text: "Statistiques de ventes avancées", available: true },
      { text: "Commission 1.5% / transaction", available: true },
    ],
    cta: "Bientôt disponible",
  },
  {
    name: "Business",
    price: "15 000",
    unit: "FCFA / mois — bientôt disponible",
    featured: false,
    available: false,
    features: [
      { text: "Tout le plan Pro", available: true },
      { text: "3 boutiques simultanées", available: true },
      { text: "Livreurs assignés", available: true },
      { text: "Rapports avancés & export", available: true },
      { text: "Commission réduite 1%", available: true },
    ],
    cta: "Bientôt disponible",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-warm-900 py-24 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-[-200px] size-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.25)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2.5">
            <span className="h-px w-10 bg-brand-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#52B788]">
              Tarifs
            </span>
            <span className="h-px w-10 bg-brand-500" />
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 className="mt-4 text-center font-display text-[clamp(32px,4vw,48px)] leading-[1.12] tracking-tight text-warm-50">
            Simple et <em className="text-brand-500">transparent.</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <p className="mx-auto mt-4 max-w-[480px] text-center text-base leading-relaxed text-warm-500">
            Commencez gratuitement. Passez au Pro quand vous êtes prêt.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((p, i) => (
              <div
                key={p.name}
                className={`relative rounded-xl border p-8 transition-all duration-300 ${
                  p.featured
                    ? "scale-105 border-brand-400 bg-brand-500 shadow-xl"
                    : p.available
                      ? "border-white/[0.12] bg-white/[0.05] hover:-translate-y-1 hover:border-white/25"
                      : "border-white/[0.08] bg-white/[0.03] opacity-60"
                }`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#D4A017] px-3.5 py-1 text-[11px] font-bold text-warm-900">
                    Accès immédiat
                  </div>
                )}

                {!p.available && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-warm-500 px-3.5 py-1 text-[11px] font-bold text-warm-50">
                    Bientôt
                  </div>
                )}

                <div
                  className={`text-[13px] font-semibold uppercase tracking-[0.08em] ${
                    p.featured ? "text-[#D8F3DC]" : "text-warm-500"
                  }`}
                >
                  {p.name}
                </div>

                <div
                  className={`mt-5 font-display text-[42px] leading-none tracking-[-1.5px] ${
                    p.featured ? "text-white" : "text-warm-50"
                  }`}
                >
                  {p.price}
                </div>
                <div
                  className={`mt-1 text-[13px] ${
                    p.featured ? "text-white/70" : "text-warm-500"
                  }`}
                >
                  {p.unit}
                </div>

                <ul className="mt-7 flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-start gap-2.5 text-[13px] leading-snug ${
                        p.featured ? "text-[#D8F3DC]" : "text-warm-300"
                      }`}
                    >
                      <div
                        className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] ${
                          p.featured
                            ? "bg-white/15"
                            : "bg-[rgba(95,213,178,0.15)]"
                        }`}
                      >
                        {f.available ? (
                          <Check
                            className="size-2.5"
                            strokeWidth={3}
                            color={p.featured ? "white" : "#52B788"}
                          />
                        ) : (
                          <XIcon className="size-2.5" strokeWidth={3} color="#555" />
                        )}
                      </div>
                      {f.text}
                    </li>
                  ))}
                </ul>

                {p.available ? (
                  <Link
                    href="/onboarding"
                    className={`mt-7 block w-full rounded-[10px] py-3 text-center text-sm font-semibold transition ${
                      p.featured
                        ? "bg-white text-brand-500 hover:bg-[#D8F3DC]"
                        : "border border-white/20 text-warm-300 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {p.cta}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="mt-7 block w-full cursor-not-allowed rounded-[10px] border border-white/10 py-3 text-center text-sm font-semibold text-warm-500"
                  >
                    {p.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
