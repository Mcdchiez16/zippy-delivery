import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { Card } from "@/components/zippy/ui";
import { useAccount } from "@/hooks/use-account";
import { driverJobsQuery } from "@/hooks/use-driver";
import { money } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/driver/earnings")({
  head: () => ({ meta: [{ title: "Earnings — Zippy Driver" }, { name: "description", content: "Your delivery earnings." }] }),
  component: Earnings,
});

function Earnings() {
  const { data: acc } = useAccount();
  const { data } = useQuery({ ...driverJobsQuery(acc?.user.id ?? ""), enabled: !!acc });
  const done = (data?.mine ?? []).filter((o) => o.status === "delivered");
  const now = new Date();
  const sum = (since: number) => done.filter((o) => new Date(o.updated_at).getTime() >= since).reduce((s, o) => s + o.driver_earnings_minor, 0);
  const startDay = new Date(now.toDateString()).getTime();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startDay - (6 - i) * 86400000);
    const key = d.toDateString();
    return { day: d.toLocaleDateString([], { weekday: "short" }), k: done.filter((o) => new Date(o.updated_at).toDateString() === key).reduce((s, o) => s + o.driver_earnings_minor, 0) / 100 };
  });
  const lifetime = done.reduce((s, o) => s + o.driver_earnings_minor, 0);
  return (
    <div className="space-y-4 px-5 pt-6">
      <h1 className="text-2xl font-extrabold">Earnings</h1>
      <div className="grid grid-cols-2 gap-3">
        {[["Today", sum(startDay)], ["This week", sum(startDay - 6 * 86400000)], ["This month", sum(new Date(now.getFullYear(), now.getMonth(), 1).getTime())], ["Lifetime", lifetime]].map(([l, v]) => (
          <Card key={l as string} className="p-4"><div className="text-xs font-bold text-muted-foreground">{l}</div><div className="mt-1 font-display text-xl font-extrabold">{money(v as number)}</div></Card>
        ))}
      </div>
      <Card className="p-4">
        <div className="mb-2 font-display font-extrabold">Last 7 days (K)</div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}><XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" /><Bar dataKey="k" radius={[8, 8, 8, 8]} fill="var(--color-primary)" /></BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <p className="text-xs text-muted-foreground">You keep 80% of each delivery fare. Payout requests arrive in an upcoming update.</p>
    </div>
  );
}
