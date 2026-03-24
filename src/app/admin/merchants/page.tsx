import { Suspense } from "react";

import { AdminMerchantsListSkeleton } from "@/components/admin/admin-merchants-skeleton";

import AdminMerchantsClient from "./admin-merchants-client";

export default function AdminMerchantsPage() {
  return (
    <Suspense fallback={<AdminMerchantsListSkeleton />}>
      <AdminMerchantsClient />
    </Suspense>
  );
}
