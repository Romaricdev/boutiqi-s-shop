import { Suspense } from "react";

import { AdminSubscriptionsListSkeleton } from "@/components/admin/admin-subscriptions-skeleton";

import AdminSubscriptionsClient from "./admin-subscriptions-client";

export default function AdminSubscriptionsPage() {
  return (
    <Suspense fallback={<AdminSubscriptionsListSkeleton />}>
      <AdminSubscriptionsClient />
    </Suspense>
  );
}
