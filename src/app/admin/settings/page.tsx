import { Settings } from "lucide-react";

import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholderPage
      title="Paramètres plateforme"
      description="Configuration globale : textes légaux, limites, fonctionnalités activées, intégrations."
      icon={Settings}
      badges={["Feature flags", "Webhooks"]}
      cardTitle="Configuration système"
      cardHint="Variables d’environnement sensibles hors interface ; ici préférences métier et toggles V1."
    />
  );
}
