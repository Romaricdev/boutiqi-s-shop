/**
 * Définition des offres d’abonnement (catalogue admin).
 * Les changements côté UI sont persistés en localStorage (démo) — à remplacer par API.
 */

import type { AdminPlanSlug } from "@/lib/admin/subscriptions";

export type AdminSubscriptionPlanCatalogEntry = {
  slug: AdminPlanSlug;
  /** Libellé court (cartes, navigation) */
  name: string;
  /** Sous-titre ou phrase d’accroche */
  shortDescription: string;
  /** Prix mensuel affiché (0 = gratuit) */
  priceMonthlyFcfa: number;
  /** Ligne affichée sous le prix (ex. unité) */
  priceUnitLabel: string;
  /** Fonctionnalités (liste affichée onboarding / marketing) */
  features: string[];
  /** Les nouvelles souscriptions peuvent souscrire à cette offre */
  isActive: boolean;
  /** Visible sur la vitrine tarifs / comparatif public */
  isListedPublic: boolean;
  /** Jours d’essai après souscription (0 = pas d’essai automatique) */
  trialDays: number;
  /**
   * Réservé : commission % sur ventes quand les paiements transiteront sur la plateforme.
   * Toujours `null` tant que l’encaissement des commandes est hors Boutiki.
   */
  commissionPct: number | null;
  /** Ordre d’affichage dans les listes */
  sortOrder: number;
  /** Rappel moyens de paiement pour cette offre */
  paymentMethodsNote: string;
};

export const PLAN_SLUGS: AdminPlanSlug[] = ["pilot", "pro", "business"];

export function isAdminPlanSlug(value: string): value is AdminPlanSlug {
  return PLAN_SLUGS.includes(value as AdminPlanSlug);
}

export const DEFAULT_SUBSCRIPTION_PLAN_CATALOG: AdminSubscriptionPlanCatalogEntry[] = [
  {
    slug: "pilot",
    name: "Pilote",
    shortDescription: "Accès complet pendant la phase test — idéal pour lancer sa vitrine.",
    priceMonthlyFcfa: 0,
    priceUnitLabel: "Gratuit — phase pilote",
    features: [
      "Catalogue produits illimité",
      "Commandes illimitées",
      "Page boutique publique",
      "Dashboard & notifications temps réel",
      "Suivi commande client",
      "Intégration WhatsApp",
    ],
    isActive: true,
    isListedPublic: true,
    trialDays: 0,
    commissionPct: null,
    sortOrder: 0,
    paymentMethodsNote: "Aucun prélèvement pendant le pilote.",
  },
  {
    slug: "pro",
    name: "Pro",
    shortDescription: "Pour les boutiques qui encaissent et automatisent au quotidien.",
    priceMonthlyFcfa: 5_000,
    priceUnitLabel: "FCFA / mois",
    features: [
      "Tout le plan Pilote",
      "Les ventes se règlent encore hors plateforme — pas de commission Boutiki pour l’instant",
      "Futur : prélèvement de l’abonnement via Orange Money & MTN MoMo",
      "Gestion de stock automatique",
      "Statistiques de ventes avancées",
    ],
    isActive: false,
    isListedPublic: true,
    trialDays: 14,
    commissionPct: null,
    sortOrder: 1,
    paymentMethodsNote:
      "Aujourd’hui : pas de paiement commande sur Boutiki, donc pas de commission sur les ventes. Abonnement commerçant : futur prélèvement OM / MoMo.",
  },
  {
    slug: "business",
    name: "Business",
    shortDescription: "Multi-boutiques, équipe et rapports pour structures plus grandes.",
    priceMonthlyFcfa: 15_000,
    priceUnitLabel: "FCFA / mois",
    features: [
      "Tout le plan Pro",
      "Jusqu’à 3 boutiques simultanées",
      "Livreurs assignés",
      "Rapports avancés & export",
      "Même règle : pas de commission plateforme tant que les paiements ne passent pas par Boutiki",
    ],
    isActive: false,
    isListedPublic: true,
    trialDays: 14,
    commissionPct: null,
    sortOrder: 2,
    paymentMethodsNote:
      "Pas de commission sur les ventes pour l’instant. Abonnement : futur prélèvement OM / MoMo une fois activé.",
  },
];

export function sortPlanCatalog(rows: AdminSubscriptionPlanCatalogEntry[]): AdminSubscriptionPlanCatalogEntry[] {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fr"));
}
