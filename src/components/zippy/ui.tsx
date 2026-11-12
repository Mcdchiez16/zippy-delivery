import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, type OrderStatus } from "@/lib/lifecycle";
import motorbike from "@/assets/vehicle-motorbike.png";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-3xl bg-card text-card-foreground shadow-card border border-border/60", className)}>{children}</div>;
}

const STATUS_TONE: Record<OrderStatus, string> = {
  searching: "bg-sun/25 text-sun-foreground",
  assigned: "bg-sky/15 text-sky",
  arriving_pickup: "bg-sky/15 text-sky",
  picked_up: "bg-secondary text-secondary-foreground",
  in_transit: "bg-secondary text-secondary-foreground",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};
export function StatusChip({ status }: { status: OrderStatus }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", STATUS_TONE[status])}>{STATUS_LABEL[status]}</span>;
}

export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full bg-primary transition-all duration-500", i <= step ? "w-full" : "w-0")} />
        </div>
      ))}
    </div>
  );
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "sun" | "sky" }) {
  const bg = tone === "sun" ? "bg-sun" : tone === "sky" ? "bg-sky" : "bg-primary";
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all duration-700", bg)} style={{ width: `${Math.min(100, Math.max(4, value))}%` }} />
    </div>
  );
}

export function CourierLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground" role="status">
      <div className="relative h-16 w-40 overflow-hidden">
        <img src={motorbike} alt="" className="absolute bottom-0 h-14 w-14 animate-ride" />
        <div className="absolute bottom-1 left-0 right-0 border-b-2 border-dashed border-border" />
      </div>
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}

export function EmptyState({ art, title, body, action }: { art: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <img src={art} alt="" className="h-32 w-32 animate-float object-contain" />
      <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const CONFETTI_COLORS = ["bg-primary", "bg-sun", "bg-sky", "bg-destructive", "bg-primary-deep"];
export function Confetti({ fire }: { fire: boolean }) {
  const [pieces, setPieces] = useState<{ left: number; delay: number; color: string; dur: number }[]>([]);
  useEffect(() => {
    if (!fire) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPieces(Array.from({ length: 60 }).map((_, i) => ({ left: Math.random() * 100, delay: Math.random() * 0.4, color: CONFETTI_COLORS[i % 5], dur: 1.6 + Math.random() * 1.4 })));
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [fire]);
  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className={cn("absolute top-0 h-3 w-2 rounded-sm", p.color)} style={{ left: `${p.left}%`, animation: `zp-confetti ${p.dur}s ${p.delay}s ease-in forwards` }} />
      ))}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls = "h-12 w-full rounded-2xl border-2 border-input bg-card px-4 text-base outline-none transition focus:border-primary";
