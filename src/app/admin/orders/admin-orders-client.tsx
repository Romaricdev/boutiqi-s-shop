"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  Download,
  ExternalLink,
  ListFilter,
  MapPin,
  MoreHorizontal,
  Package,
  Radio,
  Search,
  ShoppingCart,
  Store,
  Truck,
  Wallet,
  WifiOff,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Input } from "@/components/shadcn/input";
import { Separator } from "@/components/shadcn/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table";
import { cn } from "@/lib/cn";
import {
  adminOrderStatusLabel,
  adminOrdersToCsv,
  formatAdminOrderDateShort,
  formatAdminOrderDateTime,
  getAdminOrderKpis,
  MOCK_ADMIN_PLATFORM_ORDERS,
  orderMatchesDemoPeriod,
  sortAdminPlatformOrders,
  type AdminOrderChannel,
  type AdminOrderPeriod,
  type AdminOrderSortKey,
  type AdminPlatformOrder,
} from "@/lib/admin/orders";
import type { OrderStatus } from "@/lib/types/dashboard";
import { ORDER_STATUS_LABELS } from "@/lib/types/dashboard";

const PAGE_SIZE = 8;
const ALL_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "delivering",
  "delivered",
  "cancelled",
];

const STATUS_UI: Record<
  OrderStatus,
  { dot: string; icon: LucideIcon }
> = {
  new: { dot: "bg-amber-400", icon: Clock },
  confirmed: { dot: "bg-blue-400", icon: CheckCircle2 },
  preparing: { dot: "bg-orange-400", icon: Package },
  delivering: { dot: "bg-violet-500", icon: Truck },
  delivered: { dot: "bg-emerald-500", icon: CheckCircle2 },
  cancelled: { dot: "bg-neutral-400", icon: XCircle },
};

function channelLabel(c: AdminOrderChannel) {
  return c === "whatsapp" ? "WhatsApp" : "Lien";
}

function SortableTh({
  label,
  column,
  activeKey,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  column: AdminOrderSortKey;
  activeKey: AdminOrderSortKey;
  dir: "asc" | "desc";
  onSort: (k: AdminOrderSortKey) => void;
  align?: "left" | "right";
}) {
  const active = activeKey === column;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <TableHead
      className={cn(
        "h-12 text-[11px] font-semibold uppercase tracking-wider text-neutral-400",
        align === "right" && "text-right",
        column === "publicRef" && "pl-6",
      )}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-neutral-700",
          align === "right" && "ml-auto w-full flex-row-reverse justify-end",
        )}
      >
        {label}
        <Icon className={cn("size-3.5 shrink-0", !active && "opacity-35")} strokeWidth={2} />
      </button>
    </TableHead>
  );
}

function StatusCell({ status }: { status: OrderStatus }) {
  const ui = STATUS_UI[status];
  const Icon = ui.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700">
      <span className={cn("size-1.5 shrink-0 rounded-full", ui.dot)} />
      <Icon className="size-3.5 text-neutral-500" strokeWidth={2} />
      {adminOrderStatusLabel(status)}
    </span>
  );
}

