/**
 * Abonnements boutiques (admin) — démo. Encaissement ciblé Orange Money / MTN MoMo (pas de carte pour l’instant).
 */

export type AdminPlanSlug = "pilot" | "pro" | "business";

export type AdminSubscriptionStatus = "active" | "trial" | "past_due" | "cancelled";

/** Moyen de paiement plateforme : uniquement OM / MoMo pour l’instant. */
export type AdminSubscriptionPaymentMethod = "none" | "orange_money" | "mtn_momo";

export type AdminShopSubscription = {
  id: string;
  shopSlug: string;
  shopName: string;
  merchantName: string;
  merchantEmail: string;
  plan: AdminPlanSlug;
  status: AdminSubscriptionStatus;
  /** Mensuel facturé (0 = pilote gratuit) */
  priceFcfaMonthly: number;
  startedAt: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  paymentMethod: AdminSubscriptionPaymentMethod;
  /** Libellé démo */
  billingRef: string;
};

export function formatAdminSubscriptionPaymentMethod(
  p: AdminSubscriptionPaymentMethod,
  emptyLabel = "—",
): string {
  if (p === "orange_money") return "Orange Money";
  if (p === "mtn_momo") return "MTN MoMo";
  return emptyLabel;
}

export const ADMIN_PLAN_LABELS: Record<AdminPlanSlug, string> = {
  pilot: "Pilote",
  pro: "Pro",
  business: "Business",
};

export const ADMIN_SUBSCRIPTION_STATUS_LABELS: Record<AdminSubscriptionStatus, string> = {
  active: "Actif",
  trial: "Essai",
  past_due: "Impayé",
  cancelled: "Résilié",
};

const STATUS_ORDER: Record<AdminSubscriptionStatus, number> = {
  trial: 0,
  active: 1,
  past_due: 2,
  cancelled: 3,
};

export const MOCK_ADMIN_SUBSCRIPTIONS: AdminShopSubscription[] = [
  {
    id: "sub-1",
    shopSlug: "ma-boutique",
    shopName: "Ma Boutique",
    merchantName: "Marie N.",
    merchantEmail: "contact@maboutique.cm",
    plan: "pilot",
    status: "active",
    priceFcfaMonthly: 0,
    startedAt: "2025-01-12",
    currentPeriodEnd: "2025-04-12",
    paymentMethod: "none",
    billingRef: "PILOTE-INTERNAL",
  },
  {
    id: "sub-2",
    shopSlug: "boutique-solange",
    shopName: "Boutique Solange",
    merchantName: "Solange F.",
    merchantEmail: "solange@example.cm",
    plan: "pilot",
    status: "active",
    priceFcfaMonthly: 0,
    startedAt: "2025-02-03",
    currentPeriodEnd: "2025-05-03",
    paymentMethod: "none",
    billingRef: "PILOTE-INTERNAL",
  },
  {
    id: "sub-3",
    shopSlug: "chez-kofi",
    shopName: "Chez Kofi",
    merchantName: "Kofi A.",
    merchantEmail: "kofi@example.cm",
    plan: "pilot",
    status: "trial",
    priceFcfaMonthly: 0,
    startedAt: "2025-03-01",
    currentPeriodEnd: "2025-03-31",
    trialEndsAt: "2025-03-31",
    paymentMethod: "none",
    billingRef: "TRIAL-KOFI",
  },
  {
    id: "sub-4",
    shopSlug: "afro-chic",
    shopName: "Afro Chic",
    merchantName: "Grace M.",
    merchantEmail: "hello@afrochic.cm",
    plan: "pilot",
    status: "active",
    priceFcfaMonthly: 0,
    startedAt: "2025-01-10",
    currentPeriodEnd: "2025-04-10",
    paymentMethod: "none",
    billingRef: "PILOTE-INTERNAL",
  },
  {
    id: "sub-5",
    shopSlug: "test-shop",
    shopName: "Test Shop",
    merchantName: "Compte Test",
    merchantEmail: "test@boutiki.cm",
    plan: "pilot",
    status: "trial",
    priceFcfaMonthly: 0,
    startedAt: "2025-03-15",
    currentPeriodEnd: "2025-04-15",
    trialEndsAt: "2025-04-15",
    paymentMethod: "none",
    billingRef: "TRIAL-TEST",
  },
  {
    id: "sub-6",
    shopSlug: "mode-eclat",
    shopName: "Mode Éclat",
    merchantName: "Élodie T.",
    merchantEmail: "mode@eclat.cm",
    plan: "pro",
    status: "cancelled",
    priceFcfaMonthly: 5_000,
    startedAt: "2024-11-01",
    currentPeriodEnd: "2025-03-01",
    paymentMethod: "mtn_momo",
    billingRef: "MTN-88921 (résilié)",
  },
  {
    id: "sub-7",
    shopSlug: "tech-co",
    shopName: "Tech & Co",
    merchantName: "Brice K.",
    merchantEmail: "vendeur@techco.cm",
    plan: "pilot",
    status: "active",
    priceFcfaMonthly: 0,
    startedAt: "2024-12-05",
    currentPeriodEnd: "2025-06-05",
    paymentMethod: "none",
    billingRef: "PILOTE-EXTENDED",
  },
  {
    id: "sub-8",
    shopSlug: "epicerie-verte",
    shopName: "Épicerie Verte",
    merchantName: "Yves P.",
    merchantEmail: "bio@verte.cm",
    plan: "pilot",
    status: "active",
    priceFcfaMonthly: 0,
    startedAt: "2025-01-28",
    currentPeriodEnd: "2025-04-28",
    paymentMethod: "none",
    billingRef: "PILOTE-INTERNAL",
  },
  {
    id: "sub-9",
    shopSlug: "boutique-prov",
    shopName: "Boutique Provisoire",
    merchantName: "Nouveau V.",
    merchantEmail: "new@merchant.cm",
    plan: "pilot",
    status: "trial",
    priceFcfaMonthly: 0,
    startedAt: "2025-03-20",
    currentPeriodEnd: "2025-04-20",
    trialEndsAt: "2025-04-20",
    paymentMethod: "none",
    billingRef: "TRIAL-NEW",
  },
  {
    id: "sub-10",
    shopSlug: "luxe-kmer",
    shopName: "Luxe Kmer",
    merchantName: "Stéphane L.",
    merchantEmail: "contact@luxekmer.cm",
    plan: "business",
    status: "past_due",
    priceFcfaMonthly: 15_000,
    startedAt: "2025-02-01",
    currentPeriodEnd: "2025-03-01",
    paymentMethod: "orange_money",
    billingRef: "OM-INV-2025-0142 (impayé)",
  },
  {
    id: "sub-11",
    shopSlug: "ma-boutique",
    shopName: "Ma Boutique",
    merchantName: "Marie N.",
    merchantEmail: "contact@maboutique.cm",
    plan: "pro",
    status: "cancelled",
    priceFcfaMonthly: 5_000,
    startedAt: "2024-06-01",
    currentPeriodEnd: "2024-12-31",
    paymentMethod: "orange_money",
    billingRef: "OM-ARCH-2024-991",
  },
];

