"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Layers, Sparkles, Tags } from "lucide-react";

import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table";
import { cn } from "@/lib/cn";
import { usePersistedSubscriptionPlanCatalog } from "@/hooks/use-persisted-subscription-plans";

export default function SubscriptionPlansListClient() {
  const { plans, hydrated, hasOverride } = usePersistedSubscriptionPlanCatalog();

  const stats = useMemo(() => {
    const active = plans.filter((p) => p.isActive).length;
    const listed = plans.filter((p) => p.isListedPublic).length;
    return { active, listed, total: plans.length };
  }, [plans]);

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <Tags className="size-5 text-neutral-700" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Types d&apos;abonnement</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Catalogue des offres (Pilote, Pro, Business) : prix, visibilité, essai et textes. Les modifications sont
            enregistrées dans ce navigateur (démo) — à synchroniser avec une API admin ensuite.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              {stats.total} offre{stats.total > 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              {stats.active} ouverte{stats.active > 1 ? "s" : ""} aux souscriptions
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              {stats.listed} sur la vitrine publique
            </Badge>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">Persistance locale</p>
        <p className="mt-1 text-xs opacity-90">
          Tant qu&apos;il n&apos;y a pas de backend, les réglages sont stockés en{" "}
          <code className="rounded bg-amber-100/80 px-1 text-[11px]">localStorage</code>. Videz-les ou changez de
          navigateur pour retrouver les valeurs par défaut (sauf si vous réinitialisez chaque offre).
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-neutral-950">Offres configurables</CardTitle>
          <CardDescription className="text-xs">
            Cliquez sur une ligne pour modifier les champs métier. Le slug technique (pilot, pro, business) n&apos;est pas
            éditable.
          </CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <div className="overflow-x-auto">
          {!hydrated ? (
            <div className="p-8 text-center text-sm text-neutral-400">Chargement…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="pl-6 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Offre
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Prix</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Essai</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Statut</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Vitrine</TableHead>
                  <TableHead className="w-12 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.slug} className="border-neutral-100 transition-colors hover:bg-neutral-50/90">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-start gap-2">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-600">
                          <Layers className="size-4" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/subscriptions/plans/${p.slug}`}
                              className="text-sm font-semibold text-neutral-900 hover:text-neutral-600 hover:underline"
                            >
                              {p.name}
                            </Link>
                            {hasOverride(p.slug) ? (
                              <Badge variant="secondary" className="rounded-md text-[10px] font-normal">
                                Modifié localement
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-0.5 max-w-md text-xs text-neutral-500">{p.shortDescription}</p>
                          <code className="mt-1 inline-block text-[10px] text-neutral-400">{p.slug}</code>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-sm">
                      {p.priceMonthlyFcfa === 0 ? (
                        <span className="font-semibold text-emerald-700">0 FCFA</span>
                      ) : (
                        <span className="font-semibold tabular-nums text-neutral-900">
                          {p.priceMonthlyFcfa.toLocaleString("fr-FR")} FCFA
                        </span>
                      )}
                      <p className="mt-0.5 text-[11px] text-neutral-400">{p.priceUnitLabel}</p>
                    </TableCell>
                    <TableCell className="align-top text-sm text-neutral-600">
                      {p.trialDays > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="size-3.5 text-sky-500" />
                          {p.trialDays} j
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-lg text-[10px] font-semibold",
                          p.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-neutral-200 bg-neutral-100 text-neutral-500",
                        )}
                      >
                        {p.isActive ? "Souscription ouverte" : "Fermé"}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top">
                      <span className="text-sm text-neutral-600">{p.isListedPublic ? "Oui" : "Non"}</span>
                    </TableCell>
                    <TableCell className="pr-6 text-right align-top">
                      <Button variant="ghost" size="sm" className="h-9 gap-1 rounded-xl text-xs" asChild>
                        <Link href={`/admin/subscriptions/plans/${p.slug}`}>
                          Configurer
                          <ArrowRight className="size-3.5 opacity-60" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}
