import { Users } from "lucide-react";

import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminMerchantsPage() {
  return (
    <AdminPlaceholderPage
      title="Commerçants"
      description="Comptes, rôles et suivi — aligné sur le PRD une fois l’auth admin branchée."
      icon={Users}
      badges={["118 comptes", "6 en attente"]}
      cardTitle="Annuaire commerçants"
      cardHint="Profils liés aux boutiques, export CSV, etc."
    />
  );
}
