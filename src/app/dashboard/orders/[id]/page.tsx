"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  MapPin,
  Package,
  User,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ShoppingBag,
  Phone,
  Copy,
  Hash,
} from "lucide-react";

import { useDashboardStore } from "@/lib/store/dashboard";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types/dashboard";
import { ORDER_NEXT_STATUS } from "@/lib/utils/order-status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  new: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  preparing: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  delivering: { bg: "bg-brand-50", text: "text-brand-700", dot: "bg-brand-500" },
  delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { bg: "bg-warm-100", text: "text-warm-500", dot: "bg-warm-400" },
};

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  new: <Clock className="size-4" />,
  confirmed: <CheckCircle2 className="size-4" />,
  preparing: <ShoppingBag className="size-4" />,
  delivering: <Truck className="size-4" />,
  delivered: <PackageCheck className="size-4" />,
  cancelled: <XCircle className="size-4" />,
};

const PIPELINE: OrderStatus[] = ["new", "confirmed", "preparing", "delivering", "delivered"];

function getPipelineIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  return PIPELINE.indexOf(status);
}

export default function DashboardOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { orders, shop, updateOrderStatus } = useDashboardStore();
  const order = orders.find((o) => o.id === id);
  const nextStatuses = order ? ORDER_NEXT_STATUS[order.status] : null;
  const currentPipelineIdx = order ? getPipelineIndex(order.status) : -1;

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!order) return;
    updateOrderStatus(order.id, newStatus);
  };

  const whatsAppClient = () => {
    if (!order || !shop) return;
    const phone = order.customerPhone.replace(/\D/g, "");
    const num = phone.startsWith("237") ? phone : `237${phone}`;
    const lines = [
      `Bonjour ${order.customerName},`,
      `Votre commande #${order.id.slice(-6)} :`,
      ...order.items.map(
        (i) => `  - ${i.productName} x${i.quantity} = ${i.subtotal.toLocaleString()} F`,
      ),
      `Total : ${order.total.toLocaleString()} FCFA`,
    ];
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order?.id ?? "");
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-warm-200 bg-white py-14 text-center">
        <div className="grid size-14 place-items-center rounded-lg bg-warm-100">
          <Package className="size-8 text-warm-300" />
        </div>
        <p className="mt-4 text-sm font-semibold text-warm-700">Commande introuvable</p>
        <Link
          href="/dashboard/orders"
          className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline"
        >
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const sc = STATUS_COLORS[order.status];
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-5">
      {/* Breadcrumb + header */}
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-500 transition hover:text-warm-800"
        >
          <ArrowLeft className="size-3.5" />
          Commandes
        </Link>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-warm-100">
              <Hash className="size-5 text-warm-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-warm-900">
                Commande #{order.id.slice(-6)}
              </h1>
              <p className="text-xs text-warm-400">
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                sc.bg,
                sc.text,
              )}
            >
              {STATUS_ICONS[order.status]}
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <button
              type="button"
              onClick={copyOrderId}
              className="grid size-8 place-items-center rounded-md border border-warm-200 text-warm-400 transition hover:bg-warm-50 hover:text-warm-600"
              title="Copier l'ID"
            >
              <Copy className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline pipeline (non-cancelled) */}
      {order.status !== "cancelled" && (
        <div className="rounded-lg border border-warm-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            {PIPELINE.map((step, idx) => {
              const done = idx <= currentPipelineIdx;
              const isCurrent = idx === currentPipelineIdx;
              const stepSc = STATUS_COLORS[step];

              return (
                <div key={step} className="flex items-center gap-0 first:gap-0">
                  {idx > 0 && (
                    <div
                      className={cn(
                        "hidden h-0.5 sm:block",
                        done ? "bg-brand-400" : "bg-warm-200",
                      )}
                      style={{ width: "100%" }}
                    />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "grid size-8 place-items-center rounded-full transition",
                        isCurrent
                          ? cn(stepSc.bg, stepSc.text, "ring-2 ring-offset-1", `ring-current`)
                          : done
                            ? "bg-brand-500 text-white"
                            : "bg-warm-100 text-warm-400",
                      )}
                    >
                      {STATUS_ICONS[step]}
                    </div>
                    <span
                      className={cn(
                        "hidden text-[10px] font-medium sm:block",
                        isCurrent ? "text-warm-900" : done ? "text-warm-600" : "text-warm-400",
                      )}
                    >
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Progress bar mobile */}
          <div className="mt-3 sm:hidden">
            <div className="flex items-center justify-between text-[10px] font-medium text-warm-500">
              <span>{ORDER_STATUS_LABELS[order.status]}</span>
              <span>{currentPipelineIdx + 1}/{PIPELINE.length}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-warm-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${((currentPipelineIdx + 1) / PIPELINE.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {order.status === "cancelled" && (
        <div className="rounded-lg border border-warm-200 bg-warm-50 px-5 py-4 text-center">
          <XCircle className="mx-auto size-8 text-warm-400" />
          <p className="mt-2 text-sm font-semibold text-warm-600">Cette commande a été annulée</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Articles */}
          <div className="rounded-lg border border-warm-200 bg-white">
            <div className="flex items-center justify-between border-b border-warm-100 px-5 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-warm-900">
                <Package className="size-4 text-warm-500" />
                Articles
                <span className="rounded bg-warm-100 px-1.5 py-0.5 text-[10px] font-medium text-warm-500">
                  {itemCount}
                </span>
              </h2>
            </div>
            <div className="divide-y divide-warm-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-warm-900">{item.productName}</div>
                    <div className="mt-0.5 text-xs text-warm-400">
                      {item.productPrice.toLocaleString()} F &times; {item.quantity}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-warm-900">
                    {item.subtotal.toLocaleString()} F
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-warm-200 bg-warm-50/40 px-5 py-3">
              <span className="text-sm font-bold text-warm-900">Total</span>
              <span className="text-lg font-bold text-brand-600">
                {order.total.toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* Actions statut */}
          {nextStatuses && nextStatuses.length > 0 && (
            <div className="rounded-lg border border-warm-200 bg-white px-5 py-4">
              <h2 className="text-sm font-semibold text-warm-900">Actions</h2>
              <p className="mt-0.5 text-xs text-warm-400">
                Faites avancer le statut de cette commande.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {nextStatuses
                  .filter((s) => s !== "cancelled")
                  .map((status) => {
                    const nsc = STATUS_COLORS[status];
                    return (
                      <Button
                        key={status}
                        type="button"
                        size="sm"
                        onClick={() => handleStatusChange(status)}
                        className={cn(nsc.bg, nsc.text, "border", "border-current/10 hover:opacity-90")}
                      >
                        {STATUS_ICONS[status]}
                        {ORDER_STATUS_LABELS[status]}
                      </Button>
                    );
                  })}
                {nextStatuses.includes("cancelled") && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStatusChange("cancelled")}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="size-3.5" />
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Client */}
          <div className="rounded-lg border border-warm-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-warm-900">
              <User className="size-4 text-warm-500" />
              Client
            </h2>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3 rounded-lg bg-warm-50/60 px-3 py-2.5">
                <div className="grid size-9 place-items-center rounded-lg bg-white text-warm-400">
                  <User className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-warm-900">
                    {order.customerName}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-warm-500">
                    <Phone className="size-3" />
                    {order.customerPhone}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={whatsAppClient}
                className="w-full"
              >
                <MessageCircle className="size-4 text-green-600" />
                Contacter sur WhatsApp
              </Button>
            </div>
          </div>

          {/* Livraison */}
          <div className="rounded-lg border border-warm-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-warm-900">
              {order.deliveryType === "delivery" ? (
                <Truck className="size-4 text-warm-500" />
              ) : (
                <Package className="size-4 text-warm-500" />
              )}
              {order.deliveryType === "delivery" ? "Livraison" : "Retrait en boutique"}
            </h2>
            <div className="mt-3 space-y-2">
              {order.address && (
                <div className="flex items-start gap-2 rounded-lg bg-warm-50/60 px-3 py-2.5 text-sm text-warm-700">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-warm-400" />
                  <span>{order.address}</span>
                </div>
              )}
              {order.note && (
                <div className="rounded-lg bg-amber-50/60 px-3 py-2.5 text-xs text-amber-700">
                  <span className="font-semibold">Note : </span>
                  {order.note}
                </div>
              )}
              {!order.address && !order.note && (
                <p className="text-xs text-warm-400">Aucune information complémentaire.</p>
              )}
            </div>
          </div>

          {/* Résumé */}
          <div className="rounded-lg border border-warm-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-warm-900">Résumé</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-warm-500">ID commande</dt>
                <dd className="font-mono font-medium text-warm-700">#{order.id.slice(-6)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-warm-500">Token suivi</dt>
                <dd className="font-mono font-medium text-warm-700">{order.trackingToken}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-warm-500">Articles</dt>
                <dd className="font-medium text-warm-700">{itemCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-warm-500">Type</dt>
                <dd className="font-medium text-warm-700">
                  {order.deliveryType === "delivery" ? "Livraison" : "Retrait"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-warm-500">Mise à jour</dt>
                <dd className="font-medium text-warm-700">
                  {new Date(order.updatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
