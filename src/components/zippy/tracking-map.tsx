import type * as React from "react";
import type { OrderStatus } from "@/lib/lifecycle";
import { progressOf } from "@/lib/lifecycle";

// Illustrated route view. A real map with live GPS replaces this when maps are connected.
export function TrackingMap({ status, art }: { status: OrderStatus; art: string }) {
  const p = Math.min(1, Math.max(0, progressOf(status) / 100));
  const path = "M40 200 C 120 40, 220 260, 320 70";
  return (
    <div className="relative h-64 overflow-hidden rounded-3xl bg-secondary">
      <svg viewBox="0 0 360 260" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="var(--color-border)" strokeWidth="1" /></pattern></defs>
        <rect width="360" height="260" fill="url(#g)" />
        <path d="M0 130 H360 M180 0 V260" stroke="var(--color-card)" strokeWidth="14" />
        <path id="route" d={path} fill="none" stroke="var(--color-sky)" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 12" />
        <circle cx="40" cy="200" r="12" fill="var(--color-primary)" stroke="var(--color-card)" strokeWidth="4" />
        <circle cx="320" cy="70" r="12" fill="var(--color-sky)" stroke="var(--color-card)" strokeWidth="4" />
      </svg>
      <div className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000" style={{ offsetPath: `path("${path}")`, offsetDistance: `${p * 100}%`, offsetRotate: "0deg", left: 0, top: 0 } as React.CSSProperties}>
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
        <img src={art} alt="Courier" className="relative h-14 w-14 object-contain" />
      </div>
    </div>
  );
}
