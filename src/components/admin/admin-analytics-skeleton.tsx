import { cn } from "@/lib/cn";

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-neutral-200/80", className)} />;
}

export function AdminAnalyticsSkeleton() {
  return (
    <div className="w-full space-y-8" aria-busy="true" aria-label="Chargement statistiques">
      <div className="flex gap-4">
        <Bar className="size-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Bar className="h-8 w-52" />
          <Bar className="h-4 max-w-2xl" />
          <Bar className="h-14 max-w-2xl rounded-xl" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border-0 bg-white p-5 shadow-soft">
            <Bar className="h-3 w-24" />
            <Bar className="mt-4 h-8 w-20" />
            <Bar className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Bar className="h-72 rounded-2xl" />
        <Bar className="h-72 rounded-2xl" />
      </div>
      <Bar className="h-48 rounded-2xl" />
    </div>
  );
}
