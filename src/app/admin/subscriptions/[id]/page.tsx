import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CreditCard,
  ExternalLink,
  History,
  Radio,
  Store,
  User,
  Wallet,
  WifiOff,
} from "lucide-react";

import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";
import { cn } from "@/lib/cn";
import {
  ADMIN_PLAN_LABELS,
  ADMIN_SUBSCRIPTION_STATUS_LABELS,
  formatAdminSubscriptionDate,
  formatAdminSubscriptionPaymentMethod,
  getAdminSubscriptionById,
  subscriptionsForShopSlug,
  type AdminPlanSlug,
  type AdminShopSubscription,
  type AdminSubscriptionStatus,
} from "@/lib/admin/subscriptions";

function planBadgeClass(plan: AdminPlanSlug) {
  if (plan === "pilot") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (plan === "pro") return "border-violet-200 bg-violet-50 text-violet-900";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

function statusBadgeClass(status: AdminSubscriptionStatus) {
  return {
    active: "border-emerald-200 bg-emerald-50 text-emerald-800",
    trial: "border-sky-200 bg-sky-50 text-sky-800",
    past_due: "border-red-200 bg-red-50 text-red-800",
    cancelled: "border-neutral-200 bg-neutral-100 text-neutral-600",
  }[status];
}

type PageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function AdminSubscriptionDetailPage({ params, searchParams }: PageProps) {
  const sub = getAdminSubscriptionById(params.id);
  if (!sub) notFound();

  const apiSimulateError = searchParams?.error === "1";
  const history = subscriptionsForShopSlug(sub.shopSlug);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="h-9 w-fit gap-2 rounded-xl px-2 text-neutral-600" asChild>
          <Link href="/admin/subscriptions">
            <ArrowLeft className="size-4" />
            Retour aux abonnements
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold" asChild>
            <Link href={`/admin/shops/${sub.shopSlug}`}>Fiche boutique</Link>
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold" asChild>
            <Link href={`/shop/${sub.shopSlug}`} target="_blank" rel="noreferrer">
              Vitrine
              <ExternalLink className="ml-1.5 size-3.5 opacity-70" />
            </Link>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between",
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
            <p className="font-semibold">{apiSimulateError ? "Erreur réseau (simulation)" : "Lecture facturation (démo)"}</p>
            <p className="text-xs opacity-90">
              Statuts de transaction Orange Money / MTN MoMo et relances apparaîtront ici une fois les APIs opérateurs
              branchées.
            </p>
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium opacity-80">
          <Activity className="mr-1 inline size-3.5 align-text-bottom" />
          Sync : {apiSimulateError ? "—" : "OK"}
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{sub.shopName}</h1>
            <Badge variant="outline" className={cn("rounded-lg text-xs font-semibold", planBadgeClass(sub.plan))}>
              {ADMIN_PLAN_LABELS[sub.plan]}
            </Badge>
            <Badge variant="outline" className={cn("rounded-lg text-xs font-semibold", statusBadgeClass(sub.status))}>
              {ADMIN_SUBSCRIPTION_STATUS_LABELS[sub.status]}
            </Badge>
          </div>
          <p className="mt-1 font-mono text-sm text-neutral-500">{sub.id}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Mensuel",
            value:
              sub.priceFcfaMonthly === 0
                ? "0 FCFA (pilote)"
                : `${sub.priceFcfaMonthly.toLocaleString("fr-FR")} FCFA`,
            icon: Wallet,
          },
          { label: "Début", value: formatAdminSubscriptionDate(sub.startedAt), icon: CreditCard },
          { label: "Fin de période", value: formatAdminSubscriptionDate(sub.currentPeriodEnd), icon: CreditCard },
          {
            label: "Paiement",
            value: formatAdminSubscriptionPaymentMethod(sub.paymentMethod, "Non configuré (pilote / essai)"),
            icon: CreditCard,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-2xl border-0 bg-white shadow-soft">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-neutral-400">{label}</p>
                <Icon className="size-4 text-neutral-400" strokeWidth={1.5} />
              </div>
              <p className="text-base font-bold text-neutral-950">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <User className="size-4 text-neutral-500" strokeWidth={1.5} />
              Commerçant
            </CardTitle>
            <CardDescription className="text-xs">Contact lié à la boutique</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-3 pt-5 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Nom</p>
              <p className="mt-0.5 font-medium text-neutral-900">{sub.merchantName}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">E-mail</p>
              <p className="mt-0.5 font-medium text-neutral-900">{sub.merchantEmail}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <Store className="size-4 text-neutral-500" strokeWidth={1.5} />
              Références
            </CardTitle>
            <CardDescription className="text-xs">Facturation &amp; intégration</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-3 pt-5 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Réf. facturation</p>
              <p className="mt-0.5 font-mono text-sm font-medium text-neutral-900">{sub.billingRef}</p>
            </div>
            {sub.trialEndsAt ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Fin d&apos;essai</p>
                <p className="mt-0.5 font-medium text-sky-800">{formatAdminSubscriptionDate(sub.trialEndsAt)}</p>
              </div>
            ) : null}
            <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 p-3 text-xs text-neutral-500">
              Actions : changer de plan, relance impayé, résiliation — via intégration OM / MTN MoMo (pas de carte pour
              l&apos;instant).
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
            <History className="size-4 text-neutral-500" strokeWidth={1.5} />
            Historique boutique
          </CardTitle>
          <CardDescription className="text-xs">
            Toutes les périodes enregistrées pour <span className="font-medium text-neutral-700">{sub.shopSlug}</span>
          </CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="pt-5">
          <ul className="space-y-3">
            {history.map((h) => (
              <li
                key={h.id}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                  h.id === sub.id ? "border-violet-200 bg-violet-50/40" : "border-neutral-100 bg-neutral-50/30",
                )}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-neutral-500">{h.id}</span>
                    <Badge variant="outline" className={cn("rounded-lg text-[10px] font-semibold", planBadgeClass(h.plan))}>
                      {ADMIN_PLAN_LABELS[h.plan]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("rounded-lg text-[10px] font-semibold", statusBadgeClass(h.status))}
                    >
                      {ADMIN_SUBSCRIPTION_STATUS_LABELS[h.status]}
                    </Badge>
                    {h.id === sub.id ? (
                      <Badge className="rounded-lg bg-violet-600 text-[10px]">Vue actuelle</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatAdminSubscriptionDate(h.startedAt)} → {formatAdminSubscriptionDate(h.currentPeriodEnd)} ·{" "}
                    {h.priceFcfaMonthly.toLocaleString("fr-FR")} FCFA/mois
                  </p>
                </div>
                {h.id !== sub.id ? (
                  <Button variant="outline" size="sm" className="h-8 shrink-0 rounded-lg text-xs" asChild>
                    <Link href={`/admin/subscriptions/${h.id}`}>Voir</Link>
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
