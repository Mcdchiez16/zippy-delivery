import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, Check, Flag, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, Confetti, CourierLoader, StatusChip } from "@/components/zippy/ui";
import { VEHICLE_ART } from "@/components/zippy/vehicle-art";
import { orderDetailQuery } from "@/hooks/use-orders";
import { STATUS_LABEL, TIMELINE, type OrderStatus } from "@/lib/lifecycle";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VehicleCode } from "@/lib/pricing";
import success from "@/assets/success-delivery.png";
import { TrackingMap } from "@/components/zippy/tracking-map";
import { Share2, LifeBuoy, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/order/$id")({
  head: () => ({ meta: [{ title: "Delivery — Zippy" }, { name: "description", content: "Track your Zippy delivery." }] }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(orderDetailQuery(id));
  const order = data?.order;
  const { data: driver } = useQuery({
    queryKey: ["orders", "driver", id, order?.driver_id],
    enabled: !!order?.driver_id,
    queryFn: async () => (await supabase.rpc("order_driver_info", { _order_id: id })).data?.[0] ?? null,
  });
  const [cancelling, setCancelling] = useState(false);

  if (isLoading) return <CourierLoader />;
  if (!order) return <div className="p-8 text-center"><p className="font-bold">We couldn't find this delivery.</p><Link to="/app/orders" className="mt-3 inline-block font-bold text-primary-deep">Back to activity</Link></div>;

  const st = order.status as OrderStatus;
  const pickup = data.stops.find((s) => s.kind === "pickup");
  const drop = data.stops.find((s) => s.kind === "dropoff");
  const pkg = data.packages[0];
  const reached = (s: OrderStatus) => data.events.some((e) => e.to_status === s);

  async function cancel() {
    setCancelling(true);
    const { error } = await supabase.rpc("advance_order", { _order_id: id, _to: "cancelled", _note: "Cancelled by customer" });
    setCancelling(false);
    if (error) { toast.error(error.message); return; }
    toast("Delivery cancelled");
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  return (
    <div className="px-5 pt-5 space-y-4">
      <Confetti fire={st === "delivered"} />
      <div className="flex items-center gap-3">
        <Link to="/app/orders" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-card"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex-1"><div className="text-xs font-bold text-muted-foreground">Tracking ID</div><div className="font-display font-extrabold">#{order.tracking_code}</div></div>
        <StatusChip status={st} />
      </div>

      {st === "searching" && (
        <Card className="overflow-hidden p-6 text-center">
          <div className="relative mx-auto grid h-40 w-40 place-items-center">
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
            <span className="absolute inset-6 rounded-full bg-primary/30 animate-pulse-ring [animation-delay:600ms]" />
            <img src={VEHICLE_ART[order.vehicle_type as VehicleCode]} alt="" className="relative h-28 w-28 animate-float object-contain" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold">Finding your delivery hero…</h2>
          <p className="mt-1 text-sm text-muted-foreground">We're asking nearby {order.vehicle_type} couriers. This usually takes a few minutes.</p>
          <Button variant="soft" className="mt-5 h-11 px-6" disabled={cancelling} onClick={cancel}>Cancel request</Button>
        </Card>
      )}

      {st === "delivered" && (
        <Card className="p-6 text-center">
          <img src={success} alt="" className="mx-auto h-40 w-40 animate-pop object-contain" />
          <h2 className="mt-2 text-2xl font-extrabold">Delivered! 🎉</h2>
          <p className="text-muted-foreground">Your package made it safely.</p>
          <p className="mt-2 text-sm font-bold text-sun-foreground">+20 Zippy Points</p>
          <Button asChild variant="zippy" className="mt-4 h-12 px-6"><Link to="/app/send">Book another delivery</Link></Button>
        </Card>
      )}

      {!["searching", "delivered", "cancelled"].includes(st) && (
        <>
          <TrackingMap status={st} art={VEHICLE_ART[order.vehicle_type as VehicleCode]} />
          <div className="rounded-2xl bg-sky/15 p-3 text-center text-sm font-bold text-sky">
            {st === "assigned" ? "Your driver is on the way! 🚴" : st === "arriving_pickup" ? "Driver arriving at pickup" : st === "picked_up" ? "Your package has been picked up!" : "Good news! Your delivery is on its way."} · ETA ~{order.duration_min} min
          </div>
        </>
      )}

      {driver && st !== "searching" && (
        <Card className="flex items-center gap-3 p-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary font-display text-xl font-extrabold text-secondary-foreground">{driver.full_name.charAt(0)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-1 font-display font-extrabold">{driver.full_name}<BadgeCheck className="h-4 w-4 text-sky" /></div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="h-3.5 w-3.5 fill-sun text-sun" />{Number(driver.rating).toFixed(1)} · {driver.vehicle_type}{driver.registration ? ` · ${driver.registration}` : ""}</div>
          </div>
          <img src={VEHICLE_ART[driver.vehicle_type as VehicleCode]} alt="" className="h-12 w-12 object-contain" />
        </Card>
      )}
      {driver && st !== "searching" && st !== "cancelled" && (
        <div className="grid grid-cols-3 gap-2">
          <Button variant="soft" className="h-11" onClick={() => toast("In-app chat arrives soon.")}><MessageCircle />Chat</Button>
          <Button variant="soft" className="h-11" onClick={() => { navigator.clipboard?.writeText(`Track my Zippy delivery: #${order.tracking_code}`); toast.success("Tracking ID copied"); }}><Share2 />Share</Button>
          <Button variant="soft" className="h-11" onClick={() => toast("Support chat arrives soon.")}><LifeBuoy />Help</Button>
        </div>
      )}
      {st === "delivered" && <RateDriver />}

      {st !== "cancelled" && (
        <Card className="p-4">
          <h3 className="mb-3 font-display font-extrabold">Delivery timeline</h3>
          <ol className="space-y-3">
            {TIMELINE.map((s) => {
              const done = reached(s);
              const current = s === st;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span className={cn("grid h-7 w-7 place-items-center rounded-full border-2 transition", done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card", current && "animate-bounce-in")}>
                    {done && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                  <span className={cn("text-sm", done ? "font-bold" : "text-muted-foreground")}>{s === "searching" ? "Order confirmed" : STATUS_LABEL[s]}</span>
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><div className="text-xs font-bold text-muted-foreground">PICKUP</div><div className="font-bold">{pickup?.address}</div></div></div>
        <div className="my-1 ml-2.5 h-5 border-l-2 border-dashed border-border" />
        <div className="flex gap-3"><Flag className="mt-0.5 h-5 w-5 shrink-0 text-sky" /><div><div className="text-xs font-bold text-muted-foreground">DROP-OFF</div><div className="font-bold">{drop?.address}</div><div className="text-sm text-muted-foreground">{drop?.contact_name}</div></div></div>
      </Card>

      {pkg && (
        <Card className="p-4 text-sm">
          <div className="font-display font-extrabold">{pkg.category}</div>
          <div className="text-muted-foreground">{pkg.description} · {pkg.quantity} × {pkg.weight_kg} kg{pkg.fragile ? " · Fragile" : ""}</div>
        </Card>
      )}

      {data.quote && (
        <Card className="p-4">
          {(data.quote.breakdown as { label: string; amount_minor: number }[]).map((l) => (
            <div key={l.label} className="flex justify-between py-0.5 text-sm"><span>{l.label}</span><span>{money(l.amount_minor, data.quote!.currency)}</span></div>
          ))}
          <div className="mt-2 flex justify-between border-t border-border pt-2 font-display font-extrabold"><span>Total</span><span>{money(order.total_minor, order.currency)}</span></div>
        </Card>
      )}
    </div>
  );
}

function RateDriver() {
  const [stars, setStars] = useState(0);
  const [sent, setSent] = useState(false);
  if (sent) return <Card className="p-4 text-center font-bold">Thanks for your feedback! 💚</Card>;
  return (
    <Card className="p-4 text-center">
      <div className="font-display font-extrabold">How was your driver?</div>
      <div className="mt-2 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} aria-label={`${n} stars`} onClick={() => setStars(n)}><Star className={cn("h-9 w-9 transition", n <= stars ? "fill-sun text-sun scale-110" : "text-border")} /></button>
        ))}
      </div>
      <Button variant="zippy" className="mt-3 h-11 px-6" disabled={!stars} onClick={() => setSent(true)}>Submit rating</Button>
    </Card>
  );
}
