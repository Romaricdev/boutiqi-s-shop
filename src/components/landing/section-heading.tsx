import type { ReactNode } from "react";

export function SectionEyebrow({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <span className="h-px w-10 bg-[#95D5B2]" />
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-500">
        {text}
      </span>
      <span className="h-px w-10 bg-[#95D5B2]" />
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-4 text-center font-display text-[clamp(32px,4vw,48px)] leading-[1.12] tracking-tight text-warm-900">
      {children}
    </h2>
  );
}

export function SectionSub({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto mt-4 max-w-[480px] text-center text-base leading-relaxed text-warm-500">
      {children}
    </p>
  );
}
