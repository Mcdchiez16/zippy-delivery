import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, StatusChip } from "@/components/zippy/ui";
import { useAccount } from "@/hooks/use-account";
import { driverJobsQuery } from "@/hooks/use-driver";
import { money } from "@/lib/format";
import type { OrderStatus } from "@/lib/lifecycle";
import { VEHICLE_ART } from "@/components/zippy/vehicle-art";

export const Route = createFileRoute("/_authenticated/driver/activity")({
  head: () => ({ meta: [{ title: "Activity — Zippy Driver" }, { name: "description", content: "Your delivery history." }] }),
  component: Activity,
});

function Activity() {
  const { data: acc } = useAccount();
  const { data } = useQuery({ ...driverJobsQuery(acc?.user.id ?? ""), enabled: !!acc });
  const list = data?.mine ?? [];
  return (
    <div className="space-y-3 px-5 pt-6">
      <h1 className="text-2xl font-extrabold">Activity</h1>
      {list.length ? list.map((o) => (
        <Card key={o.id} className="p-4">
          <div className="flex items-center justify-between"><span className="text-xs font-bold text-muted-foreground">#{o.tracking_code} · {new Date(o.created_at).toLocaleDateString()}</span><StatusChip status={o.status as OrderStatus} /></div>
          <div className="mt-2 truncate text-sm">{o.pickup_summary} → {o.dropoff_summary}</div>
          <div className="mt-1 flex justify-between text-sm"><span className="text-muted-foreground">{Number(o.distance_km)} km</span><span className="font-bold text-primary">{money(o.driver_earnings_minor, o.currency)}</span></div>
        </Card>
      )) : <Card><EmptyState art={VEHICLE_ART.bicycle} title="No trips yet" body="Completed deliveries will be listed here." /></Card>}
    </div>
  );
}
