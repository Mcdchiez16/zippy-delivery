import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, StatusChip } from "@/components/zippy/ui";
import { adminOrdersQuery } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/support")({
  head: () => ({ meta: [{ title: "Support & disputes — Zippy Admin" }, { name: "description", content: "Cancelled and failed deliveries to investigate." }] }),
  component: Support,
});

function Support() {
  const { data = [] } = useQuery(adminOrdersQuery);
  const issues = data.filter((o) => o.status === "cancelled" || o.cancel_reason);
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-extrabold">Exceptions to review</h2>
      {issues.length === 0 && <Card className="p-8 text-center text-muted-foreground">All clear — no cancelled or failed deliveries. 🎉</Card>}
      {issues.map((o) => (
        <Card key={o.id} className="flex items-center gap-4 p-4">
          <div className="flex-1"><div className="font-bold">{o.tracking_code}</div><div className="text-sm text-muted-foreground">{o.pickup_summary} → {o.dropoff_summary}</div>{o.cancel_reason && <div className="mt-1 text-sm">Reason: {o.cancel_reason}</div>}</div>
          <StatusChip status={o.status} />
        </Card>
      ))}
    </div>
  );
}
