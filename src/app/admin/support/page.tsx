import { Suspense } from "react";

import { AdminAnalyticsSkeleton } from "@/components/admin/admin-analytics-skeleton";

import AdminSupportClient from "./admin-support-client";

export default function AdminSupportPage() {
  return (
    <Suspense fallback={<AdminAnalyticsSkeleton />}>
      <AdminSupportClient />
    </Suspense>
  );
}
