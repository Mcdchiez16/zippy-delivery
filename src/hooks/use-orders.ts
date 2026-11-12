import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const myOrdersQuery = (userId: string) =>
  queryOptions({
    queryKey: ["orders", "mine", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("delivery_orders").select("*").eq("customer_id", userId).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

export const orderDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["orders", "detail", id],
    queryFn: async () => {
      const [o, s, p, q, e] = await Promise.all([
        supabase.from("delivery_orders").select("*").eq("id", id).maybeSingle(),
        supabase.from("delivery_stops").select("*").eq("order_id", id).order("seq"),
        supabase.from("packages").select("*").eq("order_id", id),
        supabase.from("delivery_quotes").select("*").eq("order_id", id).order("created_at").limit(1),
        supabase.from("delivery_status_events").select("*").eq("order_id", id).order("created_at"),
      ]);
      if (o.error) throw o.error;
      return { order: o.data, stops: s.data ?? [], packages: p.data ?? [], quote: q.data?.[0] ?? null, events: e.data ?? [] };
    },
  });

/** Refetch order queries whenever any visible delivery changes. */
export function useOrdersRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`orders-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders" }, () => {
        qc.invalidateQueries({ queryKey: ["orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
}
