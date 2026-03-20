import Link from "next/link";

import { cn } from "@/lib/cn";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg place-items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-warm-200 bg-white p-6 text-center">
        <div className="font-display text-3xl text-warm-900">Page introuvable</div>
        <p className="mt-2 text-sm text-warm-500">Le lien demandé n’existe pas (ou plus).</p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-[0.97]",
              "h-10 px-5 text-sm",
              "bg-brand-500 text-white shadow-sm hover:-translate-y-px hover:bg-brand-600 hover:shadow-md",
            )}
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

