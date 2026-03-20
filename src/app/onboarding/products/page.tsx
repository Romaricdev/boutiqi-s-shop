"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Store,
  Package,
  Tag,
  ImagePlus,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { productSchema, type ProductFormData } from "@/lib/validations/onboarding";
import { useOnboardingStore } from "@/lib/store/onboarding";

const categories = [
  { value: "", label: "Sélectionnez une catégorie..." },
  { value: "vetements", label: "Vêtements" },
  { value: "chaussures", label: "Chaussures" },
  { value: "accessoires", label: "Accessoires" },
  { value: "alimentation", label: "Alimentation" },
  { value: "cosmetiques", label: "Cosmétiques" },
  { value: "electronique", label: "Électronique" },
  { value: "autre", label: "Autre" },
];

export default function OnboardingProductsPage() {
  const router = useRouter();
  const { account, shop, products, addProduct, removeProduct, setStep, shopSlug } =
    useOnboardingStore();
  const [showForm, setShowForm] = useState(products.length === 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (!account || !shop) {
      router.replace("/onboarding/account");
    }
  }, [account, shop, router]);

  const onSubmit = (data: ProductFormData) => {
    addProduct({
      id: crypto.randomUUID(),
      ...data,
    });
    reset();
    setShowForm(false);
  };

  const handleSkip = () => {
    setStep(4);
    router.push("/onboarding/summary");
  };

  const handleContinue = () => {
    setStep(4);
    router.push("/onboarding/summary");
  };

  if (!account || !shop) return null;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-warm-900 lg:text-2xl">
          Ajoutez vos produits
        </h1>
        <p className="mt-1 text-sm text-warm-500">
          Étape facultative — vous pouvez aussi le faire depuis le dashboard.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,260px]">
        {/* Left: form + products list */}
        <div className="space-y-4">
          {/* Products list */}
          {products.length > 0 && (
            <div className="rounded-2xl border border-warm-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="grid size-7 place-items-center rounded-lg bg-[#27AE60]/10">
                  <Package className="size-3.5 text-[#27AE60]" />
                </div>
                <h2 className="text-sm font-semibold text-warm-800">
                  Produits ajoutés ({products.length})
                </h2>
              </div>

              <div className="space-y-2">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-warm-100 bg-warm-50/50 p-3 transition hover:border-warm-200"
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="size-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="grid size-12 place-items-center rounded-lg bg-warm-100">
                        <Store className="size-5 text-warm-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-warm-900">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-warm-100 px-1.5 py-0.5 text-[10px] font-medium text-warm-600">
                          {p.category}
                        </span>
                        <span className="text-sm font-bold text-brand-600">
                          {p.price.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(p.id)}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-warm-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add product form */}
          {showForm ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="rounded-2xl border border-warm-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-brand-50">
                    <Tag className="size-3.5 text-brand-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-warm-800">Nouveau produit</h2>
                </div>

                <div className="space-y-4">
                  <FileUpload
                    label="Photo du produit"
                    value={watch("imageUrl")}
                    onChange={(url) => setValue("imageUrl", url)}
                    error={errors.imageUrl?.message}
                  />

                  <Input
                    label="Nom du produit"
                    placeholder="Ex: Robe wax bleue"
                    icon={<Tag className="size-4" />}
                    error={errors.name?.message}
                    {...register("name")}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Prix (FCFA)"
                      type="number"
                      placeholder="14 500"
                      error={errors.price?.message}
                      {...register("price", { valueAsNumber: true })}
                    />

                    <Select
                      label="Catégorie"
                      error={errors.category?.message}
                      {...register("category")}
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Textarea
                    label="Description (optionnelle)"
                    placeholder="Ex: Belle robe en wax authentique, taille M"
                    error={errors.description?.message}
                    {...register("description")}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  <Plus className="size-4" />
                  Ajouter le produit
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-warm-200 bg-white py-5 text-sm font-semibold text-warm-500 transition hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-700"
            >
              <Plus className="size-5" />
              Ajouter un produit
            </button>
          )}
        </div>

        {/* Right: preview boutique */}
        <div className="hidden rounded-2xl border border-warm-200 bg-white p-4 lg:sticky lg:top-20 lg:block lg:self-start">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-warm-600">
            <Store className="size-3.5" />
            Aperçu de votre boutique
          </div>

          <div className="overflow-hidden rounded-xl border border-warm-200">
            <div className="border-b border-warm-100 bg-warm-50 px-3 py-2.5">
              <div className="flex items-center gap-2">
                {shop.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shop.shopName}
                    className="size-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid size-8 place-items-center rounded-lg bg-brand-100">
                    <Store className="size-4 text-brand-600" />
                  </div>
                )}
                <div>
                  <div className="font-display text-sm font-semibold text-warm-900">
                    {shop.shopName || "Boutique"}
                  </div>
                  <div className="text-[10px] text-warm-500">
                    {shop.neighborhood}, {shop.city}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5">
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {products.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="overflow-hidden rounded-lg border border-warm-100"
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-square w-full bg-warm-100" />
                      )}
                      <div className="p-1.5">
                        <div className="truncate text-[9px] font-semibold text-warm-900">
                          {p.name}
                        </div>
                        <div className="text-[10px] font-bold text-brand-600">
                          {p.price.toLocaleString()} F
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-lg border border-dashed border-warm-200 py-6 text-center">
                  <ImagePlus className="size-6 text-warm-300" />
                  <span className="mt-1.5 text-[10px] text-warm-400">
                    Vos produits apparaîtront ici
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Retour
        </Button>

        {products.length === 0 ? (
          <Button type="button" variant="ghost" onClick={handleSkip} className="flex-1">
            Passer cette étape
          </Button>
        ) : (
          <Button type="button" onClick={handleContinue} className="flex-1" size="lg">
            Continuer
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
