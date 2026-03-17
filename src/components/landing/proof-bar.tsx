import { Fragment } from "react";

import { ScrollReveal } from "./scroll-reveal";

const stats = [
  { value: "240+", label: "Boutiques actives" },
  { value: "12k+", label: "Commandes traitées" },
  { value: "48M", label: "FCFA traités" },
  { value: "4.9/5", label: "Satisfaction commerçants" },
];

export function ProofBar() {
  return (
    <ScrollReveal>
      <div className="border-y border-[#D8F3DC] bg-brand-50 px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-16">
          {stats.map((s, i) => (
            <Fragment key={s.label}>
              {i > 0 && (
                <div className="hidden h-10 w-px bg-[#D8F3DC] md:block" />
              )}
              <div
                className="group animate-scale-in text-center"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="font-display text-4xl tracking-tight text-brand-500 transition-transform duration-300 group-hover:scale-110">
                  {s.value}
                </div>
                <div className="mt-0.5 text-[13px] text-warm-500">{s.label}</div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
