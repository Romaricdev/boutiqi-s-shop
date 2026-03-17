import { MessageSquareX, FileQuestion, TrendingDown, AlertCircle } from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";
import { SectionEyebrow, SectionSub, SectionTitle } from "./section-heading";

const problems = [
  {
    icon: MessageSquareX,
    title: "Commandes perdues",
    desc: "Les messages WhatsApp se perdent dans les groupes. Impossible de retrouver qui a commandé quoi.",
  },
  {
    icon: FileQuestion,
    title: "Suivi inexistant",
    desc: "Vos clients ne savent pas où en est leur commande. Vous recevez des dizaines de messages « C'est prêt ? ».",
  },
  {
    icon: TrendingDown,
    title: "Aucune visibilité",
    desc: "Impossible de savoir combien vous vendez, quels produits marchent, ou combien vous avez encaissé ce mois-ci.",
  },
  {
    icon: AlertCircle,
    title: "Gestion manuelle",
    desc: "Tout est dans votre tête ou sur un cahier. Risque d'erreurs, de doublons, d'oublis.",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal>
          <SectionEyebrow text="Le problème" />
        </ScrollReveal>
        <ScrollReveal>
          <SectionTitle>
            WhatsApp, c&apos;est <em className="text-brand-500">pratique</em>.
            <br />
            Mais <em className="text-accent-600">pas suffisant</em>.
          </SectionTitle>
        </ScrollReveal>
        <ScrollReveal>
          <SectionSub>
            Vous vendez déjà sur WhatsApp. Mais vous perdez du temps, de l&apos;argent, et des clients.
          </SectionSub>
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {problems.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group animate-slide-up rounded-xl border border-warm-200 bg-warm-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-200 hover:bg-white hover:shadow-lg"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="grid size-12 place-items-center rounded-xl bg-accent-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-500">
                    <Icon className="size-5 text-accent-600 transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <div className="mt-4 text-base font-bold text-warm-900">{p.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-warm-500">{p.desc}</div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-12">
          <div className="mx-auto max-w-2xl rounded-2xl border-2 border-brand-200 bg-brand-50 p-6 text-center">
            <div className="text-base font-semibold text-brand-700">
              Boutiki organise ce que vous faites déjà sur WhatsApp.
            </div>
            <div className="mt-2 text-sm text-warm-600">
              Sans changer vos habitudes. Sans formation. Sans app à installer.
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
