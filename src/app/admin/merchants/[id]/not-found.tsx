import Link from "next/link";
import { Users } from "lucide-react";

import { Button } from "@/components/shadcn/button";

export default function AdminMerchantNotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
      <div className="grid size-14 place-items-center rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <Users className="size-7 text-neutral-400" strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 text-xl font-bold text-neutral-900">Commerçant introuvable</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        Cet identifiant n&apos;existe pas dans les données démo ou le compte a été retiré.
      </p>
      <Button asChild className="mt-8 rounded-xl" variant="outline">
        <Link href="/admin/merchants">Retour à l&apos;annuaire</Link>
      </Button>
    </div>
  );
}
