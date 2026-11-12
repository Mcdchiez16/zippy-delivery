import { cn } from "@/lib/utils";

// Animated package mascot: walks back and forth, waves, blinks and hops.
export function BoxBuddy({ className }: { className?: string }) {
  return (
    <div className={cn("bb-stroll pointer-events-none", className)} aria-hidden>
      <svg viewBox="0 0 120 140" className="bb-flip h-full w-full overflow-visible">
        <ellipse cx="60" cy="134" rx="30" ry="5" fill="black" opacity=".15" className="bb-shadow" />
        <g className="bb-leg-l"><rect x="40" y="100" width="10" height="28" rx="5" fill="var(--color-ink)" /><ellipse cx="44" cy="129" rx="9" ry="5" fill="var(--color-ink)" /></g>
        <g className="bb-leg-r"><rect x="70" y="100" width="10" height="28" rx="5" fill="var(--color-ink)" /><ellipse cx="76" cy="129" rx="9" ry="5" fill="var(--color-ink)" /></g>
        <g className="bb-body">
          <g className="bb-arm-l"><rect x="10" y="62" width="22" height="10" rx="5" fill="var(--color-ink)" /></g>
          <rect x="22" y="34" width="76" height="72" rx="14" fill="var(--color-sun)" stroke="var(--color-sun-foreground)" strokeOpacity=".25" strokeWidth="3" />
          <path d="M22 50 H98" stroke="var(--color-sun-foreground)" strokeOpacity=".2" strokeWidth="3" />
          <rect x="52" y="34" width="16" height="72" fill="var(--color-sun-foreground)" opacity=".12" />
          <g className="bb-eyes">
            <ellipse cx="46" cy="70" rx="6" ry="8" fill="var(--color-ink)" /><circle cx="48" cy="67" r="2" fill="white" />
            <ellipse cx="74" cy="70" rx="6" ry="8" fill="var(--color-ink)" /><circle cx="76" cy="67" r="2" fill="white" />
          </g>
          <circle cx="38" cy="84" r="5" fill="var(--color-destructive)" opacity=".35" /><circle cx="82" cy="84" r="5" fill="var(--color-destructive)" opacity=".35" />
          <path d="M52 84 Q60 93 68 84" stroke="var(--color-ink)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <g className="bb-arm-r"><rect x="88" y="62" width="24" height="10" rx="5" fill="var(--color-ink)" /><circle cx="113" cy="67" r="7" fill="var(--color-ink)" /></g>
        </g>
      </svg>
    </div>
  );
}
