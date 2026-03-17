import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 py-10">
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
          <Link className="font-semibold text-brand-700" href="/auth/register">
            Créer une boutique
          </Link>
        </div>
      </div>
    </main>
  );
}

