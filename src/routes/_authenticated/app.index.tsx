import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronRight, MapPin, ListChecks, Wallet, Store, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/zippy/ui";
import { firstName, useAccount } from "@/hooks/use-account";
import { myOrdersQuery } from "@/hooks/use-orders";
import { ACTIVE_STATUSES, type OrderStatus } from "@/lib/lifecycle";
import box from "@/assets/box-hero.png";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Home — Zippy" }, { name: "description", content: "Send a package in Lusaka — Zippy." }] }),
  component: CustomerHome,
});

const ROWS = [
  { to: "/app/track" as const, label: "Track a delivery", icon: MapPin },
  { to: "/app/orders" as const, label: "My orders", icon: ListChecks },
  { to: "/app/wallet" as const, label: "Wallet & points", icon: Wallet },
  { to: "/app/business" as const, label: "Business profile", icon: Store },
];

function CustomerHome() {
  const { data: acc } = useAccount();
  const { data: orders = [] } = useQuery({ ...myOrdersQuery(acc?.user.id ?? ""), enabled: !!acc });
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status as OrderStatus));
  const points = orders.filter((o) => o.status === "delivered").length * 20;

  return (
    <div className="px-6 pt-8">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">{acc?.profile?.city ?? "Lusaka"}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-none">Hey {firstName(acc)} 👋</h1>
        </div>
        <Link to="/app/notifications" aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-card">
          <Bell className="h-5 w-5" />
          {active.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-[10px] font-extrabold text-destructive-foreground">{active.length}</span>}
        </Link>
      </header>

      <section className="relative mt-9 overflow-hidden rounded-[2rem] bg-ink p-6 text-ink-foreground shadow-float">
        <img src={box} alt="" aria-hidden className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 object-contain" />
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] opacity-50">New delivery</p>
        <h2 className="mt-3 max-w-[13ch] font-display text-3xl font-extrabold leading-[1.08]">Send a package.</h2>
        <p className="mt-3 max-w-[24ch] text-sm font-semibold opacity-70">Pickup, drop-off, done. Anything, anywhere in town.</p>
        <Button asChild variant="sun" className="mt-7 h-12 w-full max-w-[230px] px-6">
          <Link to="/app/send">Send a Package</Link>
        </Button>
      </section>

      {active.length > 0 && (
        <section className="mt-9">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">On the way</h3>
            <Link to="/app/orders" className="text-xs font-bold text-primary-deep">See all</Link>
          </div>
          <div className="mt-3 space-y-3">
            {active.slice(0, 2).map((o) => (
              <Link key={o.id} to="/app/order/$id" params={{ id: o.id }} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition active:scale-[0.98]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Package className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{o.dropoff_summary}</span>
                  <span className="block text-xs text-muted-foreground">#{o.tracking_code}</span>
                </span>
                <StatusChip status={o.status as OrderStatus} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav className="mt-9 overflow-hidden rounded-3xl border border-border bg-card">
        {ROWS.map((r, i) => (
          <Link key={r.label} to={r.to} className={`flex items-center gap-3 px-4 py-4 transition active:bg-muted ${i > 0 ? "border-t border-border" : ""}`}>
            <r.icon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 font-bold">{r.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </nav>

      <p className="mt-7 text-center text-xs font-bold text-muted-foreground">{points} Zippy Points</p>
    </div>
  );
}
