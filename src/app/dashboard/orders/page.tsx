"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  LayoutGrid,
  List,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ChevronRight,
} from "lucide-react";

import { useDashboardStore } from "@/lib/store/dashboard";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
  type DashboardOrder,
} from "@/lib/types/dashboard";
import { cn } from "@/lib/cn";

type ViewMode = "cards" | "table";

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  new: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", icon: <Clock className="size-3.5" /> },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", icon: <CheckCircle2 className="size-3.5" /> },
  preparing: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", icon: <ShoppingBag className="size-3.5" /> },
  delivering: { bg: "bg-brand-50", text: "text-brand-700", dot: "bg-brand-500", icon: <Truck className="size-3.5" /> },
  delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", icon: <PackageCheck className="size-3.5" /> },
  cancelled: { bg: "bg-warm-100", text: "text-warm-500", dot: "bg-warm-400", icon: <XCircle className="size-3.5" /> },
};

const ALL_STATUSES: OrderStatus[] = ["new", "confirmed", "preparing", "delivering", "delivered", "cancelled"];

export default function DashboardOrdersPage() {
  const { orders } = useDashboardStore();
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const statusCounts = useMemo(() => {
    const map = new Map<OrderStatus, number>();
    orders.forEach((o) => map.set(o.status, (map.get(o.status) ?? 0) + 1));
    return map;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => (!statusFilter ? true : o.status === statusFilter))
      .filter((o) => {
        if (!q) return true;
        return (
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.items.some((i) => i.productName.toLowerCase().includes(q))
        );
      });
  }, [orders, statusFilter, query]);

  const totalRevenue = useMemo(
    () => filteredOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
    [filteredOrders],
  );

  const pendingCount = useMemo(
    () =>
      (statusCounts.get("new") ?? 0) +
      (statusCounts.get("confirmed") ?? 0) +
      (statusCounts.get("preparing") ?? 0) +
      (statusCounts.get("delivering") ?? 0),
    [statusCounts],
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-warm-900 lg:text-2xl">Commandes</h1>
          <p className="mt-0.5 text-sm text-warm-500">
            Suivi et gestion de vos commandes clients
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-500">
          <span className="font-semibold text-warm-800">{orders.length}</span> total
          <span className="text-warm-300">|</span>
          <span className="font-semibold text-amber-600">{pendingCount}</span> en cours
          <span className="text-warm-300">|</span>
          <span className="font-semibold text-green-600">{statusCounts.get("delivered") ?? 0}</span> livrées
        </div>
      </div>

      {/* Layout : sidebar filtres + contenu */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* ── Sidebar filtres ── */}
        <aside className="lg:col-span-3">
          <div className="rounded-lg border border-warm-200 bg-white">
            {/* KPI summary */}
            <div className="grid grid-cols-2 gap-px border-b border-warm-200 bg-warm-200">
              <div className="bg-white px-4 py-4">
                <div className="text-2xl font-bold text-warm-900">{filteredOrders.length}</div>
                <div className="mt-0.5 text-[11px] font-medium text-warm-400">Commandes</div>
              </div>
              <div className="bg-white px-4 py-4">
                <div className="text-lg font-bold text-brand-600">{totalRevenue.toLocaleString()}<span className="text-sm font-semibold"> F</span></div>
                <div className="mt-0.5 text-[11px] font-medium text-warm-400">Chiffre</div>
              </div>
            </div>

            {/* Search */}
            <div className="border-b border-warm-100 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-warm-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  className="h-9 w-full rounded-lg border border-warm-200 bg-warm-50/60 pl-8 pr-3 text-xs text-warm-900 outline-none placeholder:text-warm-400 focus:border-brand-400 focus:bg-white focus:ring-1 focus:ring-brand-400/20"
                />
              </div>
            </div>

            {/* Status list */}
            <nav className="p-2">
              <button
                type="button"
                onClick={() => setStatusFilter("")}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition",
                  statusFilter === ""
                    ? "bg-brand-50/70 font-semibold text-brand-700"
                    : "text-warm-700 hover:bg-warm-50",
                )}
              >
                <span>Toutes les commandes</span>
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                  statusFilter === "" ? "bg-brand-100 text-brand-700" : "bg-warm-100 text-warm-500",
                )}>
                  {orders.length}
                </span>
              </button>

              <div className="my-1.5 border-t border-warm-100" />

              {ALL_STATUSES.map((s) => {
                const st = STATUS_STYLES[s];
                const count = statusCounts.get(s) ?? 0;
                const isActive = statusFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition",
                      isActive
                        ? "bg-brand-50/70 font-semibold text-brand-700"
                        : "text-warm-700 hover:bg-warm-50",
                    )}
                  >
                    <span className={cn("grid size-6 place-items-center rounded-md", st.bg, st.text)}>
                      {st.icon}
                    </span>
                    <span className="flex-1">{ORDER_STATUS_LABELS[s]}</span>
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                      isActive ? "bg-brand-100 text-brand-700" : "bg-warm-100 text-warm-500",
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Zone principale ── */}
        <section className="space-y-3 lg:col-span-9">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-warm-500">
              <span className="font-semibold text-warm-800">{filteredOrders.length}</span>{" "}
              résultat{filteredOrders.length > 1 ? "s" : ""}
              {statusFilter && (
                <span className="ml-2">
                  &middot;{" "}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("")}
                    className="font-medium text-brand-600 hover:underline"
                  >
                    Réinitialiser
                  </button>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-warm-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={cn(
                  "grid size-7 place-items-center rounded-md transition",
                  viewMode === "cards" ? "bg-warm-900 text-white" : "text-warm-400 hover:text-warm-600",
                )}
                title="Vue cartes"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "grid size-7 place-items-center rounded-md transition",
                  viewMode === "table" ? "bg-warm-900 text-white" : "text-warm-400 hover:text-warm-600",
                )}
                title="Vue tableau"
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-warm-200 bg-white py-16 text-center">
              <div className="grid size-14 place-items-center rounded-xl bg-warm-100">
                <ShoppingBag className="size-7 text-warm-300" />
              </div>
              <p className="mt-4 text-sm font-semibold text-warm-700">Aucune commande</p>
              <p className="mt-1 max-w-xs text-xs text-warm-500">
                {statusFilter
                  ? "Aucune commande avec ce statut."
                  : query
                    ? "Aucune commande ne correspond à votre recherche."
                    : "Les commandes de vos clients apparaîtront ici."}
              </p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-warm-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-warm-100 bg-warm-50/60 text-[11px] uppercase tracking-wide text-warm-400">
                    <th className="py-2.5 pl-4 pr-2 font-medium">Commande</th>
                    <th className="px-2 py-2.5 font-medium">Client</th>
                    <th className="px-2 py-2.5 font-medium">Articles</th>
                    <th className="px-2 py-2.5 font-medium">Type</th>
                    <th className="px-2 py-2.5 text-center font-medium">Statut</th>
                    <th className="px-2 py-2.5 text-right font-medium">Montant</th>
                    <th className="py-2.5 pl-2 pr-4 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {filteredOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function OrderCard({ order }: { order: DashboardOrder }) {
  const st = STATUS_STYLES[order.status];
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="group flex flex-col rounded-lg border border-warm-200 bg-white transition hover:border-brand-200 hover:shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-warm-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("grid size-6 place-items-center rounded-md", st.bg, st.text)}>
            {st.icon}
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-wide", st.text)}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
        <span className="font-mono text-[11px] text-warm-400">#{order.id.slice(-6)}</span>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-warm-900">{order.customerName}</span>
          <span className="text-sm font-bold text-warm-900">{order.total.toLocaleString()} F</span>
        </div>

        {/* Items */}
        <div className="mt-2 space-y-1">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs text-warm-500">
              <span className="truncate">
                {item.productName}{" "}
                <span className="text-warm-400">&times;{item.quantity}</span>
              </span>
              <span className="shrink-0 tabular-nums text-warm-600">
                {item.subtotal.toLocaleString()} F
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-[10px] font-medium text-warm-400">
              +{order.items.length - 3} autre{order.items.length - 3 > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-warm-100 px-4 py-2">
        <div className="flex items-center gap-2 text-[11px] text-warm-400">
          <span>
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-warm-200">|</span>
          <span>{order.deliveryType === "delivery" ? "Livraison" : "Retrait"}</span>
          <span className="text-warm-200">|</span>
          <span>{itemCount} art.</span>
        </div>
        <ChevronRight className="size-3.5 text-warm-300 transition group-hover:text-brand-500" />
      </div>
    </Link>
  );
}

