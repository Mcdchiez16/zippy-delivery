import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CourierLoader, EmptyState } from "@/components/zippy/ui";
import { useAccount } from "@/hooks/use-account";
import { myOrdersQuery } from "@/hooks/use-orders";
import { ACTIVE_STATUSES, type OrderStatus } from "@/lib/lifecycle";
import routeMap from "@/assets/route-map.png";

export const Route = createFileRoute("/_authenticated/app/track")({
  head: () => ({ meta: [{ title: "Track — Zippy" }, { name: "description", content: "Track your active delivery." }] }),
  component: Track,
});

function Track() {
  const { data: acc } = useAccount();
  const { data, isLoading } = useQuery({ ...myOrdersQuery(acc?.user.id ?? ""), enabled: !!acc });
  if (isLoading || !data) return <CourierLoader />;
  const active = data.find((o) => ACTIVE_STATUSES.includes(o.status as OrderStatus));
  if (active) return <Navigate to="/app/order/$id" params={{ id: active.id }} replace />;
  return (
    <div className="px-5 pt-10">
      <EmptyState art={routeMap} title="Nothing to track yet" body="Book a delivery and follow every step from pickup to doorstep." action={<Button asChild variant="zippy" className="h-11 px-6"><Link to="/app/send">Send a Package</Link></Button>} />
    </div>
  );
}
