import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const driverJobsQuery = (uid: string) =>
  queryOptions({
    queryKey: ["orders", "driver", uid],
    queryFn: async () => {
      const [mine, open] = await Promise.all([
        supabase.from("delivery_orders").select("*").eq("driver_id", uid).order("updated_at", { ascending: false }).limit(100),
        supabase.from("delivery_orders").select("*").eq("status", "searching").order("created_at").limit(30),
      ]);
      if (mine.error) throw mine.error;
      return { mine: mine.data, open: (open.data ?? []).filter((o) => !o.scheduled_for || new Date(o.scheduled_for).getTime() < Date.now() + 60 * 60_000) };
    },
  });
