"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  ExternalLink,
  Eye,
  MapPin,
  MoreHorizontal,
  Search,
  Store,
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
  formatAdminShopJoinedLabel,
  getAdminCityStats,
  getAdminShopKpis,
  MOCK_ADMIN_SHOPS,
  sortAdminShops,
  type AdminShopSortKey,
  type AdminShopStatus,
} from "@/lib/admin/shops";

const PAGE_SIZE = 5;

const rowDiscStyles = [
  "bg-sky-100 text-sky-700",
  "bg-orange-100 text-orange-700",
  "bg-emerald-100 text-emerald-800",
] as const;

function StatusDot({ status }: { status: AdminShopStatus }) {
  const map = {
    active: { label: "Active", dot: "bg-emerald-500" },
    pending: { label: "En attente", dot: "bg-orange-400" },
    suspended: { label: "Suspendue", dot: "bg-neutral-300" },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600">
      <span className={cn("size-1.5 rounded-full", map.dot)} />
      {map.label}
    </span>
  );
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
  column: AdminShopSortKey;
  activeKey: AdminShopSortKey;
  dir: "asc" | "desc";
  onSort: (k: AdminShopSortKey) => void;
  align?: "left" | "right" | "center";
}) {
  const active = activeKey === column;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <TableHead
      className={cn(
        "h-12 text-[11px] font-semibold uppercase tracking-wider text-neutral-400",
        align === "right" && "text-right",
        align === "center" && "text-center",
        column === "name" && "min-w-[200px] pl-6",
      )}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-neutral-700",
          align === "right" && "ml-auto w-full flex-row-reverse justify-end",
          align === "center" && "mx-auto w-full justify-center",
        )}
      >
        {label}
        <Icon className={cn("size-3.5 shrink-0", !active && "opacity-35")} strokeWidth={2} />
      </button>
    </TableHead>
  );
}

