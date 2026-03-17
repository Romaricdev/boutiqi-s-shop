import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg place-items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-warm-200 bg-white p-6 text-center">
        <div className="font-display text-3xl text-warm-900">Page introuvable</div>
        <p className="mt-2 text-sm text-warm-500">Le lien demandé n’existe pas (ou plus).</p>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/">Retour à l’accueil</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