function OrderRow({ order }: { order: DashboardOrder }) {
  const st = STATUS_STYLES[order.status];
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <tr className="group transition hover:bg-warm-50/50">
      <td className="py-3 pl-4 pr-2">
        <Link href={`/dashboard/orders/${order.id}`} className="group-hover:text-brand-600">
          <span className="font-mono text-xs font-semibold text-warm-700">#{order.id.slice(-6)}</span>
        </Link>
      </td>
      <td className="px-2 py-3">
        <Link href={`/dashboard/orders/${order.id}`}>
          <div className="text-sm font-medium text-warm-900">{order.customerName}</div>
          <div className="text-[11px] text-warm-400">{order.customerPhone}</div>
        </Link>
      </td>
      <td className="px-2 py-3">
        <div className="text-xs text-warm-600">
          {order.items.slice(0, 2).map((it) => it.productName).join(", ")}
          {order.items.length > 2 && <span className="text-warm-400"> +{order.items.length - 2}</span>}
        </div>
        <div className="text-[10px] text-warm-400">{itemCount} article{itemCount > 1 ? "s" : ""}</div>
      </td>
      <td className="px-2 py-3">
        <span className="text-xs text-warm-600">
          {order.deliveryType === "delivery" ? "Livraison" : "Retrait"}
        </span>
      </td>
      <td className="px-2 py-3 text-center">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
            st.bg,
            st.text,
          )}
        >
          {st.icon}
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </td>
      <td className="px-2 py-3 text-right">
        <span className="text-sm font-semibold text-warm-900">{order.total.toLocaleString()} F</span>
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <div className="text-xs text-warm-500">
          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          })}
        </div>
        <div className="text-[10px] text-warm-400">
          {new Date(order.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </td>
    </tr>
  );
}
