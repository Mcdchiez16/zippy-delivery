import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, inputCls } from "@/components/zippy/ui";
import { VEHICLE_ART } from "@/components/zippy/vehicle-art";
import type { VehicleCode } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/admin/pricing")({
  head: () => ({ meta: [{ title: "Pricing — Zippy Admin" }, { name: "description", content: "Configure vehicle limits and pricing." }] }),
  component: Pricing,
});

function Pricing() {
  const { data } = useQuery({
    queryKey: ["admin", "pricing"],
    queryFn: async () => {
      const [v, r] = await Promise.all([supabase.from("vehicle_types").select("*").order("sort"), supabase.from("pricing_rules").select("*")]);
      return { v: v.data ?? [], r: r.data ?? [] };
    },
  });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data?.v.map((v) => <VehicleEditor key={v.code} v={v} r={data.r.find((x) => x.vehicle_type === v.code)!} />)}
    </div>
  );
}

const num = (label: string, value: number, on: (n: number) => void, kwacha = false) => (
  <label className="block text-xs font-bold">{label}
    <input type="number" min={0} step={kwacha ? 0.01 : 1} className={inputCls + " mt-1 h-10"} value={kwacha ? value / 100 : value} onChange={(e) => on(kwacha ? Math.round(Number(e.target.value) * 100) : Number(e.target.value))} />
  </label>
);

function VehicleEditor({ v, r }: { v: Tables<"vehicle_types">; r: Tables<"pricing_rules"> }) {
  const qc = useQueryClient();
  const [vt, setVt] = useState(v);
  const [pr, setPr] = useState(r);
  useEffect(() => { setVt(v); setPr(r); }, [v, r]);
  async function save() {
    const a = await supabase.from("vehicle_types").update({ max_weight_kg: vt.max_weight_kg, max_length_cm: vt.max_length_cm, max_distance_km: vt.max_distance_km, allows_fragile: vt.allows_fragile, speed_kmh: vt.speed_kmh, active: vt.active }).eq("code", v.code);
    const b = await supabase.from("pricing_rules").update({ base_fare_minor: pr.base_fare_minor, per_km_minor: pr.per_km_minor, per_kg_minor: pr.per_kg_minor, fragile_fee_minor: pr.fragile_fee_minor, scheduled_fee_minor: pr.scheduled_fee_minor, min_fare_minor: pr.min_fare_minor }).eq("vehicle_type", v.code);
    if (a.error || b.error) { toast.error((a.error ?? b.error)!.message); return; }
    toast.success(`${v.name} updated`);
    qc.invalidateQueries({ queryKey: ["admin", "pricing"] });
    qc.invalidateQueries({ queryKey: ["pricing-config"] });
  }
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <img src={VEHICLE_ART[v.code as VehicleCode]} alt="" className="h-14 w-14 object-contain" />
        <div className="flex-1 font-display text-lg font-extrabold">{v.name}</div>
        <label className="flex items-center gap-2 text-sm font-bold">Active <input type="checkbox" checked={vt.active} onChange={(e) => setVt({ ...vt, active: e.target.checked })} /></label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {num("Max weight kg", Number(vt.max_weight_kg), (n) => setVt({ ...vt, max_weight_kg: n }))}
        {num("Max length cm", Number(vt.max_length_cm), (n) => setVt({ ...vt, max_length_cm: n }))}
        {num("Max distance km", Number(vt.max_distance_km), (n) => setVt({ ...vt, max_distance_km: n }))}
        {num("Base fare K", pr.base_fare_minor, (n) => setPr({ ...pr, base_fare_minor: n }), true)}
        {num("Per km K", pr.per_km_minor, (n) => setPr({ ...pr, per_km_minor: n }), true)}
        {num("Per kg K", pr.per_kg_minor, (n) => setPr({ ...pr, per_kg_minor: n }), true)}
        {num("Fragile fee K", pr.fragile_fee_minor, (n) => setPr({ ...pr, fragile_fee_minor: n }), true)}
        {num("Scheduled fee K", pr.scheduled_fee_minor, (n) => setPr({ ...pr, scheduled_fee_minor: n }), true)}
        {num("Minimum fare K", pr.min_fare_minor, (n) => setPr({ ...pr, min_fare_minor: n }), true)}
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={vt.allows_fragile} onChange={(e) => setVt({ ...vt, allows_fragile: e.target.checked })} />Allows fragile items</label>
      <Button variant="zippy" className="mt-4 h-11 w-full" onClick={save}>Save {v.name}</Button>
    </Card>
  );
}
