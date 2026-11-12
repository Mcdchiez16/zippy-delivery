import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { driverEarnings, estimateDistanceKm, ineligibilityReason, quoteFor, type PricingRule, type VehicleRule } from "@/lib/pricing";

const stop = z.object({
  address: z.string().trim().min(3).max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  contact_name: z.string().trim().min(2).max(80),
  contact_phone: z.string().trim().min(6).max(20),
  instructions: z.string().trim().max(300).optional().default(""),
});

const input = z.object({
  client_request_id: z.string().min(8).max(64),
  pickup: stop,
  dropoff: stop,
  pkg: z.object({
    category: z.enum(["Documents", "Food", "Groceries", "Clothing", "Electronics", "Gifts", "Furniture", "Business Goods", "Other"]),
    description: z.string().trim().min(2).max(300),
    weight_kg: z.number().positive().max(5000),
    length_cm: z.number().positive().max(1000),
    width_cm: z.number().positive().max(1000),
    height_cm: z.number().positive().max(1000),
    quantity: z.number().int().positive().max(500),
    fragile: z.boolean(),
    declared_value_minor: z.number().int().nonnegative().optional(),
    instructions: z.string().trim().max(300).optional().default(""),
  }),
  vehicle_type: z.enum(["bicycle", "motorbike", "car", "cargo"]),
  scheduled_for: z.string().datetime().nullable(),
});

export const createDeliveryOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    if (data.scheduled_for && new Date(data.scheduled_for).getTime() < Date.now() + 15 * 60_000) {
      throw new Error("Scheduled time must be at least 15 minutes from now.");
    }

    const [{ data: vt, error: e1 }, { data: pr, error: e2 }] = await Promise.all([
      supabase.from("vehicle_types").select("*").eq("code", data.vehicle_type).maybeSingle(),
      supabase.from("pricing_rules").select("*").eq("vehicle_type", data.vehicle_type).maybeSingle(),
    ]);
    if (e1 || e2 || !vt || !pr) throw new Error("Pricing is unavailable right now. Please try again.");

    const distance = estimateDistanceKm(data.pickup, data.dropoff);
    const reason = ineligibilityReason(vt as VehicleRule, data.pkg, distance);
    if (reason) throw new Error(reason);
    const quote = quoteFor(vt as VehicleRule, pr as PricingRule, data.pkg, distance, !!data.scheduled_for);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Idempotency: the same booking attempt returns the existing order.
    const { data: existing } = await supabaseAdmin
      .from("delivery_orders").select("id").eq("customer_id", userId).eq("client_request_id", data.client_request_id).maybeSingle();
    if (existing) return { id: existing.id };

    const { data: order, error } = await supabaseAdmin.from("delivery_orders").insert({
      customer_id: userId,
      client_request_id: data.client_request_id,
      vehicle_type: data.vehicle_type,
      scheduled_for: data.scheduled_for,
      distance_km: quote.distance_km,
      duration_min: quote.duration_min,
      total_minor: quote.total_minor,
      driver_earnings_minor: driverEarnings(quote.total_minor),
      currency: quote.currency,
      pickup_summary: data.pickup.address,
      dropoff_summary: data.dropoff.address,
    }).select("id").single();
    if (error || !order) {
      if (error?.code === "23505") {
        const { data: again } = await supabaseAdmin.from("delivery_orders").select("id").eq("customer_id", userId).eq("client_request_id", data.client_request_id).single();
        if (again) return { id: again.id };
      }
      console.error(error);
      throw new Error("We couldn't create your delivery. Please try again.");
    }

    const s = (k: "pickup" | "dropoff", seq: number) => ({ order_id: order.id, seq, kind: k, ...data[k] });
    const results = await Promise.all([
      supabaseAdmin.from("delivery_stops").insert([s("pickup", 0), s("dropoff", 1)]),
      supabaseAdmin.from("packages").insert({ order_id: order.id, ...data.pkg }),
      supabaseAdmin.from("delivery_quotes").insert({ order_id: order.id, vehicle_type: data.vehicle_type, breakdown: quote.lines as never, total_minor: quote.total_minor, currency: quote.currency }),
      supabaseAdmin.from("delivery_status_events").insert({ order_id: order.id, to_status: "searching", actor_id: userId }),
    ]);
    const failed = results.find((r) => r.error);
    if (failed) {
      console.error(failed.error);
      await supabaseAdmin.from("delivery_orders").delete().eq("id", order.id);
      throw new Error("We couldn't save your delivery details. Please try again.");
    }
    return { id: order.id };
  });
