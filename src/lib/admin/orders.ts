/**
 * Commandes vues « plateforme » (admin) — démo. À remplacer par API admin / Supabase.
 */

import type { DeliveryType, OrderStatus } from "@/lib/types/dashboard";
import { ORDER_STATUS_LABELS } from "@/lib/types/dashboard";

export type AdminOrderChannel = "whatsapp" | "store_link";

export type AdminPlatformOrderLine = {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type AdminPlatformOrder = {
  id: string;
  /** Référence affichée client / support */
  publicRef: string;
  createdAt: string;
  updatedAt: string;
  shopSlug: string;
  shopName: string;
  merchantName: string;
  city: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  address?: string;
  total: number;
  channel: AdminOrderChannel;
  lines: AdminPlatformOrderLine[];
};

/** Date de référence démo pour filtres 7j / 30j / 90j (cohérent avec les autres mocks admin). */
export const ADMIN_ORDERS_DEMO_ANCHOR_MS = new Date("2025-03-24T23:59:59.000+01:00").getTime();

export type AdminOrderPeriod = "7d" | "30d" | "90d" | "all";

const STATUS_SORT: Record<OrderStatus, number> = {
  new: 0,
  confirmed: 1,
  preparing: 2,
  delivering: 3,
  delivered: 4,
  cancelled: 5,
};

function line(name: string, qty: number, unit: number): AdminPlatformOrderLine {
  return { productName: name, quantity: qty, unitPrice: unit, subtotal: qty * unit };
}

export const MOCK_ADMIN_PLATFORM_ORDERS: AdminPlatformOrder[] = [
  {
    id: "ao-001",
    publicRef: "BQT-91042",
    createdAt: "2025-03-24T08:12:00+01:00",
    updatedAt: "2025-03-24T08:45:00+01:00",
    shopSlug: "ma-boutique",
    shopName: "Ma Boutique",
    merchantName: "Marie N.",
    city: "Douala",
    customerName: "Chantal M.",
    customerPhone: "+237 6 70 11 22 33",
    status: "preparing",
    deliveryType: "delivery",
    address: "Akwa, près de la station",
    total: 22_500,
    channel: "whatsapp",
    lines: [line("Robe wax bleue", 1, 14_500), line("Collier doré", 2, 4_000)],
  },
  {
    id: "ao-002",
    publicRef: "BQT-91041",
    createdAt: "2025-03-24T07:30:00+01:00",
    updatedAt: "2025-03-24T07:35:00+01:00",
    shopSlug: "boutique-solange",
    shopName: "Boutique Solange",
    merchantName: "Solange F.",
    city: "Yaoundé",
    customerName: "Patrick E.",
    customerPhone: "+237 6 81 44 55 66",
    status: "delivering",
    deliveryType: "delivery",
    address: "Bastos",
    total: 67_800,
    channel: "store_link",
    lines: [line("Sac cuir", 1, 45_000), line("Ceinture", 2, 11_400)],
  },
  {
    id: "ao-003",
    publicRef: "BQT-91040",
    createdAt: "2025-03-23T19:05:00+01:00",
    updatedAt: "2025-03-24T06:00:00+01:00",
    shopSlug: "tech-co",
    shopName: "Tech & Co",
    merchantName: "Brice K.",
    city: "Yaoundé",
    customerName: "Hervé K.",
    customerPhone: "+237 6 92 00 11 22",
    status: "delivered",
    deliveryType: "pickup",
    total: 315_000,
    channel: "whatsapp",
    lines: [line("Écran 24\"", 1, 285_000), line("Câble HDMI", 2, 15_000)],
  },
  {
    id: "ao-004",
    publicRef: "BQT-91039",
    createdAt: "2025-03-23T14:22:00+01:00",
    updatedAt: "2025-03-23T14:40:00+01:00",
    shopSlug: "afro-chic",
    shopName: "Afro Chic",
    merchantName: "Grace M.",
    city: "Douala",
    customerName: "Yasmine B.",
    customerPhone: "+237 6 65 33 44 55",
    status: "confirmed",
    deliveryType: "delivery",
    address: "Makepe",
    total: 41_200,
    channel: "whatsapp",
    lines: [line("Ensemble wax", 1, 38_000), line("Foulard", 1, 3_200)],
  },
  {
    id: "ao-005",
    publicRef: "BQT-91038",
    createdAt: "2025-03-22T11:00:00+01:00",
    updatedAt: "2025-03-22T16:10:00+01:00",
    shopSlug: "epicerie-verte",
    shopName: "Épicerie Verte",
    merchantName: "Yves P.",
    city: "Douala",
    customerName: "Famille Ndzana",
    customerPhone: "+237 6 77 88 99 00",
    status: "delivered",
    deliveryType: "delivery",
    total: 18_900,
    channel: "store_link",
    lines: [line("Panier bio hebdo", 1, 18_900)],
  },
  {
    id: "ao-006",
    publicRef: "BQT-91037",
    createdAt: "2025-03-22T09:15:00+01:00",
    updatedAt: "2025-03-22T09:20:00+01:00",
    shopSlug: "chez-kofi",
    shopName: "Chez Kofi",
    merchantName: "Kofi A.",
    city: "Douala",
    customerName: "Marc L.",
    customerPhone: "+237 6 54 12 34 56",
    status: "cancelled",
    deliveryType: "pickup",
    total: 52_000,
    channel: "whatsapp",
    lines: [line("Baskets taille 42", 1, 52_000)],
  },
  {
    id: "ao-007",
    publicRef: "BQT-91036",
    createdAt: "2025-03-21T17:40:00+01:00",
    updatedAt: "2025-03-21T18:00:00+01:00",
    shopSlug: "luxe-kmer",
    shopName: "Luxe Kmer",
    merchantName: "Stéphane L.",
    city: "Douala",
    customerName: "Audrey T.",
    customerPhone: "+237 6 88 77 66 55",
    status: "new",
    deliveryType: "delivery",
    address: "Bonapriso",
    total: 125_000,
    channel: "store_link",
    lines: [line("Coffret soin", 1, 125_000)],
  },
  {
    id: "ao-008",
    publicRef: "BQT-91035",
    createdAt: "2025-03-21T10:00:00+01:00",
    updatedAt: "2025-03-21T15:30:00+01:00",
    shopSlug: "ma-boutique",
    shopName: "Ma Boutique",
    merchantName: "Marie N.",
    city: "Douala",
    customerName: "Serge O.",
    customerPhone: "+237 6 71 22 33 44",
    status: "delivered",
    deliveryType: "pickup",
    total: 9_500,
    channel: "whatsapp",
    lines: [line("Pagne 6 yards", 1, 9_500)],
  },
  {
    id: "ao-009",
    publicRef: "BQT-91034",
    createdAt: "2025-03-20T08:50:00+01:00",
    updatedAt: "2025-03-20T09:00:00+01:00",
    shopSlug: "boutique-solange",
    shopName: "Boutique Solange",
    merchantName: "Solange F.",
    city: "Yaoundé",
    customerName: "Inès F.",
    customerPhone: "+237 6 90 12 12 12",
    status: "preparing",
    deliveryType: "delivery",
    total: 28_400,
    channel: "whatsapp",
    lines: [line("Sandales", 1, 22_000), line("Bracelet", 2, 3_200)],
  },
  {
    id: "ao-010",
    publicRef: "BQT-91033",
    createdAt: "2025-03-19T13:25:00+01:00",
    updatedAt: "2025-03-19T14:00:00+01:00",
    shopSlug: "tech-co",
    shopName: "Tech & Co",
    merchantName: "Brice K.",
    city: "Yaoundé",
    customerName: "Cédric M.",
    customerPhone: "+237 6 83 45 67 89",
    status: "delivered",
    deliveryType: "delivery",
    total: 89_000,
    channel: "store_link",
    lines: [line("Casque BT", 1, 55_000), line("Souris", 2, 17_000)],
  },
  {
    id: "ao-011",
    publicRef: "BQT-91032",
    createdAt: "2025-03-18T16:00:00+01:00",
    updatedAt: "2025-03-18T16:05:00+01:00",
    shopSlug: "afro-chic",
    shopName: "Afro Chic",
    merchantName: "Grace M.",
    city: "Douala",
    customerName: "Léa D.",
    customerPhone: "+237 6 66 55 44 33",
    status: "cancelled",
    deliveryType: "delivery",
    total: 15_000,
    channel: "whatsapp",
    lines: [line("T-shirt", 3, 5_000)],
  },
  {
    id: "ao-012",
    publicRef: "BQT-91031",
    createdAt: "2025-03-17T12:10:00+01:00",
    updatedAt: "2025-03-17T12:30:00+01:00",
    shopSlug: "epicerie-verte",
    shopName: "Épicerie Verte",
    merchantName: "Yves P.",
    city: "Douala",
    customerName: "Claire V.",
    customerPhone: "+237 6 78 90 12 34",
    status: "delivered",
    deliveryType: "pickup",
    total: 6_200,
    channel: "whatsapp",
    lines: [line("Panier fruits", 1, 6_200)],
  },
  {
    id: "ao-013",
    publicRef: "BQT-91030",
    createdAt: "2025-03-16T09:00:00+01:00",
    updatedAt: "2025-03-16T11:00:00+01:00",
    shopSlug: "boutique-solange",
    shopName: "Boutique Solange",
    merchantName: "Solange F.",
    city: "Yaoundé",
    customerName: "Gilles R.",
    customerPhone: "+237 6 91 23 45 67",
    status: "delivered",
    deliveryType: "delivery",
    total: 112_000,
    channel: "store_link",
    lines: [line("Manteau", 1, 98_000), line("Gants", 1, 14_000)],
  },
  {
    id: "ao-014",
    publicRef: "BQT-91029",
    createdAt: "2025-03-15T15:45:00+01:00",
    updatedAt: "2025-03-15T16:00:00+01:00",
    shopSlug: "chez-kofi",
    shopName: "Chez Kofi",
    merchantName: "Kofi A.",
    city: "Douala",
    customerName: "Nina P.",
    customerPhone: "+237 6 72 11 22 33",
    status: "confirmed",
    deliveryType: "pickup",
    total: 34_000,
    channel: "whatsapp",
    lines: [line("Chaussures 38", 1, 34_000)],
  },
  {
    id: "ao-015",
    publicRef: "BQT-91028",
    createdAt: "2025-03-14T10:20:00+01:00",
    updatedAt: "2025-03-14T18:00:00+01:00",
    shopSlug: "luxe-kmer",
    shopName: "Luxe Kmer",
    merchantName: "Stéphane L.",
    city: "Douala",
    customerName: "Vanessa K.",
    customerPhone: "+237 6 84 56 78 90",
    status: "delivered",
    deliveryType: "delivery",
    total: 210_000,
    channel: "whatsapp",
    lines: [line("Parfum collector", 1, 210_000)],
  },
  {
    id: "ao-016",
    publicRef: "BQT-91027",
    createdAt: "2025-03-12T08:00:00+01:00",
    updatedAt: "2025-03-12T08:30:00+01:00",
    shopSlug: "ma-boutique",
    shopName: "Ma Boutique",
    merchantName: "Marie N.",
    city: "Douala",
    customerName: "Bruno S.",
    customerPhone: "+237 6 69 87 65 43",
    status: "delivered",
    deliveryType: "delivery",
    total: 19_900,
    channel: "store_link",
    lines: [line("Chaussure wax", 1, 19_900)],
  },
  {
    id: "ao-017",
    publicRef: "BQT-91026",
    createdAt: "2025-03-10T14:00:00+01:00",
    updatedAt: "2025-03-10T14:15:00+01:00",
    shopSlug: "tech-co",
    shopName: "Tech & Co",
    merchantName: "Brice K.",
    city: "Yaoundé",
    customerName: "Alain Z.",
    customerPhone: "+237 6 75 11 22 33",
    status: "new",
    deliveryType: "pickup",
    total: 12_500,
    channel: "whatsapp",
    lines: [line("Chargeur USB-C", 5, 2_500)],
  },
  {
    id: "ao-018",
    publicRef: "BQT-91025",
    createdAt: "2025-03-08T11:30:00+01:00",
    updatedAt: "2025-03-09T09:00:00+01:00",
    shopSlug: "afro-chic",
    shopName: "Afro Chic",
    merchantName: "Grace M.",
    city: "Douala",
    customerName: "Mireille A.",
    customerPhone: "+237 6 61 00 99 88",
    status: "delivering",
    deliveryType: "delivery",
    address: "Logpom",
    total: 54_500,
    channel: "whatsapp",
    lines: [line("Robe cocktail", 1, 48_000), line("Bijoux", 1, 6_500)],
  },
  {
    id: "ao-019",
    publicRef: "BQT-91024",
    createdAt: "2025-03-05T09:45:00+01:00",
    updatedAt: "2025-03-05T10:00:00+01:00",
    shopSlug: "boutique-prov",
    shopName: "Boutique Provisoire",
    merchantName: "Nouveau V.",
    city: "Garoua",
    customerName: "Test Client",
    customerPhone: "+237 6 99 00 00 00",
    status: "confirmed",
    deliveryType: "pickup",
    total: 3_500,
    channel: "store_link",
    lines: [line("Article test", 1, 3_500)],
  },
  {
    id: "ao-020",
    publicRef: "BQT-91023",
    createdAt: "2025-03-01T16:20:00+01:00",
    updatedAt: "2025-03-02T12:00:00+01:00",
    shopSlug: "epicerie-verte",
    shopName: "Épicerie Verte",
    merchantName: "Yves P.",
    city: "Douala",
    customerName: "Thomas H.",
    customerPhone: "+237 6 76 54 32 10",
    status: "delivered",
    deliveryType: "delivery",
    total: 24_000,
    channel: "whatsapp",
    lines: [line("Pack riz + huile", 2, 12_000)],
  },
  {
    id: "ao-021",
    publicRef: "BQT-91022",
    createdAt: "2025-02-28T13:00:00+01:00",
    updatedAt: "2025-02-28T14:00:00+01:00",
    shopSlug: "luxe-kmer",
    shopName: "Luxe Kmer",
    merchantName: "Stéphane L.",
    city: "Douala",
    customerName: "Julie M.",
    customerPhone: "+237 6 82 11 22 33",
    status: "delivered",
    deliveryType: "pickup",
    total: 45_000,
    channel: "store_link",
    lines: [line("Sérum", 3, 15_000)],
  },
  {
    id: "ao-022",
    publicRef: "BQT-91021",
    createdAt: "2025-02-22T10:00:00+01:00",
    updatedAt: "2025-02-22T11:00:00+01:00",
    shopSlug: "ma-boutique",
    shopName: "Ma Boutique",
    merchantName: "Marie N.",
    city: "Douala",
    customerName: "Olivier C.",
    customerPhone: "+237 6 73 44 55 66",
    status: "delivered",
    deliveryType: "delivery",
    total: 31_000,
    channel: "whatsapp",
    lines: [line("Chemise wax", 2, 15_500)],
  },
  {
    id: "ao-023",
    publicRef: "BQT-91020",
    createdAt: "2025-02-15T08:30:00+01:00",
    updatedAt: "2025-02-15T09:00:00+01:00",
    shopSlug: "tech-co",
    shopName: "Tech & Co",
    merchantName: "Brice K.",
    city: "Yaoundé",
    customerName: "Stéphane B.",
    customerPhone: "+237 6 94 33 22 11",
    status: "cancelled",
    deliveryType: "delivery",
    total: 450_000,
    channel: "whatsapp",
    lines: [line("PC portable", 1, 450_000)],
  },
  {
    id: "ao-024",
    publicRef: "BQT-91019",
    createdAt: "2025-02-10T12:00:00+01:00",
    updatedAt: "2025-02-11T18:00:00+01:00",
    shopSlug: "boutique-solange",
    shopName: "Boutique Solange",
    merchantName: "Solange F.",
    city: "Yaoundé",
    customerName: "Carine L.",
    customerPhone: "+237 6 85 66 77 88",
    status: "delivered",
    deliveryType: "delivery",
    total: 76_000,
    channel: "store_link",
    lines: [line("Robe soirée", 1, 76_000)],
  },
];

export function formatAdminOrderDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAdminOrderDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function adminOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

export function getAdminPlatformOrderById(id: string): AdminPlatformOrder | undefined {
  return MOCK_ADMIN_PLATFORM_ORDERS.find((o) => o.id === id);
}

export function orderMatchesDemoPeriod(createdAtIso: string, period: AdminOrderPeriod): boolean {
  if (period === "all") return true;
  const t = new Date(createdAtIso).getTime();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const min = ADMIN_ORDERS_DEMO_ANCHOR_MS - days * 86_400_000;
  return t >= min && t <= ADMIN_ORDERS_DEMO_ANCHOR_MS + 86_400_000;
}

export function getAdminOrderKpis(rows: AdminPlatformOrder[]) {
  const nonCancelled = rows.filter((o) => o.status !== "cancelled");
  const revenue = nonCancelled.reduce((s, o) => s + o.total, 0);
  const inProgress = rows.filter((o) =>
    ["new", "confirmed", "preparing", "delivering"].includes(o.status),
  ).length;
  const cancelled = rows.filter((o) => o.status === "cancelled").length;
  return {
    count: rows.length,
    revenue,
    inProgress,
    cancelled,
  };
}

export type AdminOrderSortKey =
  | "createdAt"
  | "updatedAt"
  | "total"
  | "shopName"
  | "customerName"
  | "status"
  | "publicRef";

export function sortAdminPlatformOrders(
  rows: AdminPlatformOrder[],
  key: AdminOrderSortKey,
  dir: "asc" | "desc",
): AdminPlatformOrder[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "createdAt":
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "total":
        cmp = a.total - b.total;
        break;
      case "shopName":
        cmp = a.shopName.localeCompare(b.shopName, "fr");
        break;
      case "customerName":
        cmp = a.customerName.localeCompare(b.customerName, "fr");
        break;
      case "status":
        cmp = STATUS_SORT[a.status] - STATUS_SORT[b.status];
        break;
      case "publicRef":
        cmp = a.publicRef.localeCompare(b.publicRef, "fr");
        break;
      default:
        cmp = 0;
    }
    if (cmp !== 0) return cmp * mult;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** CSV pour export (séparateur virgule, champs entre guillemets si besoin). */
export function adminOrdersToCsv(rows: AdminPlatformOrder[]): string {
  const headers = [
    "Date création",
    "Référence",
    "Boutique",
    "Slug",
    "Commerçant",
    "Client",
    "Téléphone",
    "Statut",
    "Livraison",
    "Canal",
    "Montant FCFA",
  ];
  const esc = (v: string) => {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = rows.map((o) =>
    [
      formatAdminOrderDateTime(o.createdAt),
      o.publicRef,
      o.shopName,
      o.shopSlug,
      o.merchantName,
      o.customerName,
      o.customerPhone,
      adminOrderStatusLabel(o.status),
      o.deliveryType === "delivery" ? "Livraison" : "Retrait",
      o.channel === "whatsapp" ? "WhatsApp" : "Lien boutique",
      String(o.total),
    ]
      .map((c) => esc(c))
      .join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}
