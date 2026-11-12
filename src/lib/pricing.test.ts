import { describe, expect, it } from "vitest";
import { ineligibilityReason, quoteFor, recommendVehicle, driverEarnings, type VehicleRule, type PricingRule } from "./pricing";
import { canTransition } from "./lifecycle";

const V: VehicleRule[] = [
  { code: "bicycle", name: "Bicycle", tagline: "", max_weight_kg: 5, max_length_cm: 40, max_distance_km: 8, allows_fragile: false, speed_kmh: 14, sort: 1, active: true },
  { code: "motorbike", name: "Motorbike", tagline: "", max_weight_kg: 20, max_length_cm: 60, max_distance_km: 40, allows_fragile: true, speed_kmh: 30, sort: 2, active: true },
  { code: "car", name: "Car", tagline: "", max_weight_kg: 100, max_length_cm: 120, max_distance_km: 150, allows_fragile: true, speed_kmh: 35, sort: 3, active: true },
  { code: "cargo", name: "Cargo", tagline: "", max_weight_kg: 1500, max_length_cm: 400, max_distance_km: 500, allows_fragile: true, speed_kmh: 30, sort: 4, active: true },
];
const R: PricingRule[] = [
  { vehicle_type: "bicycle", currency: "ZMW", base_fare_minor: 1500, per_km_minor: 400, per_kg_minor: 0, fragile_fee_minor: 0, scheduled_fee_minor: 500, min_fare_minor: 2000 },
  { vehicle_type: "motorbike", currency: "ZMW", base_fare_minor: 2500, per_km_minor: 600, per_kg_minor: 50, fragile_fee_minor: 1000, scheduled_fee_minor: 500, min_fare_minor: 3000 },
  { vehicle_type: "car", currency: "ZMW", base_fare_minor: 5000, per_km_minor: 1000, per_kg_minor: 20, fragile_fee_minor: 1500, scheduled_fee_minor: 1000, min_fare_minor: 6000 },
  { vehicle_type: "cargo", currency: "ZMW", base_fare_minor: 15000, per_km_minor: 2500, per_kg_minor: 10, fragile_fee_minor: 3000, scheduled_fee_minor: 2000, min_fare_minor: 20000 },
];
const small = { weight_kg: 1, length_cm: 30, width_cm: 20, height_cm: 5, quantity: 1, fragile: false };

describe("vehicle eligibility", () => {
  it("rejects a bicycle for packages heavier than its limit", () => {
    expect(ineligibilityReason(V[0]!, { ...small, weight_kg: 6 }, 3)).toMatch(/Too heavy/);
  });
  it("counts quantity toward weight", () => {
    expect(ineligibilityReason(V[1]!, { ...small, weight_kg: 7, quantity: 3 }, 3)).toMatch(/Too heavy/);
  });
  it("rejects a bicycle for fragile items", () => {
    expect(ineligibilityReason(V[0]!, { ...small, fragile: true }, 3)).toMatch(/Fragile/);
  });
  it("rejects trips longer than the vehicle's range", () => {
    expect(ineligibilityReason(V[0]!, small, 9)).toMatch(/Too far/);
  });
});

describe("pricing", () => {
  it("prices a 5 km bicycle trip at K35.00", () => {
    expect(quoteFor(V[0]!, R[0]!, small, 5, false).total_minor).toBe(3500);
  });
  it("applies the minimum fare", () => {
    expect(quoteFor(V[0]!, R[0]!, small, 0.5, false).total_minor).toBe(2000);
  });
  it("adds fragile and scheduled fees", () => {
    const q = quoteFor(V[1]!, R[1]!, { ...small, fragile: true }, 10, true);
    expect(q.total_minor).toBe(2500 + 6000 + 50 + 1000 + 500);
  });
  it("recommends the cheapest eligible vehicle", () => {
    expect(recommendVehicle(V, R, small, 5)).toBe("bicycle");
    expect(recommendVehicle(V, R, { ...small, weight_kg: 50 }, 5)).toBe("car");
  });
  it("gives drivers 80% of the total", () => {
    expect(driverEarnings(3500)).toBe(2800);
  });
});

describe("order lifecycle", () => {
  it("allows only forward steps", () => {
    expect(canTransition("searching", "assigned")).toBe(true);
    expect(canTransition("searching", "delivered")).toBe(false);
    expect(canTransition("picked_up", "cancelled")).toBe(false);
    expect(canTransition("delivered", "in_transit")).toBe(false);
  });
});
