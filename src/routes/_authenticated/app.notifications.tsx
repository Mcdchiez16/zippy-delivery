import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bell } from "lucide-react";
import { Card, EmptyState } from "@/components/zippy/ui";
import { useAccount } from "@/hooks/use-account";
import { myOrdersQuery } from "@/hooks/use-orders";
import { STATUS_LABEL, type OrderStatus } from "@/lib/lifecycle";
import box from "@/assets/box-hero.png";

export const Route = createFileRoute("/_authenticated/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Zippy" }, { name: "description", content: "Your delivery updates." }] }),
  component: Notifications,
});

const MSG: Partial<Record<OrderStatus, string>> = {
  assigned: "Your driver has been assigned! 🚴",
  picked_up: "Your package has been picked up!",
  in_transit: "Good news! Your delivery is on its way.",
  delivered: "Delivered successfully! 🎉 You earned 20 Zippy Points.",
  cancelled: "Your delivery was cancelled.",
  searching: "We're finding your delivery hero…",
};

function Notifications() {
  const { data: acc } = useAccount();
  const { data = [] } = useQuery({ ...myOrdersQuery(acc?.user.id ?? ""), enabled: !!acc });
  return (
    <div className="space-y-3 px-5 pt-6">
      <div className="flex items-center gap-3">
        <Link to="/app" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-card"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-extrabold">Notifications</h1>
      </div>
      {data.length ? data.slice(0, 30).map((o) => (
        <Link key={o.id} to="/app/order/$id" params={{ id: o.id }}>
          <Card className="mb-3 flex gap-3 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Bell className="h-5 w-5" /></span>
            <div className="min-w-0"><div className="font-bold">{MSG[o.status as OrderStatus] ?? STATUS_LABEL[o.status as OrderStatus]}</div><div className="truncate text-xs text-muted-foreground">#{o.tracking_code} · {new Date(o.updated_at).toLocaleString()}</div></div>
          </Card>
        </Link>
      )) : <EmptyState art={box} title="All caught up" body="Delivery updates will land here." />}
    </div>
  );
}
