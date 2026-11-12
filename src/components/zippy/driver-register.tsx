import { useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Field, inputCls } from "./ui";
import { VEHICLE_ART, VEHICLE_FALLBACK } from "./vehicle-art";
import type { VehicleCode } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const DOCS = [
  { k: "id", label: "National ID or passport", always: true },
  { k: "profile_photo", label: "Profile photo", always: true },
  { k: "license", label: "Driver's licence", always: false },
  { k: "vehicle_photo", label: "Vehicle photo", always: true },
] as const;

export function DriverRegister({ userId, defaultName }: { userId: string; defaultName: string }) {
  const qc = useQueryClient();
  const [vt, setVt] = useState<VehicleCode>("motorbike");
  const [f, setF] = useState({ name: defaultName, phone: "", license: "", registration: "", make: "", emergency: "", payout_method: "Mobile money", payout_account: "" });
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [busy, setBusy] = useState(false);
  const needsLicence = vt !== "bicycle";

  async function submit(e: FormEvent) {
    e.preventDefault();
    const required = DOCS.filter((d) => d.always || needsLicence);
    const missing = required.find((d) => !files[d.k]);
    if (missing) { toast.error(`Please add your ${missing.label.toLowerCase()}.`); return; }
    setBusy(true);
    try {
      const { error } = await supabase.rpc("register_driver", {
        _full_name: f.name, _phone: f.phone, _vehicle_type: vt, _license: f.license, _registration: f.registration,
        _make_model: f.make, _emergency: f.emergency, _payout_method: f.payout_method, _payout_account: f.payout_account,
      });
      if (error) throw error;
      for (const d of required) {
        const file = files[d.k]!;
        const path = `${userId}/${d.k}-${Date.now()}.${file.name.split(".").pop() || "jpg"}`;
        const up = await supabase.storage.from("driver-docs").upload(path, file, { upsert: false });
        if (up.error) throw up.error;
        const ins = await supabase.from("driver_documents").insert({ driver_id: userId, doc_type: d.k, storage_path: path });
        if (ins.error) throw ins.error;
      }
      toast.success("Application sent! We'll review it soon.");
      qc.invalidateQueries({ queryKey: ["account"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit your application.");
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="space-y-5 px-5 pt-6">
      <div>
        <h1 className="text-2xl font-extrabold">Become a Zippy courier 🚀</h1>
        <p className="text-sm text-muted-foreground">Tell us about you and your ride. We verify every courier before their first delivery.</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(VEHICLE_ART) as VehicleCode[]).map((v) => (
          <button type="button" key={v} onClick={() => setVt(v)} className={cn("rounded-2xl border-2 p-2 text-center text-xs font-bold", vt === v ? "border-primary bg-secondary" : "border-border bg-card")}>
            <img src={VEHICLE_ART[v]} alt="" className="mx-auto h-12 w-12 object-contain" />{VEHICLE_FALLBACK[v].name}
          </button>
        ))}
      </div>
      <Field label="Full name"><input className={inputCls} value={f.name} onChange={set("name")} required minLength={2} /></Field>
      <Field label="Phone"><input className={inputCls} type="tel" value={f.phone} onChange={set("phone")} required minLength={6} /></Field>
      {needsLicence && (
        <>
          <Field label="Driver's licence number"><input className={inputCls} value={f.license} onChange={set("license")} required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Registration plate"><input className={inputCls} value={f.registration} onChange={set("registration")} required /></Field>
            <Field label="Make & model"><input className={inputCls} value={f.make} onChange={set("make")} /></Field>
          </div>
        </>
      )}
      <Field label="Emergency contact"><input className={inputCls} value={f.emergency} onChange={set("emergency")} placeholder="Name and phone" required /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Payout method">
          <select className={inputCls} value={f.payout_method} onChange={set("payout_method")}><option>Mobile money</option><option>Bank account</option></select>
        </Field>
        <Field label="Account / number"><input className={inputCls} value={f.payout_account} onChange={set("payout_account")} required /></Field>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-bold">Documents</div>
        {DOCS.filter((d) => d.always || needsLicence).map((d) => (
          <label key={d.k} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed p-3", files[d.k] ? "border-primary bg-secondary" : "border-border")}>
            <Upload className="h-5 w-5 text-primary" />
            <span className="flex-1 text-sm font-semibold">{d.label}</span>
            <span className="max-w-28 truncate text-xs text-muted-foreground">{files[d.k]?.name ?? "Add file"}</span>
            <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setFiles({ ...files, [d.k]: e.target.files?.[0] })} />
          </label>
        ))}
      </div>
      <Button variant="zippy" size="xl" className="w-full" disabled={busy}>{busy ? "Submitting…" : "Submit for verification"}</Button>
    </form>
  );
}
