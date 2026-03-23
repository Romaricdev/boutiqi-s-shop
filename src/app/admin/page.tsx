import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

import { AdminGreeting } from "@/components/admin/admin-greeting";
import { AdminPerformanceChart } from "@/components/admin/admin-performance-chart";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table";
import { cn } from "@/lib/cn";

const kpis: {
  label: string;
  value: string;
  hint: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
}[] = [
  { label: "Boutiques actives", value: "124", hint: "sur 132 inscrites", trend: "+8", trendUp: true, icon: Store },
  { label: "Commerçants", value: "118", hint: "comptes vérifiés", trend: "+12", trendUp: true, icon: Users },
  { label: "Commandes (30 j.)", value: "1 847", hint: "toutes boutiques", trend: "+18%", trendUp: true, icon: ShoppingCart },
  { label: "Revenus pilote", value: "0 F", hint: "hors flux", trend: "—", trendUp: true, icon: CreditCard },
];

const recentShops = [
  { name: "Ma Boutique", slug: "ma-boutique", city: "Douala", products: 24, orders: 87, joined: "12 jan.", status: "active" as const, load: "87 cmd." },
  { name: "Boutique Solange", slug: "boutique-solange", city: "Yaoundé", products: 56, orders: 213, joined: "03 fév.", status: "active" as const, load: "213 cmd." },
  { name: "Chez Kofi", slug: "chez-kofi", city: "Douala", products: 12, orders: 41, joined: "18 fév.", status: "active" as const, load: "41 cmd." },
  { name: "Afro Chic", slug: "afro-chic", city: "Douala", products: 38, orders: 156, joined: "10 jan.", status: "active" as const, load: "156 cmd." },
  { name: "Test Shop", slug: "test-shop", city: "Douala", products: 3, orders: 0, joined: "20 fév.", status: "pending" as const, load: "—" },
  { name: "Mode Éclat", slug: "mode-eclat", city: "Bafoussam", products: 0, orders: 0, joined: "21 fév.", status: "suspended" as const, load: "—" },
];

const activity = [
  { label: "Nouvelles boutiques", value: "32", period: "ce mois" },
  { label: "Commandes", value: "156", period: "cette semaine" },
  { label: "Signalements", value: "4", period: "ouverts" },
];

const rowDiscStyles = [
  "bg-sky-100 text-sky-700",
  "bg-orange-100 text-orange-700",
  "bg-emerald-100 text-emerald-800",
] as const;

