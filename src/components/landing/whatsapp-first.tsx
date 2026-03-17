import { MessageCircle, Share2, Link as LinkIcon, Smartphone } from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";

const points = [
  {
    icon: Share2,
    title: "Partagez en 1 clic",
    desc: "Copiez votre lien boutique et partagez-le sur vos statuts, groupes et discussions WhatsApp.",
  },
  {
    icon: MessageCircle,
    title: "Messages pré-remplis",
    desc: "Contactez vos clients directement depuis le dashboard avec des messages automatiquement remplis.",
  },
  {
    icon: LinkIcon,
    title: "Lien de suivi automatique",
    desc: "Chaque client reçoit un lien de suivi unique à partager ou consulter à tout moment.",
  },
  {
    icon: Smartphone,
    title: "Aucune app requise",
    desc: "Tout fonctionne dans le navigateur. Vos clients n'ont rien à installer.",
  },
];

export function WhatsAppFirst() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#25D366]/5 via-warm-50 to-brand-50/30 py-24 lg:py-32">
      <div className="pointer-events-none absolute -right-40 top-20 size-[500px] rounded-full bg-[#25D366]/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-20 size-[400px] rounded-full bg-brand-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-2.5">
            <span className="h-px w-10 bg-[#25D366]/30" />
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#25D366]">
              WhatsApp First
            </span>
            <span className="h-px w-10 bg-[#25D366]/30" />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="mt-4 text-center font-display text-[clamp(32px,4vw,48px)] leading-[1.12] tracking-tight text-warm-900">
            Conçu pour <em className="text-[#25D366]">WhatsApp</em>.
            <br />
            Pas <em className="text-warm-500">contre</em> WhatsApp.
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <p className="mx-auto mt-4 max-w-[580px] text-center text-base leading-relaxed text-warm-500">
            Vos clients utilisent déjà WhatsApp. Boutiki s&apos;intègre naturellement dans leur
            parcours, sans friction.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {points.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group animate-scale-in rounded-2xl border border-warm-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#25D366]/30 hover:shadow-xl"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="grid size-14 place-items-center rounded-xl bg-[#25D366]/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#25D366]">
                    <Icon className="size-6 text-[#25D366] transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <div className="mt-4 text-base font-bold text-warm-900">{p.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-warm-500">{p.desc}</div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-12">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[#25D366]/20 bg-white shadow-lg">
            <div className="flex items-center gap-3 border-b border-warm-200 bg-[#25D366]/5 px-5 py-4">
              <div className="grid size-10 place-items-center rounded-full bg-[#25D366]">
                <MessageCircle className="size-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-warm-900">Exemple de message pré-rempli</div>
                <div className="text-xs text-warm-500">Envoyé automatiquement au client</div>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div className="animate-fade-up rounded-lg bg-warm-50 p-4 text-sm leading-relaxed text-warm-700" style={{ animationDelay: "0.2s" }}>
                Bonjour Marie 👋
              </div>
              <div className="animate-fade-up rounded-lg bg-warm-50 p-4 text-sm leading-relaxed text-warm-700" style={{ animationDelay: "0.35s" }}>
                Votre commande <strong>#047</strong> (2 articles, 22 500 FCFA) est bien confirmée !
              </div>
              <div className="animate-fade-up rounded-lg bg-warm-50 p-4 text-sm leading-relaxed text-warm-700" style={{ animationDelay: "0.5s" }}>
                Livraison prévue demain à Akwa.
                <br />
                Suivez votre commande ici : boutiki.cm/track/abc123
              </div>
              <div className="animate-fade-up text-center text-xs text-warm-400" style={{ animationDelay: "0.65s" }}>
                Un clic pour envoyer depuis votre dashboard
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
