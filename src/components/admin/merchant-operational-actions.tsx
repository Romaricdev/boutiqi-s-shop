"use client";

import { useCallback, useState } from "react";
import { KeyRound, ShieldCheck, ShieldOff, ShieldX } from "lucide-react";

import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import { cn } from "@/lib/cn";
import type { AdminKycStatus, AdminMerchantStatus } from "@/lib/admin/merchants";

type Props = {
  merchantId: string;
  initialStatus: AdminMerchantStatus;
  initialKyc: AdminKycStatus;
};

/**
 * Actions métier en démo : état local uniquement (aucun appel API).
 * À remplacer par mutations tRPC / Edge Functions + revalidation.
 */
export function MerchantOperationalActions({ merchantId, initialStatus, initialKyc }: Props) {
  const [status, setStatus] = useState<AdminMerchantStatus>(initialStatus);
  const [kyc, setKyc] = useState<AdminKycStatus>(initialKyc);
  const [resetDone, setResetDone] = useState(false);

  const suspend = useCallback(() => {
    setStatus("suspended");
  }, []);
  const reactivate = useCallback(() => {
    if (kyc !== "rejected") setStatus("verified");
    else setStatus("pending");
  }, [kyc]);
  const validateKyc = useCallback(() => {
    setKyc("verified");
    if (status === "pending") setStatus("verified");
  }, [status]);
  const rejectKyc = useCallback(() => {
    setKyc("rejected");
    setStatus("pending");
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Actions opérationnelles</p>
          <p className="text-xs text-neutral-500">
            Simulation locale · <code className="text-[11px]">{merchantId}</code>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className={cn(
              "rounded-lg border px-2 py-1 font-medium",
              status === "verified" && "border-emerald-200 bg-emerald-50 text-emerald-800",
              status === "pending" && "border-orange-200 bg-orange-50 text-orange-800",
              status === "suspended" && "border-neutral-200 bg-neutral-100 text-neutral-600",
            )}
          >
            Compte :{" "}
            {status === "verified" ? "Vérifié" : status === "pending" ? "En attente" : "Suspendu"}
          </span>
          <span
            className={cn(
              "rounded-lg border px-2 py-1 font-medium",
              kyc === "verified" && "border-emerald-200 bg-emerald-50 text-emerald-800",
              kyc === "pending" && "border-amber-200 bg-amber-50 text-amber-800",
              kyc === "rejected" && "border-red-200 bg-red-50 text-red-800",
            )}
          >
            KYC : {kyc === "verified" ? "Validé" : kyc === "pending" ? "En cours" : "Refusé"}
          </span>
        </div>
      </div>

      <Separator className="my-4 bg-neutral-100" />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {status !== "suspended" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
            onClick={suspend}
          >
            <ShieldOff className="size-3.5" />
            Suspendre le compte
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl"
            onClick={reactivate}
          >
            <ShieldCheck className="size-3.5 text-emerald-600" />
            Réactiver
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-xl"
          onClick={validateKyc}
          disabled={kyc === "verified"}
        >
          <ShieldCheck className="size-3.5" />
          Valider KYC
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-xl"
          onClick={rejectKyc}
          disabled={kyc === "rejected"}
        >
          <ShieldX className="size-3.5" />
          Refuser KYC
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 gap-2 rounded-xl"
          onClick={() => {
            setResetDone(true);
            setTimeout(() => setResetDone(false), 2500);
          }}
        >
          <KeyRound className="size-3.5" />
          Réinitialiser accès (démo)
        </Button>
      </div>
      {resetDone ? (
        <p className="mt-3 text-xs font-medium text-emerald-700">
          Demande de reset enregistrée (démo — aucun e-mail envoyé).
        </p>
      ) : null}
    </div>
  );
}
