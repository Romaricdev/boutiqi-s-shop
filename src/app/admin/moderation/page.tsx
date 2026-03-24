import { Suspense } from "react";

import { AdminAnalyticsSkeleton } from "@/components/admin/admin-analytics-skeleton";

import AdminModerationClient from "./admin-moderation-client";

export default function AdminModerationPage() {
  return (
    <Suspense fallback={<AdminAnalyticsSkeleton />}>
      <AdminModerationClient />
    </Suspense>
  );
}
