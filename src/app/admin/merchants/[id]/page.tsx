import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Phone,
  Store,
  User,
  Calendar,
  Briefcase,
  Activity,
  Radio,
  WifiOff,
  ScrollText,
  MonitorSmartphone,
  ShieldCheck,
  Wallet,
  ShoppingCart,
  AlertTriangle,
  Percent,
} from "lucide-react";

import { MerchantOperationalActions } from "@/components/admin/merchant-operational-actions";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";
import { cn } from "@/lib/cn";
import {
  formatAdminMerchantJoinedLabel,
  formatAdminMerchantRevenueFcfa,
  formatMerchantAuditLabel,
  formatMerchantRelativeActivity,
  formatMerchantSessionLabel,
  getAdminMerchantById,
  type AdminKycStatus,
  type AdminMerchantStatus,
} from "@/lib/admin/merchants";

function StatusBadge({ status }: { status: AdminMerchantStatus }) {
  const map = {
    verified: { label: "Vérifié", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
    pending: { label: "En attente", className: "border-orange-200 bg-orange-50 text-orange-800" },
    suspended: { label: "Suspendu", className: "border-neutral-200 bg-neutral-100 text-neutral-600" },
  }[status];
  return (
    <Badge variant="outline" className={cn("rounded-lg text-xs font-semibold", map.className)}>
      {map.label}
    </Badge>
  );
}

function KycBadge({ kyc }: { kyc: AdminKycStatus }) {
  const map = {
    verified: { label: "KYC validé", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
    pending: { label: "KYC en cours", className: "border-amber-200 bg-amber-50 text-amber-800" },
    rejected: { label: "KYC refusé", className: "border-red-200 bg-red-50 text-red-800" },
  }[kyc];
  return (
    <Badge variant="outline" className={cn("rounded-lg text-xs font-semibold", map.className)}>
      {map.label}
    </Badge>
  );
}

type PageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function AdminMerchantDetailPage({ params, searchParams }: PageProps) {
  const merchant = getAdminMerchantById(params.id);
  if (!merchant) notFound();

  const joinedLabel = formatAdminMerchantJoinedLabel(merchant.joinedAt);
  const apiSimulateError = searchParams?.error === "1";

  const auditSorted = [...merchant.auditLog].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="h-9 w-fit gap-2 rounded-xl px-2 text-neutral-600" asChild>
          <Link href="/admin/merchants">
            <ArrowLeft className="size-4" />
            Retour à l&apos;annuaire
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          {merchant.shopSlug ? (
            <>
              <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold" asChild>
                <Link href={`/admin/shops/${merchant.shopSlug}`}>Fiche boutique</Link>
              </Button>
              <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold" asChild>
                <Link href={`/shop/${merchant.shopSlug}`} target="_blank" rel="noreferrer">
                  Vitrine publique
                  <ExternalLink className="ml-1.5 size-3.5 opacity-70" />
                </Link>
              </Button>
            </>
          ) : null}
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
            <p className="font-semibold">{apiSimulateError ? "Erreur réseau (simulation)" : "Données à jour (démo)"}</p>
            <p className="text-xs opacity-90">
              {apiSimulateError
                ? "Échec de chargement — affichage du dernier état connu (mock)."
                : "Prêt pour invalidation React Query / événements temps réel après branchement API."}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums opacity-80">
          <Activity className="mr-1 inline size-3.5 align-text-bottom" />
          Dernière sync : {apiSimulateError ? "—" : "à l’instant"}
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-neutral-200 bg-white text-lg font-bold text-neutral-700 shadow-sm">
          {merchant.fullName.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{merchant.fullName}</h1>
            <StatusBadge status={merchant.status} />
            <KycBadge kyc={merchant.kycStatus} />
          </div>
          <p className="mt-1 font-mono text-sm text-neutral-500">{merchant.id}</p>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">
            Indicateurs 30 j., permissions plateforme, journal d&apos;audit et sessions — structure alignée sur le futur
            branchement Supabase / API admin.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          {
            label: "CA 30 j.",
            value: formatAdminMerchantRevenueFcfa(merchant.revenue30d),
            icon: Wallet,
          },
          {
            label: "Commandes 30 j.",
            value: merchant.orders30d.toLocaleString("fr-FR"),
            icon: ShoppingCart,
          },
          {
            label: "Litiges ouverts",
            value: String(merchant.disputesOpen),
            icon: AlertTriangle,
            warn: merchant.disputesOpen > 0,
          },
          {
            label: "Taux annulation",
            value: merchant.orders30d > 0 ? `${merchant.cancellationRatePct} %` : "—",
            icon: Percent,
          },
          {
            label: "Dernière activité",
            value: formatMerchantRelativeActivity(merchant.lastActiveAt),
            icon: Activity,
            sub: new Date(merchant.lastActiveAt).toLocaleString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          {
            label: "Inscription",
            value: joinedLabel,
            icon: Calendar,
          },
        ].map(({ label, value, icon: Icon, sub, warn }) => (
          <Card key={label} className="rounded-2xl border-0 bg-white shadow-soft">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-neutral-400">{label}</p>
                <Icon
                  className={cn("size-4 text-neutral-400", warn && "text-amber-600")}
                  strokeWidth={1.5}
                />
              </div>
              <p className={cn("text-lg font-bold text-neutral-950", warn && "text-amber-800")}>{value}</p>
              {sub ? <p className="text-[11px] text-neutral-400">{sub}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Type d'activité", value: merchant.businessType, icon: Briefcase },
          {
            label: "Boutique",
            value: merchant.shopName ?? "—",
            icon: Store,
            sub: merchant.shopSlug ? `/${merchant.shopSlug}` : undefined,
          },
        ].map(({ label, value, icon: Icon, sub }) => (
          <Card key={label} className="rounded-2xl border-0 bg-white shadow-soft">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-neutral-400">{label}</p>
                <Icon className="size-4 text-neutral-400" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-bold text-neutral-950">{value}</p>
              {sub ? <code className="text-xs text-neutral-400">{sub}</code> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <MerchantOperationalActions
        merchantId={merchant.id}
        initialStatus={merchant.status}
        initialKyc={merchant.kycStatus}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <User className="size-4 text-neutral-500" strokeWidth={1.5} />
              Coordonnées
            </CardTitle>
            <CardDescription className="text-xs">Contact enregistré (démo)</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-5 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">E-mail</p>
              <p className="mt-0.5 font-medium text-neutral-900">{merchant.email}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Téléphone</p>
              <p className="mt-0.5 flex items-center gap-2 font-medium text-neutral-900">
                <Phone className="size-3.5 text-neutral-400" />
                {merchant.phone}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">WhatsApp</p>
              <p className="mt-0.5 flex items-center gap-2 font-medium text-neutral-900">
                <MessageCircle className="size-3.5 text-emerald-600" />
                {merchant.whatsappPhone}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <ShieldCheck className="size-4 text-neutral-500" strokeWidth={1.5} />
              Rôles & permissions
            </CardTitle>
            <CardDescription className="text-xs">
              Capacités côté compte commerçant (aperçu). Rôle console admin séparé côté auth.
            </CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Console admin</p>
              <p className="mt-1 text-sm text-neutral-700">
                Votre session : <span className="font-medium text-neutral-900">super_admin</span> (démo) — toutes les
                actions ci-dessous seront tracées dans le journal d&apos;audit réel.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Permissions plateforme
              </p>
              {merchant.platformPermissions.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-400">Aucune permission active (compte restreint).</p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {merchant.platformPermissions.map((p) => (
                    <li key={p}>
                      <Badge variant="secondary" className="rounded-lg font-mono text-[11px] font-normal">
                        {p}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <MonitorSmartphone className="size-4 text-neutral-500" strokeWidth={1.5} />
              Sessions récentes
            </CardTitle>
            <CardDescription className="text-xs">Appareils et dernière activité (mock)</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="pt-5">
            {merchant.sessions.length === 0 ? (
              <p className="text-center text-sm text-neutral-400">Aucune session enregistrée.</p>
            ) : (
              <ul className="space-y-3">
                {merchant.sessions.map((s) => (
                  <li
                    key={s.id}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm",
                      s.isCurrent ? "border-emerald-200 bg-emerald-50/40" : "border-neutral-100 bg-neutral-50/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-neutral-900">{s.device}</span>
                      {s.isCurrent ? (
                        <Badge className="rounded-lg bg-emerald-600 text-[10px]">Session actuelle</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {s.ipLabel} · {formatMerchantSessionLabel(s.lastAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <ScrollText className="size-4 text-neutral-500" strokeWidth={1.5} />
              Journal d&apos;audit
            </CardTitle>
            <CardDescription className="text-xs">Timeline modération & actions (données démo)</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="pt-5">
            {auditSorted.length === 0 ? (
              <p className="text-center text-sm text-neutral-400">Aucun événement.</p>
            ) : (
              <ul className="relative space-y-0 border-l border-neutral-200 pl-4">
                {auditSorted.map((ev) => (
                  <li key={ev.id} className="relative pb-6 last:pb-0">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-white bg-violet-400 shadow-sm" />
                    <p className="text-[11px] font-medium text-neutral-400">
                      {formatMerchantAuditLabel(ev.at)} · {ev.actorLabel}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-neutral-900">{ev.action}</p>
                    {ev.detail ? <p className="mt-1 text-xs text-neutral-500">{ev.detail}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
