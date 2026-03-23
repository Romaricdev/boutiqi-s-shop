import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Separator } from "@/components/shadcn/separator";

export function AdminPlaceholderPage({
  title,
  description,
  icon: Icon,
  badges,
  cardTitle = "Contenu à venir",
  cardHint = "Cette section sera branchée sur Supabase et les Edge Functions.",
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  badges?: string[];
  cardTitle?: string;
  cardHint?: string;
}) {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-start gap-4">
        <div className="group grid size-10 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
          <Icon className="size-5 text-neutral-700 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
          {badges && badges.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 font-semibold text-neutral-700 transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-sm"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-soft transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.14)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-neutral-900">{cardTitle}</CardTitle>
          <CardDescription className="text-[11px]">{cardHint}</CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="py-12 text-center text-sm text-neutral-400">
          Implémentation prévue après validation du back-office et des API admin.
        </CardContent>
      </Card>
    </div>
  );
}
