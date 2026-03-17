import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function DashboardHomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-warm-900">Dashboard</h1>
          <p className="mt-2 text-sm text-warm-500">
            Squelette V1 — commandes & catalogue (auth/guard à ajouter).
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/dashboard/products">Produits</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/orders">Commandes</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-4">
        {[
          { label: "Nouvelles", value: "—" },
          { label: "Confirmées", value: "—" },
          { label: "En cours", value: "—" },
          { label: "Livrées", value: "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-warm-50 p-4">
            <div className="text-xs text-warm-500">{s.label}</div>
            <div className="mt-1 text-2xl font-bold text-warm-900">{s.value}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

