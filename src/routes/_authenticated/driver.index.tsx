import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Target, TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CourierLoader, ProgressBar, EmptyState } from "@/components/zippy/ui";
import { DriverRegister } from "@/components/zippy/driver-register";
import { RequestCard } from "@/components/zippy/job-card";
import { ActiveJob } from "@/components/zippy/active-job";
import { firstName, useAccount } from "@/hooks/use-account";
import { driverJobsQuery } from "@/hooks/use-driver";
import { ACTIVE_STATUSES, type OrderStatus } from "@/lib/lifecycle";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { VEHICLE_ART } from "@/components/zippy/vehicle-art";
import type { VehicleCode } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/driver/")({
  head: () => ({ meta: [{ title: "Driver — Zippy" }, { name: "description", content: "Your Zippy driver dashboard." }] }),
  component: DriverHome,
});

const DAILY_GOAL = 5;

function DriverHome() {
  const { data: acc, isLoading } = useAccount();
  if (isLoading || !acc) return <CourierLoader />;
  const d = acc.driver;
  if (!d || d.status === "rejected") {
    return (
      <>
        {d?.status === "rejected" && <div className="mx-5 mt-5 rounded-2xl bg-destructive/15 p-4 text-sm font-semibold text-destructive">Your last application wasn't approved{d.rejection_reason ? `: ${d.rejection_reason}` : "."} You can update and resubmit.</div>}
        <DriverRegister userId={acc.user.id} defaultName={acc.profile?.full_name ?? ""} />
      </>
    );
  }
  if (d.status === "pending" || d.status === "suspended") {
    const pending = d.status === "pending";
    return (
      <div className="px-5 pt-10 text-center">
        <img src={VEHICLE_ART[d.vehicle_type as VehicleCode]} alt="" className="mx-auto h-40 w-40 animate-float object-contain" />
        <h1 className="mt-4 text-2xl font-extrabold">{pending ? "Verification in progress" : "Account suspended"}</h1>
        <p className="mt-2 text-muted-foreground">{pending ? "We're reviewing your documents. You'll be able to go online as soon as you're approved." : "Please contact Zippy support to restore access."}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sun/20 px-4 py-2 text-sm font-bold text-sun">{pending ? <Clock className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}{pending ? "Pending verification" : "Suspended"}</div>
        <div className="mt-8"><Link to="/app" className="text-sm font-bold text-primary">Switch to sending packages</Link></div>
      </div>
    );
  }
  return <ApprovedHome name={firstName(acc)} uid={acc.user.id} online={d.is_online} rating={Number(d.rating)} />;
}

function ApprovedHome({ name, uid, online, rating }: { name: string; uid: string; online: boolean; rating: number }) {
  const qc = useQueryClient();
  const { data } = useQuery(driverJobsQuery(uid));
  const [busy, setBusy] = useState(false);
  const mine = data?.mine ?? [];
  const today = new Date().toDateString();
  const doneToday = mine.filter((o) => o.status === "delivered" && new Date(o.updated_at).toDateString() === today);
  const earnedToday = doneToday.reduce((s, o) => s + o.driver_earnings_minor, 0);
  const assignedTotal = mine.length;
  const completed = mine.filter((o) => o.status === "delivered").length;
  const active = mine.find((o) => ACTIVE_STATUSES.includes(o.status as OrderStatus));
  const left = Math.max(0, DAILY_GOAL - doneToday.length);

  async function toggle() {
    setBusy(true);
    const go = async (lat?: number, lng?: number) => {
      const { error } = await supabase.rpc("set_driver_online", { _online: !online, _lat: lat, _lng: lng });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast(online ? "You're offline. Rest up!" : "You're online. Let's find your next delivery!");
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    };
    if (!online && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => go(p.coords.latitude, p.coords.longitude), () => go(), { timeout: 6000 });
    } else go();
  }

  return (
    <div className="space-y-5 px-5 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Ready to roll, {name}? 🚀</h1>
          <p className="text-sm text-muted-foreground">{online ? "You're online. Let's find your next delivery!" : "Go online to start receiving requests."}</p>
        </div>
      </header>

      <button onClick={toggle} disabled={busy} role="switch" aria-checked={online} className={cn("tactile flex w-full items-center justify-between rounded-full px-6 py-4 font-display text-lg font-extrabold", online ? "bg-primary text-primary-foreground" : "bg-muted text-foreground [--tactile-shadow:oklch(0.15_0.02_155)]")}>
        {online ? "Online" : "Go Online"}
        <span className={cn("relative h-8 w-14 rounded-full transition", online ? "bg-primary-deep" : "bg-card")}>
          <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-foreground transition-all", online ? "left-7 bg-primary-foreground" : "left-1")} />
        </span>
      </button>

      <div className="rounded-3xl bg-hero p-5 text-primary-foreground shadow-float">
        <div className="text-sm font-bold opacity-90">Today's Earnings</div>
        <div className="mt-1 font-display text-4xl font-extrabold">{money(earnedToday)}</div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <div className="rounded-2xl bg-ink/20 p-2"><CheckCircle2 className="mx-auto mb-1 h-4 w-4" />{doneToday.length} done</div>
          <div className="rounded-2xl bg-ink/20 p-2"><TrendingUp className="mx-auto mb-1 h-4 w-4" />{assignedTotal ? Math.round((completed / assignedTotal) * 100) : 100}% completion</div>
          <div className="rounded-2xl bg-ink/20 p-2"><Star className="mx-auto mb-1 h-4 w-4" />{rating.toFixed(1)} rating</div>
        </div>
      </div>

      {active && <ActiveJob o={active} />}

      <Card className="p-4">
        <div className="flex items-center gap-2 font-display font-extrabold"><Target className="h-5 w-5 text-sun" />{left ? `${left} more deliveries to reach today's goal!` : "Daily goal reached — great work! 🎉"}</div>
        <div className="mt-3"><ProgressBar value={(doneToday.length / DAILY_GOAL) * 100} tone="sun" /></div>
        <p className="mt-2 text-xs text-muted-foreground">Goals reward great service — never speed. Take breaks when you need them.</p>
      </Card>

      {!active && online && (
        <section>
          <h2 className="mb-3 font-display text-lg font-extrabold">Incoming requests</h2>
          {data?.open.length ? <div className="space-y-3">{data.open.map((o) => <RequestCard key={o.id} o={o} />)}</div> : (
            <Card><EmptyState art={VEHICLE_ART.motorbike} title="Waiting for requests…" body="New deliveries that match your vehicle will appear here instantly." /></Card>
          )}
        </section>
      )}
    </div>
  );
}
