export type OrderStatus =
  | "searching" | "assigned" | "arriving_pickup" | "picked_up" | "in_transit" | "delivered" | "cancelled";

// Mirrors public.is_valid_transition in the database (the database is the source of truth).
export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  searching: ["assigned", "cancelled"],
  assigned: ["arriving_pickup", "cancelled"],
  arriving_pickup: ["picked_up", "cancelled"],
  picked_up: ["in_transit"],
  in_transit: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return TRANSITIONS[from].includes(to);
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  searching: "Finding driver",
  assigned: "Driver assigned",
  arriving_pickup: "Driver arriving",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const TIMELINE: OrderStatus[] = ["searching", "assigned", "arriving_pickup", "picked_up", "in_transit", "delivered"];

/** The next step a driver performs, with its button label. */
export const DRIVER_NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  assigned: { to: "arriving_pickup", label: "Navigate to Pickup" },
  arriving_pickup: { to: "picked_up", label: "Confirm Pickup" },
  picked_up: { to: "in_transit", label: "Start Delivery" },
  in_transit: { to: "delivered", label: "Complete Delivery" },
};

export const ACTIVE_STATUSES: OrderStatus[] = ["searching", "assigned", "arriving_pickup", "picked_up", "in_transit"];

export function progressOf(s: OrderStatus) {
  if (s === "cancelled") return 0;
  return (TIMELINE.indexOf(s) / (TIMELINE.length - 1)) * 100;
}
