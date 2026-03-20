import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";

export function CtaSection() {
  return (
    <section className="bg-warm-50 px-4 py-24 lg:py-32">
      <ScrollReveal className="mx-auto max-w-[600px]">
        <div className="relative overflow-hidden rounded-[28px] bg-brand-700 px-8 py-16 text-center sm:px-12">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-[rgba(82,183,136,0.15)]" />
          <div className="pointer-events-none absolute -bottom-[60px] -left-[60px] size-[180px] rounded-full bg-[rgba(192,113,74,0.12)]" />

          <h2 className="relative font-display text-[clamp(32px,5vw,42px)] leading-[1.1] tracking-tight text-white">
            Votre boutique
            <br />
            <em className="text-[#52B788]">vous attend.</em>
          </h2>

          <p className="relative mt-4 text-base leading-relaxed text-white/65">
            Rejoignez les commerçants pilotes qui testent Boutiki. Accès gratuit et illimité pendant la phase test.
          </p>

          <Link
            href="/onboarding"
            className="group relative mt-9 inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-700 transition-all duration-300 hover:-translate-y-1 hover:bg-[#D8F3DC] hover:shadow-xl"
          >
            Créer ma boutique gratuitement
            <ArrowRight className="size-[18px] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <p className="relative mt-4 text-xs text-white/45">
            Aucune carte bancaire requise · Annulable à tout moment
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