export default function AdminShopsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminShopStatus>("all");
  const [sortKey, setSortKey] = useState<AdminShopSortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_ADMIN_SHOPS.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.merchantEmail.toLowerCase().includes(q) ||
        s.merchantName.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter]);

  const sorted = useMemo(() => sortAdminShops(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const onSort = useCallback(
    (key: AdminShopSortKey) => {
      if (key === sortKey) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return;
      }
      setSortKey(key);
      const defaultDesc = key === "products" || key === "orders30d" || key === "joinedAt" || key === "status";
      setSortDir(defaultDesc ? "desc" : "asc");
    },
    [sortKey],
  );

  const kpis = useMemo(() => getAdminShopKpis(), []);
  const cityStats = useMemo(() => getAdminCityStats(), []);

  const rangeLabel = useMemo(() => {
    if (sorted.length === 0) return "0 sur 0";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, sorted.length);
    return `${start}–${end} sur ${sorted.length}`;
  }, [sorted.length, page]);

  const kpiCards: {
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
    accent: string;
  }[] = [
    {
      label: "Total inscrites",
      value: String(kpis.total),
      hint: "Toutes périodes",
      icon: Store,
      accent: "bg-neutral-100 text-neutral-600",
    },
    {
      label: "Actives",
      value: String(kpis.active),
      hint: "Vitrine visible",
      icon: CheckCircle2,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "En attente",
      value: String(kpis.pending),
      hint: "Vérification / onboarding",
      icon: Clock,
      accent: "bg-orange-50 text-orange-700",
    },
    {
      label: "Suspendues",
      value: String(kpis.suspended),
      hint: "Accès restreint",
      icon: Ban,
      accent: "bg-neutral-100 text-neutral-500",
    },
  ];

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm">
            <Store className="size-5 text-neutral-700" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Boutiques</h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-500">
              Inventaire des vitrines : recherche, filtre, tri, pagination et fiche détail (démo — API à brancher).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
                Données démo
              </Badge>
              <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
                {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              </Badge>
            </div>
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
                <p className="text-3xl font-bold tabular-nums tracking-tight text-neutral-950">{k.value}</p>
                <p className="text-xs text-neutral-400">{k.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader className="space-y-4 pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-neutral-950">Liste des boutiques</CardTitle>
              <CardDescription className="text-xs">
                Cliquez sur un en-tête de colonne pour trier. {PAGE_SIZE} lignes par page.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  className="h-10 rounded-xl border-neutral-200 bg-neutral-50/50 pl-9 text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | AdminShopStatus)}
                className="h-10 w-full shrink-0 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400 sm:w-[200px]"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendues</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-neutral-200 text-xs font-semibold"
                type="button"
                disabled
                title="Export CSV / XLSX à brancher"
              >
                Exporter
              </Button>
            </div>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <SortableTh
                    label="Boutique"
                    column="name"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="left"
                  />
                  <SortableTh
                    label="Localisation"
                    column="city"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTh
                    label="Produits"
                    column="products"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                  />
                  <SortableTh
                    label="Cmd. 30 j."
                    column="orders30d"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                  />
                  <SortableTh
                    label="Inscription"
                    column="joinedAt"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTh
                    label="Statut"
                    column="status"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <TableHead className="w-12 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-neutral-500">
                      Aucune boutique ne correspond aux filtres.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageSlice.map((row, i) => (
                    <TableRow key={row.id} className="border-neutral-100 transition-colors hover:bg-neutral-50/90">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold shadow-sm",
                              rowDiscStyles[((page - 1) * PAGE_SIZE + i) % rowDiscStyles.length],
                            )}
                          >
                            {row.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/shops/${row.slug}`}
                              className="text-sm font-semibold text-neutral-950 hover:text-neutral-700 hover:underline"
                            >
                              {row.name}
                            </Link>
                            <code className="block text-[11px] text-neutral-400">/{row.slug}</code>
                            <div className="truncate text-[11px] text-neutral-400">{row.merchantEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm text-neutral-600">
                          <MapPin className="size-3.5 shrink-0 text-neutral-400" />
                          <span>
                            {row.city}
                            {row.neighborhood && row.neighborhood !== "—" ? (
                              <span className="text-neutral-400"> · {row.neighborhood}</span>
                            ) : null}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm font-medium text-neutral-800">
                        {row.products}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm font-medium text-neutral-800">
                        {row.orders30d}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                        {formatAdminShopJoinedLabel(row.joinedAt)}
                      </TableCell>
                      <TableCell>
                        <StatusDot status={row.status} />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-xl text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-900"
                              aria-label={`Actions pour ${row.name}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-xl">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/shops/${row.slug}`} className="gap-2">
                                <Store className="size-4" />
                                Fiche admin
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/shop/${row.slug}`} target="_blank" rel="noreferrer" className="gap-2">
                                <Eye className="size-4" />
                                Voir la vitrine
                                <ExternalLink className="ml-auto size-3.5 opacity-50" />
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled className="text-neutral-400">
                              Suspendre (bientôt)
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled className="text-neutral-400">
                              Réactiver (bientôt)
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
                <span className="font-medium text-neutral-700">{rangeLabel}</span> boutique
                {sorted.length > 1 ? "s" : ""}
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

        <div className="space-y-6">
          <Card className="rounded-2xl border-0 bg-white shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-950">Top villes</CardTitle>
              <CardDescription className="text-xs">Répartition des boutiques inscrites (démo)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {cityStats.map(([city, count], idx) => (
                <div key={city} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-600">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 text-sm font-medium text-neutral-800">
                      <span className="truncate">{city}</span>
                      <span className="tabular-nums text-neutral-500">{count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-neutral-400/80"
                        style={{ width: `${(count / kpis.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 bg-white shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-950">Modération</CardTitle>
              <CardDescription className="text-xs">Raccourcis prévus côté back-office</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-600">
              <p className="leading-relaxed">
                Les actions <strong className="font-medium text-neutral-900">suspendre / valider</strong> seront reliées aux
                règles RLS et aux journaux d&apos;audit une fois l&apos;API admin en place.
              </p>
              <Button variant="outline" size="sm" className="mt-2 w-full rounded-xl text-xs" disabled type="button">
                Ouvrir la file d&apos;attente modération
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
