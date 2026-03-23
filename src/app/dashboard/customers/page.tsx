"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  UserRound,
  MoreHorizontal,
  MessageCircle,
  Send,
  Eye,
  X,
  Wallet,
  Star,
  Clock3,
  Check,
  Tags,
} from "lucide-react";

import { useDashboardStore } from "@/lib/store/dashboard";
import type { DashboardOrder } from "@/lib/types/dashboard";
import { cn } from "@/lib/cn";

type Segment = "all" | "vip" | "recent" | "inactive" | "followup";
type SortMode = "spent-desc" | "orders-desc" | "recent-desc";
const PAGE_SIZE = 8;

type CustomerRow = {
  name: string;
  phone: string;
  orders: number;
  spent: number;
  avgBasket: number;
  lastOrderAt: string;
  status: "vip" | "recent" | "inactive";
  orderList: DashboardOrder[];
  notes: string;
  tags: string[];
  needsFollowUp: boolean;
  followUpReason?: string;
};

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const FOLLOW_UP_DAYS = 14;
const FREQUENT_TAG_SUGGESTIONS = [
  "fidele",
  "gros-panier",
  "a-risque",
  "nouveau",
  "a-relancer",
  "achat-recent",
];

type WhatsAppTemplateContext = "followup" | "thanks" | "promo";

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "");
}

function waNumberFromPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("237")) return cleaned;
  return `237${cleaned}`;
}

function buildWhatsAppTemplate(customer: CustomerRow, context: WhatsAppTemplateContext) {
  if (context === "followup") {
    return [
      `Bonjour ${customer.name},`,
      ``,
      `Nous espérons que vous allez bien.`,
      `Nous restons disponibles pour votre prochaine commande sur notre boutique.`,
      `Souhaitez-vous que nous vous partagions nos nouveautés du moment ?`,
      ``,
      `Merci pour votre confiance.`,
    ].join("\n");
  }
  if (context === "thanks") {
    return [
      `Bonjour ${customer.name},`,
      ``,
      `Merci beaucoup pour votre dernière commande.`,
      `Votre confiance nous fait vraiment plaisir.`,
      ``,
      `A très bientôt sur notre boutique.`,
    ].join("\n");
  }
  return [
    `Bonjour ${customer.name},`,
    ``,
    `Nous avons de nouvelles offres qui pourraient vous intéresser cette semaine.`,
    `Dites-nous si vous souhaitez que nous vous enverrions une sélection personnalisée.`,
    ``,
    `Belle journée a vous.`,
  ].join("\n");
}

