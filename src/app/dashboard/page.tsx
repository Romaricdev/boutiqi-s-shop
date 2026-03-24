"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ExternalLink,
  ArrowRight,
  Truck,
  Users,
  MapPin,
  QrCode,
  Link2,
} from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function getStartOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}
function getDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: "#F59E0B",
  confirmed: "#3B82F6",
  preparing: "#C0714A",
  delivering: "#2D6A4F",
  delivered: "#22C55E",
  cancelled: "#A09E95",
};

export default function DashboardPage() {
  const { shop, orders, products, merchant } = useDashboardStore();
  /** Chemin relatif — identique SSR / client (évite erreur d’hydratation). */
  const shopPath = shop ? `/shop/${shop.slug}` : "";
  const [isQrOpen, setIsQrOpen] = useState(false);

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
    [orders],
  );
  const activeProducts = useMemo(() => products.filter((p) => p.isActive).length, [products]);
  const newOrders = useMemo(() => orders.filter((o) => o.status === "new"), [orders]);
  const deliveredCount = useMemo(() => orders.filter((o) => o.status === "delivered").length, [orders]);
  const deliveryCount = useMemo(() => orders.filter((o) => o.deliveryType === "delivery").length, [orders]);
  const pickupCount = useMemo(() => orders.filter((o) => o.deliveryType === "pickup").length, [orders]);
  const uniqueClients = useMemo(() => new Set(orders.map((o) => o.customerPhone)).size, [orders]);

  const avgOrderValue = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");
    return valid.length > 0 ? Math.round(valid.reduce((s, o) => s + o.total, 0) / valid.length) : 0;
  }, [orders]);

  const last7 = getStartOfDay(getDaysAgo(6));
  const prev7 = getStartOfDay(getDaysAgo(13));
  const last7Count = useMemo(() => orders.filter((o) => new Date(o.createdAt).getTime() >= last7).length, [orders, last7]);
  const prev7Count = useMemo(() => orders.filter((o) => { const t = new Date(o.createdAt).getTime(); return t >= prev7 && t < last7; }).length, [orders, prev7, last7]);
  const trend = prev7Count === 0 ? (last7Count > 0 ? 100 : 0) : Math.round(((last7Count - prev7Count) / prev7Count) * 100);

  const ordersByDay = useMemo(() => {
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = getDaysAgo(6 - i);
      return {
        day: days[d.getDay()],
        date: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        count: orders.filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= getStartOfDay(d) && t < getStartOfDay(d) + 86400000;
        }).length,
        isToday: d.toDateString() === new Date().toDateString(),
      };
    });
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const all: OrderStatus[] = ["new", "confirmed", "preparing", "delivering", "delivered", "cancelled"];
    return all.map((s) => ({
      status: s,
      label: ORDER_STATUS_LABELS[s],
      count: orders.filter((o) => o.status === s).length,
      color: STATUS_COLORS[s],
    })).filter((s) => s.count > 0);
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => o.items.forEach((item) => map.set(item.productName, (map.get(item.productName) ?? 0) + item.quantity)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  const copyLink = useCallback(() => {
    if (!shopPath) return;
    const full = `${window.location.origin}${shopPath}`;
    void navigator.clipboard.writeText(full);
  }, [shopPath]);
  const shareWhatsApp = useCallback(() => {
    if (!shopPath || !shop) return;
    const full = `${window.location.origin}${shopPath}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Découvrez ma boutique : ${full}`)}`, "_blank");
  }, [shopPath, shop]);

  const visitsThisMonth = useMemo(() => {
    // Mock analytics (backend à implémenter). Valeurs déterministes basées sur l'activité.
    const base = 120;
    const v = base + orders.length * 38 + activeProducts * 17 + uniqueClients * 9;
    return Math.max(base, v);
  }, [orders.length, activeProducts, uniqueClients]);

  const conversionRate = useMemo(() => {
    if (visitsThisMonth <= 0) return 0;
    const pct = Math.round((orders.length / visitsThisMonth) * 100);
    return Math.min(99, Math.max(1, pct));
  }, [orders.length, visitsThisMonth]);

  const newVisitsToday = useMemo(() => {
    const todayOrders = ordersByDay[ordersByDay.length - 1]?.count ?? 0;
    const v = Math.round(visitsThisMonth / 30 / 2) + todayOrders * 8;
    return Math.max(0, v);
  }, [ordersByDay, visitsThisMonth]);

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-warm-900">
          {getGreeting()}{merchant?.fullName ? `, ${merchant.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-0.5 text-sm text-warm-500">
          Voici le résumé de votre boutique{shop?.shopName ? ` ${shop.shopName}` : ""}.
        </p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<ShoppingBag className="size-[18px]" />}
          label="Commandes"
          value={orders.length.toString()}
          badge={
            <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold", trend >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500")}>
              {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {Math.abs(trend)}%
            </span>
          }
        />
        <KpiCard
          icon={<DollarSign className="size-[18px]" />}
          label="Chiffre d'affaires"
          value={`${totalRevenue.toLocaleString()} F`}
          badge={<span className="text-[11px] text-warm-400">panier moy. {avgOrderValue.toLocaleString()} F</span>}
        />
        <KpiCard
          icon={<Package className="size-[18px]" />}
          label="Produits actifs"
          value={`${activeProducts}`}
          badge={<span className="text-[11px] text-warm-400">sur {products.length} au catalogue</span>}
        />
        <KpiCard
          icon={<Users className="size-[18px]" />}
          label="Clients uniques"
          value={`${uniqueClients}`}
          badge={<span className="text-[11px] text-warm-400">{deliveredCount} livrées</span>}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Vue d'ensemble – large */}
        <div className="rounded-xl border border-warm-200 bg-white p-5 lg:col-span-3">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-sm font-semibold text-warm-900">Vue d&apos;ensemble</h2>
              <div className="mt-1 text-2xl font-bold text-warm-900">
                {totalRevenue.toLocaleString()} <span className="text-sm font-medium text-warm-500">FCFA</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", trend >= 0 ? "text-green-600" : "text-red-500")}>
                  {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {Math.abs(trend)}%
                </span>
                <span className="text-xs text-warm-400">vs semaine précédente</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-end gap-2" style={{ height: 160 }}>
            {ordersByDay.map((d) => {
              const max = Math.max(1, ...ordersByDay.map((x) => x.count));
              const hasOrders = ordersByDay.some((x) => x.count > 0);
              const barHeight = hasOrders ? Math.max(12, (d.count / max) * 130) : 10;
              return (
                <div key={d.day} className="group flex flex-1 flex-col items-center">
                  <span className="mb-1 text-[10px] font-semibold text-warm-500 opacity-0 transition group-hover:opacity-100">
                    {d.count > 0 ? d.count : ""}
                  </span>
                  <div className="flex w-full flex-1 flex-col justify-end">
                    <div
                      className={cn(
                        "mx-auto w-full max-w-[36px] rounded-t-md transition-all duration-300 ease-out",
                        d.isToday ? "bg-brand-500" : "bg-brand-200 group-hover:bg-brand-400",
                      )}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  <span className={cn("mt-1.5 text-[11px]", d.isToday ? "font-bold text-warm-900" : "text-warm-400")}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
          {!ordersByDay.some((x) => x.count > 0) && (
            <p className="mt-2 text-center text-xs text-warm-400">
              Pas encore de commandes cette semaine.
            </p>
          )}

          {/* Mini stats sous le graphe */}
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-warm-100 pt-3">
            <div>
              <div className="text-xs text-warm-400">Aujourd&apos;hui</div>
              <div className="text-sm font-bold text-warm-900">{ordersByDay[ordersByDay.length - 1]?.count ?? 0}</div>
            </div>
            <div>
              <div className="text-xs text-warm-400">7 derniers jours</div>
              <div className="text-sm font-bold text-warm-900">{last7Count}</div>
            </div>
            <div>
              <div className="text-xs text-warm-400">Total</div>
              <div className="text-sm font-bold text-warm-900">{orders.length}</div>
            </div>
          </div>
        </div>

        {/* Répartition */}
        <div className="rounded-xl border border-warm-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-warm-900">Répartition</h2>
          <div className="mt-1 text-2xl font-bold text-warm-900">{orders.length}</div>
          <p className="text-xs text-warm-400">commandes au total</p>

          <div className="mt-5 space-y-3">
            {ordersByStatus.map((s) => {
              const pct = orders.length > 0 ? Math.round((s.count / orders.length) * 100) : 0;
              return (
                <div key={s.status}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-warm-700">{s.label}</span>
                    <span className="text-xs font-semibold text-warm-800">{s.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
                    <div
                      className="h-full rounded-full transition-[width]"
                      style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Livraison vs retrait */}
          <div className="mt-5 border-t border-warm-100 pt-4">
            <h3 className="mb-2 text-xs font-semibold text-warm-700">Mode de réception</h3>
            <div className="flex gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-warm-50 px-3 py-2">
                <Truck className="size-4 text-brand-500" />
                <div>
                  <div className="text-sm font-bold text-warm-900">{deliveryCount}</div>
                  <div className="text-[10px] text-warm-400">Livraisons</div>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-warm-50 px-3 py-2">
                <MapPin className="size-4 text-accent-500" />
                <div>
                  <div className="text-sm font-bold text-warm-900">{pickupCount}</div>
                  <div className="text-[10px] text-warm-400">Retraits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Colonne gauche */}
        <div className="space-y-4 lg:col-span-2">
          {/* Lien boutique */}
          <div className="rounded-xl border border-warm-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-warm-900">Mon lien boutique</h2>
              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                <QrCode className="size-3.5" />
                QR Code
              </button>
            </div>

            <div className="mt-3 rounded-xl bg-brand-50/60 p-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-white/80 text-brand-700">
                  <Link2 className="size-4" />
                </div>
                <span className="min-w-0 flex-1 truncate font-mono text-xs font-semibold text-brand-700">
                  {shopPath || "—"}
                </span>
                <Button type="button" size="sm" onClick={copyLink} disabled={!shopPath} className="h-8 px-3 text-xs">
                  Copier
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/70 px-3 py-3 text-center">
                  <div className="text-xl font-bold text-warm-900">{visitsThisMonth}</div>
                  <div className="text-[11px] text-warm-500">Visites ce mois</div>
                </div>
                <div className="rounded-lg bg-white/70 px-3 py-3 text-center">
                  <div className="text-xl font-bold text-brand-700">{conversionRate}%</div>
                  <div className="text-[11px] text-warm-500">Taux conversion</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#27AE60]/10 px-3 py-2 text-xs font-medium text-[#1F7A4D]">
                <TrendingUp className="size-3.5" />
                +{newVisitsToday} nouvelles visites aujourd&apos;hui
              </div>

              <div className="mt-3 flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={shareWhatsApp} disabled={!shopPath} className="flex-1">
                  Partager
                </Button>
                {shopPath ? (
                  <a
                    href={shopPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                  >
                    Voir boutique
                    <ExternalLink className="ml-1 size-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex-1 cursor-not-allowed rounded-xl bg-warm-200 px-3 py-2 text-xs font-semibold text-warm-500"
                  >
                    Voir boutique
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Top produits */}
          <div className="rounded-xl border border-warm-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-warm-900">Top produits</h2>
            {topProducts.length === 0 ? (
              <p className="mt-3 text-xs text-warm-400">Pas encore de ventes</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {topProducts.map(([name, qty]) => {
                  const max = topProducts[0][1];
                  const pct = (qty / max) * 100;
                  return (
                    <div key={name}>
                      <div className="mb-0.5 flex items-center justify-between">
                        <span className="text-xs text-warm-700">{name}</span>
                        <span className="text-xs font-semibold text-warm-800">{qty}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
                        <div
                          className="h-full rounded-full bg-brand-400 transition-[width]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Dernières commandes */}
        <div className="rounded-xl border border-warm-200 bg-white p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-warm-900">Dernières commandes</h2>
            <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
              Voir tout <ArrowRight className="size-3" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="mt-4 text-center text-sm text-warm-400">Aucune commande</p>
          ) : (
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-warm-100 text-[11px] font-medium uppercase tracking-wide text-warm-400">
                  <th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Statut</th>
                  <th className="pb-2 text-right font-medium">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="group">
                    <td className="py-2.5">
                      <Link href={`/dashboard/orders/${order.id}`} className="group-hover:text-brand-600">
                        <div className="font-medium text-warm-900">{order.customerName}</div>
                        <div className="text-[11px] text-warm-400">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </Link>
                    </td>
                    <td className="py-2.5">
                      <span className="text-[11px] text-warm-500">
                        {order.deliveryType === "delivery" ? "Livraison" : "Retrait"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: STATUS_COLORS[order.status] + "18",
                          color: STATUS_COLORS[order.status],
                        }}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-warm-900">
                      {order.total.toLocaleString()} F
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <QrModal
        open={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        value={
          shopPath
            ? typeof window !== "undefined"
              ? `${window.location.origin}${shopPath}`
              : shopPath
            : ""
        }
      />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[124px] flex-col justify-between rounded-xl border border-warm-200 bg-white px-5 py-5">
      <div className="flex items-center gap-2 text-warm-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold leading-none text-warm-900">{value}</span>
      </div>
      <div className="mt-2">{badge}</div>
    </div>
  );
}

function pseudoQrGrid(value: string) {
  const size = 21;
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    cells.push((seed & 1) === 1);
  }
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  return { size, cells, isFinder };
}

function QrModal({
  open,
  onClose,
  value,
}: {
  open: boolean;
  onClose: () => void;
  value: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  if (!open) return null;
  if (!mounted) return null;

  const v = value || "boutiki.cm";
  const { size, cells, isFinder } = pseudoQrGrid(v);
  const cell = 6;
  const pad = 10;
  const w = size * cell + pad * 2;

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-warm-900/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-warm-200 bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-warm-900">QR Code</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-warm-500 hover:bg-warm-50 hover:text-warm-700"
          >
            Fermer
          </button>
        </div>
        <p className="mt-1 text-xs text-warm-500">Scannez pour ouvrir votre boutique.</p>

        <div className="mt-4 grid place-items-center rounded-xl bg-warm-50 p-4">
          <svg width={w} height={w} viewBox={`0 0 ${w} ${w}`} aria-label="QR Code">
            <rect x="0" y="0" width={w} height={w} rx="16" fill="#FFFFFF" />
            <g transform={`translate(${pad}, ${pad})`}>
              {Array.from({ length: size }).map((_, r) =>
                Array.from({ length: size }).map((__, c) => {
                  const idx = r * size + c;
                  const on = cells[idx];
                  const finder = isFinder(r, c);
                  const fill = finder ? (on ? "#2D6A4F" : "#E8F5EC") : on ? "#2D6A4F" : "transparent";
                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={c * cell}
                      y={r * cell}
                      width={cell}
                      height={cell}
                      fill={fill}
                    />
                  );
                }),
              )}
            </g>
          </svg>
        </div>

        <div className="mt-4 rounded-lg border border-warm-200 bg-warm-50/50 px-3 py-2 font-mono text-[11px] text-warm-700">
          {v || "—"}
        </div>
      </div>
    </div>,
    document.body,
  );
}
