import { cn } from "@/lib/cn";

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-warm-100", className)} />;
}

export type DashboardLoaderVariant =
  | "default"
  | "orders"
  | "products"
  | "analytics"
  | "customers"
  | "settings"
  | "orderDetail";

export function DashboardPageLoader({ variant = "default" }: { variant?: DashboardLoaderVariant }) {
  return (
    <div
      className="space-y-5"
      aria-busy="true"
      aria-live="polite"
      aria-label="Chargement de la page"
    >
      {/* En-tête de page */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Bar className="h-7 w-48 lg:h-8" />
          <Bar className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Bar className="h-9 w-28 rounded-lg" />
          <Bar className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {variant === "default" && <DefaultBody />}
      {variant === "orders" && <OrdersBody />}
      {variant === "products" && <ProductsBody />}
      {variant === "analytics" && <AnalyticsBody />}
      {variant === "customers" && <CustomersBody />}
      {variant === "settings" && <SettingsBody />}
      {variant === "orderDetail" && <OrderDetailBody />}
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex min-h-[124px] flex-col justify-between rounded-xl border border-warm-200 bg-white p-4">
          <div className="flex justify-between">
            <Bar className="h-3 w-20" />
            <Bar className="size-8 rounded-md" />
          </div>
          <Bar className="h-8 w-24" />
          <Bar className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

function DefaultBody() {
  return (
    <>
      <KpiRow />
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-warm-200 bg-white p-5 lg:col-span-3">
          <Bar className="mb-4 h-4 w-40" />
          <Bar className="h-[200px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-warm-200 bg-white p-5 lg:col-span-2">
          <Bar className="mb-3 h-4 w-36" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Bar className="h-3 w-full" />
                <Bar className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function OrdersBody() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Bar key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-warm-200 bg-white">
        <div className="border-b border-warm-100 bg-warm-50/60 px-4 py-3">
          <div className="flex gap-4">
            <Bar className="h-3 w-24" />
            <Bar className="h-3 w-20" />
            <Bar className="h-3 w-16" />
            <Bar className="ml-auto h-3 w-14" />
          </div>
        </div>
        <div className="divide-y divide-warm-100">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Bar className="size-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Bar className="h-4 w-40 max-w-full" />
                <Bar className="h-3 w-28" />
              </div>
              <Bar className="h-4 w-16 shrink-0" />
              <Bar className="h-6 w-20 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ProductsBody() {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Bar className="h-9 w-40 rounded-lg" />
        <Bar className="h-9 flex-1 min-w-[120px] max-w-xs rounded-lg" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-warm-200 bg-white">
            <Bar className="aspect-[4/3] w-full rounded-none rounded-t-xl" />
            <div className="space-y-2 p-3.5">
              <Bar className="h-4 w-3/4" />
              <Bar className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AnalyticsBody() {
  return (
    <>
      <KpiRow />
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-lg border border-warm-200 bg-white p-5 xl:col-span-3">
          <Bar className="mb-4 h-4 w-48" />
          <div className="mb-3 flex gap-2">
            {[0, 1, 2].map((i) => (
              <Bar key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
          <Bar className="h-[260px] w-full rounded-xl" />
        </div>
        <div className="rounded-lg border border-warm-200 bg-white p-5 xl:col-span-2">
          <Bar className="mb-4 h-4 w-40" />
          <div className="space-y-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Bar className="h-3 w-full" />
                <Bar className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CustomersBody() {
  return (
    <div className="overflow-hidden rounded-xl border border-warm-200 bg-white">
      <div className="border-b border-warm-100 bg-warm-50/60 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Bar className="h-9 flex-1 min-w-[160px] max-w-sm rounded-lg" />
          <Bar className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      <div className="divide-y divide-warm-100">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Bar className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bar className="h-4 w-36" />
              <Bar className="h-3 w-28" />
            </div>
            <Bar className="h-4 w-16 shrink-0" />
            <Bar className="h-8 w-8 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsBody() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {[0, 1, 2].map((section) => (
        <div key={section} className="rounded-xl border border-warm-200 bg-white p-5">
          <Bar className="mb-4 h-5 w-48" />
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Bar className="h-3 w-24" />
                <Bar className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderDetailBody() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-lg border border-warm-200 bg-white p-4">
          <Bar className="mb-4 h-4 w-32" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Bar key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-warm-200 bg-white p-4">
          <Bar className="h-20 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-warm-200 bg-white p-5">
          <Bar className="mb-3 h-4 w-24" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Bar key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
