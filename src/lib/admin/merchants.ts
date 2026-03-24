/**
 * Données admin « commerçants » (démo) — à remplacer par l’API admin / Supabase.
 * Champs structurants pour CA, commandes, litiges, annulations, activité, KYC, audit & sessions.
 */

export type AdminMerchantStatus = "verified" | "pending" | "suspended";

export type AdminKycStatus = "verified" | "pending" | "rejected";

export type AdminMerchantAuditEvent = {
  id: string;
  at: string;
  actorLabel: string;
  action: string;
  detail?: string;
};

export type AdminMerchantSession = {
  id: string;
  device: string;
  ipLabel: string;
  lastAt: string;
  isCurrent: boolean;
};

export type AdminMerchant = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  businessType: string;
  shopName: string | null;
  shopSlug: string | null;
  joinedAt: string;
  status: AdminMerchantStatus;
  /** Commandes boutique (30 j.) — agrégat démo */
  orders30d: number;
  /** CA estimé 30 j. (FCFA) */
  revenue30d: number;
  /** Litiges / tickets ouverts */
  disputesOpen: number;
  /** Taux d’annulation sur commandes 30 j. (%) */
  cancellationRatePct: number;
  /** ISO — dernière activité tableau de bord / boutique */
  lastActiveAt: string;
  kycStatus: AdminKycStatus;
  /** Capacités côté compte commerçant (aperçu permissions) */
  platformPermissions: string[];
  auditLog: AdminMerchantAuditEvent[];
  sessions: AdminMerchantSession[];
};

function audit(
  id: string,
  at: string,
  actor: string,
  action: string,
  detail?: string,
): AdminMerchantAuditEvent {
  return { id, at, actorLabel: actor, action, detail };
}

function sess(
  id: string,
  device: string,
  ipLabel: string,
  lastAt: string,
  isCurrent: boolean,
): AdminMerchantSession {
  return { id, device, ipLabel, lastAt, isCurrent };
}

