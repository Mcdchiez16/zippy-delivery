export type VehicleCode = "bicycle" | "motorbike" | "car" | "cargo";

export interface VehicleRule {
  code: VehicleCode;
  name: string;
  tagline: string;
  max_weight_kg: number;
  max_length_cm: number;
  max_distance_km: number;
  allows_fragile: boolean;
  speed_kmh: number;
  sort: number;
  active: boolean;
}

export interface PricingRule {
  vehicle_type: string;
  currency: string;
  base_fare_minor: number;
  per_km_minor: number;
  per_kg_minor: number;
  fragile_fee_minor: number;
  scheduled_fee_minor: number;
  min_fare_minor: number;
}

export interface PackageInput {
  weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  quantity: number;
  fragile: boolean;
}

export interface LatLng { lat: number; lng: number }

/** Straight-line distance in km, padded by 1.3x to approximate road distance. */
export function estimateDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * R * Math.asin(Math.sqrt(h));
  return Math.round(straight * 1.3 * 10) / 10;
}

export function totalWeight(p: PackageInput) {
  return p.weight_kg * p.quantity;
}

/** Returns null when the vehicle can carry the package, otherwise a friendly reason. */
export function ineligibilityReason(v: VehicleRule, p: PackageInput, distanceKm: number): string | null {
  if (!v.active) return `${v.name} deliveries are paused right now.`;
  const w = totalWeight(p);
  if (w > v.max_weight_kg) return `Too heavy — ${v.name.toLowerCase()} carries up to ${v.max_weight_kg} kg.`;
  const longest = Math.max(p.length_cm, p.width_cm, p.height_cm);
  if (longest > v.max_length_cm) return `Too big — longest side must be under ${v.max_length_cm} cm.`;
  if (distanceKm > v.max_distance_km) return `Too far — ${v.name.toLowerCase()} trips go up to ${v.max_distance_km} km.`;
  if (p.fragile && !v.allows_fragile) return `Fragile items need a more stable ride.`;
  return null;
}

export interface QuoteLine { label: string; amount_minor: number }
export interface Quote {
  vehicle_type: VehicleCode;
  currency: string;
  lines: QuoteLine[];
  total_minor: number;
  duration_min: number;
  distance_km: number;
}

export function quoteFor(
  v: VehicleRule,
  r: PricingRule,
  p: PackageInput,
  distanceKm: number,
  scheduled: boolean,
): Quote {
  const lines: QuoteLine[] = [
    { label: "Base fare", amount_minor: r.base_fare_minor },
    { label: `Distance (${distanceKm} km)`, amount_minor: Math.round(r.per_km_minor * distanceKm) },
  ];
  const weightFee = Math.round(r.per_kg_minor * totalWeight(p));
  if (weightFee > 0) lines.push({ label: "Weight", amount_minor: weightFee });
  if (p.fragile && r.fragile_fee_minor > 0) lines.push({ label: "Fragile handling", amount_minor: r.fragile_fee_minor });
  if (scheduled && r.scheduled_fee_minor > 0) lines.push({ label: "Scheduled pickup", amount_minor: r.scheduled_fee_minor });
  let total = lines.reduce((s, l) => s + l.amount_minor, 0);
  if (total < r.min_fare_minor) {
    lines.push({ label: "Minimum fare top-up", amount_minor: r.min_fare_minor - total });
    total = r.min_fare_minor;
  }
  const duration = Math.max(5, Math.round((distanceKm / v.speed_kmh) * 60) + 5);
  return { vehicle_type: v.code, currency: r.currency, lines, total_minor: total, duration_min: duration, distance_km: distanceKm };
}

/** Recommend the cheapest eligible vehicle (ties broken by sort order). */
export function recommendVehicle(
  vehicles: VehicleRule[],
  rules: PricingRule[],
  p: PackageInput,
  distanceKm: number,
  scheduled = false,
): VehicleCode | null {
  let best: { code: VehicleCode; total: number; sort: number } | null = null;
  for (const v of vehicles) {
    if (ineligibilityReason(v, p, distanceKm)) continue;
    const r = rules.find((x) => x.vehicle_type === v.code);
    if (!r) continue;
    const t = quoteFor(v, r, p, distanceKm, scheduled).total_minor;
    if (!best || t < best.total || (t === best.total && v.sort < best.sort)) best = { code: v.code, total: t, sort: v.sort };
  }
  return best?.code ?? null;
}

/** Driver receives 80% of the delivery total. */
export const DRIVER_SHARE = 0.8;
export function driverEarnings(totalMinor: number) {
  return Math.round(totalMinor * DRIVER_SHARE);
}
