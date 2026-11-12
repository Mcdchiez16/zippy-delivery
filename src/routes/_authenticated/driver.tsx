import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Inbox, Wallet, ListChecks, User } from "lucide-react";
import { BottomNav } from "@/components/zippy/bottom-nav";
import { useOrdersRealtime } from "@/hooks/use-orders";

export const Route = createFileRoute("/_authenticated/driver")({
  component: DriverLayout,
});

function DriverLayout() {
  useOrdersRealtime();
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto min-h-screen max-w-md pb-28">
        <Outlet />
        <BottomNav items={[
          { to: "/driver", label: "Home", icon: Home, exact: true },
          { to: "/driver/requests", label: "Requests", icon: Inbox },
          { to: "/driver/earnings", label: "Earnings", icon: Wallet },
          { to: "/driver/activity", label: "Activity", icon: ListChecks },
          { to: "/driver/profile", label: "Profile", icon: User },
        ]} />
      </div>
    </div>
  );
}
