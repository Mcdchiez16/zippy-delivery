import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, CourierLoader, inputCls } from "@/components/zippy/ui";
import { OrderCard } from "@/components/zippy/order-card";
import { useAccount } from "@/hooks/use-account";
import { myOrdersQuery } from "@/hooks/use-orders";
import { ACTIVE_STATUSES, type OrderStatus } from "@/lib/lifecycle";
import { cn } from "@/lib/utils";
import box from "@/assets/box-hero.png";

export const Route = createFileRoute("/_authenticated/app/orders")({
  head: () => ({ meta: [{ title: "Activity — Zippy" }, { name: "description", content: "Your delivery history." }] }),
  component: Orders,
});

const TABS = ["Active", "Scheduled", "Completed", "Cancelled"] as const;

function Orders() {
  const { data: acc } = useAccount();
  const { data = [], isLoading } = useQuery({ ...myOrdersQuery(acc?.user.id ?? ""), enabled: !!acc });
  const [tab, setTab] = useState<(typeof TABS)[number]>("Active");
  const [q, setQ] = useState("");
  const now = Date.now();
  const list = data.filter((o) => {
    const st = o.status as OrderStatus;
    const sched = !!o.scheduled_for && new Date(o.scheduled_for).getTime() > now && st === "searching";
    const inTab = tab === "Active" ? ACTIVE_STATUSES.includes(st) && !sched : tab === "Scheduled" ? sched : tab === "Completed" ? st === "delivered" : st === "cancelled";
    const s = q.trim().toLowerCase();
    return inTab && (!s || [o.tracking_code, o.pickup_summary, o.dropoff_summary].some((x) => x.toLowerCase().includes(s)));
  });
  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold">Activity</h1>
      <div className="relative mt-4">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input className={cn(inputCls, "pl-10")} placeholder="Search tracking ID or address" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-4 flex gap-1 rounded-full bg-muted p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-full py-2 text-xs font-bold transition", tab === t ? "bg-card shadow-card" : "text-muted-foreground")}>{t}</button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {isLoading ? <CourierLoader /> : list.length ? list.map((o) => <OrderCard key={o.id} o={o} />) : (
          <EmptyState art={box} title={`No ${tab.toLowerCase()} deliveries`} body="When you send something, it'll show up here." action={<Button asChild variant="zippy" className="h-11 px-6"><Link to="/app/send">Send a Package</Link></Button>} />
        )}
      </div>
    </div>
  );
}
