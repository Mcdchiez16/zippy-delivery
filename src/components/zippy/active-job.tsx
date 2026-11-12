import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Flag, MapPin, Navigation, Phone } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Card, ProgressBar, StatusChip } from "./ui";
import { orderDetailQuery } from "@/hooks/use-orders";
import { DRIVER_NEXT, progressOf, type OrderStatus } from "@/lib/lifecycle";
import { money } from "@/lib/format";

export function ActiveJob({ o }: { o: Tables<"delivery_orders"> }) {
  const qc = useQueryClient();
  const { data } = useQuery(orderDetailQuery(o.id));
  const [busy, setBusy] = useState(false);
  const st = o.status as OrderStatus;
  const next = DRIVER_NEXT[st];
  const pickup = data?.stops.find((s) => s.kind === "pickup");
  const drop = data?.stops.find((s) => s.kind === "dropoff");
  const target = st === "assigned" || st === "arriving_pickup" ? pickup : drop;
  const pkg = data?.packages[0];

  async function advance() {
    if (!next) return;
    setBusy(true);
    const { error } = await supabase.rpc("advance_order", { _order_id: o.id, _to: next.to });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (next.to === "delivered") toast.success(`Delivered! ${money(o.driver_earnings_minor, o.currency)} added to your earnings 🎉`);
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  return (
    <Card className="overflow-hidden border-primary/40">
      <div className="bg-hero p-4 text-primary-foreground">
        <div className="flex items-center justify-between"><span className="font-display font-extrabold">Active delivery</span><StatusChip status={st} /></div>
        <div className="mt-3"><ProgressBar value={progressOf(st)} tone="sun" /></div>
      </div>
      <div className="space-y-3 p-4 text-sm">
        <div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" /><div><div className="font-bold">{pickup?.address ?? o.pickup_summary}</div>{pickup && <div className="text-muted-foreground">{pickup.contact_name} · {pickup.instructions || "No notes"}</div>}</div></div>
        <div className="flex gap-2"><Flag className="h-4 w-4 shrink-0 text-sky" /><div><div className="font-bold">{drop?.address ?? o.dropoff_summary}</div>{drop && <div className="text-muted-foreground">{drop.contact_name} · {drop.instructions || "No notes"}</div>}</div></div>
        {pkg && <div className="rounded-2xl bg-muted p-3"><span className="font-bold">{pkg.category}</span> · {pkg.description} · {pkg.quantity}× {pkg.weight_kg} kg{pkg.fragile ? " · ⚠️ Fragile" : ""}{pkg.instructions ? ` · ${pkg.instructions}` : ""}</div>}
        <div className="grid grid-cols-2 gap-3">
          {target && (
            <Button asChild variant="soft" className="h-11">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}`} target="_blank" rel="noreferrer"><Navigation />Navigate</a>
            </Button>
          )}
          {target && <Button asChild variant="soft" className="h-11"><a href={`tel:${target.contact_phone}`}><Phone />Call</a></Button>}
        </div>
        {st === "arriving_pickup" || st === "in_transit" ? (
          <Button asChild variant="zippy" size="xl" className="w-full"><Link to="/driver/job/$id" params={{ id: o.id }}>{st === "arriving_pickup" ? "Arrived at Pickup" : "Arrived at Destination"}</Link></Button>
        ) : next && <Button variant="zippy" size="xl" className="w-full" disabled={busy} onClick={advance}>{busy ? "Updating…" : next.label}</Button>}
      </div>
    </Card>
  );
}
