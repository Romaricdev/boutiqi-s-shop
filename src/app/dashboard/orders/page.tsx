"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  MapPin,
  Phone,
  Filter,
  CircleCheck,
  CircleDashed,
  Package,
  Truck as TruckIcon,
  Ban,
  Eye,
  X,
  MoreHorizontal,
} from "lucide-react";

import { useDashboardStore } from "@/lib/store/dashboard";
import { ORDER_NEXT_STATUS } from "@/lib/utils/order-status";
import { ORDER_STATUS_LABELS, type OrderStatus, type DashboardOrder } from "@/lib/types/dashboard";
import { cn } from "@/lib/cn";

type ViewMode = "cards" | "table";
type SortMode = "recent" | "oldest" | "amount-desc" | "amount-asc";
type DeliveryFilter = "" | "delivery" | "pickup";

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
  const { orders, updateOrderStatus } = useDashboardStore();
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>("");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [recapOrderId, setRecapOrderId] = useState<string | null>(null);

  const statusCounts = useMemo(() => {
    const map = new Map<OrderStatus, number>();
    orders.forEach((o) => map.set(o.status, (map.get(o.status) ?? 0) + 1));
    return map;
  }, [orders]);

  const deliveryCounts = useMemo(() => {
    return {
      delivery: orders.filter((o) => o.deliveryType === "delivery").length,
      pickup: orders.filter((o) => o.deliveryType === "pickup").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = orders
      .filter((o) => (!statusFilter ? true : o.status === statusFilter))
      .filter((o) => (!deliveryFilter ? true : o.deliveryType === deliveryFilter))
      .filter((o) => {
        if (!q) return true;
        return (
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.items.some((i) => i.productName.toLowerCase().includes(q))
        );
      });

    const sorted = [...list];
    if (sortMode === "recent") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortMode === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortMode === "amount-desc") {
      sorted.sort((a, b) => b.total - a.total);
    } else {
      sorted.sort((a, b) => a.total - b.total);
    }
    return sorted;
  }, [orders, statusFilter, deliveryFilter, query, sortMode]);

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

  const selectedOrders = useMemo(
    () => orders.filter((o) => selectedIds.includes(o.id)),
    [orders, selectedIds],
  );
  const recapOrder = useMemo(
    () => orders.find((o) => o.id === recapOrderId) ?? null,
    [orders, recapOrderId],
  );

  const canBulkDeliver = selectedOrders.some((o) => ORDER_NEXT_STATUS[o.status]?.includes("delivered"));
  const canBulkCancel = selectedOrders.some((o) => ORDER_NEXT_STATUS[o.status]?.includes("cancelled"));

  const resetFilters = () => {
    setStatusFilter("");
    setDeliveryFilter("");
    setQuery("");
    setSortMode("recent");
  };

  const toggleSelection = (orderId: string) => {
    setSelectedIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
    );
  };

  const selectAllFiltered = () => {
    setSelectedIds(filteredOrders.map((o) => o.id));
  };

  const clearSelection = () => setSelectedIds([]);

  const applyBulkStatus = (to: OrderStatus) => {
    selectedOrders.forEach((order) => {
      if (ORDER_NEXT_STATUS[order.status]?.includes(to)) {
        updateOrderStatus(order.id, to);
      }
    });
    clearSelection();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-warm-900 lg:text-2xl">Commandes</h1>
          <p className="mt-0.5 text-sm text-warm-500">Suivi, tri et actions rapides sur vos commandes.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-500">
          <span className="font-semibold text-warm-800">{orders.length}</span> total
          <span className="text-warm-300">|</span>
          <span className="font-semibold text-amber-600">{pendingCount}</span> en cours
          <span className="text-warm-300">|</span>
          <span className="font-semibold text-green-600">{statusCounts.get("delivered") ?? 0}</span> livrées
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Résultats" value={`${filteredOrders.length}`} sub="commandes filtrées" />
        <SummaryCard label="CA filtré" value={`${totalRevenue.toLocaleString()} F`} sub="hors annulées" accent="text-brand-700" />
        <SummaryCard label="Livraison" value={`${deliveryCounts.delivery}`} sub="à domicile" />
        <SummaryCard label="Retrait" value={`${deliveryCounts.pickup}`} sub="sur place" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="space-y-3 lg:col-span-3">
          <div className="rounded-lg border border-warm-200 bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-warm-500">
              <Filter className="size-3.5" />
              Filtres
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-warm-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher client, id, produit…"
                className="h-9 w-full rounded-lg border border-warm-200 bg-warm-50/60 pl-8 pr-3 text-xs text-warm-900 outline-none placeholder:text-warm-400 focus:border-brand-400 focus:bg-white focus:ring-1 focus:ring-brand-400/20"
              />
            </div>

            <div className="mt-3 space-y-1">
              <FilterButton
                active={statusFilter === ""}
                label="Tous les statuts"
                count={orders.length}
                onClick={() => setStatusFilter("")}
              />
              {ALL_STATUSES.map((s) => (
                <FilterButton
                  key={s}
                  active={statusFilter === s}
                  label={ORDER_STATUS_LABELS[s]}
                  count={statusCounts.get(s) ?? 0}
                  onClick={() => setStatusFilter(s)}
                />
              ))}
            </div>

            <div className="my-3 border-t border-warm-100" />

            <div className="space-y-1">
              <FilterButton
                active={deliveryFilter === ""}
                label="Tous les types"
                count={orders.length}
                onClick={() => setDeliveryFilter("")}
              />
              <FilterButton
                active={deliveryFilter === "delivery"}
                label="Livraison"
                count={deliveryCounts.delivery}
                onClick={() => setDeliveryFilter("delivery")}
              />
              <FilterButton
                active={deliveryFilter === "pickup"}
                label="Retrait"
                count={deliveryCounts.pickup}
                onClick={() => setDeliveryFilter("pickup")}
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 w-full rounded-md border border-warm-200 px-3 py-2 text-xs font-medium text-warm-600 transition hover:bg-warm-50"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </aside>

        <section className="space-y-3 lg:col-span-9">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-warm-500">
              <span className="font-semibold text-warm-800">{filteredOrders.length}</span>
              résultat{filteredOrders.length > 1 ? "s" : ""}
              {selectedIds.length > 0 && (
                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  {selectedIds.length} sélectionnée{selectedIds.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="h-8 rounded-md border border-warm-200 bg-white px-2 text-xs text-warm-700 outline-none focus:border-brand-400"
              >
                <option value="recent">Plus récentes</option>
                <option value="oldest">Plus anciennes</option>
                <option value="amount-desc">Montant décroissant</option>
                <option value="amount-asc">Montant croissant</option>
              </select>

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
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/50 p-2.5">
              <button
                type="button"
                onClick={selectAllFiltered}
                className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-warm-700 hover:bg-warm-50"
              >
                Tout sélectionner
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-warm-700 hover:bg-warm-50"
              >
                Effacer
              </button>
              {canBulkDeliver && (
                <button
                  type="button"
                  onClick={() => applyBulkStatus("delivered")}
                  className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700"
                >
                  Marquer livrées
                </button>
              )}
              {canBulkCancel && (
                <button
                  type="button"
                  onClick={() => applyBulkStatus("cancelled")}
                  className="rounded-md bg-warm-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-warm-800"
                >
                  Annuler
                </button>
              )}
            </div>
          )}

          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-warm-200 bg-white py-16 text-center">
              <div className="grid size-14 place-items-center rounded-xl bg-warm-100">
                <ShoppingBag className="size-7 text-warm-300" />
              </div>
              <p className="mt-4 text-sm font-semibold text-warm-700">Aucune commande</p>
              <p className="mt-1 max-w-xs text-xs text-warm-500">
                {statusFilter || deliveryFilter
                  ? "Aucune commande pour les filtres sélectionnés."
                  : query
                    ? "Aucune commande ne correspond à votre recherche."
                    : "Les commandes de vos clients apparaîtront ici."}
              </p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  selected={selectedIds.includes(order.id)}
                  onToggleSelect={() => toggleSelection(order.id)}
                  onStatusChange={(to) => updateOrderStatus(order.id, to)}
                  onOpenRecap={() => setRecapOrderId(order.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-warm-200 bg-white">
              <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-warm-100 bg-warm-50/60 text-[11px] uppercase tracking-wide text-warm-400">
                    <th className="w-10 py-2.5 pl-4 pr-2 font-medium">
                      <input
                        type="checkbox"
                        className="size-3.5 rounded border-warm-300"
                        checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                        onChange={(e) => (e.target.checked ? selectAllFiltered() : clearSelection())}
                      />
                    </th>
                    <th className="py-2.5 pl-1 pr-2 font-medium">Commande</th>
                    <th className="px-2 py-2.5 font-medium">Client</th>
                    <th className="px-2 py-2.5 font-medium">Articles</th>
                    <th className="px-2 py-2.5 font-medium">Type</th>
                    <th className="px-2 py-2.5 text-center font-medium">Statut</th>
                    <th className="px-2 py-2.5 text-right font-medium">Montant</th>
                    <th className="py-2.5 pl-2 pr-4 text-right font-medium">Date</th>
                    <th className="w-[90px] py-2.5 pl-2 pr-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {filteredOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      selected={selectedIds.includes(order.id)}
                      onToggleSelect={() => toggleSelection(order.id)}
                      onStatusChange={(to) => updateOrderStatus(order.id, to)}
                      onOpenRecap={() => setRecapOrderId(order.id)}
                    />
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
      <OrderRecapModal order={recapOrder} onClose={() => setRecapOrderId(null)} />
    </div>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition",
        active ? "bg-brand-50/70 font-semibold text-brand-700" : "text-warm-700 hover:bg-warm-50",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[11px] font-semibold",
          active ? "bg-brand-100 text-brand-700" : "bg-warm-100 text-warm-500",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  accent = "text-warm-900",
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
}) {
  return (
    <div className="flex min-h-[124px] flex-col justify-between rounded-lg border border-warm-200 bg-white px-4 py-3">
      <p className="text-xs font-medium text-warm-500">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold leading-none", accent)}>{value}</p>
      <p className="text-[11px] text-warm-500">{sub}</p>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const st = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
        st.bg,
        st.text,
      )}
    >
      {st.icon}
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

function OrderActions({
  order,
  onStatusChange,
  onOpenRecap,
}: {
  order: DashboardOrder;
  onStatusChange: (to: OrderStatus) => void;
  onOpenRecap: () => void;
}) {
  const nextStatuses = ORDER_NEXT_STATUS[order.status] ?? [];
  const whatsappHref = `https://wa.me/237${order.customerPhone.replace(/\D/g, "")}`;
  const actionMeta: Record<OrderStatus, { icon: React.ReactNode; tone: string }> = {
    new: { icon: <CircleDashed className="size-3.5" />, tone: "text-amber-700 hover:bg-amber-50" },
    confirmed: { icon: <CircleCheck className="size-3.5" />, tone: "text-blue-700 hover:bg-blue-50" },
    preparing: { icon: <Package className="size-3.5" />, tone: "text-orange-700 hover:bg-orange-50" },
    delivering: { icon: <TruckIcon className="size-3.5" />, tone: "text-brand-700 hover:bg-brand-50" },
    delivered: { icon: <CircleCheck className="size-3.5" />, tone: "text-green-700 hover:bg-green-50" },
    cancelled: { icon: <Ban className="size-3.5" />, tone: "text-warm-600 hover:bg-warm-100" },
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {nextStatuses.slice(0, 2).map((to) => (
        <span key={to} className="group/action relative inline-flex">
          <button
            type="button"
            onClick={() => onStatusChange(to)}
            title={ORDER_STATUS_LABELS[to]}
            aria-label={ORDER_STATUS_LABELS[to]}
            className={cn(
              "grid size-7 place-items-center rounded-md border border-warm-200 bg-white transition",
              actionMeta[to].tone,
            )}
          >
            {actionMeta[to].icon}
          </button>
          <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-warm-200 bg-white px-2 py-1 text-[10px] font-semibold text-warm-700 opacity-0 shadow-sm transition duration-150 group-hover/action:opacity-100 group-focus-within/action:opacity-100">
            {ORDER_STATUS_LABELS[to]}
          </span>
        </span>
      ))}
      <span className="group/action relative inline-flex">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          title="Contacter sur WhatsApp"
          aria-label="Contacter sur WhatsApp"
          className="grid size-7 place-items-center rounded-md border border-brand-200 bg-brand-50 text-brand-700 transition hover:bg-brand-100"
        >
          <Phone className="size-3.5" />
        </a>
        <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-warm-200 bg-white px-2 py-1 text-[10px] font-semibold text-warm-700 opacity-0 shadow-sm transition duration-150 group-hover/action:opacity-100 group-focus-within/action:opacity-100">
          WhatsApp
        </span>
      </span>
      <span className="group/action relative inline-flex">
        <button
          type="button"
          onClick={onOpenRecap}
          title="Voir récapitulatif"
          aria-label="Voir récapitulatif"
          className="grid size-7 place-items-center rounded-md border border-warm-200 bg-white text-warm-700 transition hover:bg-warm-50"
        >
          <Eye className="size-3.5" />
        </button>
        <span className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-warm-200 bg-white px-2 py-1 text-[10px] font-semibold text-warm-700 opacity-0 shadow-sm transition duration-150 group-hover/action:opacity-100 group-focus-within/action:opacity-100">
          Récapitulatif
        </span>
      </span>
    </div>
  );
}

function OrderCard({
  order,
  selected,
  onToggleSelect,
  onStatusChange,
  onOpenRecap,
}: {
  order: DashboardOrder;
  selected: boolean;
  onToggleSelect: () => void;
  onStatusChange: (to: OrderStatus) => void;
  onOpenRecap: () => void;
}) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="rounded-lg border border-warm-200 bg-white transition hover:border-brand-200 hover:shadow-sm">
      <div className="flex items-center justify-between border-b border-warm-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="size-3.5 rounded border-warm-300"
          />
          <OrderStatusBadge status={order.status} />
        </div>
        <span className="font-mono text-[11px] text-warm-400">#{order.id.slice(-6)}</span>
      </div>

      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-warm-900">{order.customerName}</span>
          <span className="text-sm font-bold text-warm-900">{order.total.toLocaleString()} F</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-warm-500">
          <span>{order.customerPhone}</span>
          <span className="text-warm-300">•</span>
          <span>{order.deliveryType === "delivery" ? "Livraison" : "Retrait"}</span>
          <span className="text-warm-300">•</span>
          <span>{itemCount} art.</span>
          {order.address && (
            <>
              <span className="text-warm-300">•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                <span className="truncate">{order.address}</span>
              </span>
            </>
          )}
        </div>
        <OrderActions order={order} onStatusChange={onStatusChange} onOpenRecap={onOpenRecap} />
      </div>

      <div className="flex items-center justify-between border-t border-warm-100 px-4 py-2">
        <span className="text-[11px] text-warm-400">
          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <Link href={`/dashboard/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
          Détails <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  selected,
  onToggleSelect,
  onStatusChange,
  onOpenRecap,
}: {
  order: DashboardOrder;
  selected: boolean;
  onToggleSelect: () => void;
  onStatusChange: (to: OrderStatus) => void;
  onOpenRecap: () => void;
}) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <tr className="group transition hover:bg-warm-50/50">
      <td className="py-3 pl-4 pr-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="size-3.5 rounded border-warm-300"
        />
      </td>
      <td className="py-3 pl-1 pr-2">
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
        <span className="text-xs text-warm-600">{order.deliveryType === "delivery" ? "Livraison" : "Retrait"}</span>
      </td>
      <td className="px-2 py-3 text-center">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-2 py-3 text-right">
        <span className="text-sm font-semibold text-warm-900">{order.total.toLocaleString()} F</span>
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <div className="text-xs text-warm-500">
          {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </div>
        <div className="text-[10px] text-warm-400">
          {new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <OrderActionsMenu
          order={order}
          onStatusChange={onStatusChange}
          onOpenRecap={onOpenRecap}
        />
      </td>
    </tr>
  );
}

function OrderActionsMenu({
  order,
  onStatusChange,
  onOpenRecap,
}: {
  order: DashboardOrder;
  onStatusChange: (to: OrderStatus) => void;
  onOpenRecap: () => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; up: boolean }>({
    top: 0,
    left: 0,
    up: false,
  });
  const nextStatuses = ORDER_NEXT_STATUS[order.status] ?? [];
  const whatsappHref = `https://wa.me/237${order.customerPhone.replace(/\D/g, "")}`;

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 180;
      const estimatedMenuHeight = 180;
      const gap = 8;

      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

      const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
      const top = openUp ? rect.top - gap : rect.bottom + gap;

      setMenuPos({ top, left, up: openUp });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Afficher les actions"
        onClick={() => setOpen((v) => !v)}
        className="grid size-8 place-items-center rounded-md border border-warm-200 bg-white text-warm-600 transition hover:bg-warm-50"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-10" aria-label="Fermer le menu actions" onClick={() => setOpen(false)} />
          <div
            className={cn(
              "fixed z-20 min-w-[180px] rounded-lg border border-warm-200 bg-white p-1.5 shadow-lg",
              menuPos.up && "-translate-y-full",
            )}
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              type="button"
              onClick={() => {
                onOpenRecap();
                setOpen(false);
              }}
              className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium text-warm-700 hover:bg-warm-50"
            >
              Voir le récapitulatif
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center rounded-md px-2.5 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              Contacter sur WhatsApp
            </a>

            {nextStatuses.length > 0 && <div className="my-1 border-t border-warm-100" />}

            {nextStatuses.map((to) => (
              <button
                key={to}
                type="button"
                onClick={() => {
                  onStatusChange(to);
                  setOpen(false);
                }}
                className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium text-warm-700 hover:bg-warm-50"
              >
                {ORDER_STATUS_LABELS[to]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OrderRecapModal({ order, onClose }: { order: DashboardOrder | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!order) return null;
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Récapitulatif commande ${order.id}`}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-warm-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-warm-100 bg-white px-4 py-3">
          <div>
            <p className="text-xs text-warm-500">Commande</p>
            <p className="font-mono text-sm font-semibold text-warm-900">#{order.id.slice(-6)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md border border-warm-200 text-warm-500 hover:bg-warm-50"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBlock label="Client" value={order.customerName} sub={order.customerPhone} />
            <InfoBlock
              label="Statut"
              value={ORDER_STATUS_LABELS[order.status]}
              sub={new Date(order.updatedAt).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <InfoBlock label="Type" value={order.deliveryType === "delivery" ? "Livraison" : "Retrait"} />
            <InfoBlock
              label="Date"
              value={new Date(order.createdAt).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </div>

          {order.address && (
            <div className="rounded-lg border border-warm-100 bg-warm-50/60 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-warm-500">Adresse</p>
              <p className="mt-1 text-sm text-warm-800">{order.address}</p>
            </div>
          )}

          {order.note && (
            <div className="rounded-lg border border-warm-100 bg-warm-50/60 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-warm-500">Note client</p>
              <p className="mt-1 text-sm text-warm-800">{order.note}</p>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-warm-200">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-warm-100 bg-warm-50/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-warm-500">
              <span>Article</span>
              <span className="text-right">Qté</span>
              <span className="text-right">Sous-total</span>
            </div>
            <div className="divide-y divide-warm-100 bg-white">
              {order.items.map((item, i) => (
                <div key={`${item.productName}-${i}`} className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-warm-900">{item.productName}</p>
                    <p className="text-xs text-warm-500">{item.productPrice.toLocaleString()} F / unité</p>
                  </div>
                  <span className="self-center text-right font-medium text-warm-700">{item.quantity}</span>
                  <span className="self-center text-right font-semibold text-warm-900">{item.subtotal.toLocaleString()} F</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5">
            <span className="text-sm font-semibold text-brand-800">Total commande</span>
            <span className="text-lg font-bold text-brand-800">{order.total.toLocaleString()} F</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function InfoBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-warm-100 bg-warm-50/60 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-warm-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-warm-900">{value}</p>
      {sub ? <p className="text-xs text-warm-500">{sub}</p> : null}
    </div>
  );
}
