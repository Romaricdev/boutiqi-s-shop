import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-warm-50">
      <header className="border-b border-warm-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Logo size={30} />
          <Link href="/" className="text-sm text-warm-500 hover:text-warm-700">
            Retour
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="font-display text-3xl text-warm-900">Connexion</h1>
        <p className="mt-2 text-sm text-warm-500">
          Espace commerçant. (Auth Supabase à brancher)
        </p>

        <div className="mt-8 rounded-2xl border border-warm-200 bg-white p-5">
          <div className="text-sm text-warm-500">Formulaire à implémenter</div>
          <div className="mt-4 flex gap-3">
            <Button disabled className="w-full">
              Se connecter
            </Button>
          </div>
          <div className="mt-4 text-sm text-warm-500">
            Pas de compte ?{" "}
            <Link className="font-semibold text-brand-700" href="/onboarding">
              Créer une boutique
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
