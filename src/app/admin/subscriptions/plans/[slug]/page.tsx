import SubscriptionPlanEditClient from "../subscription-plan-edit-client";

type PageProps = { params: { slug: string } };

export default function AdminSubscriptionPlanEditPage({ params }: PageProps) {
  return <SubscriptionPlanEditClient slug={params.slug} />;
}
