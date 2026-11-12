import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Camera, AlertTriangle, PenLine, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CourierLoader, Field, inputCls } from "@/components/zippy/ui";
import { orderDetailQuery } from "@/hooks/use-orders";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/lifecycle";

export const Route = createFileRoute("/_authenticated/driver/job/$id")({
  head: () => ({ meta: [{ title: "Confirm — Zippy Driver" }, { name: "description", content: "Pickup and delivery confirmation." }] }),
  component: JobConfirm,
});

function JobConfirm() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(orderDetailQuery(id));
  const [photo, setPhoto] = useState<string | null>(null);
  const [count, setCount] = useState(false);
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [signed, setSigned] = useState(false);
  const [damage, setDamage] = useState(false);
  const [busy, setBusy] = useState(false);
  if (isLoading || !data?.order) return <CourierLoader />;
  const o = data.order;
  const st = o.status as OrderStatus;
  const isPickup = st === "arriving_pickup";
  const isDeliver = st === "in_transit";
  const pkg = data.packages[0];
  const stop = data.stops.find((s) => s.kind === (isPickup ? "pickup" : "dropoff"));

  if (!isPickup && !isDeliver) {
    return <div className="p-8 text-center"><p className="font-bold">Nothing to confirm right now.</p><Link to="/driver" className="mt-2 inline-block font-bold text-primary">Back home</Link></div>;
  }
  const ready = isPickup ? photo && count : photo && (signed || code.length >= 4);

  async function submit(to: OrderStatus, note?: string) {
    setBusy(true);
    const { error } = await supabase.rpc("advance_order", { _order_id: id, _to: to, ...(note ? { _note: note } : {}) });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    if (to === "delivered") toast.success(`Delivered! ${money(o.driver_earnings_minor, o.currency)} added 🎉`);
    else if (to === "picked_up") toast.success("Package collected. Start the delivery when ready.");
    qc.invalidateQueries({ queryKey: ["orders"] });
    navigate({ to: "/driver" });
  }

  return (
    <div className="space-y-4 px-5 pt-6">
      <div className="flex items-center gap-3">
        <Link to="/driver" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-card"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-extrabold">{isPickup ? "Pickup verification" : "Delivery confirmation"}</h1>
      </div>
      <Card className="p-4 text-sm">
        <div className="font-bold">{stop?.address}</div>
        <div className="text-muted-foreground">{stop?.contact_name} · {stop?.contact_phone}</div>
        {pkg && <div className="mt-2 rounded-2xl bg-muted p-3"><b>{pkg.category}</b> · {pkg.description} · {pkg.quantity} item(s){pkg.fragile ? " · ⚠️ Fragile" : ""}</div>}
      </Card>

      <label className={cn("flex cursor-pointer items-center gap-3 rounded-3xl border-2 border-dashed p-4", photo ? "border-primary bg-secondary" : "border-border")}>
        <Camera className="h-6 w-6 text-primary" />
        <span className="flex-1 font-bold">{isPickup ? "Photo of the package" : "Photo at drop-off"}</span>
        {photo ? <img src={photo} alt="Captured" className="h-12 w-12 rounded-xl object-cover" /> : <span className="text-xs text-muted-foreground">Required</span>}
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
      </label>

      {isPickup ? (
        <>
          <label className="flex items-center justify-between rounded-2xl border-2 border-border bg-card px-4 py-3 font-bold">
            I counted {pkg?.quantity ?? 1} item(s)
            <input type="checkbox" className="h-6 w-6 accent-[var(--color-primary)]" checked={count} onChange={(e) => setCount(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-2xl border-2 border-border bg-card px-4 py-3 font-bold">
            <span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Report damage</span>
            <input type="checkbox" className="h-6 w-6" checked={damage} onChange={(e) => setDamage(e.target.checked)} />
          </label>
          {damage && <Field label="Describe the damage"><input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>}
        </>
      ) : (
        <>
          <Field label="Recipient code" hint="Ask the recipient for their 4-digit code, or collect a signature."><div className="relative"><KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input inputMode="numeric" maxLength={6} className={cn(inputCls, "pl-10 tracking-[0.4em]")} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /></div></Field>
          <button type="button" onClick={() => setSigned(!signed)} className={cn("flex h-28 w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed font-bold", signed ? "border-primary bg-secondary text-primary" : "border-border text-muted-foreground")}>
            <PenLine className="h-5 w-5" />{signed ? "Signature captured ✓" : "Tap to collect signature"}
          </button>
          <Field label="Completion notes (optional)"><input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        </>
      )}

      <Button variant="zippy" size="xl" className="w-full" disabled={!ready || busy} onClick={() => submit(isPickup ? "picked_up" : "delivered", notes || undefined)}>
        {busy ? "Saving…" : isPickup ? "Confirm Pickup" : "Complete Delivery"}
      </Button>
      {isPickup && <Button variant="soft" className="h-12 w-full" disabled={busy} onClick={() => toast("Contact support to report a failed pickup.")}>Can't collect this package</Button>}
      {isDeliver && <Button variant="soft" className="h-12 w-full" disabled={busy} onClick={() => toast("Recipient unreachable? Contact support to arrange a return.")}>Recipient unreachable</Button>}
    </div>
  );
}
