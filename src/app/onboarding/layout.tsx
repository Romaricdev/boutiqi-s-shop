"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Store, Package, CheckCircle2, Check } from "lucide-react";

import { Logo } from "@/components/ui/logo";

const STEPS = [
  {
    id: 1,
    path: "/onboarding/account",
    title: "Votre compte",
    description: "Informations personnelles",
    icon: User,
  },
  {
    id: 2,
    path: "/onboarding/shop",
    title: "Votre boutique",
    description: "Nom, localisation, description",
    icon: Store,
  },
  {
    id: 3,
    path: "/onboarding/products",
    title: "Vos produits",
    description: "Ajoutez vos articles (optionnel)",
    icon: Package,
  },
  {
    id: 4,
    path: "/onboarding/summary",
    title: "Récapitulatif",
    description: "Vérification et lancement",
    icon: CheckCircle2,
  },
];

function VerticalStepper({ currentPath }: { currentPath: string }) {
  const currentIndex = STEPS.findIndex((s) => s.path === currentPath);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="hidden w-[280px] shrink-0 lg:block">
      <div className="sticky top-20 space-y-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <div
              key={step.id}
              className={[
                "relative overflow-hidden rounded-xl border bg-white px-4 py-4 transition-all",
                isActive
                  ? "border-brand-300 shadow-md"
                  : "border-warm-200",
              ].join(" ")}
            >
              {/* Accent bar on left for active */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={[
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                      isCompleted
                        ? "bg-[#27AE60] text-white"
                        : isActive
                          ? "bg-brand-500 text-white"
                          : "bg-warm-100 text-warm-400",
                    ].join(" ")}
                  >
                    {isCompleted ? (
                      <Check className="size-4" strokeWidth={2.5} />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>

                  {/* Text */}
                  <div>
                    <span
                      className={[
                        "block text-sm font-semibold",
                        isActive
                          ? "text-warm-900"
                          : isCompleted
                            ? "text-warm-700"
                            : "text-warm-400",
                      ].join(" ")}
                    >
                      {step.title}
                    </span>
                    <p
                      className={[
                        "mt-0.5 text-xs",
                        isActive || isCompleted ? "text-warm-500" : "text-warm-300",
                      ].join(" ")}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Badge terminé */}
                {isCompleted && (
                  <span className="shrink-0 rounded-full bg-[#27AE60] px-2.5 py-1 text-[10px] font-semibold text-white">
                    Terminé
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileProgress({ currentPath }: { currentPath: string }) {
  const currentIndex = STEPS.findIndex((s) => s.path === currentPath);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentStep = STEPS[activeIndex];

  return (
    <div className="mb-6 lg:hidden">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-warm-900">{currentStep?.title}</span>
        <span className="text-warm-500">
          Étape {activeIndex + 1} sur {STEPS.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-warm-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${((activeIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-warm-50">
      {/* Header */}
      <header className="border-b border-warm-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Logo size={30} />
          <Link href="/" className="text-sm text-warm-500 hover:text-warm-700">
            Retour
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-8">
        {/* Mobile progress */}
        <MobileProgress currentPath={pathname} />

        {/* Desktop: 2 columns */}
        <div className="flex gap-8">
          {/* Left: Stepper */}
          <VerticalStepper currentPath={pathname} />

          {/* Right: Form content */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
