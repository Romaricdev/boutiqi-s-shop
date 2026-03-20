"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, MapPin, FileText, Phone, Globe, ImageIcon } from "lucide-react";

import { useDashboardStore } from "@/lib/store/dashboard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const settingsSchema = z.object({
  shopName: z.string().min(2, "Nom requis").max(60, "Max 60 caractères"),
  city: z.string().min(1, "Ville requise"),
  neighborhood: z.string().min(2, "Quartier requis"),
  description: z.string().min(10, "Min 10 caractères").max(200, "Max 200 caractères"),
  openingHours: z.string().min(1, "Horaires requis"),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  whatsappPhone: z
    .string()
    .regex(/^(6[5-9]\d{7}|2376[5-9]\d{7})$/, "Numéro invalide (ex: 690123456)"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const CITIES = [
  { value: "", label: "Ville..." },
  { value: "douala", label: "Douala" },
  { value: "yaounde", label: "Yaoundé" },
  { value: "autre", label: "Autre" },
];

const HOURS = [
  { value: "", label: "Horaires..." },
  { value: "8h-20h", label: "Tous les jours 8h–20h" },
  { value: "9h-18h", label: "Lun–Sam 9h–18h" },
  { value: "10h-22h", label: "Tous les jours 10h–22h" },
  { value: "custom", label: "Personnalisé" },
];

export default function DashboardSettingsPage() {
  const { shop, setShop } = useDashboardStore();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName: "",
      city: "",
      neighborhood: "",
      description: "",
      openingHours: "",
      whatsappPhone: "",
    },
  });

  useEffect(() => {
    if (shop) {
      form.reset({
        shopName: shop.shopName,
        city: shop.city,
        neighborhood: shop.neighborhood,
        description: shop.description,
        openingHours: shop.openingHours,
        logoUrl: shop.logoUrl ?? "",
        coverImageUrl: shop.coverImageUrl ?? "",
        whatsappPhone: shop.whatsappPhone,
      });
    }
  }, [shop]);

  const onSubmit = (data: SettingsFormData) => {
    if (!shop) return;
    const slug = data.shopName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setShop({
      ...shop,
      shopName: data.shopName,
      city: data.city,
      neighborhood: data.neighborhood,
      description: data.description,
      openingHours: data.openingHours,
      logoUrl: data.logoUrl || undefined,
      coverImageUrl: data.coverImageUrl || undefined,
      whatsappPhone: data.whatsappPhone,
      slug: slug || shop.slug,
    });
  };

  if (!shop) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-warm-900 lg:text-2xl">Paramètres</h1>
          <p className="mt-1 text-sm text-warm-500">Profil de votre boutique (visible par les clients).</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-400">
          <span className="rounded-md bg-warm-50 px-2 py-1">boutique</span>
          <span className="text-warm-300">/</span>
          <span className="font-semibold text-warm-600">{shop.shopName}</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border border-warm-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-brand-50">
              <Store className="size-3.5 text-brand-600" />
            </div>
            <h2 className="text-sm font-semibold text-warm-800">Identité</h2>
          </div>
          <div className="space-y-3">
            <FileUpload
              label="Logo"
              compact
              value={form.watch("logoUrl")}
              onChange={(url) => form.setValue("logoUrl", url)}
            />
            <Input
              label="Nom de la boutique"
              placeholder="Ex: Boutique Solange"
              icon={<Store className="size-4" />}
              error={form.formState.errors.shopName?.message}
              {...form.register("shopName")}
            />
            <div className="rounded-md bg-warm-50 px-3.5 py-2">
              <div className="flex items-center gap-2 text-xs text-warm-600">
                <Globe className="size-4" />
                Lien : boutiki.cm/{shop.slug}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-warm-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-brand-50">
              <ImageIcon className="size-3.5 text-brand-600" />
            </div>
            <h2 className="text-sm font-semibold text-warm-800">Mise en avant</h2>
          </div>
          <div className="space-y-3">
            <FileUpload
              label="Image de couverture (hero de votre boutique)"
              value={form.watch("coverImageUrl")}
              onChange={(url) => form.setValue("coverImageUrl", url)}
            />
            <p className="text-[11px] text-warm-400">
              Format recommandé : 1200×400px. Si aucune image n&apos;est ajoutée, un visuel par défaut sera affiché.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-warm-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-accent-50">
              <MapPin className="size-3.5 text-accent-600" />
            </div>
            <h2 className="text-sm font-semibold text-warm-800">Localisation</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Ville"
              error={form.formState.errors.city?.message}
              {...form.register("city")}
            >
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
            <Input
              label="Quartier"
              placeholder="Ex: Akwa"
              icon={<MapPin className="size-4" />}
              error={form.formState.errors.neighborhood?.message}
              {...form.register("neighborhood")}
            />
          </div>
        </div>

        <div className="rounded-lg border border-warm-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-warm-100">
              <FileText className="size-3.5 text-warm-600" />
            </div>
            <h2 className="text-sm font-semibold text-warm-800">Détails</h2>
          </div>
          <div className="space-y-3">
            <Textarea
              label="Description"
              placeholder="Présentez votre boutique en 1–2 phrases."
              error={form.formState.errors.description?.message}
              {...form.register("description")}
            />
            <Select
              label="Horaires d'ouverture"
              error={form.formState.errors.openingHours?.message}
              {...form.register("openingHours")}
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </Select>
            <Input
              label="Numéro WhatsApp (contact clients)"
              type="tel"
              placeholder="690123456"
              icon={<Phone className="size-4" />}
              hint="Format: 6XXXXXXXX"
              error={form.formState.errors.whatsappPhone?.message}
              {...form.register("whatsappPhone")}
            />
          </div>
        </div>

        <div className="pt-1">
          <Button type="submit" disabled={form.formState.isSubmitting} size="lg" className="w-full sm:w-auto">
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
