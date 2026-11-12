import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, ProgressBar } from "@/components/zippy/ui";
import { adminOrdersQuery } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Zippy Admin" }, { name: "description", content: "Delivery volume, vehicles and peak hours." }] }),
  component: Analytics,
});

function Bars({ rows }: { rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="flex h-40 items-end gap-2">
      {rows.map(([l, v]) => (
        <div key={l} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-lg bg-primary transition-all" style={{ height: `${(v / max) * 100}%`, minHeight: 4 }} title={`${v}`} />
          <span className="text-[10px] font-bold text-muted-foreground">{l}</span>
        </div>
      ))}
    </div>
  );
}

function Analytics() {
  const { data = [] } = useQuery(adminOrdersQuery);
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const daily: [string, number][] = days.map((d) => [d.toLocaleDateString("en", { weekday: "short" }), data.filter((o) => new Date(o.created_at).toDateString() === d.toDateString()).length]);
  const hours: [string, number][] = [...Array(12)].map((_, i) => [`${i * 2}h`, data.filter((o) => Math.floor(new Date(o.created_at).getHours() / 2) === i).length]);
  const vehicles = ["bicycle", "motorbike", "car", "cargo"].map((v) => [v, data.filter((o) => o.vehicle_type === v).length] as const);
  const finished = data.filter((o) => ["delivered", "cancelled"].includes(o.status));
  const success = finished.length ? Math.round((data.filter((o) => o.status === "delivered").length / finished.length) * 100) : 0;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5"><h3 className="mb-4 font-display font-extrabold">Daily deliveries (7 days)</h3><Bars rows={daily} /></Card>
      <Card className="p-5"><h3 className="mb-4 font-display font-extrabold">Peak booking hours</h3><Bars rows={hours} /></Card>
      <Card className="space-y-3 p-5">
        <h3 className="font-display font-extrabold">Popular vehicles</h3>
        {vehicles.map(([v, n]) => (<div key={v}><div className="flex justify-between text-sm font-bold capitalize"><span>{v}</span><span>{n}</span></div><ProgressBar value={data.length ? (n / data.length) * 100 : 0} tone="sky" /></div>))}
      </Card>
      <Card className="p-5">
        <h3 className="font-display font-extrabold">Delivery success rate</h3>
        <div className="mt-3 font-display text-5xl font-extrabold text-primary">{success}%</div>
        <p className="mt-1 text-sm text-muted-foreground">of finished orders were delivered.</p>
      </Card>
    </div>
  );
}
