import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function DemoShopPage({ params }: { params: { shopSlug: string } }) {
  const shopName = params.shopSlug.replaceAll("-", " ");
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-warm-900">Boutique {shopName}</h1>
          <p className="mt-2 text-sm text-warm-500">
            Démo UI uniquement (V1: commande sans paiement, sans stock).
          </p>
        </div>
        <Button asChild>
          <Link href="/">Retour</Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { name: "Robe wax bleue", price: "14 500 FCFA" },
          { name: "Sac cuir marron", price: "28 000 FCFA" },
          { name: "Collier doré", price: "7 500 FCFA" },
          { name: "Chaussure wax", price: "19 900 FCFA" },
        ].map((p) => (
          <div key={p.name} className="overflow-hidden rounded-xl border border-warm-200 bg-white">
            <div className="aspect-[4/3] bg-brand-50" />
            <div className="p-3">
              <div className="line-clamp-2 text-sm font-semibold text-warm-900">{p.name}</div>
              <div className="mt-1 text-sm font-bold text-brand-700">{p.price}</div>
              <div className="mt-3">
                <Button size="md" className="w-full" variant="secondary">
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 mt-10 rounded-2xl bg-brand-500 p-4 text-warm-50 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">Panier</div>
            <div className="text-base font-bold">42 500 FCFA</div>
          </div>
          <Button variant="secondary">Commander</Button>
        </div>
      </div>
    </main>
  );
}

