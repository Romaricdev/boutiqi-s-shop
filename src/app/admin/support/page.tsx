import { LifeBuoy } from "lucide-react";

import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminSupportPage() {
  return (
    <AdminPlaceholderPage
      title="Support"
      description="Tickets commerçants, SLA et escalade — intégration outil tiers ou file interne."
      icon={LifeBuoy}
      badges={["4 tickets ouverts", "Temps moyen : 2h (démo)"]}
      cardTitle="File d’attente"
      cardHint="Vue liste, priorités et assignation aux agents."
    />
  );
}
