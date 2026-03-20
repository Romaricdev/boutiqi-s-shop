"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  FileText,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { shopSchema, type ShopFormData } from "@/lib/validations/onboarding";
import { useOnboardingStore } from "@/lib/store/onboarding";

const cities = [
  { value: "", label: "Sélectionnez une ville..." },
  { value: "douala", label: "Douala" },
  { value: "yaounde", label: "Yaoundé" },
  { value: "autre", label: "Autre ville" },
];

const openingHoursPresets = [
  { value: "", label: "Sélectionnez vos horaires..." },
  { value: "8h-20h", label: "Tous les jours 8h–20h" },
  { value: "9h-18h", label: "Lun–Sam 9h–18h" },
  { value: "10h-22h", label: "Tous les jours 10h–22h" },
  { value: "custom", label: "Personnalisé (à définir plus tard)" },
];

export default function OnboardingShopPage() {
  const router = useRouter();
  const { account, shop, setShop, setStep, shopSlug } = useOnboardingStore();
  const [liveSlug, setLiveSlug] = useState(shopSlug);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: shop || undefined,
  });

  const shopNameValue = watch("shopName");

  useEffect(() => {
    if (!account) {
      router.replace("/onboarding/account");
    }
  }, [account, router]);

  useEffect(() => {
    if (shopNameValue) {
      const slug = shopNameValue
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setLiveSlug(slug);
    }
  }, [shopNameValue]);

  const onSubmit = (data: ShopFormData) => {
    setShop(data);
    setStep(3);
    router.push("/onboarding/products");
  };

  if (!account) return null;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-warm-900 lg:text-2xl">
          Votre boutique
        </h1>
        <p className="mt-1 text-sm text-warm-500">
          Ces informations seront visibles sur votre page publique.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Section: Identité de la boutique */}
        <div className="rounded-2xl border border-warm-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-brand-50">
              <Store className="size-3.5 text-brand-600" />
            </div>
            <h2 className="text-sm font-semibold text-warm-800">Identité</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <FileUpload
                label="Logo"
                compact
                value={watch("logoUrl")}
                onChange={(url) => setValue("logoUrl", url)}
                error={errors.logoUrl?.message}
                hint="Carré, 500×500px min"
              />
            </div>

            <Input
              label="Nom de la boutique"
              placeholder="Ex: Boutique Solange"
              icon={<Store className="size-4" />}
              error={errors.shopName?.message}
              {...register("shopName")}
            />

            {liveSlug && (
              <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5">
                <Globe className="size-4 text-brand-500" />
                <span className="text-xs text-brand-700">
                  Votre lien :{" "}
                  <span className="font-bold">boutiki.cm/{liveSlug}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section: Localisation */}
        <div className="rounded-2xl border border-warm-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-accent-50">
              <MapPin className="size-3.5 text-accent-600" />
            </div>
            <h2 className="text-sm font-semibold text-warm-800">Localisation</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Ville" error={errors.city?.message} {...register("city")}>
              {cities.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>

            <Input
              label="Quartier"
              placeholder="Ex: Akwa"
              icon={<MapPin className="size-4" />}
              error={errors.neighborhood?.message}
              {...register("neighborhood")}
            />
          </div>
        </div>

        {/* Section: Détails */}
        <div className="rounded-2xl border border-warm-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-warm-100">
              <FileText className="size-3.5 text-warm-600" />
            </div>
            <h2 className="text-sm font-semibold text-warm-800">Détails</h2>
          </div>

          <div className="space-y-4">
            <Textarea
              label="Description de votre boutique"
              placeholder="Ex: Friperie de qualité à Akwa. Vêtements européens, prix abordables."
              hint="1–2 phrases pour présenter votre activité"
              error={errors.description?.message}
              {...register("description")}
            />

            <Select
              label="Horaires d'ouverture"
              error={errors.openingHours?.message}
              {...register("openingHours")}
            >
              {openingHoursPresets.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />
            Retour
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1" size="lg">
            Continuer
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
