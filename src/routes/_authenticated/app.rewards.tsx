import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Lock } from "lucide-react";
import { Card, ProgressBar } from "@/components/zippy/ui";
import { useAccount } from "@/hooks/use-account";
import { myOrdersQuery } from "@/hooks/use-orders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/rewards")({
  head: () => ({ meta: [{ title: "Rewards — Zippy" }, { name: "description", content: "Your Zippy Points and achievement badges." }] }),
  component: Rewards,
});

function Rewards() {
  const { data: acc } = useAccount();
  const { data = [] } = useQuery({ ...myOrdersQuery(acc?.user.id ?? ""), enabled: !!acc });
  const n = data.filter((o) => o.status === "delivered").length;
  const vehicles = new Set(data.filter((o) => o.status === "delivered").map((o) => o.vehicle_type)).size;
  const badges = [
    { name: "First Delivery", body: "Complete your first delivery", got: n >= 1 },
    { name: "Delivery Explorer", body: "Use 3 different vehicles", got: vehicles >= 3 },
    { name: "Frequent Sender", body: "Complete 10 deliveries", got: n >= 10 },
    { name: "Business Champion", body: "Complete 50 deliveries", got: n >= 50 },
  ];
  const points = n * 20;
  return (
    <div className="space-y-4 px-5 pt-6 pb-28">
      <h1 className="text-2xl font-extrabold">Rewards</h1>
      <div className="rounded-3xl bg-sun p-5 text-ink shadow-float">
        <div className="text-sm font-bold">Zippy Points</div>
        <div className="font-display text-4xl font-extrabold">{points}</div>
        <div className="mt-3"><ProgressBar value={((points % 200) / 200) * 100} /></div>
        <p className="mt-2 text-xs font-semibold">{200 - (points % 200)} points to your next K10 discount</p>
      </div>
      <h2 className="font-display font-extrabold">Achievements</h2>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((b) => (
          <Card key={b.name} className={cn("p-4 text-center", !b.got && "opacity-60")}>
            <div className={cn("mx-auto grid h-12 w-12 place-items-center rounded-full", b.got ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{b.got ? <Award /> : <Lock className="h-5 w-5" />}</div>
            <div className="mt-2 text-sm font-extrabold">{b.name}</div><div className="text-xs text-muted-foreground">{b.body}</div>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Earn 20 points for every completed delivery.</p>
    </div>
  );
}
