import { cn } from "@/lib/cn";

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-neutral-200/80", className)} />;
}

export function AdminOrdersListSkeleton() {
  return (
    <div className="w-full space-y-8" aria-busy="true" aria-live="polite" aria-label="Chargement commandes">
      <div className="flex items-start gap-4">
        <Bar className="size-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Bar className="h-8 w-48" />
          <Bar className="h-4 w-full max-w-2xl" />
          <Bar className="h-16 w-full max-w-2xl rounded-xl" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border-0 bg-white p-5 shadow-soft">
            <div className="flex justify-between">
              <Bar className="h-3 w-24" />
              <Bar className="size-10 rounded-xl" />
            </div>
            <Bar className="mt-4 h-9 w-28" />
            <Bar className="mt-2 h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border-0 bg-white shadow-soft">
        <div className="space-y-4 p-6">
          <Bar className="h-5 w-40" />
          <div className="flex flex-col gap-3 lg:flex-row">
            <Bar className="h-10 flex-1 rounded-xl" />
            <Bar className="h-10 w-full rounded-xl lg:w-40" />
            <Bar className="h-10 w-full rounded-xl lg:w-40" />
            <Bar className="h-10 w-full rounded-xl lg:w-44" />
            <Bar className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        <div className="border-t border-neutral-100 px-4 py-3">
          <Bar className="h-10 w-full rounded-lg" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Bar key={i} className="mt-3 h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminOrderDetailSkeleton() {
  return (
    <div className="w-full space-y-6" aria-busy="true" aria-live="polite" aria-label="Chargement commande">
      <Bar className="h-9 w-44 rounded-xl" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Bar className="h-8 w-56" />
          <Bar className="h-4 w-32" />
        </div>
        <Bar className="h-10 w-36 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border-0 bg-white p-5 shadow-soft">
            <Bar className="h-3 w-20" />
            <Bar className="mt-3 h-6 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border-0 bg-white p-6 shadow-soft">
          <Bar className="h-5 w-32" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <Bar key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border-0 bg-white p-6 shadow-soft">
          <Bar className="h-5 w-40" />
          <Bar className="mt-4 h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
