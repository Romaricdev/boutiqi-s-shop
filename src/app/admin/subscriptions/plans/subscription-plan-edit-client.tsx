"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";

import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Separator } from "@/components/shadcn/separator";
import { cn } from "@/lib/cn";
import {
  DEFAULT_SUBSCRIPTION_PLAN_CATALOG,
  isAdminPlanSlug,
  type AdminSubscriptionPlanCatalogEntry,
} from "@/lib/admin/subscription-plans";
import type { AdminPlanSlug } from "@/lib/admin/subscriptions";
import { usePersistedSubscriptionPlanCatalog } from "@/hooks/use-persisted-subscription-plans";

type FormState = {
  name: string;
  shortDescription: string;
  priceMonthlyFcfa: string;
  priceUnitLabel: string;
  featuresText: string;
  trialDays: string;
  sortOrder: string;
  paymentMethodsNote: string;
  isActive: boolean;
  isListedPublic: boolean;
};

function toForm(p: AdminSubscriptionPlanCatalogEntry): FormState {
  return {
    name: p.name,
    shortDescription: p.shortDescription,
    priceMonthlyFcfa: String(p.priceMonthlyFcfa),
    priceUnitLabel: p.priceUnitLabel,
    featuresText: p.features.join("\n"),
    trialDays: String(p.trialDays),
    sortOrder: String(p.sortOrder),
    paymentMethodsNote: p.paymentMethodsNote,
    isActive: p.isActive,
    isListedPublic: p.isListedPublic,
  };
}

function parseForm(slug: AdminPlanSlug, f: FormState): Partial<AdminSubscriptionPlanCatalogEntry> {
  const price = Math.max(0, Math.floor(Number(f.priceMonthlyFcfa.replace(/\s/g, "")) || 0));
  const trial = Math.max(0, Math.floor(Number(f.trialDays) || 0));
  const sort = Math.max(0, Math.floor(Number(f.sortOrder) || 0));
  const features = f.featuresText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    slug,
    name: f.name.trim() || slug,
    shortDescription: f.shortDescription.trim(),
    priceMonthlyFcfa: price,
    priceUnitLabel: f.priceUnitLabel.trim() || "FCFA / mois",
    features,
    isActive: f.isActive,
    isListedPublic: f.isListedPublic,
    trialDays: trial,
    commissionPct: null,
    sortOrder: sort,
    paymentMethodsNote: f.paymentMethodsNote.trim(),
  };
}

