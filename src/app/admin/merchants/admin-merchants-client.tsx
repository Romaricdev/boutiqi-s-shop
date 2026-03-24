"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Phone,
  Radio,
  Search,
  Store,
  UserCircle,
  Users,
  Wallet,
  WifiOff,
  ShoppingCart,
  Percent,
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
  formatAdminMerchantJoinedLabel,
  formatAdminMerchantRevenueFcfa,
  formatMerchantRelativeActivity,
  getAdminMerchantAggregates,
  getAdminMerchantKpis,
  MOCK_ADMIN_MERCHANTS,
  sortAdminMerchants,
  type AdminKycStatus,
  type AdminMerchantSortKey,
  type AdminMerchantStatus,
} from "@/lib/admin/merchants";

const PAGE_SIZE = 5;

const rowDiscStyles = [
  "bg-violet-100 text-violet-800",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-800",
] as const;

function StatusDot({ status }: { status: AdminMerchantStatus }) {
  const map = {
    verified: { label: "Vérifié", dot: "bg-emerald-500" },
    pending: { label: "En attente", dot: "bg-orange-400" },
    suspended: { label: "Suspendu", dot: "bg-neutral-300" },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600">
      <span className={cn("size-1.5 rounded-full", map.dot)} />
      {map.label}
    </span>
  );
}

