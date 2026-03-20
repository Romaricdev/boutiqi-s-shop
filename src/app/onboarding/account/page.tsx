"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, UserCircle, Phone, Briefcase } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { accountSchema, type AccountFormData } from "@/lib/validations/onboarding";
import { useOnboardingStore } from "@/lib/store/onboarding";

const businessTypes = [
  { value: "", label: "Sélectionnez votre activité..." },
  { value: "friperie", label: "Friperie / Vêtements" },
  { value: "restaurant", label: "Restaurant / Maquis" },
  { value: "epicerie", label: "Épicerie / Supérette" },
  { value: "cosmetiques", label: "Cosmétiques / Beauté" },
  { value: "electronique", label: "Électronique" },
  { value: "autre", label: "Autre" },
];

export default function OnboardingAccountPage() {
  const router = useRouter();
  const { setAccount, setStep } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });

  const onSubmit = (data: AccountFormData) => {
    const { confirmPassword, ...accountData } = data;
    setAccount(accountData);
    setStep(2);
    router.push("/onboarding/shop");
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-warm-900 lg:text-2xl">
          Créez votre compte
        </h1>
        <p className="mt-1 text-sm text-warm-500">
          Quelques informations pour démarrer. Vous pourrez tout modifier plus tard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Section: Identifiants */}
        <div className="rounded-2xl border border-warm-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-brand-50">
              <Lock className="size-3.5 text-brand-600" />
            </div>
            <h2 className="text-sm font-semibold text-warm-800">Identifiants</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Adresse email"
              type="email"
              placeholder="votre@email.cm"
              icon={<Mail className="size-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Mot de passe"
                type="password"
                placeholder="Minimum 8 caractères"
                icon={<Lock className="size-4" />}
                hint="Utilisez un mot de passe sécurisé"
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="Retapez votre mot de passe"
                icon={<Lock className="size-4" />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>
          </div>
        </div>

        {/* Section: Informations personnelles */}
        <div className="rounded-2xl border border-warm-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-accent-50">
              <UserCircle className="size-3.5 text-accent-600" />
            </div>
            <h2 className="text-sm font-semibold text-warm-800">Informations personnelles</h2>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nom et prénom"
                placeholder="Ex: Marie Fotso"
                icon={<UserCircle className="size-4" />}
                error={errors.fullName?.message}
                {...register("fullName")}
              />

              <Input
                label="Numéro WhatsApp"
                type="tel"
                placeholder="690123456"
                icon={<Phone className="size-4" />}
                hint="Format: 6XXXXXXXX (sans indicatif)"
                error={errors.phone?.message}
                {...register("phone")}
              />
            </div>

            <Select
              label="Type de commerce"
              error={errors.businessType?.message}
              {...register("businessType")}
            >
              {businessTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5 rounded-xl border border-warm-100 bg-warm-50/50 px-4 py-3">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-0.5 size-4 rounded border-warm-300 text-brand-500 focus:ring-brand-500/20"
          />
          <label htmlFor="terms" className="text-xs leading-relaxed text-warm-600">
            J&apos;accepte les{" "}
            <a href="#" className="font-semibold text-brand-600 hover:underline">
              conditions d&apos;utilisation
            </a>{" "}
            et la{" "}
            <a href="#" className="font-semibold text-brand-600 hover:underline">
              politique de confidentialité
            </a>
          </label>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          Continuer
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-warm-500">
        Vous avez déjà un compte ?{" "}
        <a href="/auth/login" className="font-semibold text-brand-600 hover:underline">
          Se connecter
        </a>
      </div>
    </div>
  );
}
