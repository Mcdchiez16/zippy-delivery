import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, LogOut, Package, Star } from "lucide-react";
import { Card } from "@/components/zippy/ui";
import { useAccount } from "@/hooks/use-account";
import { signOut } from "@/lib/sign-out";
import { VEHICLE_ART } from "@/components/zippy/vehicle-art";
import type { VehicleCode } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/driver/profile")({
  head: () => ({ meta: [{ title: "Profile — Zippy Driver" }, { name: "description", content: "Your courier profile." }] }),
  component: DriverProfile,
});

function DriverProfile() {
  const { data: acc } = useAccount();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const d = acc?.driver;
  return (
    <div className="space-y-4 px-5 pt-6">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-display text-2xl font-extrabold text-primary-foreground">{(d?.full_name ?? acc?.user.email ?? "?").charAt(0)}</div>
        <div>
          <h1 className="flex items-center gap-1 text-xl font-extrabold">{d?.full_name ?? "Courier"}{d?.status === "approved" && <BadgeCheck className="h-5 w-5 text-sky" />}</h1>
          <p className="text-sm capitalize text-muted-foreground">{d?.status ?? "Not registered"}{d ? ` · ${Number(d.rating).toFixed(1)}★` : ""}</p>
        </div>
      </div>
      {d && (
        <Card className="flex items-center gap-3 p-4">
          <img src={VEHICLE_ART[d.vehicle_type as VehicleCode]} alt="" className="h-14 w-14 object-contain" />
          <div className="text-sm"><div className="font-display font-extrabold capitalize">{d.vehicle_type}</div><div className="text-muted-foreground">Payout: {d.payout_method ?? "—"}</div></div>
          <Star className="ml-auto h-5 w-5 fill-sun text-sun" />
        </Card>
      )}
      <Card className="divide-y divide-border">
        <Link to="/app" className="flex items-center gap-3 p-4 font-bold"><Package className="h-5 w-5 text-primary" />Switch to sending packages</Link>
        <button onClick={() => signOut(qc, navigate)} className="flex w-full items-center gap-3 p-4 font-bold text-destructive"><LogOut className="h-5 w-5" />Log out</button>
      </Card>
    </div>
  );
}