export const MOCK_ADMIN_MERCHANTS: AdminMerchant[] = [
  {
    id: "m1",
    fullName: "Marie N.",
    email: "contact@maboutique.cm",
    phone: "+237 6 91 11 22 33",
    whatsappPhone: "+237 6 91 11 22 33",
    businessType: "Prêt-à-porter",
    shopName: "Ma Boutique",
    shopSlug: "ma-boutique",
    joinedAt: "2025-01-12",
    status: "verified",
    orders30d: 87,
    revenue30d: 1_245_000,
    disputesOpen: 0,
    cancellationRatePct: 4,
    lastActiveAt: "2025-03-24T08:15:00",
    kycStatus: "verified",
    platformPermissions: ["shop:write", "orders:read", "catalog:publish"],
    auditLog: [
      audit("e1", "2025-03-20T14:00:00", "admin@boutiki.cm", "Connexion console admin", "Vue fiche commerçant"),
      audit("e2", "2025-02-01T09:30:00", "système", "KYC validé", "Pièce conforme"),
    ],
    sessions: [
      sess("s1", "Chrome · Windows", "Douala · CM", "2025-03-24T08:15:00", true),
      sess("s2", "Safari · iOS", "Douala · CM", "2025-03-23T19:40:00", false),
    ],
  },
  {
    id: "m2",
    fullName: "Solange F.",
    email: "solange@example.cm",
    phone: "+237 6 92 44 55 66",
    whatsappPhone: "+237 6 92 44 55 66",
    businessType: "Mode & accessoires",
    shopName: "Boutique Solange",
    shopSlug: "boutique-solange",
    joinedAt: "2025-02-03",
    status: "verified",
    orders30d: 213,
    revenue30d: 4_890_500,
    disputesOpen: 1,
    cancellationRatePct: 6,
    lastActiveAt: "2025-03-24T06:22:00",
    kycStatus: "verified",
    platformPermissions: ["shop:write", "orders:read", "catalog:publish", "promotions:write"],
    auditLog: [
      audit("e1", "2025-03-22T11:20:00", "support@boutiki.cm", "Ticket litige #4421", "Client — retard livraison"),
      audit("e2", "2025-03-10T08:00:00", "système", "Export CSV commandes", "Période 30 j."),
    ],
    sessions: [
      sess("s1", "Chrome · Android", "Yaoundé · CM", "2025-03-24T06:22:00", true),
    ],
  },
  {
    id: "m3",
    fullName: "Kofi A.",
    email: "kofi@example.cm",
    phone: "+237 6 93 77 88 99",
    whatsappPhone: "+237 6 93 77 88 99",
    businessType: "Chaussures",
    shopName: "Chez Kofi",
    shopSlug: "chez-kofi",
    joinedAt: "2025-02-18",
    status: "verified",
    orders30d: 41,
    revenue30d: 612_000,
    disputesOpen: 0,
    cancellationRatePct: 2,
    lastActiveAt: "2025-03-23T16:05:00",
    kycStatus: "verified",
    platformPermissions: ["shop:write", "orders:read"],
    auditLog: [audit("e1", "2025-03-15T10:00:00", "admin@boutiki.cm", "Mise à jour slug boutique", "—")],
    sessions: [sess("s1", "Firefox · macOS", "Douala · CM", "2025-03-23T16:05:00", true)],
  },
  {
    id: "m4",
    fullName: "Grace M.",
    email: "hello@afrochic.cm",
    phone: "+237 6 94 10 20 30",
    whatsappPhone: "+237 6 94 10 20 30",
    businessType: "Boutique textile",
    shopName: "Afro Chic",
    shopSlug: "afro-chic",
    joinedAt: "2025-01-10",
    status: "verified",
    orders30d: 156,
    revenue30d: 2_980_000,
    disputesOpen: 2,
    cancellationRatePct: 9,
    lastActiveAt: "2025-03-24T09:00:00",
    kycStatus: "verified",
    platformPermissions: ["shop:write", "orders:read", "catalog:publish"],
    auditLog: [
      audit("e1", "2025-03-24T09:00:00", "grace@afrochic.cm", "Connexion dashboard", "IP habituelle"),
      audit("e2", "2025-03-18T14:30:00", "moderation@boutiki.cm", "Signalement examiné", "Produit — photo floue"),
    ],
    sessions: [
      sess("s1", "Chrome · Windows", "Douala · CM", "2025-03-24T09:00:00", true),
      sess("s2", "Chrome · Android", "Douala · CM", "2025-03-21T12:00:00", false),
    ],
  },
  {
    id: "m5",
    fullName: "Compte Test",
    email: "test@boutiki.cm",
    phone: "+237 6 90 00 00 01",
    whatsappPhone: "+237 6 90 00 00 01",
    businessType: "Test",
    shopName: "Test Shop",
    shopSlug: "test-shop",
    joinedAt: "2025-02-20",
    status: "pending",
    orders30d: 0,
    revenue30d: 0,
    disputesOpen: 0,
    cancellationRatePct: 0,
    lastActiveAt: "2025-03-20T11:00:00",
    kycStatus: "pending",
    platformPermissions: ["shop:read"],
    auditLog: [audit("e1", "2025-02-20T16:00:00", "système", "Compte créé", "Onboarding incomplet")],
    sessions: [sess("s1", "Chrome · Windows", "Lab · CM", "2025-03-20T11:00:00", true)],
  },
  {
    id: "m6",
    fullName: "Élodie T.",
    email: "mode@eclat.cm",
    phone: "+237 6 95 55 66 77",
    whatsappPhone: "+237 6 95 55 66 77",
    businessType: "Mode",
    shopName: "Mode Éclat",
    shopSlug: "mode-eclat",
    joinedAt: "2025-02-21",
    status: "suspended",
    orders30d: 0,
    revenue30d: 0,
    disputesOpen: 1,
    cancellationRatePct: 0,
    lastActiveAt: "2025-03-10T08:00:00",
    kycStatus: "rejected",
    platformPermissions: [],
    auditLog: [
      audit("e1", "2025-03-10T08:00:00", "admin@boutiki.cm", "Compte suspendu", "Non-respect CGU"),
      audit("e2", "2025-03-01T12:00:00", "moderation@boutiki.cm", "KYC refusé", "Document illisible"),
    ],
    sessions: [sess("s1", "Safari · iOS", "Bafoussam · CM", "2025-03-10T08:00:00", true)],
  },
  {
    id: "m7",
    fullName: "Brice K.",
    email: "vendeur@techco.cm",
    phone: "+237 6 96 88 99 00",
    whatsappPhone: "+237 6 96 88 99 00",
    businessType: "High-tech",
    shopName: "Tech & Co",
    shopSlug: "tech-co",
    joinedAt: "2024-12-05",
    status: "verified",
    orders30d: 340,
    revenue30d: 8_120_000,
    disputesOpen: 0,
    cancellationRatePct: 3,
    lastActiveAt: "2025-03-24T07:45:00",
    kycStatus: "verified",
    platformPermissions: ["shop:write", "orders:read", "catalog:publish", "analytics:export"],
    auditLog: [audit("e1", "2025-03-01T09:00:00", "brice@techco.cm", "Export analytics", "90 jours")],
    sessions: [
      sess("s1", "Edge · Windows", "Yaoundé · CM", "2025-03-24T07:45:00", true),
      sess("s2", "Chrome · Windows", "Yaoundé · CM", "2025-03-22T18:00:00", false),
    ],
  },
  {
    id: "m8",
    fullName: "Yves P.",
    email: "bio@verte.cm",
    phone: "+237 6 97 12 34 56",
    whatsappPhone: "+237 6 97 12 34 56",
    businessType: "Alimentation",
    shopName: "Épicerie Verte",
    shopSlug: "epicerie-verte",
    joinedAt: "2025-01-28",
    status: "verified",
    orders30d: 92,
    revenue30d: 1_890_000,
    disputesOpen: 0,
    cancellationRatePct: 5,
    lastActiveAt: "2025-03-23T20:10:00",
    kycStatus: "verified",
    platformPermissions: ["shop:write", "orders:read", "catalog:publish"],
    auditLog: [],
    sessions: [sess("s1", "Chrome · Android", "Douala · CM", "2025-03-23T20:10:00", true)],
  },
  {
    id: "m9",
    fullName: "Nouveau V.",
    email: "new@merchant.cm",
    phone: "+237 6 98 00 11 22",
    whatsappPhone: "+237 6 98 00 11 22",
    businessType: "Commerce général",
    shopName: "Boutique Provisoire",
    shopSlug: "boutique-prov",
    joinedAt: "2025-02-22",
    status: "pending",
    orders30d: 0,
    revenue30d: 0,
    disputesOpen: 0,
    cancellationRatePct: 0,
    lastActiveAt: "2025-03-24T10:00:00",
    kycStatus: "pending",
    platformPermissions: ["shop:read", "catalog:draft"],
    auditLog: [audit("e1", "2025-03-24T10:00:00", "new@merchant.cm", "Première connexion", "—")],
    sessions: [sess("s1", "Chrome · Android", "Garoua · CM", "2025-03-24T10:00:00", true)],
  },
  {
    id: "m10",
    fullName: "Stéphane L.",
    email: "contact@luxekmer.cm",
    phone: "+237 6 99 33 44 55",
    whatsappPhone: "+237 6 99 33 44 55",
    businessType: "Luxe & cosmétiques",
    shopName: "Luxe Kmer",
    shopSlug: "luxe-kmer",
    joinedAt: "2025-02-02",
    status: "verified",
    orders30d: 64,
    revenue30d: 3_450_000,
    disputesOpen: 0,
    cancellationRatePct: 1,
    lastActiveAt: "2025-03-24T05:30:00",
    kycStatus: "verified",
    platformPermissions: ["shop:write", "orders:read", "catalog:publish"],
    auditLog: [audit("e1", "2025-03-12T15:00:00", "admin@boutiki.cm", "Vérification manuelle", "OK")],
    sessions: [sess("s1", "Safari · macOS", "Douala · CM", "2025-03-24T05:30:00", true)],
  },
  {
    id: "m11",
    fullName: "Amina D.",
    email: "amina.d@email.cm",
    phone: "+237 6 88 22 33 44",
    whatsappPhone: "+237 6 88 22 33 44",
    businessType: "Coiffure & soins",
    shopName: null,
    shopSlug: null,
    joinedAt: "2025-02-23",
    status: "pending",
    orders30d: 0,
    revenue30d: 0,
    disputesOpen: 0,
    cancellationRatePct: 0,
    lastActiveAt: "2025-03-21T14:00:00",
    kycStatus: "pending",
    platformPermissions: ["shop:read"],
    auditLog: [audit("e1", "2025-02-23T11:00:00", "système", "Inscription", "Sans boutique")],
    sessions: [sess("s1", "Chrome · iOS", "Douala · CM", "2025-03-21T14:00:00", true)],
  },
];