function StatusDot({ status }: { status: "active" | "pending" | "suspended" }) {
  const map = {
    active: { label: "Active", dot: "bg-emerald-500", text: "text-neutral-600" },
    pending: { label: "En attente", dot: "bg-orange-400", text: "text-neutral-600" },
    suspended: { label: "Suspendue", dot: "bg-neutral-300", text: "text-neutral-400" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", map.text)}>
      <span className={cn("size-1.5 rounded-full", map.dot)} />
      {map.label}
    </span>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="w-full space-y-8">
      {/* En-tête type référence */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl space-y-2">
          <AdminGreeting name="Admin" />
          <p className="text-sm leading-relaxed text-neutral-500">
            Voici un aperçu de la plateforme — chiffres et listes sont{" "}
            <span className="font-medium text-neutral-700">mockés</span> pour la phase démo.
          </p>
        </div>
        <Badge
          variant="outline"
          className="h-fit w-fit rounded-xl border-neutral-200/90 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 shadow-soft-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
        >
          <span className="mr-2 size-1.5 rounded-full bg-emerald-500" />
          Système opérationnel
        </Badge>
      </div>

      {/* Bloc statistiques — une carte, colonnes séparées */}
      <Card className="rounded-2xl border-0 bg-white shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)]">
        <CardContent className="grid divide-y divide-neutral-100 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className="group/kpi flex flex-col gap-4 px-6 py-6 transition-colors duration-200 ease-out hover:bg-neutral-50/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-medium text-neutral-400 transition-colors group-hover/kpi:text-neutral-500">
                    {k.label}
                  </p>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-neutral-100 shadow-inner transition-all duration-300 ease-out group-hover/kpi:scale-105 group-hover/kpi:bg-neutral-200/60 group-hover/kpi:shadow-md">
                    <Icon className="size-5 text-neutral-600 transition-transform duration-300 group-hover/kpi:scale-110" strokeWidth={1.5} />
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold tabular-nums tracking-tight text-neutral-950">{k.value}</p>
                  <p className="mt-1 text-xs text-neutral-400">{k.hint}</p>
                </div>
                {k.trend !== "—" ? (
                  <div
                    className={cn(
                      "inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold",
                      k.trendUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                    )}
                  >
                    {k.trendUp ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    <span>{k.trend}</span>
                    <span className="font-normal opacity-80">ce mois</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-neutral-400">Pilote gratuit</span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Performance */}
      <Card className="rounded-2xl border-0 bg-white shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.16)]">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-950">Performance</CardTitle>
            <CardDescription className="text-xs text-neutral-500">Volume d&apos;activité agrégé (données fictives)</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-xl border-neutral-200/90 bg-neutral-50/50 text-xs font-semibold text-neutral-700 shadow-none transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:bg-white hover:shadow-soft-sm active:translate-y-0"
          >
            01–07 {new Date().toLocaleDateString("fr-FR", { month: "short" })}
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <AdminPerformanceChart />
          <div className="mt-3 flex flex-wrap gap-4 px-2 text-xs">
            <span className="inline-flex items-center gap-2 text-neutral-600">
              <span className="size-2 rounded-full bg-blue-500" />
              Ce mois
            </span>
            <span className="inline-flex items-center gap-2 text-neutral-600">
              <span className="size-2 rounded-full bg-orange-400" />
              Mois dernier
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-0 bg-white shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.16)] lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-neutral-100 shadow-inner transition-all duration-300 hover:scale-105 hover:shadow-md">
                <TrendingUp className="size-5 text-neutral-600" strokeWidth={1.5} />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold text-neutral-950">Activité récente</CardTitle>
                <CardDescription className="text-xs">Résumé fictif — événements réels à brancher.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="grid grid-cols-1 divide-y divide-neutral-100 p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {activity.map((a) => (
              <div
                key={a.label}
                className="group flex flex-col items-center justify-center px-4 py-8 text-center transition-colors duration-200 ease-out hover:bg-neutral-50/80"
              >
                <span className="text-3xl font-bold tabular-nums text-neutral-950 transition-transform duration-200 ease-out group-hover:scale-[1.04]">
                  {a.value}
                </span>
                <span className="mt-2 text-sm font-medium text-neutral-600">{a.label}</span>
                <span className="mt-0.5 text-xs text-neutral-400">{a.period}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.16)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-neutral-100 shadow-inner transition-all duration-300 hover:scale-105 hover:shadow-md">
                <Package className="size-5 text-neutral-600" strokeWidth={1.5} />
              </span>
              <CardTitle className="text-sm font-semibold text-neutral-950">Note produit</CardTitle>
            </div>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="pt-5">
            <p className="text-sm leading-relaxed text-neutral-600">
              Phase pilote — paiements et abonnements <strong className="font-semibold text-neutral-950">hors flux</strong> jusqu&apos;à la bascule production.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-neutral-400">Accès commerçants offert pendant la collecte de retours.</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste type « tâches » */}
      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)]">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-4">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-950">Boutiques</CardTitle>
            <CardDescription className="text-xs">
              {recentShops.length} entrées — démo. Filtres & recherche à venir.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-400">Complété</span>
            <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">72%</span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-neutral-200/90 text-xs font-semibold shadow-none transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-soft-sm active:translate-y-0"
            >
              Semaine
              <ChevronDown className="ml-1 size-3.5 opacity-60" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-neutral-200/90 text-xs font-semibold shadow-none transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-soft-sm active:translate-y-0"
            >
              Exporter
              <ExternalLink className="ml-1 size-3.5 opacity-60" />
            </Button>
          </div>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="h-12 pl-6 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Boutique</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Ville</TableHead>
                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Produits</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Charge</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Statut</TableHead>
                <TableHead className="w-12 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentShops.map((row, i) => (
                <TableRow
                  key={row.slug}
                  className="group/row border-neutral-100 transition-all duration-200 ease-out hover:bg-neutral-50/90 hover:shadow-[0_2px_16px_-6px_rgba(15,23,42,0.1)]"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold shadow-sm transition-all duration-200 ease-out group-hover/row:scale-105 group-hover/row:shadow-md",
                          rowDiscStyles[i % rowDiscStyles.length],
                        )}
                      >
                        {row.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-neutral-950">{row.name}</div>
                        <code className="text-[11px] text-neutral-400">{row.slug}</code>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600">
                      <MapPin className="size-3.5 text-neutral-400" />
                      {row.city}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-medium text-neutral-800">{row.products}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
                      <Clock className="size-3.5 text-neutral-400" />
                      {row.load}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusDot status={row.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-xl text-neutral-400 transition-all duration-200 hover:bg-neutral-200/60 hover:text-neutral-900 hover:shadow-sm active:scale-95"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
