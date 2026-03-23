import { Store } from "lucide-react";

import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminShopsPage() {
  return (
    <AdminPlaceholderPage
      title="Boutiques"
      description="Gestion des vitrines : activation, suspension, modération."
      icon={Store}
      badges={["132 total", "124 actives"]}
      cardTitle="Liste des boutiques"
      cardHint="Pagination, recherche et actions groupées à venir."
    />
  );
}
