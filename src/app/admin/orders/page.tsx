import { Suspense } from "react";

import { AdminOrdersListSkeleton } from "@/components/admin/admin-orders-skeleton";

import AdminOrdersClient from "./admin-orders-client";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<AdminOrdersListSkeleton />}>
      <AdminOrdersClient />
    </Suspense>
  );
}
