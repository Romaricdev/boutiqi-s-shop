/**
 * Statistiques plateforme (admin) — agrégations démo à partir des mocks commandes / boutiques / commerçants.
 */

import { getAdminCityStats, getAdminShopKpis, MOCK_ADMIN_SHOPS } from "@/lib/admin/shops";
import { getAdminMerchantKpis } from "@/lib/admin/merchants";
import {
  ADMIN_ORDERS_DEMO_ANCHOR_MS,
  MOCK_ADMIN_PLATFORM_ORDERS,
  orderMatchesDemoPeriod,
  type AdminOrderPeriod,
  type AdminPlatformOrder,
} from "@/lib/admin/orders";
import type { OrderStatus } from "@/lib/types/dashboard";

export type AdminAnalyticsPeriodKey = "7d" | "30d" | "90d";

export function analyticsPeriodToOrderPeriod(p: AdminAnalyticsPeriodKey): AdminOrderPeriod {
  return p;
}

export type AdminAnalyticsDayPoint = {
  dateKey: string;
  label: string;
  orders: number;
  revenue: number;
  uniqueCustomers: number;
  /** Plage inclusive (YYYY-MM-DD, UTC) pour drill-down commandes */
  drillFrom: string;
  drillTo: string;
};

export type AdminAnalyticsTopShop = {
  shopSlug: string;
  shopName: string;
  orders: number;
  revenue: number;
};

function orderTime(iso: string): number {
  return new Date(iso).getTime();
}

/** Bornes [start, end] alignées sur la même logique que `orderMatchesDemoPeriod` pour la période courante. */
export function getAnalyticsPeriodBounds(period: AdminAnalyticsPeriodKey): { start: number; end: number } {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const end = ADMIN_ORDERS_DEMO_ANCHOR_MS + 86_400_000;
  const start = ADMIN_ORDERS_DEMO_ANCHOR_MS - days * 86_400_000;
  return { start, end };
}

/** Période précédente de même durée (pour variation %). */
export function getPreviousAnalyticsPeriodBounds(period: AdminAnalyticsPeriodKey): { start: number; end: number } {
  const { start, end } = getAnalyticsPeriodBounds(period);
  const len = end - start;
  return { start: start - len, end: start };
}

export function filterOrdersByTimeRange(orders: AdminPlatformOrder[], start: number, end: number): AdminPlatformOrder[] {
  return orders.filter((o) => {
    const t = orderTime(o.createdAt);
    return t >= start && t <= end;
  });
}

export function ordersInAnalyticsPeriod(period: AdminAnalyticsPeriodKey): AdminPlatformOrder[] {
  return MOCK_ADMIN_PLATFORM_ORDERS.filter((o) => orderMatchesDemoPeriod(o.createdAt, analyticsPeriodToOrderPeriod(period)));
}

function aggregateOrderMetrics(orders: AdminPlatformOrder[]) {
  const nonCancelled = orders.filter((o) => o.status !== "cancelled");
  const revenue = nonCancelled.reduce((s, o) => s + o.total, 0);
  const uniqueCustomers = new Set(orders.map((o) => o.customerPhone.replace(/\s/g, ""))).size;
  const uniqueShops = new Set(orders.map((o) => o.shopSlug)).size;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const basket =
    nonCancelled.length === 0 ? 0 : Math.round(nonCancelled.reduce((s, o) => s + o.total, 0) / nonCancelled.length);
  return {
    orderCount: orders.length,
    revenue,
    uniqueCustomers,
    uniqueShops,
    delivered,
    cancelled,
    basket,
  };
}

export type AdminAnalyticsKpis = ReturnType<typeof aggregateOrderMetrics> & {
  period: AdminAnalyticsPeriodKey;
  previous: ReturnType<typeof aggregateOrderMetrics>;
};

