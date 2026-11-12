import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/zippy/ui";
import { adminOrdersQuery } from "@/lib/admin-data";
import { money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/finance")({
  head: () => ({ meta: [{ title: "Finance — Zippy Admin" }, { name: "description", content: "Revenue, commissions and driver payouts." }] }),
  component: Finance,
});

function Finance() {
  const { data = [] } = useQuery(adminOrdersQuery);
  const done = data.filter((o) => o.status === "delivered");
  const gross = done.reduce((s, o) => s + o.total_minor, 0);
  const drivers = done.reduce((s, o) => s + o.driver_earnings_minor, 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[["Gross bookings", money(gross)], ["Owed to drivers", money(drivers)], ["Platform commission", money(gross - drivers)]].map(([l, v]) => (
          <Card key={l} className="p-5"><div className="text-xs font-bold text-muted-foreground">{l}</div><div className="mt-1 font-display text-2xl font-extrabold">{v}</div></Card>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-3">Date</th><th>Tracking</th><th>Method</th><th>Total</th><th>Driver share</th><th className="p-3 text-right">Commission</th></tr></thead>
          <tbody>
            {done.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No completed payments yet.</td></tr>}
            {done.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td><td className="font-bold">{o.tracking_code}</td><td>Cash</td>
                <td>{money(o.total_minor)}</td><td>{money(o.driver_earnings_minor)}</td><td className="p-3 text-right">{money(o.total_minor - o.driver_earnings_minor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-muted-foreground">Online payments, refunds and payout processing arrive with the payments phase.</p>
    </div>
  );
}
