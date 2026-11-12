import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Flag, MapPin, Package } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui";
import { money } from "@/lib/format";

export function RequestCard({ o }: { o: Tables<"delivery_orders"> }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  async function accept() {
    setBusy(true);
    const { error } = await supabase.rpc("accept_order", { _order_id: o.id });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Delivery accepted! Head to pickup.");
    qc.invalidateQueries({ queryKey: ["orders"] });
  }
  return (
    <Card className="p-4 animate-bounce-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-muted-foreground">You earn</div>
          <div className="font-display text-2xl font-extrabold text-primary">{money(o.driver_earnings_minor, o.currency)}</div>
        </div>
        <div className="text-right text-xs font-semibold text-muted-foreground">
          <div>{Number(o.distance_km)} km trip</div><div>~{o.duration_min} min</div>
          {o.scheduled_for && <div className="text-sun">Pickup {new Date(o.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{o.pickup_summary}</span></div>
        <div className="flex gap-2"><Flag className="h-4 w-4 shrink-0 text-sky" /><span className="truncate">{o.dropoff_summary}</span></div>
        <div className="flex gap-2 text-muted-foreground"><Package className="h-4 w-4 shrink-0" />Needs a {o.vehicle_type}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="soft" className="h-12" onClick={() => setHidden(true)}>Decline</Button>
        <Button variant="zippy" className="h-12" disabled={busy} onClick={accept}>{busy ? "…" : "Accept"}</Button>
      </div>
    </Card>
  );
}
