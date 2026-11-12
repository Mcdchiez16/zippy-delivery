import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { accountQuery } from "@/hooks/use-account";

// UI gate only — every admin action is also checked in the database.
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const acc = await context.queryClient.fetchQuery(accountQuery);
    if (!acc?.isAdmin) throw redirect({ to: "/go" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const tab = "rounded-full px-4 py-2 text-sm font-bold text-muted-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground";
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <span className="font-display text-xl font-extrabold text-primary">Zippy <span className="text-foreground">Admin</span></span>
          <nav className="flex gap-1">
            <Link to="/admin" activeOptions={{ exact: true }} className={tab}>Overview & drivers</Link>
            <Link to="/admin/pricing" className={tab}>Vehicles & pricing</Link>
          </nav>
          <Link to="/app" className="ml-auto text-sm font-bold text-muted-foreground">Customer app</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8"><Outlet /></main>
    </div>
  );
}
