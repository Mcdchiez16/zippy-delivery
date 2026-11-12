import { createFileRoute, redirect } from "@tanstack/react-router";
import { accountQuery } from "@/hooks/use-account";
import { CourierLoader } from "@/components/zippy/ui";

// Sends each person to their own app based on server-stored roles.
export const Route = createFileRoute("/_authenticated/go")({
  beforeLoad: async ({ context }) => {
    const acc = await context.queryClient.fetchQuery(accountQuery);
    if (!acc) throw redirect({ to: "/auth" });
    if (acc.isAdmin) throw redirect({ to: "/admin" });
    if (!acc.profile?.usage_intent) throw redirect({ to: "/welcome" });
    if (acc.profile.usage_intent === "deliver") throw redirect({ to: "/driver" });
    throw redirect({ to: "/app" });
  },
  component: () => <CourierLoader label="Getting things ready…" />,
});
