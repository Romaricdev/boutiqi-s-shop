"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Download,
  FileText,
  MapPin,
  Radio,
  RefreshCw,
  Shield,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";

import { AnalyticsSmoothChart } from "@/components/dashboard/analytics-smooth-chart";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table";
import { cn } from "@/lib/cn";
import {
  adminAnalyticsSummaryCsv,
  adminOrdersDrilldownHref,
  adminOrdersShopDrilldownHref,
  channelSplit,
  formatAnalyticsDelta,
  getAdminAnalyticsChartSeries,
  getAdminAnalyticsKpis,
  getAvgOrderProcessingHours,
  getMockExtendedPlatformMetrics,
  getOrderStatusDistribution,
  getPlatformContextStats,
  getTopShopsByRevenue,
  ordersInAnalyticsPeriod,
  type AdminAnalyticsPeriodKey,
} from "@/lib/admin/analytics";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types/dashboard";

const PERIODS: { value: AdminAnalyticsPeriodKey; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
];

const PERIOD_CHART_TITLE: Record<AdminAnalyticsPeriodKey, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "90d": "90 jours",
};

const CHART_METRICS: { value: "orders" | "revenue" | "customers"; label: string }[] = [
  { value: "orders", label: "Commandes" },
  { value: "revenue", label: "CA" },
  { value: "customers", label: "Clients" },
];

