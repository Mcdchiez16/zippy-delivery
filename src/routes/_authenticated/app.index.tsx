import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Package, MapPin, ListChecks, Tag, MapPinned, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, ProgressBar, EmptyState } from "@/components/zippy/ui";
import { OrderCard } from "@/components/zippy/order-card";
import { VEHICLE_ART, VEHICLE_FALLBACK } from "@/components/zippy/vehicle-art";
import { firstName, useAccount } from "@/hooks/use-account";
import { myOrdersQuery } from "@/hooks/use-orders";
import { ACTIVE_STATUSES, type OrderStatus } from "@/lib/lifecycle";
import box from "@/assets/box-hero.png";
import type { VehicleCode } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Home — Zippy" }, { name: "description", content: "Your Zippy deliveries at a glance." }] }),
  component: CustomerHome,
});

function CustomerHome() {
  const { data: acc } = useAccount();
  const { data: orders = [] } = useQuery({ ...myOrdersQuery(acc?.user.id ?? ""), enabled: !!acc });
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status as OrderStatus));
  const recent = orders.filter((o) => o.status === "delivered").slice(0, 3);
  const points = orders.filter((o) => o.status === "delivered").length * 20;
  const goal = 200;

  return (
    <div className="space-y-6 px-5 pt-6">
      <header className="flex items-start justify-between">
        <div>
          <Link to="/app/business" className="mb-2 inline-flex rounded-full bg-muted p-1 text-xs font-bold"><span className="rounded-full bg-card px-3 py-1 shadow-card">Personal</span><span className="px-3 py-1 text-muted-foreground">Business</span></Link>
          <h1 className="text-2xl font-extrabold">Hey {firstName(acc)}! 👋</h1>
          <p className="text-muted-foreground">Where are we delivering today?</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary-deep"><MapPinned className="h-3.5 w-3.5" />{acc?.profile?.city ?? "Lusaka"}</p>
        </div>
        <Link to="/app/notifications" aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-2xl bg-card shadow-card">
          <Bell className="h-5 w-5" />
          {active.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-[10px] font-extrabold text-destructive-foreground">{active.length}</span>}
        </Link>
      </header>

      <section className="relative overflow-hidden rounded-3xl bg-hero p-5 text-primary-foreground shadow-float">
        <div className="max-w-[60%]">
          <h2 className="text-2xl font-extrabold leading-tight">Let's get it moving!</h2>
          <p className="mt-1 text-sm font-semibold opacity-90">Your next delivery is just a few taps away.</p>
          <Button asChild variant="sun" className="mt-4 h-11 px-5"><Link to="/app/send">Send a Package</Link></Button>
        </div>
        <img src={box} alt="" className="absolute -bottom-3 -right-3 h-40 w-40 animate-float object-contain" />
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-extrabold">Quick actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { to: "/app/send" as const, label: "Send", icon: Package, tone: "bg-secondary text-secondary-foreground" },
            { to: "/app/track" as const, label: "Track", icon: MapPin, tone: "bg-sky/15 text-sky" },
            { to: "/app/orders" as const, label: "Orders", icon: ListChecks, tone: "bg-sun/25 text-sun-foreground" },
            { to: "/app/send" as const, label: "Prices", icon: Tag, tone: "bg-muted text-foreground" },
          ].map((q) => (
            <Link key={q.label} to={q.to} className="flex flex-col items-center gap-1.5 rounded-3xl bg-card p-3 shadow-card transition active:scale-95">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${q.tone}`}><q.icon className="h-5 w-5" /></span>
              <span className="text-xs font-bold">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-extrabold">Choose your ride</h3>
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
          {(Object.keys(VEHICLE_ART) as VehicleCode[]).map((v) => (
            <Link key={v} to="/app/send" className="w-36 shrink-0 snap-start rounded-3xl bg-card p-3 shadow-card transition active:scale-95">
              <img src={VEHICLE_ART[v]} alt="" className="mx-auto h-20 w-20 object-contain" loading="lazy" />
              <div className="mt-1 font-display font-extrabold">{VEHICLE_FALLBACK[v].name}</div>
              <div className="text-xs text-muted-foreground">{VEHICLE_FALLBACK[v].fit}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-extrabold">Active deliveries</h3>
        {active.length ? <div className="space-y-3">{active.map((o) => <OrderCard key={o.id} o={o} />)}</div> : (
          <Card><EmptyState art={box} title="Nothing on the move" body="Your active deliveries will show up here." /></Card>
        )}
      </section>

      {recent.length > 0 && (
        <section>
          <h3 className="mb-3 font-display text-lg font-extrabold">Recent deliveries</h3>
          <div className="space-y-3">{recent.map((o) => <OrderCard key={o.id} o={o} />)}</div>
        </section>
      )}

      <Card className="bg-sun/20 p-5">
        <div className="flex items-center gap-2 font-display font-extrabold"><Sparkles className="h-5 w-5 text-sun-foreground" />Every delivery gets you closer to a reward!</div>
        <div className="mt-3 flex items-center justify-between text-sm font-bold"><span>{points} Zippy Points</span><span className="text-muted-foreground">{goal}</span></div>
        <div className="mt-2"><ProgressBar value={(points / goal) * 100} tone="sun" /></div>
      </Card>
    </div>
  );
}
