import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, StatusChip } from "@/components/zippy/ui";
import { adminOrdersQuery } from "@/lib/admin-data";
import { money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/operations")({
  head: () => ({ meta: [{ title: "Live operations — Zippy Admin" }, { name: "description", content: "Active, unassigned and delayed deliveries." }] }),
  component: Ops,
});

function Ops() {
  const { data = [] } = useQuery(adminOrdersQuery);
  const active = data.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const unassigned = active.filter((o) => !o.driver_id);
  const delayed = active.filter((o) => Date.now() - new Date(o.created_at).getTime() > (o.duration_min + 30) * 60000);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[["Active deliveries", active.length], ["Unassigned", unassigned.length], ["Running late", delayed.length]].map(([l, v]) => (
          <Card key={l} className="p-5"><div className="text-xs font-bold text-muted-foreground">{l}</div><div className="mt-1 font-display text-3xl font-extrabold">{v}</div></Card>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-3">Tracking</th><th>Route</th><th>Vehicle</th><th>Status</th><th>Driver</th><th className="p-3 text-right">Total</th></tr></thead>
          <tbody>
            {active.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No live deliveries right now.</td></tr>}
            {active.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-bold">{o.tracking_code}</td>
                <td className="max-w-xs truncate">{o.pickup_summary} → {o.dropoff_summary}</td>
                <td className="capitalize">{o.vehicle_type}</td>
                <td><StatusChip status={o.status} /></td>
                <td>{o.driver_id ? "Assigned" : <span className="font-bold text-destructive">Waiting</span>}</td>
                <td className="p-3 text-right">{money(o.total_minor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
