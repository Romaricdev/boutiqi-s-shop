import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Radio,
  Store,
  User,
  Wallet,
  WifiOff,
  Activity,
} from "lucide-react";

import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table";
import { cn } from "@/lib/cn";
import {
  adminOrderStatusLabel,
  formatAdminOrderDateTime,
  getAdminPlatformOrderById,
  type AdminOrderChannel,
} from "@/lib/admin/orders";
import type { OrderStatus } from "@/lib/types/dashboard";

function channelLabel(c: AdminOrderChannel) {
  return c === "whatsapp" ? "WhatsApp" : "Lien boutique";
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map = {
    new: "border-amber-200 bg-amber-50 text-amber-900",
    confirmed: "border-blue-200 bg-blue-50 text-blue-900",
    preparing: "border-orange-200 bg-orange-50 text-orange-900",
    delivering: "border-violet-200 bg-violet-50 text-violet-900",
    delivered: "border-emerald-200 bg-emerald-50 text-emerald-900",
    cancelled: "border-neutral-200 bg-neutral-100 text-neutral-600",
  }[status];
  return (
    <Badge variant="outline" className={cn("rounded-lg text-xs font-semibold", map)}>
      {adminOrderStatusLabel(status)}
    </Badge>
  );
}

type PageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function AdminOrderDetailPage({ params, searchParams }: PageProps) {
  const order = getAdminPlatformOrderById(params.id);
  if (!order) notFound();

  const apiSimulateError = searchParams?.error === "1";

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="h-9 w-fit gap-2 rounded-xl px-2 text-neutral-600" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="size-4" />
            Retour aux commandes
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold" asChild>
            <Link href={`/admin/shops/${order.shopSlug}`}>Fiche boutique</Link>
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-semibold" asChild>
            <Link href={`/shop/${order.shopSlug}`} target="_blank" rel="noreferrer">
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
            <p className="font-semibold">{apiSimulateError ? "Erreur réseau (simulation)" : "Lecture démo"}</p>
            <p className="text-xs opacity-90">
              Détail statique — les actions commerçant / support seront branchées sur l&apos;API.
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
            <h1 className="font-mono text-2xl font-bold tracking-tight text-neutral-900">{order.publicRef}</h1>
            <StatusBadge status={order.status} />
            <Badge variant="secondary" className="rounded-lg text-xs">
              {channelLabel(order.channel)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500">ID interne · {order.id}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Montant", value: `${order.total.toLocaleString("fr-FR")} FCFA`, icon: Wallet },
          { label: "Création", value: formatAdminOrderDateTime(order.createdAt), icon: Package },
          { label: "Dernière mise à jour", value: formatAdminOrderDateTime(order.updatedAt), icon: Package },
          {
            label: "Livraison",
            value: order.deliveryType === "delivery" ? "À domicile" : "Retrait",
            icon: MapPin,
            sub: order.address,
          },
        ].map(({ label, value, icon: Icon, sub }) => (
          <Card key={label} className="rounded-2xl border-0 bg-white shadow-soft">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-neutral-400">{label}</p>
                <Icon className="size-4 text-neutral-400" strokeWidth={1.5} />
              </div>
              <p className="text-base font-bold text-neutral-950">{value}</p>
              {sub ? <p className="text-xs text-neutral-500">{sub}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <Store className="size-4 text-neutral-500" strokeWidth={1.5} />
              Boutique & commerçant
            </CardTitle>
            <CardDescription className="text-xs">Contexte plateforme</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-5 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Boutique</p>
              <p className="mt-0.5 font-medium text-neutral-900">{order.shopName}</p>
              <code className="text-xs text-neutral-400">{order.shopSlug}</code>
              <p className="mt-1 text-xs text-neutral-500">{order.city}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Commerçant</p>
              <p className="mt-0.5 font-medium text-neutral-900">{order.merchantName}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-950">
              <User className="size-4 text-neutral-500" strokeWidth={1.5} />
              Client
            </CardTitle>
            <CardDescription className="text-xs">Coordonnées de commande</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-5 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Nom</p>
              <p className="mt-0.5 font-medium text-neutral-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Téléphone</p>
              <p className="mt-0.5 flex items-center gap-2 font-medium text-neutral-900">
                <Phone className="size-3.5 text-neutral-400" />
                {order.customerPhone}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Canal</p>
              <p className="mt-0.5 flex items-center gap-2 font-medium text-neutral-900">
                <MessageCircle className="size-3.5 text-emerald-600" />
                {channelLabel(order.channel)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-neutral-950">Lignes de commande</CardTitle>
          <CardDescription className="text-xs">{order.lines.length} article(s) — snapshot démo</CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="pt-5">
          <div className="overflow-x-auto rounded-xl border border-neutral-100">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-100 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-neutral-500">Produit</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-neutral-500">Prix unit.</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-neutral-500">Qté</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-neutral-500">Sous-total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.lines.map((l, i) => (
                  <TableRow key={`${l.productName}-${i}`} className="border-neutral-100">
                    <TableCell className="font-medium text-neutral-900">{l.productName}</TableCell>
                    <TableCell className="text-right tabular-nums text-neutral-600">
                      {l.unitPrice.toLocaleString("fr-FR")} FCFA
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-neutral-600">{l.quantity}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-neutral-900">
                      {l.subtotal.toLocaleString("fr-FR")} FCFA
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-end border-t border-neutral-100 pt-4">
            <p className="text-sm text-neutral-500">
              Total{" "}
              <span className="ml-2 text-lg font-bold tabular-nums text-neutral-950">
                {order.total.toLocaleString("fr-FR")} FCFA
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
