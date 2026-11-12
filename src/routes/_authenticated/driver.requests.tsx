import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CourierLoader, EmptyState } from "@/components/zippy/ui";
import { RequestCard } from "@/components/zippy/job-card";
import { ActiveJob } from "@/components/zippy/active-job";
import { useAccount } from "@/hooks/use-account";
import { driverJobsQuery } from "@/hooks/use-driver";
import { ACTIVE_STATUSES, type OrderStatus } from "@/lib/lifecycle";
import { VEHICLE_ART } from "@/components/zippy/vehicle-art";

export const Route = createFileRoute("/_authenticated/driver/requests")({
  head: () => ({ meta: [{ title: "Requests — Zippy Driver" }, { name: "description", content: "Incoming delivery requests." }] }),
  component: Requests,
});

function Requests() {
  const { data: acc } = useAccount();
  const { data, isLoading } = useQuery({ ...driverJobsQuery(acc?.user.id ?? ""), enabled: !!acc });
  const d = acc?.driver;
  if (isLoading || !acc) return <CourierLoader />;
  const active = data?.mine.find((o) => ACTIVE_STATUSES.includes(o.status as OrderStatus));
  return (
    <div className="space-y-4 px-5 pt-6">
      <h1 className="text-2xl font-extrabold">Requests</h1>
      {d?.status !== "approved" ? (
        <Card><EmptyState art={VEHICLE_ART.motorbike} title="Not approved yet" body="Requests appear once your account is verified." action={<Link to="/driver" className="font-bold text-primary">Check status</Link>} /></Card>
      ) : active ? <ActiveJob o={active} /> : !d.is_online ? (
        <Card><EmptyState art={VEHICLE_ART.motorbike} title="You're offline" body="Go online from Home to see nearby requests." action={<Link to="/driver" className="font-bold text-primary">Go to Home</Link>} /></Card>
      ) : data?.open.length ? data.open.map((o) => <RequestCard key={o.id} o={o} />) : (
        <Card><EmptyState art={VEHICLE_ART.motorbike} title="All quiet for now" body="We'll show matching deliveries here the moment they're booked." /></Card>
      )}
    </div>
  );
}
