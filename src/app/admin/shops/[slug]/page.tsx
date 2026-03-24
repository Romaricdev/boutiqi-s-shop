import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Package,
  ShoppingCart,
  Store,
  User,
  Calendar,
  MessageCircle,
} from "lucide-react";

import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";
import { cn } from "@/lib/cn";
import {
  formatAdminShopJoinedLabel,
  getAdminShopBySlug,
  type AdminShopStatus,
} from "@/lib/admin/shops";

function StatusBadge({ status }: { status: AdminShopStatus }) {
  const map = {
    active: { label: "Active", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
    pending: { label: "En attente", className: "border-orange-200 bg-orange-50 text-orange-800" },
    suspended: { label: "Suspendue", className: "border-neutral-200 bg-neutral-100 text-neutral-600" },
  }[status];
  return (
    <Badge variant="outline" className={cn("rounded-lg text-xs font-semibold", map.className)}>
      {map.label}
    </Badge>
  );
}

type PageProps = { params: { slug: string } };

export default function AdminShopDetailPage({ params }: PageProps) {
  const shop = getAdminShopBySlug(params.slug);
  if (!shop) notFound();

  const joinedLabel = formatAdminShopJoinedLabel(shop.joinedAt);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="h-9 w-fit gap-2 rounded-xl px-2 text-neutral-600" asChild>
          <Link href="/admin/shops">
            <ArrowLeft className="size-4" />
            Retour aux boutiques
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold" asChild>
            <Link href={`/shop/${shop.slug}`} target="_blank" rel="noreferrer">
              Voir la vitrine
              <ExternalLink className="ml-1.5 size-3.5 opacity-70" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold" disabled type="button">
            Ouvrir fiche commerçant
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-neutral-200 bg-white text-lg font-bold text-neutral-700 shadow-sm">
            {shop.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{shop.name}</h1>
              <StatusBadge status={shop.status} />
            </div>
            <code className="mt-1 block text-sm text-neutral-500">/{shop.slug}</code>
            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              Fiche admin — données démo. Historique commandes, logs et actions de modération seront branchés sur l&apos;API.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Produits publiés", value: String(shop.products), icon: Package },
          { label: "Commandes (30 j.)", value: String(shop.orders30d), icon: ShoppingCart },
          { label: "Inscription", value: joinedLabel, icon: Calendar },
          { label: "ID interne", value: `#${shop.id}`, icon: Store },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-2xl border-0 bg-white shadow-soft">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-neutral-400">{label}</p>
                <Icon className="size-4 text-neutral-400" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-bold tabular-nums text-neutral-950">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <MapPin className="size-4 text-neutral-500" strokeWidth={1.5} />
              Localisation vitrine
            </CardTitle>
            <CardDescription className="text-xs">Affichée côté client (démo)</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-3 pt-5 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Ville</p>
              <p className="mt-0.5 font-medium text-neutral-900">{shop.city}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Quartier</p>
              <p className="mt-0.5 font-medium text-neutral-900">{shop.neighborhood}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <User className="size-4 text-neutral-500" strokeWidth={1.5} />
              Commerçant
            </CardTitle>
            <CardDescription className="text-xs">Contact principal (démo)</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-3 pt-5 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Nom</p>
              <p className="mt-0.5 font-medium text-neutral-900">{shop.merchantName}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">E-mail</p>
              <p className="mt-0.5 font-medium text-neutral-900">{shop.merchantEmail}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">WhatsApp</p>
              <p className="mt-0.5 flex items-center gap-2 font-medium text-neutral-900">
                <MessageCircle className="size-3.5 text-emerald-600" />
                {shop.whatsappPhone}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-neutral-950">Audit & modération</CardTitle>
          <CardDescription className="text-xs">
            Journal des actions, suspensions et validations — à connecter à Supabase / Edge Functions.
          </CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="py-10 text-center text-sm text-neutral-400">
          Aucun événement enregistré (phase démo).
        </CardContent>
      </Card>
    </div>
  );
}
