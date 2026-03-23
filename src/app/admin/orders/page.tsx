import { ShoppingCart } from "lucide-react";

import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminOrdersPage() {
  return (
    <AdminPlaceholderPage
      title="Commandes"
      description="Vue agrégée des commandes passées via les boutiques (WhatsApp / lien) — suivi et export."
      icon={ShoppingCart}
      badges={["1 847 (30 j.)", "Données démo"]}
      cardTitle="Toutes les commandes"
      cardHint="Filtres par statut, boutique, période et recherche client."
    />
  );
}
