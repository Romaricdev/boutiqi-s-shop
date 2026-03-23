import { ShieldAlert } from "lucide-react";

import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminModerationPage() {
  return (
    <AdminPlaceholderPage
      title="Modération"
      description="Signalements, contenus sensibles et conformité des fiches boutiques / produits."
      icon={ShieldAlert}
      badges={["4 signalements ouverts", "File démo"]}
      cardTitle="File de modération"
      cardHint="Workflow de validation, suspension et historique des actions admin."
    />
  );
}
