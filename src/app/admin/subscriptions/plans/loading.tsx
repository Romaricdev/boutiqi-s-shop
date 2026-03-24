import { cn } from "@/lib/cn";

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-neutral-200/80", className)} />;
}

export default function Loading() {
  return (
    <div className="w-full space-y-8" aria-busy="true" aria-label="Chargement">
      <div className="flex gap-4">
        <Bar className="size-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Bar className="h-8 w-64" />
          <Bar className="h-4 max-w-xl" />
        </div>
      </div>
      <Bar className="h-24 w-full rounded-2xl" />
      <Bar className="h-96 w-full rounded-2xl" />
    </div>
  );
}
