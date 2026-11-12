import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, StatusChip } from "@/components/zippy/ui";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/lifecycle";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — Zippy" }, { name: "description", content: "Zippy operations overview." }] }),
  component: AdminHome,
});

function AdminHome() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [d, o, docs] = await Promise.all([
        supabase.from("drivers").select("*").order("created_at", { ascending: false }),
        supabase.from("delivery_orders").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("driver_documents").select("*"),
      ]);
      return { drivers: d.data ?? [], orders: o.data ?? [], docs: docs.data ?? [] };
    },
  });
  const orders = data?.orders ?? [];
  const delivered = orders.filter((o) => o.status === "delivered");
  const revenue = delivered.reduce((s, o) => s + o.total_minor, 0);
  const commission = delivered.reduce((s, o) => s + o.total_minor - o.driver_earnings_minor, 0);

  async function setStatus(id: string, status: "approved" | "rejected" | "suspended") {
    const reason = status === "rejected" ? prompt("Reason for rejection (shown to driver)") ?? "" : null;
    const { error } = await supabase.rpc("admin_set_driver_status", { _driver_id: id, _status: status, ...(reason ? { _reason: reason } : {}) });
    if (error) { toast.error(error.message); return; }
    toast.success(`Driver ${status}`);
    qc.invalidateQueries({ queryKey: ["admin"] });
  }
  async function openDoc(path: string) {
    const { data, error } = await supabase.storage.from("driver-docs").createSignedUrl(path, 120);
    if (error || !data) { toast.error("Couldn't open document"); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[["Total orders", orders.length], ["Active", orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length], ["Delivered", delivered.length], ["Revenue", money(revenue)], ["Commission", money(commission)]].map(([l, v]) => (
          <Card key={l as string} className="p-5"><div className="text-xs font-bold text-muted-foreground">{l}</div><div className="mt-1 font-display text-2xl font-extrabold">{v}</div></Card>
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl font-extrabold">Drivers</h2>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-3">Name</th><th>Vehicle</th><th>Status</th><th>Documents</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>
              {(data?.drivers ?? []).map((d) => (
                <tr key={d.user_id} className="border-t border-border">
                  <td className="p-3"><div className="font-bold">{d.full_name}</div><div className="text-xs text-muted-foreground">{d.phone}{d.license_number ? ` · Lic ${d.license_number}` : ""}</div></td>
                  <td className="capitalize">{d.vehicle_type}</td>
                  <td><span className={cn("rounded-full px-2.5 py-1 text-xs font-bold capitalize", d.status === "approved" ? "bg-success/15 text-success" : d.status === "pending" ? "bg-sun/25 text-sun-foreground" : "bg-destructive/15 text-destructive")}>{d.status}{d.is_online ? " · online" : ""}</span></td>
                  <td className="space-x-2">{data!.docs.filter((x) => x.driver_id === d.user_id).map((x) => <button key={x.id} onClick={() => openDoc(x.storage_path)} className="text-xs font-bold text-sky underline">{x.doc_type.replace("_", " ")}</button>)}</td>
                  <td className="space-x-2 p-3 text-right whitespace-nowrap">
                    {d.status !== "approved" && <Button size="sm" variant="zippy" className="h-8 px-3" onClick={() => setStatus(d.user_id, "approved")}>Approve</Button>}
                    {d.status === "pending" && <Button size="sm" variant="soft" className="h-8 px-3" onClick={() => setStatus(d.user_id, "rejected")}>Reject</Button>}
                    {d.status === "approved" && <Button size="sm" variant="danger" className="h-8 px-3" onClick={() => setStatus(d.user_id, "suspended")}>Suspend</Button>}
                  </td>
                </tr>
              ))}
              {!data?.drivers.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No driver applications yet.</td></tr>}
            </tbody>
          </table>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-extrabold">Recent deliveries</h2>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-3">Tracking</th><th>Route</th><th>Vehicle</th><th>Status</th><th className="p-3 text-right">Total</th></tr></thead>
            <tbody>
              {orders.slice(0, 30).map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="p-3 font-bold">#{o.tracking_code}</td><td className="max-w-xs truncate">{o.pickup_summary} → {o.dropoff_summary}</td>
                  <td className="capitalize">{o.vehicle_type}</td><td><StatusChip status={o.status as OrderStatus} /></td>
                  <td className="p-3 text-right font-bold">{money(o.total_minor, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
