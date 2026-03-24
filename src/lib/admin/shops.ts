/**
 * Données admin « boutiques » (démo) — types et mocks partagés.
 * Remplacer par fetch API / Supabase une fois le back-office branché.
 */

export type AdminShopStatus = "active" | "pending" | "suspended";

export type AdminShop = {
  id: string;
  name: string;
  slug: string;
  city: string;
  neighborhood: string;
  merchantEmail: string;
  merchantName: string;
  whatsappPhone: string;
  products: number;
  orders30d: number;
  /** ISO date (tri / filtres futurs) */
  joinedAt: string;
  status: AdminShopStatus;
};

export const MOCK_ADMIN_SHOPS: AdminShop[] = [
  {
    id: "1",
    name: "Ma Boutique",
    slug: "ma-boutique",
    city: "Douala",
    neighborhood: "Akwa",
    merchantEmail: "contact@maboutique.cm",
    merchantName: "Marie N.",
    whatsappPhone: "+237 6XX 111 222",
    products: 24,
    orders30d: 87,
    joinedAt: "2025-01-12",
    status: "active",
  },
  {
    id: "2",
    name: "Boutique Solange",
    slug: "boutique-solange",
    city: "Yaoundé",
    neighborhood: "Bastos",
    merchantEmail: "solange@example.cm",
    merchantName: "Solange F.",
    whatsappPhone: "+237 6XX 333 444",
    products: 56,
    orders30d: 213,
    joinedAt: "2025-02-03",
    status: "active",
  },
  {
    id: "3",
    name: "Chez Kofi",
    slug: "chez-kofi",
    city: "Douala",
    neighborhood: "Bonanjo",
    merchantEmail: "kofi@example.cm",
    merchantName: "Kofi A.",
    whatsappPhone: "+237 6XX 555 666",
    products: 12,
    orders30d: 41,
    joinedAt: "2025-02-18",
    status: "active",
  },
  {
    id: "4",
    name: "Afro Chic",
    slug: "afro-chic",
    city: "Douala",
    neighborhood: "Makepe",
    merchantEmail: "hello@afrochic.cm",
    merchantName: "Grace M.",
    whatsappPhone: "+237 6XX 777 888",
    products: 38,
    orders30d: 156,
    joinedAt: "2025-01-10",
    status: "active",
  },
  {
    id: "5",
    name: "Test Shop",
    slug: "test-shop",
    city: "Douala",
    neighborhood: "Logpom",
    merchantEmail: "test@boutiki.cm",
    merchantName: "Compte Test",
    whatsappPhone: "+237 6XX 000 001",
    products: 3,
    orders30d: 0,
    joinedAt: "2025-02-20",
    status: "pending",
  },
  {
    id: "6",
    name: "Mode Éclat",
    slug: "mode-eclat",
    city: "Bafoussam",
    neighborhood: "Centre",
    merchantEmail: "mode@eclat.cm",
    merchantName: "Élodie T.",
    whatsappPhone: "+237 6XX 999 000",
    products: 0,
    orders30d: 0,
    joinedAt: "2025-02-21",
    status: "suspended",
  },
  {
    id: "7",
    name: "Tech & Co",
    slug: "tech-co",
    city: "Yaoundé",
    neighborhood: "Melen",
    merchantEmail: "vendeur@techco.cm",
    merchantName: "Brice K.",
    whatsappPhone: "+237 6XX 444 555",
    products: 102,
    orders30d: 340,
    joinedAt: "2024-12-05",
    status: "active",
  },
  {
    id: "8",
    name: "Épicerie Verte",
    slug: "epicerie-verte",
    city: "Douala",
    neighborhood: "Bonamoussadi",
    merchantEmail: "bio@verte.cm",
    merchantName: "Yves P.",
    whatsappPhone: "+237 6XX 222 333",
    products: 45,
    orders30d: 92,
    joinedAt: "2025-01-28",
    status: "active",
  },
  {
    id: "9",
    name: "Boutique Provisoire",
    slug: "boutique-prov",
    city: "Garoua",
    neighborhood: "—",
    merchantEmail: "new@merchant.cm",
    merchantName: "Nouveau V.",
    whatsappPhone: "+237 6XX 111 000",
    products: 0,
    orders30d: 0,
    joinedAt: "2025-02-22",
    status: "pending",
  },
  {
    id: "10",
    name: "Luxe Kmer",
    slug: "luxe-kmer",
    city: "Douala",
    neighborhood: "Bonapriso",
    merchantEmail: "contact@luxekmer.cm",
    merchantName: "Stéphane L.",
    whatsappPhone: "+237 6XX 888 999",
    products: 18,
    orders30d: 64,
    joinedAt: "2025-02-02",
    status: "active",
  },
];

export function formatAdminShopJoinedLabel(joinedAt: string): string {
  return new Date(joinedAt + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getAdminShopBySlug(slug: string): AdminShop | undefined {
  return MOCK_ADMIN_SHOPS.find((s) => s.slug === slug);
}

export function getAdminShopKpis(shops: AdminShop[] = MOCK_ADMIN_SHOPS) {
  return {
    total: shops.length,
    active: shops.filter((s) => s.status === "active").length,
    pending: shops.filter((s) => s.status === "pending").length,
    suspended: shops.filter((s) => s.status === "suspended").length,
  };
}

export function getAdminCityStats(shops: AdminShop[] = MOCK_ADMIN_SHOPS) {
  const map = new Map<string, number>();
  shops.forEach((s) => map.set(s.city, (map.get(s.city) ?? 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

/** Ordre statut pour tri (actif < en attente < suspendue) */
const STATUS_ORDER: Record<AdminShopStatus, number> = {
  active: 0,
  pending: 1,
  suspended: 2,
};

export type AdminShopSortKey = "name" | "city" | "products" | "orders30d" | "joinedAt" | "status";

export function sortAdminShops(
  rows: AdminShop[],
  key: AdminShopSortKey,
  dir: "asc" | "desc",
): AdminShop[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "name":
        cmp = a.name.localeCompare(b.name, "fr");
        break;
      case "city":
        cmp = a.city.localeCompare(b.city, "fr") || a.neighborhood.localeCompare(b.neighborhood, "fr");
        break;
      case "products":
        cmp = a.products - b.products;
        break;
      case "orders30d":
        cmp = a.orders30d - b.orders30d;
        break;
      case "joinedAt":
        cmp = a.joinedAt.localeCompare(b.joinedAt);
        break;
      case "status":
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        break;
      default:
        cmp = 0;
    }
    if (cmp !== 0) return cmp * mult;
    return a.name.localeCompare(b.name, "fr");
  });
}
