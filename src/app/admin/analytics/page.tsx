import { BarChart3 } from "lucide-react";

import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminAnalyticsPage() {
  return (
    <AdminPlaceholderPage
      title="Statistiques"
      description="Indicateurs d’usage de la plateforme : boutiques actives, commandes, trafic des liens boutique, etc."
      icon={BarChart3}
      badges={["Rapports CSV", "Tableaux de bord"]}
      cardTitle="Tableaux & exports"
      cardHint="Graphiques et métriques alignés sur le PRD — branchage analytics / Supabase."
    />
  );
}
