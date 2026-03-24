import Link from "next/link";

import { Button } from "@/components/shadcn/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-lg font-semibold text-neutral-900">Commande introuvable</p>
      <p className="max-w-sm text-sm text-neutral-500">Cette référence n&apos;existe pas dans les données démo.</p>
      <Button asChild variant="outline" className="rounded-xl">
        <Link href="/admin/orders">Retour à la liste</Link>
      </Button>
    </div>
  );
}