/** Garde une seule entrée « courante » par boutique pour la liste principale (la plus récente par slug). */
export function getCurrentSubscriptionsByShop(
  rows: AdminShopSubscription[] = MOCK_ADMIN_SUBSCRIPTIONS,
): AdminShopSubscription[] {
  const bySlug = new Map<string, AdminShopSubscription>();
  const sorted = [...rows].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  for (const r of sorted) {
    if (!bySlug.has(r.shopSlug)) bySlug.set(r.shopSlug, r);
  }
  return [...bySlug.values()].sort((a, b) => a.shopName.localeCompare(b.shopName, "fr"));
}

export function getAdminSubscriptionById(id: string): AdminShopSubscription | undefined {
  return MOCK_ADMIN_SUBSCRIPTIONS.find((s) => s.id === id);
}

export function subscriptionsForShopSlug(slug: string): AdminShopSubscription[] {
  return MOCK_ADMIN_SUBSCRIPTIONS.filter((s) => s.shopSlug === slug).sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );
}

export function formatAdminSubscriptionDate(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getAdminSubscriptionKpis(rows: AdminShopSubscription[]) {
  const paying = rows.filter((r) => r.priceFcfaMonthly > 0 && r.status !== "cancelled");
  const mrr = paying.reduce((s, r) => s + r.priceFcfaMonthly, 0);
  return {
    total: rows.length,
    pilot: rows.filter((r) => r.plan === "pilot").length,
    pro: rows.filter((r) => r.plan === "pro").length,
    business: rows.filter((r) => r.plan === "business").length,
    trial: rows.filter((r) => r.status === "trial").length,
    pastDue: rows.filter((r) => r.status === "past_due").length,
    cancelled: rows.filter((r) => r.status === "cancelled").length,
    mrr,
  };
}

export type AdminSubscriptionSortKey =
  | "shopName"
  | "merchantName"
  | "plan"
  | "status"
  | "priceFcfaMonthly"
  | "currentPeriodEnd"
  | "startedAt";

export function sortAdminSubscriptions(
  rows: AdminShopSubscription[],
  key: AdminSubscriptionSortKey,
  dir: "asc" | "desc",
): AdminShopSubscription[] {
  const mult = dir === "asc" ? 1 : -1;
  const planOrder: Record<AdminPlanSlug, number> = { pilot: 0, pro: 1, business: 2 };
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "shopName":
        cmp = a.shopName.localeCompare(b.shopName, "fr");
        break;
      case "merchantName":
        cmp = a.merchantName.localeCompare(b.merchantName, "fr");
        break;
      case "plan":
        cmp = planOrder[a.plan] - planOrder[b.plan];
        break;
      case "status":
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        break;
      case "priceFcfaMonthly":
        cmp = a.priceFcfaMonthly - b.priceFcfaMonthly;
        break;
      case "currentPeriodEnd":
        cmp = a.currentPeriodEnd.localeCompare(b.currentPeriodEnd);
        break;
      case "startedAt":
        cmp = a.startedAt.localeCompare(b.startedAt);
        break;
      default:
        cmp = 0;
    }
    if (cmp !== 0) return cmp * mult;
    return a.shopName.localeCompare(b.shopName, "fr");
  });
}

export function adminSubscriptionsToCsv(rows: AdminShopSubscription[]): string {
  const headers = [
    "Boutique",
    "Slug",
    "Commerçant",
    "E-mail",
    "Plan",
    "Statut",
    "Mensuel FCFA",
    "Début",
    "Fin période",
    "Essai jusqu'au",
    "Paiement",
    "Réf. facturation",
  ];
  const esc = (v: string) => {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const payLabel = (p: AdminSubscriptionPaymentMethod) => formatAdminSubscriptionPaymentMethod(p);
  const lines = rows.map((r) =>
    [
      r.shopName,
      r.shopSlug,
      r.merchantName,
      r.merchantEmail,
      ADMIN_PLAN_LABELS[r.plan],
      ADMIN_SUBSCRIPTION_STATUS_LABELS[r.status],
      String(r.priceFcfaMonthly),
      r.startedAt,
      r.currentPeriodEnd,
      r.trialEndsAt ?? "",
      payLabel(r.paymentMethod),
      r.billingRef,
    ]
      .map((c) => esc(c))
      .join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}