const STATUS_ORDER: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "delivering",
  "delivered",
  "cancelled",
];

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  const { text, positive } = formatAnalyticsDelta(current, previous);
  if (positive === null) {
    return <span className="text-xs font-medium text-neutral-400">{text}</span>;
  }
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        positive ? "text-emerald-600" : "text-red-600",
      )}
    >
      <Icon className="size-3" />
      {text}
    </span>
  );
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const apiSimulateError = searchParams.get("error") === "1";
  const isReadOnly = searchParams.get("role") === "readonly";

  const [period, setPeriod] = useState<AdminAnalyticsPeriodKey>("30d");
  const [chartMetric, setChartMetric] = useState<"orders" | "revenue" | "customers">("orders");
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());

  useEffect(() => {
    setRefreshedAt(new Date());
  }, [period]);

  const kpis = useMemo(() => getAdminAnalyticsKpis(period), [period]);
  const periodOrders = useMemo(() => ordersInAnalyticsPeriod(period), [period]);
  const topShops = useMemo(() => getTopShopsByRevenue(periodOrders), [periodOrders]);
  const statusDist = useMemo(() => getOrderStatusDistribution(periodOrders), [periodOrders]);
  const channels = useMemo(() => channelSplit(periodOrders), [periodOrders]);
  const platform = useMemo(() => getPlatformContextStats(), []);
  const chartSeries = useMemo(() => getAdminAnalyticsChartSeries(period), [period]);
  const extendedMetrics = useMemo(() => getMockExtendedPlatformMetrics(period), [period]);
  const avgProcessingH = useMemo(() => getAvgOrderProcessingHours(periodOrders), [periodOrders]);

  const chartData = useMemo(
    () =>
      chartSeries.map((d) => ({
        label: d.label,
        value:
          chartMetric === "orders" ? d.orders : chartMetric === "revenue" ? d.revenue : d.uniqueCustomers,
      })),
    [chartSeries, chartMetric],
  );

  const onChartPointClick = useCallback(
    (i: number) => {
      const pt = chartSeries[i];
      if (!pt) return;
      router.push(adminOrdersDrilldownHref(pt.drillFrom, pt.drillTo));
    },
    [router, chartSeries],
  );

  const statusMax = useMemo(
    () => Math.max(1, ...STATUS_ORDER.map((s) => statusDist[s])),
    [statusDist],
  );

  const exportCsv = useCallback(() => {
    const blob = new Blob(["\uFEFF", adminAnalyticsSummaryCsv(period)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statistiques-admin-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [period]);

  const kpiCards: {
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
    accent: string;
    current: number;
    previous: number;
  }[] = [
    {
      label: "Commandes",
      value: String(kpis.orderCount),
      hint: "Toutes boutiques confondues",
      icon: ShoppingCart,
      accent: "bg-violet-50 text-violet-700",
      current: kpis.orderCount,
      previous: kpis.previous.orderCount,
    },
    {
      label: "CA (hors annulées)",
      value: `${kpis.revenue.toLocaleString("fr-FR")} FCFA`,
      hint: "Volume sur la période",
      icon: Wallet,
      accent: "bg-emerald-50 text-emerald-700",
      current: kpis.revenue,
      previous: kpis.previous.revenue,
    },
    {
      label: "Clients uniques",
      value: String(kpis.uniqueCustomers),
      hint: "Par numéro de téléphone",
      icon: Users,
      accent: "bg-sky-50 text-sky-700",
      current: kpis.uniqueCustomers,
      previous: kpis.previous.uniqueCustomers,
    },
    {
      label: "Panier moyen",
      value: `${kpis.basket.toLocaleString("fr-FR")} FCFA`,
      hint: "Hors commandes annulées",
      icon: BarChart3,
      accent: "bg-amber-50 text-amber-800",
      current: kpis.basket,
      previous: kpis.previous.basket,
    },
  ];

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <BarChart3 className="size-5 text-neutral-700" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Statistiques</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Indicateurs agrégés (commandes démo, boutiques, commerçants). Même ancrage temporel que l&apos;admin
            commandes — à brancher sur analytics / Supabase pour les séries réelles.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              Données démo
            </Badge>
            {isReadOnly && (
              <Badge variant="outline" className="rounded-lg border-amber-200 bg-amber-50 text-xs font-medium text-amber-900">
                <Shield className="mr-1 inline size-3" />
                Lecture seule (export CSV masqué)
              </Badge>
            )}
            <Button variant="link" className="h-auto p-0 text-xs text-neutral-600" asChild>
              <Link href="/admin/orders">Voir les commandes</Link>
            </Button>
          </div>
          <div
            className={cn(
              "mt-4 flex flex-col gap-2 rounded-xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between",
              apiSimulateError
                ? "border-red-200 bg-red-50/90 text-red-900"
                : "border-emerald-200 bg-emerald-50/80 text-emerald-900",
            )}
            role="status"
          >
            <div className="flex items-start gap-2">
              {apiSimulateError ? (
                <WifiOff className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              ) : (
                <Radio className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              )}
              <div>
                <p className="font-semibold">{apiSimulateError ? "Erreur réseau (simulation)" : "Agrégats à jour (démo)"}</p>
                <p className="text-xs opacity-90">
                  {apiSimulateError
                    ? "Impossible de rafraîchir les métriques — affichage du dernier calcul local."
                    : "Prêt pour matérialisations SQL, cache Edge et push temps réel."}
                </p>
              </div>
            </div>
            <span className="flex shrink-0 flex-wrap items-center gap-2 text-xs font-medium opacity-80">
              <Activity className="mr-1 inline size-3.5 align-text-bottom" />
              {apiSimulateError ? (
                "—"
              ) : (
                <span className="tabular-nums">
                  Données figées à {refreshedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg px-2 text-xs font-semibold"
                disabled={apiSimulateError}
                onClick={() => setRefreshedAt(new Date())}
              >
                <RefreshCw className="mr-1 size-3.5" />
                Actualiser
              </Button>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Période</span>
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              type="button"
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              className="h-9 rounded-xl text-xs"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        {!isReadOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl text-xs font-semibold"
            onClick={exportCsv}
          >
            <Download className="mr-1.5 size-3.5" />
            Exporter CSV
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <Card
              key={k.label}
              className="rounded-2xl border-0 bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-neutral-400">{k.label}</p>
                  <span className={cn("grid size-10 place-items-center rounded-xl", k.accent)}>
                    <Icon className="size-5" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-neutral-950">{k.value}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                  <span>{k.hint}</span>
                  <span className="text-neutral-300">·</span>
                  <DeltaBadge current={k.current} previous={k.previous} />
                  <span className="text-neutral-400">vs période préc.</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader className="space-y-3">
            <div>
              <CardTitle className="text-base font-semibold text-neutral-950">
                Tendance ({PERIOD_CHART_TITLE[period]})
              </CardTitle>
              <CardDescription className="text-xs">
                Même fenêtre que les KPIs (démo, ancrage mars 2025). Clic sur un point pour ouvrir les commandes du segment.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHART_METRICS.map((m) => (
                <Button
                  key={m.value}
                  type="button"
                  variant={chartMetric === m.value ? "secondary" : "outline"}
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                  onClick={() => setChartMetric(m.value)}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-6">
            <div className="w-full overflow-x-auto">
              <AnalyticsSmoothChart
                data={chartData}
                chartMetric={chartMetric}
                className="min-w-[320px]"
                onPointClick={onChartPointClick}
              />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
              {chartSeries.map((pt) => (
                <Button key={pt.dateKey} variant="outline" size="sm" className="h-8 rounded-lg text-[11px]" asChild>
                  <Link href={adminOrdersDrilldownHref(pt.drillFrom, pt.drillTo)} title={`${pt.drillFrom} → ${pt.drillTo}`}>
                    {pt.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl border-0 bg-white shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-950">Canal d&apos;origine</CardTitle>
              <CardDescription className="text-xs">Période sélectionnée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {[
                { label: "WhatsApp", value: channels.whatsapp, color: "bg-emerald-400" },
                { label: "Lien boutique", value: channels.store_link, color: "bg-violet-400" },
              ].map((c) => {
                const total = channels.whatsapp + channels.store_link || 1;
                const pct = Math.round((c.value / total) * 100);
                return (
                  <div key={c.label}>
                    <div className="flex justify-between text-sm font-medium text-neutral-800">
                      <span>{c.label}</span>
                      <span className="tabular-nums text-neutral-500">
                        {c.value} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div className={cn("h-full rounded-full", c.color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 bg-white shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-950">Plateforme</CardTitle>
              <CardDescription className="text-xs">Inventaire démo boutiques / commerçants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-sm">
              <p>
                <span className="font-semibold text-neutral-900">{platform.shops.active}</span>{" "}
                <span className="text-neutral-500">boutiques actives</span>
              </p>
              <p>
                <span className="font-semibold text-neutral-900">{platform.merchants.verified}</span>{" "}
                <span className="text-neutral-500">commerçants vérifiés</span>
              </p>
              <Separator className="my-2 bg-neutral-100" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Top villes</p>
              <ul className="space-y-2">
                {platform.cities.slice(0, 4).map(([city, count]) => (
                  <li key={city} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-700">
                      <MapPin className="size-3 text-neutral-400" />
                      {city}
                    </span>
                    <span className="tabular-nums text-neutral-500">{count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 bg-white shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-950">Signaux produit (démo)</CardTitle>
              <CardDescription className="text-xs">Tracking & abonnements — à brancher</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0 text-xs text-neutral-700">
              <p className="flex justify-between gap-2">
                <span className="text-neutral-500">Vues vitrine</span>
                <span className="font-semibold tabular-nums text-neutral-900">
                  {extendedMetrics.vitrineViews.toLocaleString("fr-FR")}
                </span>
              </p>
              <p className="flex justify-between gap-2">
                <span className="text-neutral-500">Clics liens trackés</span>
                <span className="font-semibold tabular-nums text-neutral-900">
                  {extendedMetrics.trackedLinkClicks.toLocaleString("fr-FR")}
                </span>
              </p>
              <p className="flex justify-between gap-2">
                <span className="text-neutral-500">Inscriptions</span>
                <span className="font-semibold tabular-nums text-neutral-900">{extendedMetrics.newSignups}</span>
              </p>
              <p className="flex justify-between gap-2">
                <span className="text-neutral-500">Rétention commerçants</span>
                <span className="font-semibold tabular-nums text-neutral-900">{extendedMetrics.merchantRetentionPct} %</span>
              </p>
              <p className="flex justify-between gap-2">
                <span className="text-neutral-500">Churn abonnements</span>
                <span className="font-semibold tabular-nums text-neutral-900">{extendedMetrics.subscriptionChurnPct} %</span>
              </p>
              <Separator className="bg-neutral-100" />
              <p className="flex justify-between gap-2">
                <span className="text-neutral-500">Délai moy. traitement cmd.</span>
                <span className="font-semibold tabular-nums text-neutral-900">
                  {avgProcessingH !== null ? `${avgProcessingH} h` : "—"}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">Statuts des commandes</CardTitle>
            <CardDescription className="text-xs">Répartition sur la période sélectionnée</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-3 pt-5">
            {STATUS_ORDER.map((s) => {
              const n = statusDist[s];
              const w = Math.round((n / statusMax) * 100);
              return (
                <div key={s}>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700">{ORDER_STATUS_LABELS[s]}</span>
                    <span className="tabular-nums font-medium text-neutral-900">{n}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-neutral-400/90" style={{ width: `${w}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">Top boutiques (CA)</CardTitle>
            <CardDescription className="text-xs">Hors annulées · période sélectionnée</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="pl-6 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Boutique
                  </TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Cmd
                  </TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    CA FCFA
                  </TableHead>
                  <TableHead className="pr-6 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Commandes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topShops.map((row) => (
                  <TableRow key={row.shopSlug} className="border-neutral-100">
                    <TableCell className="py-3 pl-6">
                      <Link
                        href={`/admin/shops/${row.shopSlug}`}
                        className="text-sm font-medium text-neutral-900 hover:underline"
                      >
                        {row.shopName}
                      </Link>
                      <p className="text-[11px] text-neutral-400">{row.shopSlug}</p>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-neutral-600">{row.orders}</TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums text-neutral-900">
                      {row.revenue.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link
                        href={adminOrdersShopDrilldownHref(row.shopSlug, period)}
                        className="text-xs font-semibold text-violet-700 hover:underline"
                      >
                        Filtrer
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">Exports avancés</CardTitle>
            <CardDescription className="text-xs">
              PDF, plages personnalisées, colonnes au choix, exports planifiés — prochaine itération backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl text-xs" disabled>
              <FileText className="mr-1.5 size-3.5" />
              PDF
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl text-xs" disabled>
              Plage perso.
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl text-xs" disabled>
              Colonnes
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl text-xs" disabled>
              Planifier
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">Permissions (cible)</CardTitle>
            <CardDescription className="text-xs">Admin · support · lecture seule — à câbler (JWT / RLS).</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-neutral-600">
            <p>
              Démo : ajoutez{" "}
              <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] text-neutral-800">
                ?role=readonly
              </span>{" "}
              sur cette page pour masquer l&apos;export CSV, comme pour un profil lecture seule.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminAnalyticsClient() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-neutral-400" aria-busy="true">
          Chargement…
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
