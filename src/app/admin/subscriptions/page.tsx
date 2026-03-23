import { CreditCard } from "lucide-react";

import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminSubscriptionsPage() {
  return (
    <AdminPlaceholderPage
      title="Abonnements"
      description="Plans commerçants, période pilote offerte et future facturation (Stripe / Mobile Money)."
      icon={CreditCard}
      badges={["Pilote gratuit", "Stripe — bientôt"]}
      cardTitle="Plans & facturation"
      cardHint="Gestion des offres, essais et renouvellements une fois l’encaissement activé."
    />
  );
}
