import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, ListChecks, MapPin, Wallet, User } from "lucide-react";
import { BottomNav } from "@/components/zippy/bottom-nav";
import { useOrdersRealtime } from "@/hooks/use-orders";

export const Route = createFileRoute("/_authenticated/app")({
  component: CustomerLayout,
});

function CustomerLayout() {
  useOrdersRealtime();
  return (
    <div className="mx-auto min-h-screen max-w-md pb-28">
      <Outlet />
      <BottomNav items={[
        { to: "/app", label: "Home", icon: Home, exact: true },
        { to: "/app/orders", label: "Activity", icon: ListChecks },
        { to: "/app/track", label: "Track", icon: MapPin },
        { to: "/app/wallet", label: "Wallet", icon: Wallet },
        { to: "/app/profile", label: "Profile", icon: User },
      ]} />
    </div>
  );
}
