import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, ProgressBar } from "@/components/zippy/ui";
import { useAccount } from "@/hooks/use-account";
import { myOrdersQuery } from "@/hooks/use-orders";
import { money } from "@/lib/format";
import box from "@/assets/box-hero.png";

export const Route = createFileRoute("/_authenticated/app/wallet")({
  head: () => ({ meta: [{ title: "Wallet — Zippy" }, { name: "description", content: "Spending and Zippy Points." }] }),
  component: WalletPage,
});

function WalletPage() {
  const { data: acc } = useAccount();
  const { data = [] } = useQuery({ ...myOrdersQuery(acc?.user.id ?? ""), enabled: !!acc });
  const delivered = data.filter((o) => o.status === "delivered");
  const spent = delivered.reduce((s, o) => s + o.total_minor, 0);
  const points = delivered.length * 20;
  return (
    <div className="space-y-4 px-5 pt-6">
      <h1 className="text-2xl font-extrabold">Wallet</h1>
      <div className="rounded-3xl bg-ink p-5 text-ink-foreground shadow-float">
        <div className="text-sm font-semibold opacity-80">Total spent on deliveries</div>
        <div className="mt-1 font-display text-3xl font-extrabold">{money(spent)}</div>
        <div className="mt-1 text-xs opacity-70">{delivered.length} completed deliveries · paid in cash</div>
      </div>
      <Card className="p-5">
        <div className="font-display font-extrabold">Zippy Points</div>
        <div className="mt-1 text-3xl font-extrabold text-primary-deep">{points}</div>
        <div className="mt-3"><ProgressBar value={(points / 200) * 100} tone="sun" /></div>
        <p className="mt-2 text-xs text-muted-foreground">{Math.max(0, 200 - points)} points to your first reward.</p>
      </Card>
      <Card><EmptyState art={box} title="Online payments are coming" body="Mobile money, cards and wallet top-ups arrive in an upcoming update." /></Card>
    </div>
  );
}
