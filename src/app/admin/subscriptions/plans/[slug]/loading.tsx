import { cn } from "@/lib/cn";

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-neutral-200/80", className)} />;
}

export default function Loading() {
  return (
    <div className="w-full space-y-6" aria-busy="true">
      <Bar className="h-9 w-48 rounded-xl" />
      <Bar className="h-10 w-72" />
      <Bar className="h-64 w-full rounded-2xl" />
      <Bar className="h-48 w-full rounded-2xl" />
    </div>
  );
}