const STATUS_ORDER: Record<AdminMerchantStatus, number> = {
  verified: 0,
  pending: 1,
  suspended: 2,
};

const KYC_ORDER: Record<AdminKycStatus, number> = {
  verified: 0,
  pending: 1,
  rejected: 2,
};

export function formatAdminMerchantJoinedLabel(joinedAt: string): string {
  return new Date(joinedAt + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Affichage CA (FCFA), y compris 0. */
export function formatAdminMerchantRevenueFcfa(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}

/** Relatif simple sans dépendance (pour lastActiveAt) */
export function formatMerchantRelativeActivity(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  if (diff < 60_000) return "À l'instant";
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `Il y a ${Math.floor(diff / 60_000)} min`;
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formatMerchantSessionLabel(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMerchantAuditLabel(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getAdminMerchantById(id: string): AdminMerchant | undefined {
  return MOCK_ADMIN_MERCHANTS.find((m) => m.id === id);
}

export function getAdminMerchantKpis(merchants: AdminMerchant[] = MOCK_ADMIN_MERCHANTS) {
  return {
    total: merchants.length,
    verified: merchants.filter((m) => m.status === "verified").length,
    pending: merchants.filter((m) => m.status === "pending").length,
    suspended: merchants.filter((m) => m.status === "suspended").length,
  };
}

export function getAdminMerchantAggregates(merchants: AdminMerchant[] = MOCK_ADMIN_MERCHANTS) {
  const revenue30d = merchants.reduce((s, m) => s + m.revenue30d, 0);
  const orders30d = merchants.reduce((s, m) => s + m.orders30d, 0);
  const disputesOpen = merchants.reduce((s, m) => s + m.disputesOpen, 0);
  const withOrders = merchants.filter((m) => m.orders30d > 0);
  const avgCancellationPct =
    withOrders.length === 0
      ? 0
      : Math.round(
          withOrders.reduce((s, m) => s + m.cancellationRatePct, 0) / withOrders.length,
        );
  return { revenue30d, orders30d, disputesOpen, avgCancellationPct };
}

export type AdminMerchantSortKey =
  | "fullName"
  | "email"
  | "businessType"
  | "shopName"
  | "joinedAt"
  | "status"
  | "orders30d"
  | "revenue30d"
  | "disputesOpen"
  | "cancellationRatePct"
  | "lastActiveAt"
  | "kycStatus";

export function sortAdminMerchants(
  rows: AdminMerchant[],
  key: AdminMerchantSortKey,
  dir: "asc" | "desc",
): AdminMerchant[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "fullName":
        cmp = a.fullName.localeCompare(b.fullName, "fr");
        break;
      case "email":
        cmp = a.email.localeCompare(b.email, "fr");
        break;
      case "businessType":
        cmp = a.businessType.localeCompare(b.businessType, "fr");
        break;
      case "shopName":
        cmp = (a.shopName ?? "").localeCompare(b.shopName ?? "", "fr");
        break;
      case "joinedAt":
        cmp = a.joinedAt.localeCompare(b.joinedAt);
        break;
      case "status":
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        break;
      case "orders30d":
        cmp = a.orders30d - b.orders30d;
        break;
      case "revenue30d":
        cmp = a.revenue30d - b.revenue30d;
        break;
      case "disputesOpen":
        cmp = a.disputesOpen - b.disputesOpen;
        break;
      case "cancellationRatePct":
        cmp = a.cancellationRatePct - b.cancellationRatePct;
        break;
      case "lastActiveAt":
        cmp = a.lastActiveAt.localeCompare(b.lastActiveAt);
        break;
      case "kycStatus":
        cmp = KYC_ORDER[a.kycStatus] - KYC_ORDER[b.kycStatus];
        break;
      default:
        cmp = 0;
    }
    if (cmp !== 0) return cmp * mult;
    return a.fullName.localeCompare(b.fullName, "fr");
  });
}
