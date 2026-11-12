import bicycle from "@/assets/pro-bicycle.png";
import motorbike from "@/assets/pro-motorbike.png";
import car from "@/assets/pro-car.png";
import cargo from "@/assets/pro-cargo.png";
import type { VehicleCode } from "@/lib/pricing";

export const VEHICLE_ART: Record<VehicleCode, string> = { bicycle, motorbike, car, cargo };
export const VEHICLE_FALLBACK: Record<VehicleCode, { name: string; tagline: string; fit: string }> = {
  bicycle: { name: "Bicycle", tagline: "Small packages. Small price.", fit: "Documents & snacks" },
  motorbike: { name: "Motorbike", tagline: "Quick trips. Big convenience.", fit: "Small–medium parcels" },
  car: { name: "Car", tagline: "More room for more things.", fit: "Groceries & fragile" },
  cargo: { name: "Cargo", tagline: "Big deliveries made easy.", fit: "Furniture & bulk" },
};