export default function AdminOrdersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const apiSimulateError = searchParams.get("error") === "1";
  const urlFrom = searchParams.get("from") ?? "";
  const urlTo = searchParams.get("to") ?? "";
  const urlShop = searchParams.get("shop") ?? "";
  const hasDateDrill = Boolean(urlFrom && urlTo);
  const hasUrlShop = Boolean(urlShop);

  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<AdminOrderPeriod>("30d");
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [deliveryFilter, setDeliveryFilter] = useState<"" | "delivery" | "pickup">("");
  const [shopSlug, setShopSlug] = useState<string>("all");
  const [sortKey, setSortKey] = useState<AdminOrderSortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const shopOptions = useMemo(() => {
    const map = new Map<string, string>();
    MOCK_ADMIN_PLATFORM_ORDERS.forEach((o) => map.set(o.shopSlug, o.shopName));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "fr"));
  }, []);

  const periodFiltered = useMemo(() => {
    return MOCK_ADMIN_PLATFORM_ORDERS.filter((o) => {
      if (hasDateDrill) {
        const k = new Date(o.createdAt).toISOString().slice(0, 10);
        return k >= urlFrom && k <= urlTo;
      }
      return orderMatchesDemoPeriod(o.createdAt, period);
    });
  }, [period, hasDateDrill, urlFrom, urlTo]);

  const queryString = searchParams.toString();
  useEffect(() => {
    const sp = new URLSearchParams(queryString);
    const from = sp.get("from");
    const to = sp.get("to");
    const shop = sp.get("shop");
    const p = sp.get("period");

    if (from && to) setPeriod("all");
    else if (p === "7d" || p === "30d" || p === "90d" || p === "all") setPeriod(p);

    if (shop) setShopSlug(shop);
    else setShopSlug("all");
  }, [queryString]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return periodFiltered.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (deliveryFilter && o.deliveryType !== deliveryFilter) return false;
      if (shopSlug !== "all" && o.shopSlug !== shopSlug) return false;
      if (!q) return true;
      return (
        o.publicRef.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        o.shopName.toLowerCase().includes(q) ||
        o.shopSlug.toLowerCase().includes(q) ||
        o.merchantName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
  }, [periodFiltered, statusFilter, deliveryFilter, shopSlug, query]);

  const sorted = useMemo(() => sortAdminPlatformOrders(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  useEffect(() => {
    setPage(1);
  }, [query, period, statusFilter, deliveryFilter, shopSlug]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const onSort = useCallback(
    (key: AdminOrderSortKey) => {
      if (key === sortKey) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return;
      }
      setSortKey(key);
      const defaultDesc =
        key === "createdAt" || key === "updatedAt" || key === "total" || key === "status";
      setSortDir(defaultDesc ? "desc" : "asc");
    },
    [sortKey],
  );

  const kpis = useMemo(() => getAdminOrderKpis(filtered), [filtered]);

  const rangeLabel = useMemo(() => {
    if (sorted.length === 0) return "0 sur 0";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, sorted.length);
    return `${start}–${end} sur ${sorted.length}`;
  }, [sorted.length, page]);

  const exportCsv = useCallback(() => {
    const csv = adminOrdersToCsv(sorted);
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  const periodLabel = hasDateDrill
    ? `Plage ${urlFrom} → ${urlTo}`
    : period === "7d"
      ? "7 jours"
      : period === "30d"
        ? "30 jours"
        : period === "90d"
          ? "90 jours"
          : "Toute la période démo";

  const ordersResetHref = apiSimulateError ? "/admin/orders?error=1" : "/admin/orders";

  const replaceOrdersQuery = useCallback(
    (mutate: (q: URLSearchParams) => void) => {
      const q = new URLSearchParams(searchParams.toString());
      mutate(q);
      const s = q.toString();
      router.replace(s ? `${pathname}?${s}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const kpiCards: {
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
    accent: string;
  }[] = [
    {
      label: "Commandes",
      value: String(kpis.count),
      hint: `Période : ${periodLabel}`,
      icon: ShoppingCart,
      accent: "bg-neutral-100 text-neutral-600",
    },
    {
      label: "CA (hors annulées)",
      value: `${kpis.revenue.toLocaleString("fr-FR")} FCFA`,
      hint: "Sur la sélection filtrée",
      icon: Wallet,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "En cours",
      value: String(kpis.inProgress),
      hint: "Nouvelle → en livraison",
      icon: Truck,
      accent: "bg-violet-50 text-violet-700",
    },
    {
      label: "Annulées",
      value: String(kpis.cancelled),
      hint: "Sur la sélection",
      icon: Ban,
      accent: "bg-neutral-100 text-neutral-500",
    },
  ];

  const colSpan = 10;

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <ShoppingCart className="size-5 text-neutral-700" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Commandes</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Vue agrégée toutes boutiques : filtres, tri, export CSV. Données démo (ancrage mars 2025) — brancher l&apos;API
            admin pour le temps réel.
          </p>
          {(hasDateDrill || hasUrlShop) && (
            <div
              className="mt-3 flex flex-col gap-2 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-sky-950 sm:flex-row sm:items-center sm:justify-between"
              role="status"
            >
              <div className="flex items-start gap-2">
                <ListFilter className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
                <div>
                  <p className="font-semibold">Filtre actif (statistiques ou URL)</p>
                  <p className="text-xs opacity-90">
                    {hasDateDrill && (
                      <span>
                        Commandes créées entre <span className="font-mono tabular-nums">{urlFrom}</span> et{" "}
                        <span className="font-mono tabular-nums">{urlTo}</span>
                        {hasUrlShop ? " · " : ""}
                      </span>
                    )}
                    {hasUrlShop && (
                      <span>
                        Boutique <span className="font-medium">{urlShop}</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-9 shrink-0 rounded-xl border-sky-300 bg-white text-xs" asChild>
                <Link href={ordersResetHref}>Réinitialiser</Link>
              </Button>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              {periodFiltered.length} cmd. sur la fenêtre {periodLabel}
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              {filtered.length} après filtres
            </Badge>
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
                <p className="font-semibold">{apiSimulateError ? "Erreur réseau (simulation)" : "Flux synchronisé (démo)"}</p>
                <p className="text-xs opacity-90">
                  {apiSimulateError
                    ? "Échec de chargement — données mock. Ajoutez ?error=1 pour tester."
                    : "Prêt pour polling ou Realtime après branchement backend."}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums opacity-80">
              <Activity className="mr-1 inline size-3.5 align-text-bottom" />
              Dernière sync : {apiSimulateError ? "—" : "à l&apos;instant"}
            </span>
          </div>
        </div>
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
                <p className="text-xs text-neutral-400">{k.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader className="space-y-4 pb-4">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-950">Toutes les commandes</CardTitle>
            <CardDescription className="text-xs">
              Filtres par période (démo), statut, livraison, boutique · tri colonnes · export CSV de la vue courante.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Référence, client, téléphone, boutique, commerçant…"
                className="h-10 rounded-xl border-neutral-200 bg-neutral-50/50 pl-9 text-sm"
              />
            </div>
            <select
              value={period}
              onChange={(e) => {
                const v = e.target.value as AdminOrderPeriod;
                setPeriod(v);
                replaceOrdersQuery((q) => {
                  q.delete("from");
                  q.delete("to");
                  if (v === "30d") q.delete("period");
                  else q.set("period", v);
                });
              }}
              className="h-10 w-full min-w-[140px] rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400 xl:w-[160px]"
            >
              <option value="7d">7 derniers j.</option>
              <option value="30d">30 derniers j.</option>
              <option value="90d">90 derniers j.</option>
              <option value="all">Toute la période</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | OrderStatus)}
              className="h-10 w-full min-w-[160px] rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400 xl:w-[180px]"
            >
              <option value="">Tous les statuts</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value as "" | "delivery" | "pickup")}
              className="h-10 w-full min-w-[140px] rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400 xl:w-[160px]"
            >
              <option value="">Livraison / retrait</option>
              <option value="delivery">Livraison</option>
              <option value="pickup">Retrait</option>
            </select>
            <select
              value={shopSlug}
              onChange={(e) => {
                const v = e.target.value;
                setShopSlug(v);
                replaceOrdersQuery((q) => {
                  if (v === "all") q.delete("shop");
                  else q.set("shop", v);
                });
              }}
              className="h-10 w-full min-w-[180px] rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400 xl:w-[200px]"
            >
              <option value="all">Toutes les boutiques</option>
              {shopOptions.map(([slug, name]) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 shrink-0 rounded-xl border-neutral-200 text-xs font-semibold"
              onClick={exportCsv}
              disabled={sorted.length === 0}
            >
              <Download className="mr-1.5 size-3.5" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <SortableTh label="Réf." column="publicRef" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <SortableTh label="Création" column="createdAt" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <SortableTh label="Boutique" column="shopName" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <SortableTh label="Client" column="customerName" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <SortableTh label="Montant" column="total" activeKey={sortKey} dir={sortDir} onSort={onSort} align="right" />
                <SortableTh label="Statut" column="status" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <TableHead className="h-12 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Livraison
                </TableHead>
                <TableHead className="h-12 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Canal
                </TableHead>
                <SortableTh label="MàJ" column="updatedAt" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <TableHead className="w-12 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-14 text-center text-sm text-neutral-500">
                    Aucune commande ne correspond aux filtres.
                  </TableCell>
                </TableRow>
              ) : (
                pageSlice.map((row) => (
                  <TableRow key={row.id} className="border-neutral-100 transition-colors hover:bg-neutral-50/90">
                    <TableCell className="py-3.5 pl-6">
                      <Link
                        href={`/admin/orders/${row.id}`}
                        className="font-mono text-sm font-semibold text-neutral-900 hover:text-neutral-600 hover:underline"
                      >
                        {row.publicRef}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-neutral-600">
                      {formatAdminOrderDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <Link
                        href={`/admin/shops/${row.shopSlug}`}
                        className="text-sm font-medium text-neutral-900 hover:underline"
                      >
                        {row.shopName}
                      </Link>
                      <p className="text-[11px] text-neutral-400">{row.merchantName}</p>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <p className="text-sm font-medium text-neutral-800">{row.customerName}</p>
                      <p className="text-[11px] text-neutral-400">{row.customerPhone}</p>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums text-neutral-900">
                      {row.total.toLocaleString("fr-FR")} <span className="text-[11px] font-normal text-neutral-400">FCFA</span>
                    </TableCell>
                    <TableCell>
                      <StatusCell status={row.status} />
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">
                      {row.deliveryType === "delivery" ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5 text-neutral-400" />
                          Livraison
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Store className="size-3.5 text-neutral-400" />
                          Retrait
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg text-[10px] font-medium">
                        {channelLabel(row.channel)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-neutral-500">
                      {formatAdminOrderDateShort(row.updatedAt)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-xl text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-900"
                            aria-label={`Actions ${row.publicRef}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${row.id}`} className="gap-2">
                              <Package className="size-4" />
                              Détail commande
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/shops/${row.shopSlug}`} className="gap-2">
                              <Store className="size-4" />
                              Fiche boutique
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/shop/${row.shopSlug}`} target="_blank" rel="noreferrer" className="gap-2">
                              <ExternalLink className="size-4" />
                              Vitrine publique
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {sorted.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">{rangeLabel}</span> commande{sorted.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl text-xs"
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <span className="min-w-[100px] text-center text-xs font-medium text-neutral-600">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl text-xs"
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
