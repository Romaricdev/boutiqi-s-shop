import { ScrollReveal } from "./scroll-reveal";
import { SectionEyebrow, SectionSub, SectionTitle } from "./section-heading";

const testimonials = [
  {
    text: "Avant je perdais des commandes dans mes groupes WhatsApp. Maintenant tout est organisé et je vois mon argent arriver directement sur mon téléphone.",
    name: "Mama Solange",
    role: "Boutique friperie — Akwa, Douala",
    initials: "MS",
    bg: "bg-brand-500",
  },
  {
    text: "Mes clients partagent mon lien entre eux. J'ai doublé mes ventes en deux mois sans dépenser un franc en publicité.",
    name: "Jean Kamga",
    role: "Restaurant Le Baobab — Bonapriso",
    initials: "JK",
    bg: "bg-accent-500",
  },
  {
    text: "La gestion du stock automatique m'a sauvée. Plus de ruptures surprises. Je reçois l'alerte avant même que le produit soit fini.",
    name: "Awa Fofana",
    role: "Cosmétiques & beauté — Yaoundé",
    initials: "AF",
    bg: "bg-[#1A5276]",
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal>
          <SectionEyebrow text="Témoignages" />
        </ScrollReveal>
        <ScrollReveal>
          <SectionTitle>
            Ils ont <em className="text-brand-500">adopté</em> Boutiki.
          </SectionTitle>
        </ScrollReveal>
        <ScrollReveal>
          <SectionSub>
            Des commerçants de Douala et Yaoundé partagent leur expérience.
          </SectionSub>
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="group rounded-[18px] border border-warm-200 bg-warm-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#95D5B2] hover:shadow-lg"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="flex gap-[3px] text-[14px] text-[#D4A017] transition-transform duration-300 group-hover:scale-110">★★★★★</div>

                <p className="mt-4 text-[15px] italic leading-[1.7] text-warm-700">
                  <span className="mr-0.5 align-[-8px] font-display text-[28px] not-italic leading-none text-[#95D5B2] transition-colors duration-300 group-hover:text-brand-400">
                    &ldquo;
                  </span>
                  {t.text}
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`grid size-10 place-items-center rounded-full text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110 ${t.bg}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-warm-900">{t.name}</div>
                    <div className="text-xs text-warm-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
