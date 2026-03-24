import { Suspense } from "react";

import { AdminAnalyticsSkeleton } from "@/components/admin/admin-analytics-skeleton";

import AdminAnalyticsClient from "./admin-analytics-client";

export default function AdminAnalyticsPage() {
  return (
    <Suspense fallback={<AdminAnalyticsSkeleton />}>
      <AdminAnalyticsClient />
    </Suspense>
  );
}
