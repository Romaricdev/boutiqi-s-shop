"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Store,
  User,
  Package,
  CheckCircle2,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Clock,
  Globe,
  Rocket,
} from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { useDashboardStore } from "@/lib/store/dashboard";

export default function OnboardingSummaryPage() {
  const router = useRouter();
  const { account, shop, products, shopSlug, reset } = useOnboardingStore();

  useEffect(() => {
    if (!account || !shop) {
      router.replace("/onboarding/account");
    }
  }, [account, shop, router]);

  const handleFinish = () => {
    if (account && shop) {
      useDashboardStore.getState().hydrateFromOnboarding({
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        businessType: account.businessType,
        shopName: shop.shopName,
        city: shop.city,
        neighborhood: shop.neighborhood,
        description: shop.description,
        openingHours: shop.openingHours,
        logoUrl: shop.logoUrl,
        slug: shopSlug,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          category: p.category,
          description: p.description,
        })),
      });
    }
    alert("Inscription terminée ! (Backend à implémenter)");
    reset();
    router.push("/dashboard");
  };

  if (!account || !shop) return null;

  return (
    <div>
      {/* Header with success indicator */}
      <div className="mb-5 flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#27AE60]/10">
          <CheckCircle2 className="size-6 text-[#27AE60]" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-warm-900 lg:text-2xl">
            Tout est prêt !
          </h1>
          <p className="text-sm text-warm-500">
            Vérifiez vos informations avant de lancer votre boutique.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Account info */}
        <div className="rounded-2xl border border-warm-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-brand-50">
                <User className="size-3.5 text-brand-600" />
              </div>
              <h2 className="text-sm font-semibold text-warm-800">Votre compte</h2>
            </div>
            <button
              type="button"
              onClick={() => router.push("/onboarding/account")}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Modifier
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-xl bg-warm-50 px-3 py-2.5">
              <User className="size-4 text-warm-400" />
              <div>
                <div className="text-[10px] font-medium text-warm-400">Nom</div>
                <div className="text-sm font-medium text-warm-900">{account.fullName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-warm-50 px-3 py-2.5">
              <Mail className="size-4 text-warm-400" />
              <div>
                <div className="text-[10px] font-medium text-warm-400">Email</div>
                <div className="text-sm font-medium text-warm-900">{account.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-warm-50 px-3 py-2.5">
              <Phone className="size-4 text-warm-400" />
              <div>
                <div className="text-[10px] font-medium text-warm-400">WhatsApp</div>
                <div className="text-sm font-medium text-warm-900">{account.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-warm-50 px-3 py-2.5">
              <Briefcase className="size-4 text-warm-400" />
              <div>
                <div className="text-[10px] font-medium text-warm-400">Commerce</div>
                <div className="text-sm font-medium text-warm-900">{account.businessType}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop info */}
        <div className="rounded-2xl border border-warm-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-lg bg-accent-50">
                <Store className="size-3.5 text-accent-600" />
              </div>
              <h2 className="text-sm font-semibold text-warm-800">Votre boutique</h2>
            </div>
            <button
              type="button"
              onClick={() => router.push("/onboarding/shop")}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Modifier
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-3.5 py-2.5">
              <Globe className="size-4 text-brand-500" />
              <span className="text-xs text-brand-700">
                Votre lien :{" "}
                <span className="font-bold">boutiki.cm/{shopSlug}</span>
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 rounded-xl bg-warm-50 px-3 py-2.5">
                <Store className="size-4 text-warm-400" />
                <div>
                  <div className="text-[10px] font-medium text-warm-400">Boutique</div>
                  <div className="text-sm font-medium text-warm-900">{shop.shopName}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-warm-50 px-3 py-2.5">
                <MapPin className="size-4 text-warm-400" />
                <div>
                  <div className="text-[10px] font-medium text-warm-400">Localisation</div>
                  <div className="text-sm font-medium text-warm-900">
                    {shop.neighborhood}, {shop.city}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-warm-50 px-3 py-2.5">
                <Clock className="size-4 text-warm-400" />
                <div>
                  <div className="text-[10px] font-medium text-warm-400">Horaires</div>
                  <div className="text-sm font-medium text-warm-900">{shop.openingHours}</div>
                </div>
              </div>
            </div>

            {shop.description && (
              <div className="rounded-xl bg-warm-50 px-3 py-2.5">
                <div className="text-[10px] font-medium text-warm-400">Description</div>
                <div className="mt-0.5 text-sm text-warm-700">{shop.description}</div>
              </div>
            )}
          </div>
        </div>

        {/* Products info */}
        {products.length > 0 && (
          <div className="rounded-2xl border border-warm-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid size-7 place-items-center rounded-lg bg-[#27AE60]/10">
                  <Package className="size-3.5 text-[#27AE60]" />
                </div>
                <h2 className="text-sm font-semibold text-warm-800">
                  Produits ({products.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => router.push("/onboarding/products")}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Modifier
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl bg-warm-50 p-2.5"
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="size-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="grid size-10 place-items-center rounded-lg bg-warm-200">
                      <Store className="size-4 text-warm-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-warm-900">{p.name}</div>
                    <div className="text-xs font-bold text-brand-600">
                      {p.price.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Retour
        </Button>

        <Button type="button" onClick={handleFinish} className="flex-1" size="lg">
          <Rocket className="size-4" />
          Lancer ma boutique
        </Button>
      </div>
    </div>
  );
}