export default function DashboardCustomersPage() {
  const { orders, vipCustomerPhones, customerProfiles, setCustomerVip, setCustomerProfile } = useDashboardStore();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [sortMode, setSortMode] = useState<SortMode>("spent-desc");
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();

    for (const order of orders) {
      const key = order.customerPhone;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          name: order.customerName,
          phone: order.customerPhone,
          orders: 1,
          spent: order.status === "cancelled" ? 0 : order.total,
          avgBasket: order.status === "cancelled" ? 0 : order.total,
          lastOrderAt: order.createdAt,
          status: "recent",
          orderList: [order],
          notes: "",
          tags: [],
          needsFollowUp: false,
        });
      } else {
        existing.orders += 1;
        existing.spent += order.status === "cancelled" ? 0 : order.total;
        existing.orderList.push(order);
        if (new Date(order.createdAt).getTime() > new Date(existing.lastOrderAt).getTime()) {
          existing.lastOrderAt = order.createdAt;
          existing.name = order.customerName;
        }
      }
    }

    const now = Date.now();
    return [...map.values()].map((c) => {
      const daysSinceLast = (now - new Date(c.lastOrderAt).getTime()) / (24 * 60 * 60 * 1000);
      const avgBasket = c.orders > 0 ? Math.round(c.spent / c.orders) : 0;
      const isVip = vipCustomerPhones.includes(normalizePhone(c.phone));
      const status: CustomerRow["status"] = isVip ? "vip" : daysSinceLast > 30 ? "inactive" : "recent";
      const profile = customerProfiles[normalizePhone(c.phone)] ?? { notes: "", tags: [] };
      const needsFollowUp = daysSinceLast >= FOLLOW_UP_DAYS || status === "inactive";
      const followUpReason = status === "inactive"
        ? "Inactif depuis plus de 30 jours"
        : daysSinceLast >= FOLLOW_UP_DAYS
          ? `Aucune commande depuis ${Math.floor(daysSinceLast)} jours`
          : undefined;
      return {
        ...c,
        avgBasket,
        status,
        notes: profile.notes,
        tags: profile.tags,
        needsFollowUp,
        followUpReason,
        orderList: c.orderList.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
      };
    });
  }, [orders, vipCustomerPhones, customerProfiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));

    if (segment !== "all") {
      if (segment === "followup") list = list.filter((c) => c.needsFollowUp);
      else list = list.filter((c) => c.status === segment);
    }

    const sorted = [...list];
    if (sortMode === "orders-desc") sorted.sort((a, b) => b.orders - a.orders);
    else if (sortMode === "recent-desc") sorted.sort((a, b) => +new Date(b.lastOrderAt) - +new Date(a.lastOrderAt));
    else sorted.sort((a, b) => b.spent - a.spent);

    return sorted;
  }, [customers, query, segment, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [query, segment, sortMode]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const profile = useMemo(() => filtered.find((c) => c.phone === profilePhone) ?? customers.find((c) => c.phone === profilePhone) ?? null, [filtered, customers, profilePhone]);

  const totalCustomers = customers.length;
  const active30Days = customers.filter((c) => Date.now() - +new Date(c.lastOrderAt) <= THIRTY_DAYS).length;
  const vipCustomers = customers.filter((c) => c.status === "vip").length;
  const followUpCount = customers.filter((c) => c.needsFollowUp).length;
  const averageSpent = customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.spent, 0) / customers.length) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-warm-900 lg:text-2xl">Clients</h1>
          <p className="mt-0.5 text-sm text-warm-500">Simple, clair et orienté relation client.</p>
        </div>
        <div className="text-xs text-warm-500">
          <span className="font-semibold text-warm-900">{filtered.length}</span> client(s) &middot; page {page}/{totalPages}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={<UserRound className="size-4" />} label="Total clients" value={`${totalCustomers}`} />
        <Kpi icon={<Clock3 className="size-4" />} label="Actifs 30 j." value={`${active30Days}`} />
        <Kpi icon={<Star className="size-4" />} label="VIP" value={`${vipCustomers}`} />
        <Kpi
          icon={<Wallet className="size-4" />}
          label="Dépense moy."
          value={`${averageSpent.toLocaleString()} F`}
          sub={`${followUpCount} à relancer`}
        />
      </div>

      <div className="rounded-lg border border-warm-200 bg-white p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-warm-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un client…"
              className="h-9 w-full rounded-lg border border-warm-200 bg-warm-50/60 pl-8 pr-3 text-xs text-warm-900 outline-none placeholder:text-warm-400 focus:border-brand-400 focus:bg-white focus:ring-1 focus:ring-brand-400/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SegmentPill active={segment === "all"} label="Tous" onClick={() => setSegment("all")} />
            <SegmentPill active={segment === "vip"} label="VIP" onClick={() => setSegment("vip")} />
            <SegmentPill active={segment === "recent"} label="Récents" onClick={() => setSegment("recent")} />
            <SegmentPill active={segment === "inactive"} label="Inactifs" onClick={() => setSegment("inactive")} />
            <SegmentPill active={segment === "followup"} label="À relancer" onClick={() => setSegment("followup")} />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="h-8 rounded-md border border-warm-200 bg-white px-2 text-xs text-warm-700 outline-none"
            >
              <option value="spent-desc">Tri: dépense</option>
              <option value="orders-desc">Tri: commandes</option>
              <option value="recent-desc">Tri: récent</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-warm-200 bg-white px-4 py-8 text-center text-sm text-warm-500">
          Aucun client trouvé.
        </div>
      ) : (
        <>
          {/* Mobile: cartes, plus lisibles */}
          <div className="space-y-2.5 sm:hidden">
            {paginated.map((c) => (
              <CustomerCardMobile
                key={c.phone}
                customer={c}
                onOpenProfile={() => setProfilePhone(c.phone)}
                onToggleVip={() => setCustomerVip(c.phone, c.status !== "vip")}
              />
            ))}
          </div>

          {/* Desktop/tablette large: tableau complet */}
          <div className="hidden overflow-hidden rounded-lg border border-warm-200 bg-white sm:block">
            <div className="grid grid-cols-[2fr,90px,130px,120px,120px,70px] gap-2 border-b border-warm-100 bg-warm-50/60 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-warm-500">
              <span>Client</span>
              <span className="text-right">Cmd</span>
              <span className="text-right">Total</span>
              <span className="text-right">Panier moy.</span>
              <span className="text-right">Dernière</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-warm-100">
              {paginated.map((c) => (
                <div key={c.phone} className="grid grid-cols-[2fr,90px,130px,120px,120px,70px] gap-2 px-4 py-3 text-sm text-warm-700">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-md bg-warm-100 text-warm-500">
                        <UserRound className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-warm-900">{c.name}</p>
                        <div className="flex items-center gap-1">
                          <p className="truncate text-xs text-warm-500">{c.phone}</p>
                          <StatusDot status={c.status} />
                        </div>
                        {(c.tags.length > 0 || c.needsFollowUp) && (
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            {c.needsFollowUp && (
                              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                A relancer
                              </span>
                            )}
                            {c.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="rounded-full bg-warm-100 px-1.5 py-0.5 text-[10px] text-warm-600">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-right font-medium text-warm-800">{c.orders}</span>
                  <span className="text-right font-medium text-warm-800">{c.spent.toLocaleString()} F</span>
                  <span className="text-right text-warm-600">{c.avgBasket.toLocaleString()} F</span>
                  <span className="text-right text-warm-500">
                    {new Date(c.lastOrderAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <div className="text-right">
                    <CustomerActionsMenu
                      customer={c}
                      onOpenProfile={() => setProfilePhone(c.phone)}
                      onToggleVip={() => setCustomerVip(c.phone, c.status !== "vip")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warm-200 bg-white px-3 py-2.5">
          <p className="text-xs text-warm-500">
            Affichage {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-
            {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-warm-200 px-2.5 py-1 text-xs font-medium text-warm-700 transition hover:bg-warm-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <div key={p} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-xs text-warm-400">…</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        "grid size-7 place-items-center rounded-md border text-xs font-semibold transition",
                        p === page
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-warm-200 bg-white text-warm-600 hover:bg-warm-50",
                      )}
                    >
                      {p}
                    </button>
                  </div>
                ))}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-warm-200 px-2.5 py-1 text-xs font-medium text-warm-700 transition hover:bg-warm-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {profile && (
        <CustomerProfileModal
          customer={profile}
          onClose={() => setProfilePhone(null)}
          onSaveProfile={(notes, tags) => setCustomerProfile(profile.phone, { notes, tags })}
        />
      )}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex min-h-[124px] flex-col justify-between rounded-lg border border-warm-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between text-warm-500">
        <p className="text-xs font-medium">{label}</p>
        <span className="grid size-7 place-items-center rounded-md bg-warm-100">{icon}</span>
      </div>
      <p className="mt-1 text-3xl font-bold leading-none text-warm-900">{value}</p>
      {sub ? <p className="text-[11px] text-warm-500">{sub}</p> : null}
    </div>
  );
}

function SegmentPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold transition",
        active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-warm-200 bg-white text-warm-600 hover:bg-warm-50",
      )}
    >
      {label}
    </button>
  );
}

function StatusDot({ status }: { status: CustomerRow["status"] }) {
  const config = {
    vip: "bg-amber-400",
    recent: "bg-brand-500",
    inactive: "bg-warm-300",
  }[status];
  const label = {
    vip: "VIP",
    recent: "Actif",
    inactive: "Inactif",
  }[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warm-100 px-1.5 py-0.5 text-[10px] font-medium text-warm-600">
      <span className={cn("size-1.5 rounded-full", config)} />
      {label}
    </span>
  );
}

function CustomerActionsMenu({
  customer,
  onOpenProfile,
  onToggleVip,
}: {
  customer: CustomerRow;
  onOpenProfile: () => void;
  onToggleVip: () => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; up: boolean }>({
    top: 0,
    left: 0,
    up: false,
  });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePos = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 190;
      const menuHeight = 120;
      const gap = 8;
      const up = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;
      const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
      const top = up ? rect.top - gap : rect.bottom + gap;
      setMenuPos({ top, left, up });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open]);

  const whatsappHref = `https://wa.me/237${customer.phone.replace(/\D/g, "")}`;

  return (
    <div className="inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid size-8 place-items-center rounded-md border border-warm-200 bg-white text-warm-600 transition hover:bg-warm-50"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-10" aria-label="Fermer menu actions" onClick={() => setOpen(false)} />
          <div
            className={cn(
              "fixed z-20 min-w-[190px] rounded-lg border border-warm-200 bg-white p-1.5 shadow-lg",
              menuPos.up && "-translate-y-full",
            )}
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              type="button"
              onClick={() => {
                onOpenProfile();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-warm-700 hover:bg-warm-50"
            >
              <Eye className="size-3.5" />
              Voir le profil
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              <MessageCircle className="size-3.5" />
              Écrire sur WhatsApp
            </a>
            <a
              href={`https://wa.me/${waNumberFromPhone(customer.phone)}?text=${encodeURIComponent(buildWhatsAppTemplate(customer, "followup"))}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              <Send className="size-3.5" />
              Template: Relance
            </a>
            <a
              href={`https://wa.me/${waNumberFromPhone(customer.phone)}?text=${encodeURIComponent(buildWhatsAppTemplate(customer, "thanks"))}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              <Send className="size-3.5" />
              Template: Remerciement
            </a>
            <a
              href={`https://wa.me/${waNumberFromPhone(customer.phone)}?text=${encodeURIComponent(buildWhatsAppTemplate(customer, "promo"))}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              <Send className="size-3.5" />
              Template: Promo
            </a>
            <button
              type="button"
              onClick={() => {
                onToggleVip();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-amber-700 hover:bg-amber-50"
            >
              <Star className="size-3.5" />
              {customer.status === "vip" ? "Retirer VIP" : "Marquer VIP"}
              {customer.status === "vip" && <Check className="ml-auto size-3.5 text-amber-600" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CustomerCardMobile({
  customer,
  onOpenProfile,
  onToggleVip,
}: {
  customer: CustomerRow;
  onOpenProfile: () => void;
  onToggleVip: () => void;
}) {
  return (
    <div className="rounded-lg border border-warm-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-warm-100 text-warm-500">
              <UserRound className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-warm-900">{customer.name}</p>
              <p className="truncate text-xs text-warm-500">{customer.phone}</p>
            </div>
          </div>
        </div>
        <CustomerActionsMenu
          customer={customer}
          onOpenProfile={onOpenProfile}
          onToggleVip={onToggleVip}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-warm-50 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-warm-400">Commandes</p>
          <p className="text-sm font-semibold text-warm-900">{customer.orders}</p>
        </div>
        <div className="rounded-md bg-warm-50 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-warm-400">Total</p>
          <p className="text-sm font-semibold text-warm-900">{customer.spent.toLocaleString()} F</p>
        </div>
        <div className="rounded-md bg-warm-50 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-warm-400">Panier moy.</p>
          <p className="text-sm font-semibold text-warm-900">{customer.avgBasket.toLocaleString()} F</p>
        </div>
        <div className="rounded-md bg-warm-50 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-warm-400">Dernière</p>
          <p className="text-sm font-semibold text-warm-900">
            {new Date(customer.lastOrderAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
          </p>
        </div>
      </div>

      <div className="mt-2">
        <StatusDot status={customer.status} />
        {(customer.tags.length > 0 || customer.needsFollowUp) && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {customer.needsFollowUp && (
              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                A relancer
              </span>
            )}
            {customer.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-warm-100 px-1.5 py-0.5 text-[10px] text-warm-600">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerProfileModal({
  customer,
  onClose,
  onSaveProfile,
}: {
  customer: CustomerRow | null;
  onClose: () => void;
  onSaveProfile: (notes: string, tags: string[]) => void;
}) {
  const [notesDraft, setNotesDraft] = useState(customer?.notes ?? "");
  const [tagsDraft, setTagsDraft] = useState(customer?.tags.join(", ") ?? "");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setNotesDraft(customer?.notes ?? "");
    setTagsDraft(customer?.tags.join(", ") ?? "");
    setTagInput("");
  }, [customer]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!customer) return null;
  if (!mounted) return null;

  const tags = tagsDraft
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
  const suggestedTags = FREQUENT_TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).slice(0, 6);

  const addTag = () => {
    const next = tagInput.trim().toLowerCase();
    if (!next) return;
    if (tags.includes(next) || tags.length >= 8) {
      setTagInput("");
      return;
    }
    setTagsDraft([...tags, next].join(", "));
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTagsDraft(tags.filter((t) => t !== tagToRemove).join(", "));
  };

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl border border-warm-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-warm-100 bg-white px-4 py-3">
          <div>
            <p className="text-xs text-warm-500">Profil client</p>
            <p className="text-sm font-semibold text-warm-900">{customer.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md border border-warm-200 text-warm-500 hover:bg-warm-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <MiniInfo label="Téléphone" value={customer.phone} />
            <MiniInfo label="Commandes" value={`${customer.orders}`} />
            <MiniInfo label="Total dépensé" value={`${customer.spent.toLocaleString()} F`} />
          </div>
          {customer.needsFollowUp && customer.followUpReason && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <p className="font-semibold">Client à relancer</p>
              <p className="mt-0.5">{customer.followUpReason}</p>
            </div>
          )}

          <div className="rounded-lg border border-warm-200 bg-white px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-warm-500">
              <Tags className="size-3.5" />
              Notes & tags
            </div>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={3}
              placeholder="Notes internes sur ce client..."
              className="w-full rounded-md border border-warm-200 bg-warm-50/50 px-2.5 py-2 text-sm text-warm-800 outline-none focus:border-brand-400"
            />
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Ajouter un tag (ex: fidèle)"
              className="mt-2 h-9 w-full rounded-md border border-warm-200 bg-warm-50/50 px-2.5 text-xs text-warm-700 outline-none focus:border-brand-400"
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-warm-100 px-2 py-1 text-[11px] font-medium text-warm-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full p-0.5 text-warm-500 transition hover:bg-warm-200 hover:text-warm-700"
                    aria-label={`Supprimer le tag ${tag}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={addTag}
                className="rounded-md border border-warm-200 px-2 py-1 text-[11px] font-semibold text-warm-700 hover:bg-warm-50"
              >
                Ajouter
              </button>
            </div>
            {suggestedTags.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-warm-400">
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (tags.length >= 8) return;
                        setTagsDraft([...tags, tag].join(", "));
                      }}
                      className="rounded-full border border-warm-200 bg-white px-2 py-1 text-[11px] font-medium text-warm-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    >
                      + #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onSaveProfile(notesDraft.trim(), [...new Set(tags)]);
                }}
                className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Enregistrer
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-warm-200">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-warm-100 bg-warm-50/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-warm-500">
              <span>Commande</span>
              <span className="text-right">Statut</span>
              <span className="text-right">Montant</span>
            </div>
            <div className="divide-y divide-warm-100">
              {customer.orderList.slice(0, 6).map((o) => (
                <div key={o.id} className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-mono text-xs font-semibold text-warm-800">#{o.id.slice(-6)}</p>
                    <p className="text-xs text-warm-500">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="self-center text-right text-xs text-warm-600">{o.status}</span>
                  <span className="self-center text-right font-semibold text-warm-900">{o.total.toLocaleString()} F</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-warm-100 bg-warm-50/60 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-warm-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-warm-900">{value}</p>
    </div>
  );
}