export function getAdminAnalyticsKpis(period: AdminAnalyticsPeriodKey): AdminAnalyticsKpis {
  const { start, end } = getAnalyticsPeriodBounds(period);
  const prev = getPreviousAnalyticsPeriodBounds(period);
  const current = filterOrdersByTimeRange(MOCK_ADMIN_PLATFORM_ORDERS, start, end);
  const previousOrders = filterOrdersByTimeRange(MOCK_ADMIN_PLATFORM_ORDERS, prev.start, prev.end);
  return {
    period,
    ...aggregateOrderMetrics(current),
    previous: aggregateOrderMetrics(previousOrders),
  };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function formatAnalyticsDelta(current: number, previous: number): { text: string; positive: boolean | null } {
  const p = pctChange(current, previous);
  if (p === null) return { text: "—", positive: null };
  if (p === 0) return { text: "0 %", positive: null };
  return { text: `${p > 0 ? "+" : ""}${p} %`, positive: p > 0 };
}

/**
 * Série pour le graphique : même fenêtre temporelle que les KPIs (7j / 30j / 90j),
 * découpée en segments pour rester lisible (7, 10 ou 13 points).
 */
export function getAdminAnalyticsChartSeries(
  period: AdminAnalyticsPeriodKey,
  orders: AdminPlatformOrder[] = MOCK_ADMIN_PLATFORM_ORDERS,
): AdminAnalyticsDayPoint[] {
  const { start, end } = getAnalyticsPeriodBounds(period);
  const segments = period === "7d" ? 7 : period === "30d" ? 10 : 13;
  const span = Math.max(1, end - start);
  const w = span / segments;

  const points: AdminAnalyticsDayPoint[] = [];
  for (let i = 0; i < segments; i++) {
    const a = Math.floor(start + i * w);
    const b = i === segments - 1 ? end : Math.floor(start + (i + 1) * w - 1);
    const bucketOrders = filterOrdersByTimeRange(orders, a, b);
    const nonCancelled = bucketOrders.filter((o) => o.status !== "cancelled");
    const revenue = nonCancelled.reduce((s, o) => s + o.total, 0);
    const uniqueCustomers = new Set(bucketOrders.map((o) => o.customerPhone.replace(/\s/g, ""))).size;

    const drillFrom = new Date(a).toISOString().slice(0, 10);
    const drillTo = new Date(b).toISOString().slice(0, 10);
    const da = new Date(a);
    const db = new Date(b);
    /** Court sur l’axe (évite chevauchement) ; tooltip / liens gardent la même chaîne lisible. */
    const compact = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    const label =
      segments <= 8
        ? da.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
        : `${compact(da)}–${compact(db)}`;

    points.push({
      dateKey: `${drillFrom}_${drillTo}`,
      label,
      orders: bucketOrders.length,
      revenue,
      uniqueCustomers,
      drillFrom,
      drillTo,
    });
  }
  return points;
}

/** Lien drill-down vers la liste commandes (filtre date inclusive). */
export function adminOrdersDrilldownHref(drillFrom: string, drillTo: string): string {
  const q = new URLSearchParams({ from: drillFrom, to: drillTo });
  return `/admin/orders?${q.toString()}`;
}

export function adminOrdersShopDrilldownHref(shopSlug: string, period: AdminAnalyticsPeriodKey): string {
  const q = new URLSearchParams({ shop: shopSlug, period });
  return `/admin/orders?${q.toString()}`;
}

/** Délai moyen création → dernière maj (commandes terminées / annulées), en heures. */
export function getAvgOrderProcessingHours(orders: AdminPlatformOrder[]): number | null {
  const terminal = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");
  if (terminal.length === 0) return null;
  let sum = 0;
  let n = 0;
  for (const o of terminal) {
    const c = orderTime(o.createdAt);
    const u = orderTime(o.updatedAt);
    if (u >= c) {
      sum += (u - c) / 3_600_000;
      n += 1;
    }
  }
  if (n === 0) return null;
  return Math.round((sum / n) * 10) / 10;
}

/** Métriques « produit » encore mockées (trafic, rétention…) — à brancher sur tracking / DB. */
export function getMockExtendedPlatformMetrics(period: AdminAnalyticsPeriodKey) {
  const mult = period === "7d" ? 0.28 : period === "30d" ? 1 : 2.85;
  return {
    vitrineViews: Math.round(12_800 * mult),
    trackedLinkClicks: Math.round(7_650 * mult),
    newSignups: Math.max(1, Math.round(16 * mult)),
    merchantRetentionPct: 76,
    subscriptionChurnPct: 3.8,
  };
}

export function getTopShopsByRevenue(
  orders: AdminPlatformOrder[],
  limit = 8,
): AdminAnalyticsTopShop[] {
  const map = new Map<string, { shopName: string; orders: number; revenue: number }>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const cur = map.get(o.shopSlug) ?? { shopName: o.shopName, orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += o.total;
    cur.shopName = o.shopName;
    map.set(o.shopSlug, cur);
  }
  return [...map.entries()]
    .map(([shopSlug, v]) => ({
      shopSlug,
      shopName: v.shopName,
      orders: v.orders,
      revenue: v.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getOrderStatusDistribution(orders: AdminPlatformOrder[]): Record<OrderStatus, number> {
  const init: Record<OrderStatus, number> = {
    new: 0,
    confirmed: 0,
    preparing: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    init[o.status] += 1;
  }
  return init;
}

export function adminAnalyticsSummaryCsv(period: AdminAnalyticsPeriodKey): string {
  const k = getAdminAnalyticsKpis(period);
  const periodOrders = ordersInAnalyticsPeriod(period);
  const top = getTopShopsByRevenue(periodOrders);
  const ext = getMockExtendedPlatformMetrics(period);
  const procH = getAvgOrderProcessingHours(periodOrders);
  const lines = [
    "Indicateur,Valeur",
    `Période,${period}`,
    `Commandes,${k.orderCount}`,
    `CA hors annulées FCFA,${k.revenue}`,
    `Clients uniques (tél.),${k.uniqueCustomers}`,
    `Boutiques actives (cmd),${k.uniqueShops}`,
    `Panier moyen FCFA,${k.basket}`,
    `Délai moyen traitement (h) terminées/annulées,${procH ?? "—"}`,
    "",
    "Métrique plateforme (démo),Valeur",
    `Vues vitrine,${ext.vitrineViews}`,
    `Clics liens trackés,${ext.trackedLinkClicks}`,
    `Nouvelles inscriptions,${ext.newSignups}`,
    `Rétention commerçants %,${ext.merchantRetentionPct}`,
    `Churn abonnements %,${ext.subscriptionChurnPct}`,
    "",
    "Boutique,Slug,Commandes,CA FCFA",
    ...top.map((t) => `${t.shopName},${t.shopSlug},${t.orders},${t.revenue}`),
  ];
  return lines.join("\n");
}

export function getPlatformContextStats() {
  const shops = getAdminShopKpis(MOCK_ADMIN_SHOPS);
  const merchants = getAdminMerchantKpis();
  const cities = getAdminCityStats(MOCK_ADMIN_SHOPS);
  return { shops, merchants, cities };
}

export function channelSplit(orders: AdminPlatformOrder[]): { whatsapp: number; store_link: number } {
  let whatsapp = 0;
  let store_link = 0;
  for (const o of orders) {
    if (o.channel === "whatsapp") whatsapp += 1;
    else store_link += 1;
  }
  return { whatsapp, store_link };
}
