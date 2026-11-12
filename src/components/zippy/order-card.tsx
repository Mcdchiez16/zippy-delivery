import { Link } from "@tanstack/react-router";
import { Package, ChevronRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Card, ProgressBar, StatusChip } from "./ui";
import { progressOf, type OrderStatus } from "@/lib/lifecycle";
import { money } from "@/lib/format";

export function OrderCard({ o }: { o: Tables<"delivery_orders"> }) {
  const st = o.status as OrderStatus;
  return (
    <Link to="/app/order/$id" params={{ id: o.id }} className="block">
      <Card className="p-4 transition active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Package className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-muted-foreground">#{o.tracking_code}</div>
            <div className="truncate font-bold">{o.dropoff_summary}</div>
          </div>
          <StatusChip status={st} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">From {o.pickup_summary}</span>
          <span className="font-bold text-foreground">{money(o.total_minor, o.currency)}</span>
        </div>
        {st !== "delivered" && st !== "cancelled" && <div className="mt-3"><ProgressBar value={progressOf(st)} /></div>}
        <div className="mt-2 flex items-center justify-end text-xs font-bold text-primary-deep">View <ChevronRight className="h-4 w-4" /></div>
      </Card>
    </Link>
  );
}
