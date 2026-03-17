import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 py-10">
      <h1 className="font-display text-3xl text-warm-900">Créer ma boutique</h1>
      <p className="mt-2 text-sm text-warm-500">
        Inscription commerçant. (Supabase Auth à brancher)
      </p>

      <div className="mt-8 rounded-2xl border border-warm-200 bg-white p-5">
        <div className="text-sm text-warm-500">Formulaire à implémenter</div>
        <div className="mt-4 flex gap-3">
          <Button disabled className="w-full">
            Créer
          </Button>
        </div>
        <div className="mt-4 text-sm text-warm-500">
          Déjà un compte ?{" "}
          <Link className="font-semibold text-brand-700" href="/auth/login">
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}

