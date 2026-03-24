"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BarChart3,
  ShoppingBag,
  Users2,
  Wallet,
  Truck,
  Store,
  CircleAlert,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";

import { AnalyticsSmoothChart } from "@/components/dashboard/analytics-smooth-chart";
import { useDashboardStore } from "@/lib/store/dashboard";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types/dashboard";
import { cn } from "@/lib/cn";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayLabel(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString("fr-FR", { weekday: "short" });
}

type Period = 7 | 30 | 90;
type ChartMetric = "orders" | "revenue" | "customers";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 7, label: "7 jours" },
  { value: 30, label: "30 jours" },
  { value: 90, label: "90 jours" },
];
const CHART_METRICS: { value: ChartMetric; label: string }[] = [
  { value: "orders", label: "Commandes" },
  { value: "revenue", label: "CA" },
  { value: "customers", label: "Clients" },
];

export default function DashboardAnalyticsPage() {
  const { orders } = useDashboardStore();
  const [period, setPeriod] = useState<Period>(30);
  const [chartMetric, setChartMetric] = useState<ChartMetric>("orders");

  const now = Date.now();
  const periodStart = now - period * 24 * 60 * 60 * 1000;
  const previousPeriodStart = now - period * 2 * 24 * 60 * 60 * 1000;

  const periodOrders = useMemo(
    () => orders.filter((o) => new Date(o.createdAt).getTime() >= periodStart),
    [orders, periodStart],
  );
  const previousPeriodOrders = useMemo(
    () =>
      orders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= previousPeriodStart && t < periodStart;
      }),
    [orders, previousPeriodStart, periodStart],
  );

  const totalRevenue = useMemo(
    () => periodOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0),
    [periodOrders],
  );
  const previousRevenue = useMemo(
    () => previousPeriodOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0),
    [previousPeriodOrders],
  );

  const delivered = useMemo(() => periodOrders.filter((o) => o.status === "delivered").length, [periodOrders]);
  const customers = useMemo(() => new Set(periodOrders.map((o) => o.customerPhone)).size, [periodOrders]);
  const averageBasket = useMemo(() => {
    const valid = periodOrders.filter((o) => o.status !== "cancelled");
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((sum, o) => sum + o.total, 0) / valid.length);
  }, [periodOrders]);

  const chartLast7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const offset = 6 - i;
      const day = new Date();
      day.setDate(day.getDate() - offset);
      const from = startOfDay(day);
      const to = from + 86_400_000;
      const dayOrders = orders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= from && t < to;
      });
      return {
        label: dayLabel(offset),
        orders: dayOrders.length,
        revenue: dayOrders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0),
        customers: new Set(dayOrders.map((o) => o.customerPhone)).size,
      };
    });
  }, [orders]);

  const chartData = useMemo(
    () =>
      chartLast7Days.map((d) => ({
        label: d.label,
        value: chartMetric === "orders" ? d.orders : chartMetric === "revenue" ? d.revenue : d.customers,
      })),
    [chartLast7Days, chartMetric],
  );
  const maxChartPoint = useMemo(
    () => chartData.reduce((best, cur) => (cur.value > best.value ? cur : best), chartData[0] ?? { label: "—", value: 0 }),
    [chartData],
  );
  const last7Orders = useMemo(
    () => chartLast7Days.reduce((sum, d) => sum + d.orders, 0),
    [chartLast7Days],
  );
  const deliveredRevenue = useMemo(
    () => periodOrders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0),
    [periodOrders],
  );
  const activeCustomers30Days = useMemo(() => {
    const limit = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return new Set(
      orders
        .filter((o) => new Date(o.createdAt).getTime() >= limit)
        .map((o) => o.customerPhone),
    ).size;
  }, [orders]);
  const cancelledCount = useMemo(
    () => periodOrders.filter((o) => o.status === "cancelled").length,
    [periodOrders],
  );
  const cancellationRate = useMemo(
    () => (periodOrders.length > 0 ? Math.round((cancelledCount / periodOrders.length) * 100) : 0),
    [periodOrders.length, cancelledCount],
  );
  const deliverySplit = useMemo(
    () => ({
      delivery: periodOrders.filter((o) => o.deliveryType === "delivery").length,
      pickup: periodOrders.filter((o) => o.deliveryType === "pickup").length,
    }),
    [periodOrders],
  );
  const statusBreakdown = useMemo(() => {
    const all: OrderStatus[] = ["new", "confirmed", "preparing", "delivering", "delivered", "cancelled"];
    return all.map((status) => ({
      status,
      label: ORDER_STATUS_LABELS[status],
      count: periodOrders.filter((o) => o.status === status).length,
    }));
  }, [periodOrders]);
  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    periodOrders.forEach((o) =>
      o.items.forEach((item) => map.set(item.productName, (map.get(item.productName) ?? 0) + item.quantity)),
    );
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [periodOrders]);
  const relaunchCount = useMemo(() => {
    const latestByPhone = new Map<string, number>();
    orders.forEach((o) => {
      const t = new Date(o.createdAt).getTime();
      const current = latestByPhone.get(o.customerPhone) ?? 0;
      if (t > current) latestByPhone.set(o.customerPhone, t);
    });
    const limit = now - 14 * 24 * 60 * 60 * 1000;
    return [...latestByPhone.values()].filter((t) => t < limit).length;
  }, [orders, now]);
  const revenueTrend = previousRevenue <= 0 ? (totalRevenue > 0 ? 100 : 0) : Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100);
  const avgDailyOrders = Math.round((periodOrders.length / period) * 10) / 10;
  const followUpRate = customers > 0 ? Math.round((relaunchCount / customers) * 100) : 0;
  const dominantDeliveryMode = deliverySplit.delivery >= deliverySplit.pickup ? "Livraison" : "Retrait";

  const exportRows = useMemo((): (string | number)[][] => {
    const rows: (string | number)[][] = [
      ["Section", "Label", "Value"],
      ["Resume", "Periode", `${period} jours`],
      ["KPI", "Commandes", periodOrders.length],
      ["KPI", "Chiffre d'affaires", totalRevenue],
      ["KPI", "Clients", customers],
      ["KPI", "Panier moyen", averageBasket],
      ["KPI", "Taux annulation (%)", cancellationRate],
      ["KPI", "Clients a relancer", relaunchCount],
      ["KPI", "Tendance revenu (%)", revenueTrend],
      ["Livraison", "Livraison", deliverySplit.delivery],
      ["Livraison", "Retrait", deliverySplit.pickup],
    ];
    statusBreakdown.forEach((s) => rows.push(["Statuts", s.label, s.count]));
    topProducts.forEach(([name, qty]) => rows.push(["Top produits", name, qty]));
    chartData.forEach((d) => rows.push([`Graphe ${chartMetric}`, d.label, d.value]));
    return rows;
  }, [
    period,
    periodOrders.length,
    totalRevenue,
    customers,
    averageBasket,
    cancellationRate,
    relaunchCount,
    revenueTrend,
    deliverySplit.delivery,
    deliverySplit.pickup,
    statusBreakdown,
    topProducts,
    chartData,
    chartMetric,
  ]);

  const exportCsv = useCallback(() => {
    const csv = exportRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boutiqi-stats-${period}j.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [exportRows, period]);

  const exportXlsx = useCallback(async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, "Statistiques");
    XLSX.writeFile(wb, `boutiqi-stats-${period}j.xlsx`);
  }, [exportRows, period]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-warm-900 lg:text-2xl">Statistiques</h1>
          <p className="mt-0.5 text-sm text-warm-500">Suivez les performances de votre boutique.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-warm-200 bg-white p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                  period === opt.value ? "bg-warm-900 text-white" : "text-warm-600 hover:bg-warm-50",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-warm-200 bg-white px-3 py-2 text-xs font-semibold text-warm-700 transition hover:bg-warm-50"
          >
            Exporter CSV
          </button>
          <button
            type="button"
            onClick={() => void exportXlsx()}
            className="rounded-lg border border-warm-200 bg-white px-3 py-2 text-xs font-semibold text-warm-700 transition hover:bg-warm-50"
          >
            Exporter XLSX
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<ShoppingBag className="size-4" />}
          label="Commandes"
          value={`${periodOrders.length}`}
          sub={`Moyenne: ${avgDailyOrders}/jour`}
        />
        <StatCard
          icon={<Wallet className="size-4" />}
          label="Chiffre d'affaires"
          value={`${totalRevenue.toLocaleString()} F`}
          sub={`${revenueTrend >= 0 ? "+" : ""}${revenueTrend}% vs période précédente`}
        />
        <StatCard
          icon={<Users2 className="size-4" />}
          label="Clients"
          value={`${customers}`}
          sub={`${activeCustomers30Days} actifs sur 30 jours`}
        />
        <StatCard
          icon={<BarChart3 className="size-4" />}
          label="Panier moyen"
          value={`${averageBasket.toLocaleString()} F`}
          sub={`Annulation: ${cancellationRate}% · ${relaunchCount} à relancer`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <section className="rounded-lg border border-warm-200 bg-white p-5 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-warm-900">Courbe (7 derniers jours)</h2>
            <span className="text-xs text-warm-500">
              {last7Orders} commandes · {delivered} livrées
            </span>
          </div>
          <div className="mb-4 inline-flex rounded-lg border border-warm-200 bg-white p-1">
            {CHART_METRICS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setChartMetric(m.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                  chartMetric === m.value ? "bg-brand-600 text-white" : "text-warm-600 hover:bg-warm-50",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-warm-100 bg-white px-1 pb-1 pt-3 sm:px-2">
            <AnalyticsSmoothChart data={chartData} chartMetric={chartMetric} />
          </div>
        </section>

        <section className="rounded-lg border border-warm-200 bg-white p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold text-warm-900">Répartition des statuts</h2>
          <p className="mt-1 text-xs text-warm-500">Sur {periodOrders.length} commandes</p>
          <div className="mt-4 space-y-3">
            {statusBreakdown.map((s) => {
              const pct = periodOrders.length > 0 ? Math.round((s.count / periodOrders.length) * 100) : 0;
              return (
                <div key={s.status}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-warm-700">{s.label}</span>
                    <span className="font-semibold text-warm-800">
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-warm-100">
                    <div className="h-full rounded-full bg-brand-400" style={{ width: `${Math.max(3, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-warm-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-warm-900">Insights automatiques</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <InsightCard
            icon={<TrendingUp className="size-4 text-brand-600" />}
            title="Pic d'activité"
            text={`Le jour le plus fort sur le graphe est ${maxChartPoint.label} (${chartMetric === "revenue" ? `${maxChartPoint.value.toLocaleString()} F` : maxChartPoint.value}).`}
          />
          <InsightCard
            icon={<Users className="size-4 text-amber-600" />}
            title="Clients à relancer"
            text={`${relaunchCount} clients n'ont pas commandé récemment (${followUpRate}% de vos clients actifs période).`}
          />
          <InsightCard
            icon={<Truck className="size-4 text-accent-600" />}
            title="Canal dominant"
            text={`${dominantDeliveryMode} domine sur la période. Gardez ce canal prioritaire et surveillez l'annulation (${cancellationRate}%).`}
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-warm-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-warm-900">Livraison vs retrait</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniMetric
              icon={<Truck className="size-4 text-brand-600" />}
              label="Livraison"
              value={`${deliverySplit.delivery}`}
              sub={`${periodOrders.length > 0 ? Math.round((deliverySplit.delivery / periodOrders.length) * 100) : 0}%`}
            />
            <MiniMetric
              icon={<Store className="size-4 text-accent-600" />}
              label="Retrait"
              value={`${deliverySplit.pickup}`}
              sub={`${periodOrders.length > 0 ? Math.round((deliverySplit.pickup / periodOrders.length) * 100) : 0}%`}
            />
          </div>
          <div className="mt-3 rounded-lg border border-warm-100 bg-warm-50/60 px-3 py-2 text-xs text-warm-600">
            <span className="font-semibold text-warm-800">CA livré:</span> {deliveredRevenue.toLocaleString()} F
          </div>
        </section>

        <section className="rounded-lg border border-warm-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-warm-900">Top produits vendus</h2>
          {topProducts.length === 0 ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-warm-100 bg-warm-50/60 px-3 py-3 text-xs text-warm-500">
              <CircleAlert className="size-4" />
              Pas assez de données sur la période.
            </div>
          ) : (
            <div className="mt-3 space-y-2.5">
              {topProducts.map(([name, qty]) => {
                const max = topProducts[0][1] || 1;
                const pct = Math.round((qty / max) * 100);
                return (
                  <div key={name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-warm-700">
                        <Package className="size-3.5 text-warm-400" />
                        {name}
                      </span>
                      <span className="font-semibold text-warm-800">{qty} u.</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-warm-100">
                      <div className="h-full rounded-full bg-brand-400" style={{ width: `${Math.max(5, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MiniMetric({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-warm-200 bg-warm-50/40 px-3 py-3">
      <div className="flex items-center justify-between text-warm-500">
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
        {icon}
      </div>
      <p className="mt-1 text-lg font-bold text-warm-900">{value}</p>
      <p className="text-xs text-warm-500">{sub}</p>
    </div>
  );
}

function InsightCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-lg border border-warm-200 bg-warm-50/40 px-3 py-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-warm-700">{title}</h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-warm-600">{text}</p>
    </article>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex min-h-[124px] flex-col justify-between rounded-lg border border-warm-200 bg-white p-4">
      <div className="flex items-center justify-between text-warm-500">
        <span className="text-xs font-medium">{label}</span>
        <span className="grid size-8 place-items-center rounded-md bg-warm-100">{icon}</span>
      </div>
      <div className="mt-1 text-3xl font-bold leading-none text-warm-900">{value}</div>
      <p className="text-[11px] text-warm-500">{sub}</p>
    </div>
  );
}
