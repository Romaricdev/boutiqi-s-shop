"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  CreditCard,
  Download,
  MoreHorizontal,
  Radio,
  Search,
  Sparkles,
  Store,
  Tags,
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
  ADMIN_PLAN_LABELS,
  ADMIN_SUBSCRIPTION_STATUS_LABELS,
  adminSubscriptionsToCsv,
  formatAdminSubscriptionDate,
  formatAdminSubscriptionPaymentMethod,
  getAdminSubscriptionKpis,
  getCurrentSubscriptionsByShop,
  sortAdminSubscriptions,
  type AdminPlanSlug,
  type AdminSubscriptionSortKey,
  type AdminSubscriptionStatus,
} from "@/lib/admin/subscriptions";

const PAGE_SIZE = 7;

const ALL_PLANS: AdminPlanSlug[] = ["pilot", "pro", "business"];
const ALL_STATUSES: AdminSubscriptionStatus[] = ["active", "trial", "past_due", "cancelled"];

function planBadgeClass(plan: AdminPlanSlug) {
  if (plan === "pilot") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (plan === "pro") return "border-violet-200 bg-violet-50 text-violet-900";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

function statusBadgeClass(status: AdminSubscriptionStatus) {
  const map = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-800",
    trial: "border-sky-200 bg-sky-50 text-sky-800",
    past_due: "border-red-200 bg-red-50 text-red-800",
    cancelled: "border-neutral-200 bg-neutral-100 text-neutral-600",
  }[status];
  return map;
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
  column: AdminSubscriptionSortKey;
  activeKey: AdminSubscriptionSortKey;
  dir: "asc" | "desc";
  onSort: (k: AdminSubscriptionSortKey) => void;
  align?: "left" | "right";
}) {
  const active = activeKey === column;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <TableHead
      className={cn(
        "h-12 text-[11px] font-semibold uppercase tracking-wider text-neutral-400",
        align === "right" && "text-right",
        column === "shopName" && "pl-6",
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

export default function AdminSubscriptionsClient() {
  const searchParams = useSearchParams();
  const apiSimulateError = searchParams.get("error") === "1";

  const baseRows = useMemo(() => getCurrentSubscriptionsByShop(), []);

  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"" | AdminPlanSlug>("");
  const [statusFilter, setStatusFilter] = useState<"" | AdminSubscriptionStatus>("");
  const [sortKey, setSortKey] = useState<AdminSubscriptionSortKey>("shopName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return baseRows.filter((r) => {
      if (planFilter && r.plan !== planFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.shopName.toLowerCase().includes(q) ||
        r.shopSlug.toLowerCase().includes(q) ||
        r.merchantName.toLowerCase().includes(q) ||
        r.merchantEmail.toLowerCase().includes(q) ||
        r.billingRef.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [baseRows, planFilter, statusFilter, query]);

  const sorted = useMemo(() => sortAdminSubscriptions(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  useEffect(() => {
    setPage(1);
  }, [query, planFilter, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const onSort = useCallback(
    (key: AdminSubscriptionSortKey) => {
      if (key === sortKey) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return;
      }
      setSortKey(key);
      const defaultDesc =
        key === "currentPeriodEnd" || key === "startedAt" || key === "priceFcfaMonthly" || key === "status";
      setSortDir(defaultDesc ? "desc" : "asc");
    },
    [sortKey],
  );

  const kpis = useMemo(() => getAdminSubscriptionKpis(filtered), [filtered]);

  const rangeLabel = useMemo(() => {
    if (sorted.length === 0) return "0 sur 0";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, sorted.length);
    return `${start}–${end} sur ${sorted.length}`;
  }, [sorted.length, page]);

  const exportCsv = useCallback(() => {
    const csv = adminSubscriptionsToCsv(sorted);
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abonnements-admin-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  const kpiCards: {
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
    accent: string;
  }[] = [
    {
      label: "Boutiques suivies",
      value: String(kpis.total),
      hint: "Abonnement courant par vitrine",
      icon: Store,
      accent: "bg-neutral-100 text-neutral-600",
    },
    {
      label: "MRR (démo)",
      value: `${kpis.mrr.toLocaleString("fr-FR")} FCFA`,
      hint: "Plans payants actifs / non résiliés",
      icon: Wallet,
      accent: "bg-violet-50 text-violet-700",
    },
    {
      label: "Essais",
      value: String(kpis.trial),
      hint: "Période pilote ou trial",
      icon: Sparkles,
      accent: "bg-sky-50 text-sky-700",
    },
    {
      label: "À traiter",
      value: String(kpis.pastDue),
      hint: "Impayés — relance encaissement",
      icon: AlertTriangle,
      accent: kpis.pastDue > 0 ? "bg-red-50 text-red-700" : "bg-neutral-100 text-neutral-500",
    },
  ];

  const colSpan = 9;

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <CreditCard className="size-5 text-neutral-700" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Abonnements</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Plans commerçants (Pilote / Pro / Business), statuts de facturation et échéances. Encaissement prévu via{" "}
            <span className="font-medium text-neutral-700">Orange Money</span> et{" "}
            <span className="font-medium text-neutral-700">MTN MoMo</span> uniquement (démo).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              Pilote gratuit
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              Paiement OM &amp; MoMo
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              {baseRows.length} boutique{baseRows.length > 1 ? "s" : ""} (vue courante)
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
                <p className="font-semibold">{apiSimulateError ? "Erreur réseau (simulation)" : "Synchronisation (démo)"}</p>
                <p className="text-xs opacity-90">
                  {apiSimulateError
                    ? "Webhook facturation indisponible — données mock."
                    : "Prêt pour callbacks opérateurs OM / MoMo et états de paiement en temps réel."}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium opacity-80">
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

      <Card className="rounded-2xl border border-violet-200/80 bg-violet-50/40 shadow-soft">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-violet-700 shadow-sm">
              <Tags className="size-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Types d&apos;abonnement (offres)</p>
              <p className="mt-0.5 text-xs text-neutral-600">
                Listez et modifiez Pilote, Pro, Business : prix, essai, visibilité, textes — persistance locale en démo.
              </p>
            </div>
          </div>
          <Button variant="default" size="sm" className="h-10 shrink-0 rounded-xl gap-2" asChild>
            <Link href="/admin/subscriptions/plans">
              Configurer les offres
              <ArrowRight className="size-3.5 opacity-90" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader className="space-y-4 pb-4">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-950">Souscriptions boutiques</CardTitle>
            <CardDescription className="text-xs">
              Une ligne = abonnement courant par boutique (historique disponible sur la fiche). Export CSV de la vue
              filtrée.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Boutique, commerçant, e-mail, réf. facturation…"
                className="h-10 rounded-xl border-neutral-200 bg-neutral-50/50 pl-9 text-sm"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as "" | AdminPlanSlug)}
              className="h-10 w-full min-w-[140px] rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400 lg:w-[160px]"
            >
              <option value="">Tous les plans</option>
              {ALL_PLANS.map((p) => (
                <option key={p} value={p}>
                  {ADMIN_PLAN_LABELS[p]}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "" | AdminSubscriptionStatus)}
              className="h-10 w-full min-w-[160px] rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400 lg:w-[180px]"
            >
              <option value="">Tous les statuts</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ADMIN_SUBSCRIPTION_STATUS_LABELS[s]}
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
                <SortableTh label="Boutique" column="shopName" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <SortableTh label="Commerçant" column="merchantName" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <SortableTh label="Plan" column="plan" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <SortableTh label="Statut" column="status" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                <SortableTh
                  label="Mensuel"
                  column="priceFcfaMonthly"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={onSort}
                  align="right"
                />
                <SortableTh
                  label="Fin période"
                  column="currentPeriodEnd"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={onSort}
                />
                <TableHead className="h-12 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Paiement
                </TableHead>
                <TableHead className="h-12 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Réf.
                </TableHead>
                <TableHead className="w-12 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-14 text-center text-sm text-neutral-500">
                    Aucun abonnement ne correspond aux filtres.
                  </TableCell>
                </TableRow>
              ) : (
                pageSlice.map((row) => (
                  <TableRow key={row.id} className="border-neutral-100 transition-colors hover:bg-neutral-50/90">
                    <TableCell className="py-3.5 pl-6">
                      <Link
                        href={`/admin/subscriptions/${row.id}`}
                        className="text-sm font-semibold text-neutral-900 hover:text-neutral-600 hover:underline"
                      >
                        {row.shopName}
                      </Link>
                      <p className="text-[11px] text-neutral-400">{row.shopSlug}</p>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <p className="text-sm font-medium text-neutral-800">{row.merchantName}</p>
                      <p className="truncate text-[11px] text-neutral-400">{row.merchantEmail}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-lg text-[10px] font-semibold", planBadgeClass(row.plan))}>
                        {ADMIN_PLAN_LABELS[row.plan]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("rounded-lg text-[10px] font-semibold", statusBadgeClass(row.status))}
                      >
                        {ADMIN_SUBSCRIPTION_STATUS_LABELS[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums text-neutral-900">
                      {row.priceFcfaMonthly === 0 ? (
                        <span className="text-neutral-400">0</span>
                      ) : (
                        <>
                          {row.priceFcfaMonthly.toLocaleString("fr-FR")}{" "}
                          <span className="text-[11px] font-normal text-neutral-400">FCFA</span>
                        </>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-neutral-600">
                      {formatAdminSubscriptionDate(row.currentPeriodEnd)}
                      {row.trialEndsAt ? (
                        <span className="mt-0.5 block text-[11px] text-sky-600">
                          Essai → {formatAdminSubscriptionDate(row.trialEndsAt)}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">
                      {formatAdminSubscriptionPaymentMethod(row.paymentMethod)}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate font-mono text-xs text-neutral-500" title={row.billingRef}>
                      {row.billingRef}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-xl text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-900"
                            aria-label={`Actions ${row.shopName}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/subscriptions/${row.id}`} className="gap-2">
                              <CreditCard className="size-4" />
                              Détail abonnement
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/shops/${row.shopSlug}`} className="gap-2">
                              <Store className="size-4" />
                              Fiche boutique
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled className="text-neutral-400">
                            <XCircle className="mr-2 size-4" />
                            Relance / remboursement OM·MoMo (API)
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
              <span className="font-medium text-neutral-700">{rangeLabel}</span> ligne{sorted.length > 1 ? "s" : ""}
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