function KycBadge({ kyc }: { kyc: AdminKycStatus }) {
  const map = {
    verified: { label: "KYC OK", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
    pending: { label: "KYC", className: "border-amber-200 bg-amber-50 text-amber-800" },
    rejected: { label: "KYC refus", className: "border-red-200 bg-red-50 text-red-800" },
  }[kyc];
  return (
    <Badge variant="outline" className={cn("rounded-lg text-[10px] font-semibold", map.className)}>
      {map.label}
    </Badge>
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
  column: AdminMerchantSortKey;
  activeKey: AdminMerchantSortKey;
  dir: "asc" | "desc";
  onSort: (k: AdminMerchantSortKey) => void;
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
        column === "fullName" && "min-w-[200px] pl-6",
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

export default function AdminMerchantsClient() {
  const searchParams = useSearchParams();
  const apiSimulateError = searchParams.get("error") === "1";

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminMerchantStatus>("all");
  const [sortKey, setSortKey] = useState<AdminMerchantSortKey>("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_ADMIN_MERCHANTS.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        m.businessType.toLowerCase().includes(q) ||
        (m.shopName?.toLowerCase().includes(q) ?? false) ||
        (m.shopSlug?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, statusFilter]);

  const sorted = useMemo(() => sortAdminMerchants(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);
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
    (key: AdminMerchantSortKey) => {
      if (key === sortKey) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return;
      }
      setSortKey(key);
      const defaultDesc =
        key === "joinedAt" ||
        key === "status" ||
        key === "shopName" ||
        key === "orders30d" ||
        key === "revenue30d" ||
        key === "disputesOpen" ||
        key === "cancellationRatePct" ||
        key === "lastActiveAt" ||
        key === "kycStatus";
      setSortDir(defaultDesc ? "desc" : "asc");
    },
    [sortKey],
  );

  const kpis = useMemo(() => getAdminMerchantKpis(), []);
  const aggregates = useMemo(() => getAdminMerchantAggregates(filtered), [filtered]);

  const businessStats = useMemo(() => {
    const map = new Map<string, number>();
    MOCK_ADMIN_MERCHANTS.forEach((m) => map.set(m.businessType, (map.get(m.businessType) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, []);

  const withoutShop = useMemo(() => MOCK_ADMIN_MERCHANTS.filter((m) => !m.shopSlug).length, []);

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
      label: "Comptes",
      value: String(kpis.total),
      hint: "Inscrits plateforme",
      icon: Users,
      accent: "bg-neutral-100 text-neutral-600",
    },
    {
      label: "Vérifiés",
      value: String(kpis.verified),
      hint: "Peuvent opérer",
      icon: CheckCircle2,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "En attente",
      value: String(kpis.pending),
      hint: "KYC / onboarding",
      icon: Clock,
      accent: "bg-orange-50 text-orange-700",
    },
    {
      label: "Suspendus",
      value: String(kpis.suspended),
      hint: "Accès restreint",
      icon: Ban,
      accent: "bg-neutral-100 text-neutral-500",
    },
  ];

  const noSelection = filtered.length === 0;
  const aggregateStrip: {
    label: string;
    value: string;
    sub: string;
    icon: LucideIcon;
    accent: string;
  }[] = [
    {
      label: "CA 30 j. (filtre)",
      value: noSelection ? "—" : formatAdminMerchantRevenueFcfa(aggregates.revenue30d),
      sub: "Somme des CA démo sur la sélection",
      icon: Wallet,
      accent: "bg-violet-50 text-violet-700",
    },
    {
      label: "Commandes 30 j.",
      value: noSelection ? "—" : aggregates.orders30d.toLocaleString("fr-FR"),
      sub: "Volume agrégé",
      icon: ShoppingCart,
      accent: "bg-sky-50 text-sky-700",
    },
    {
      label: "Litiges ouverts",
      value: noSelection ? "—" : String(aggregates.disputesOpen),
      sub: "Tickets / dossiers actifs",
      icon: AlertTriangle,
      accent: "bg-amber-50 text-amber-800",
    },
    {
      label: "Annulation moy.",
      value: noSelection ? "—" : `${aggregates.avgCancellationPct} %`,
      sub: "Sur commerçants avec commandes 30 j.",
      icon: Percent,
      accent: "bg-neutral-100 text-neutral-600",
    },
  ];

  const tableColSpan = 12;

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <Users className="size-5 text-neutral-700" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Commerçants</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-500">
            Annuaire : indicateurs 30 j., KYC, tri multi-colonnes, agrégats sur le filtre courant. Données démo — brancher
            l&apos;API admin et le flux temps réel.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              Données démo
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
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
                    ? "Impossible de joindre l’API — affichage du cache / mock. Ajoutez ?error=1 à l’URL pour reproduire."
                    : "Prêt pour WebSocket ou polling React Query. Pas d’appel réel dans cette maquette."}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums opacity-80">
              <Activity className="mr-1 inline size-3.5 align-text-bottom" />
              Dernière sync : {apiSimulateError ? "—" : "à l’instant"}
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
                <p className="text-3xl font-bold tabular-nums tracking-tight text-neutral-950">{k.value}</p>
                <p className="text-xs text-neutral-400">{k.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {aggregateStrip.map((a) => {
          const Icon = a.icon;
          return (
            <Card
              key={a.label}
              className="rounded-2xl border border-neutral-100 bg-neutral-50/40 shadow-none"
            >
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-neutral-600">{a.label}</p>
                  <span className={cn("grid size-8 place-items-center rounded-lg", a.accent)}>
                    <Icon className="size-4" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="text-lg font-bold tabular-nums text-neutral-950">{a.value}</p>
                <p className="text-[11px] leading-snug text-neutral-500">{a.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader className="space-y-4 pb-4">
            <div>
              <CardTitle className="text-base font-semibold text-neutral-950">Annuaire</CardTitle>
              <CardDescription className="text-xs">
                Colonnes triables (30 j., KYC, activité) · {PAGE_SIZE} lignes par page · défilement horizontal sur petit
                écran.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nom, e-mail, téléphone, activité, boutique…"
                  className="h-10 rounded-xl border-neutral-200 bg-neutral-50/50 pl-9 text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | AdminMerchantStatus)}
                className="h-10 w-full shrink-0 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400 sm:w-[200px]"
              >
                <option value="all">Tous les statuts</option>
                <option value="verified">Vérifiés</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendus</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-neutral-200 text-xs font-semibold"
                type="button"
                disabled
                title="Export à brancher"
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
                    label="Commerçant"
                    column="fullName"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTh label="Activité" column="businessType" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <SortableTh
                    label="Boutique liée"
                    column="shopName"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTh
                    label="Inscription"
                    column="joinedAt"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTh label="KYC" column="kycStatus" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <SortableTh
                    label="CA 30 j."
                    column="revenue30d"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                  />
                  <SortableTh
                    label="Cmd 30 j."
                    column="orders30d"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                  />
                  <SortableTh
                    label="Litiges"
                    column="disputesOpen"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                  />
                  <SortableTh
                    label="Annul."
                    column="cancellationRatePct"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                  />
                  <SortableTh
                    label="Dernière activité"
                    column="lastActiveAt"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                  />
                  <SortableTh label="Statut" column="status" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <TableHead className="w-12 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColSpan} className="py-12 text-center text-sm text-neutral-500">
                      Aucun commerçant ne correspond aux filtres.
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
                            {row.fullName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/merchants/${row.id}`}
                              className="text-sm font-semibold text-neutral-950 hover:text-neutral-700 hover:underline"
                            >
                              {row.fullName}
                            </Link>
                            <div className="truncate text-[11px] text-neutral-500">{row.email}</div>
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-400">
                              <Phone className="size-3 shrink-0" />
                              {row.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[140px] text-sm text-neutral-700">{row.businessType}</TableCell>
                      <TableCell>
                        {row.shopSlug && row.shopName ? (
                          <div className="flex flex-col gap-1">
                            <Link
                              href={`/admin/shops/${row.shopSlug}`}
                              className="text-sm font-medium text-neutral-900 hover:underline"
                            >
                              {row.shopName}
                            </Link>
                            <Link
                              href={`/shop/${row.shopSlug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex w-fit items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600"
                            >
                              Vitrine
                              <ExternalLink className="size-3" />
                            </Link>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">Aucune boutique</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                        {formatAdminMerchantJoinedLabel(row.joinedAt)}
                      </TableCell>
                      <TableCell>
                        <KycBadge kyc={row.kycStatus} />
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums text-neutral-800">
                        {formatAdminMerchantRevenueFcfa(row.revenue30d)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-neutral-700">
                        {row.orders30d.toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-neutral-700">
                        {row.disputesOpen > 0 ? (
                          <span className="font-medium text-amber-800">{row.disputesOpen}</span>
                        ) : (
                          "0"
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-neutral-600">
                        {row.orders30d > 0 ? `${row.cancellationRatePct} %` : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-600">
                        {formatMerchantRelativeActivity(row.lastActiveAt)}
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
                              aria-label={`Actions pour ${row.fullName}`}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-xl">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/merchants/${row.id}`} className="gap-2">
                                <UserCircle className="size-4" />
                                Fiche commerçant
                              </Link>
                            </DropdownMenuItem>
                            {row.shopSlug ? (
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/shops/${row.shopSlug}`} className="gap-2">
                                  <Store className="size-4" />
                                  Fiche boutique
                                </Link>
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled className="text-neutral-400">
                              Réinitialiser accès (API)
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
                <span className="font-medium text-neutral-700">{rangeLabel}</span> commerçant
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
              <CardTitle className="text-sm font-semibold text-neutral-950">Types d&apos;activité</CardTitle>
              <CardDescription className="text-xs">Répartition (démo)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {businessStats.map(([label, count], idx) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-600">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 text-sm font-medium text-neutral-800">
                      <span className="truncate">{label}</span>
                      <span className="tabular-nums text-neutral-500">{count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-violet-400/80"
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
              <CardTitle className="text-sm font-semibold text-neutral-950">Sans boutique</CardTitle>
              <CardDescription className="text-xs">Comptes sans vitrine liée</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-bold tabular-nums text-neutral-950">{withoutShop}</p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                À relancer pour finaliser l&apos;onboarding ou créer une boutique.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
