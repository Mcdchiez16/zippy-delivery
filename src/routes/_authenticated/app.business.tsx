import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Boxes, Clock, Truck, CheckCircle2, Wallet, Upload, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/zippy/ui";
import { OrderCard } from "@/components/zippy/order-card";
import { useAccount } from "@/hooks/use-account";
import { myOrdersQuery } from "@/hooks/use-orders";
import { ACTIVE_STATUSES, type OrderStatus } from "@/lib/lifecycle";
import { money } from "@/lib/format";
import { VEHICLE_ART } from "@/components/zippy/vehicle-art";

export const Route = createFileRoute("/_authenticated/app/business")({
  head: () => ({ meta: [{ title: "Business — Zippy" }, { name: "description", content: "Your Zippy business dashboard." }] }),
  component: Business,
});

function Business() {
  const { data: acc } = useAccount();
  const { data = [] } = useQuery({ ...myOrdersQuery(acc?.user.id ?? ""), enabled: !!acc });
  const today = new Date().toDateString();
  const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
  const stats = [
    { l: "Today's deliveries", v: data.filter((o) => new Date(o.created_at).toDateString() === today).length, icon: Boxes, tone: "bg-secondary text-secondary-foreground" },
    { l: "Pending pickups", v: data.filter((o) => ["searching", "assigned", "arriving_pickup"].includes(o.status)).length, icon: Clock, tone: "bg-sun/25 text-sun-foreground" },
    { l: "Active shipments", v: data.filter((o) => ["picked_up", "in_transit"].includes(o.status)).length, icon: Truck, tone: "bg-sky/15 text-sky" },
    { l: "Completed", v: data.filter((o) => o.status === "delivered").length, icon: CheckCircle2, tone: "bg-success/15 text-success" },
  ];
  const spend = data.filter((o) => o.status === "delivered" && new Date(o.created_at) >= month).reduce((s, o) => s + o.total_minor, 0);
  const active = data.filter((o) => ACTIVE_STATUSES.includes(o.status as OrderStatus));
  return (
    <div className="space-y-5 px-5 pt-6">
      <div className="flex items-center gap-3">
        <Link to="/app" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-card"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="inline-flex rounded-full bg-muted p-1 text-xs font-bold"><Link to="/app" className="px-3 py-1 text-muted-foreground">Personal</Link><span className="rounded-full bg-card px-3 py-1 shadow-card">Business</span></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-ink-foreground"><Store className="h-7 w-7" /></div>
        <div><h1 className="text-xl font-extrabold">{acc?.profile?.full_name ? `${acc.profile.full_name.split(" ")[0]}'s Shop` : "My Business"}</h1><p className="text-sm text-muted-foreground">Business dashboard</p></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.l} className="p-4">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${s.tone}`}><s.icon className="h-5 w-5" /></span>
            <div className="mt-2 font-display text-2xl font-extrabold">{s.v}</div>
            <div className="text-xs font-bold text-muted-foreground">{s.l}</div>
          </Card>
        ))}
      </div>
      <div className="rounded-3xl bg-ink p-5 text-ink-foreground shadow-float">
        <div className="flex items-center gap-2 text-sm font-semibold opacity-80"><Wallet className="h-4 w-4" />Monthly delivery spend</div>
        <div className="mt-1 font-display text-3xl font-extrabold">{money(spend)}</div>
      </div>
      <Card className="relative overflow-hidden p-5">
        <h2 className="font-display text-lg font-extrabold">Quick bulk booking</h2>
        <p className="max-w-[65%] text-sm text-muted-foreground">Send several orders from your shop at once.</p>
        <div className="mt-4 flex gap-2">
          <Button asChild variant="zippy" className="h-11 px-5"><Link to="/app/send">New delivery</Link></Button>
          <Button variant="soft" className="h-11 px-4" disabled><Upload />Import CSV</Button>
        </div>
        <img src={VEHICLE_ART.cargo} alt="" className="absolute -right-4 top-2 h-28 w-28 object-contain" />
      </Card>
      <section>
        <h2 className="mb-3 font-display text-lg font-extrabold">Active shipments</h2>
        <div className="space-y-3">{active.length ? active.map((o) => <OrderCard key={o.id} o={o} />) : <Card className="p-5 text-center text-sm text-muted-foreground">No shipments on the move.</Card>}</div>
      </section>
    </div>
  );
}
