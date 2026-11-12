import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export interface NavItem { to: NonNullable<LinkProps["to"]>; label: string; icon: LucideIcon; exact?: boolean }

export function BottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-3" aria-label="Main">
      <div className="flex items-center justify-around rounded-3xl border border-border bg-card/95 px-2 py-2 shadow-float backdrop-blur">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            activeOptions={{ exact: !!it.exact }}
            className="group flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold text-muted-foreground transition data-[status=active]:text-primary"
          >
            <span className="grid h-8 w-12 place-items-center rounded-full transition group-data-[status=active]:bg-secondary">
              <it.icon className="h-5 w-5" strokeWidth={2.4} />
            </span>
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