export default function SubscriptionPlanEditClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { hydrated, getPlan, updatePlan, resetPlan, hasOverride } = usePersistedSubscriptionPlanCatalog();
  const [form, setForm] = useState<FormState | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const validSlug = isAdminPlanSlug(slug) ? slug : null;

  useEffect(() => {
    if (!hydrated || !validSlug) return;
    const p = getPlan(validSlug);
    if (p) setForm(toForm(p));
    // Intentionnel : chargement initial uniquement (évite d’écraser le formulaire à chaque render).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getPlan / plans après save
  }, [hydrated, validSlug]);

  const applyDefault = useCallback(() => {
    if (!validSlug) return;
    const base = DEFAULT_SUBSCRIPTION_PLAN_CATALOG.find((p) => p.slug === validSlug);
    if (base) setForm(toForm(base));
  }, [validSlug]);

  const handleResetStorage = useCallback(() => {
    if (!validSlug) return;
    resetPlan(validSlug);
    applyDefault();
  }, [validSlug, resetPlan, applyDefault]);

  const handleSave = useCallback(() => {
    if (!validSlug || !form) return;
    updatePlan(validSlug, parseForm(validSlug, form));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }, [validSlug, form, updatePlan]);

  if (!validSlug) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-6 text-sm text-red-900">
        Slug d&apos;offre inconnu. Les valeurs autorisées sont : pilot, pro, business.
        <Button variant="outline" className="mt-4 rounded-xl" asChild>
          <Link href="/admin/subscriptions/plans">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  if (!hydrated || !form) {
    return <div className="py-16 text-center text-sm text-neutral-400">Chargement…</div>;
  }

  const inputClass =
    "h-10 rounded-xl border-neutral-200 bg-neutral-50/50 text-sm focus-visible:ring-neutral-400";
  const textareaClass = cn(
    "flex min-h-[140px] w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-sm shadow-sm",
    "placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="h-9 w-fit gap-2 rounded-xl px-2 text-neutral-600" asChild>
          <Link href="/admin/subscriptions/plans">
            <ArrowLeft className="size-4" />
            Retour aux offres
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl text-xs" onClick={handleResetStorage}>
            <RotateCcw className="mr-1.5 size-3.5" />
            Réinitialiser (défaut navigateur)
          </Button>
          <Button type="button" size="sm" className="h-9 rounded-xl text-xs" onClick={handleSave}>
            <Save className="mr-1.5 size-3.5" />
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{form.name}</h1>
        <Badge variant="outline" className="rounded-lg font-mono text-xs">
          {validSlug}
        </Badge>
        {hasOverride(validSlug) ? (
          <Badge variant="secondary" className="rounded-lg text-xs">
            Overrides locaux actifs
          </Badge>
        ) : null}
        {savedFlash ? (
          <span className="text-xs font-medium text-emerald-600">Enregistré.</span>
        ) : null}
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-neutral-950">Identité &amp; tarif</CardTitle>
          <CardDescription className="text-xs">Textes visibles commerçants et visiteurs (selon visibilité).</CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name" className="text-xs font-semibold text-neutral-600">
              Nom de l&apos;offre
            </Label>
            <Input
              id="name"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc" className="text-xs font-semibold text-neutral-600">
              Description courte
            </Label>
            <Input
              id="desc"
              className={inputClass}
              value={form.shortDescription}
              onChange={(e) => setForm((f) => (f ? { ...f, shortDescription: e.target.value } : f))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-xs font-semibold text-neutral-600">
              Prix mensuel (FCFA)
            </Label>
            <Input
              id="price"
              inputMode="numeric"
              className={inputClass}
              value={form.priceMonthlyFcfa}
              onChange={(e) => setForm((f) => (f ? { ...f, priceMonthlyFcfa: e.target.value } : f))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit" className="text-xs font-semibold text-neutral-600">
              Libellé sous le prix
            </Label>
            <Input
              id="unit"
              className={inputClass}
              placeholder="FCFA / mois"
              value={form.priceUnitLabel}
              onChange={(e) => setForm((f) => (f ? { ...f, priceUnitLabel: e.target.value } : f))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort" className="text-xs font-semibold text-neutral-600">
              Ordre d&apos;affichage
            </Label>
            <Input
              id="sort"
              inputMode="numeric"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) => setForm((f) => (f ? { ...f, sortOrder: e.target.value } : f))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trial" className="text-xs font-semibold text-neutral-600">
              Essai (jours)
            </Label>
            <Input
              id="trial"
              inputMode="numeric"
              className={inputClass}
              value={form.trialDays}
              onChange={(e) => setForm((f) => (f ? { ...f, trialDays: e.target.value } : f))}
            />
          </div>
          <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 p-3 text-xs text-neutral-500 sm:col-span-2">
            Pas de commission plateforme sur les ventes tant que les paiements des commandes ne passent pas par Boutiki.
            Le champ reste prévu dans le modèle de données pour une phase ultérieure.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-neutral-950">Fonctionnalités</CardTitle>
          <CardDescription className="text-xs">Une ligne = une puce affichée dans les comparatifs.</CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="pt-6">
          <textarea
            className={textareaClass}
            value={form.featuresText}
            onChange={(e) => setForm((f) => (f ? { ...f, featuresText: e.target.value } : f))}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-neutral-950">Visibilité &amp; paiement</CardTitle>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="space-y-5 pt-6">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-neutral-300"
              checked={form.isActive}
              onChange={(e) => setForm((f) => (f ? { ...f, isActive: e.target.checked } : f))}
            />
            <div>
              <p className="text-sm font-semibold text-neutral-900">Souscription ouverte</p>
              <p className="text-xs text-neutral-500">
                Si décoché, les commerçants ne peuvent pas nouvellement souscrire à cette offre (affichage admin /
                historique possible).
              </p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-neutral-300"
              checked={form.isListedPublic}
              onChange={(e) => setForm((f) => (f ? { ...f, isListedPublic: e.target.checked } : f))}
            />
            <div>
              <p className="text-sm font-semibold text-neutral-900">Visible sur la vitrine tarifs</p>
              <p className="text-xs text-neutral-500">Masquer une offre encore en préparation côté marketing.</p>
            </div>
          </label>
          <div className="space-y-2">
            <Label htmlFor="payNote" className="text-xs font-semibold text-neutral-600">
              Note moyens de paiement (OM / MoMo)
            </Label>
            <textarea
              id="payNote"
              className={cn(textareaClass, "min-h-[80px]")}
              value={form.paymentMethodsNote}
              onChange={(e) => setForm((f) => (f ? { ...f, paymentMethodsNote: e.target.value } : f))}
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-neutral-400">
        Après sauvegarde API, vous pourrez invalider le cache onboarding / landing depuis cette même fiche.
        <Button variant="link" className="h-auto px-1 text-xs text-neutral-600" type="button" onClick={() => router.refresh()}>
          Rafraîchir la page
        </Button>
      </p>
    </div>
  );
}
