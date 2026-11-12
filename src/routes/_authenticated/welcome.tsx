import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import box from "@/assets/box-hero.png";
import motorbike from "@/assets/vehicle-motorbike.png";
import routeMap from "@/assets/route-map.png";

export const Route = createFileRoute("/_authenticated/welcome")({
  head: () => ({ meta: [{ title: "How will you use Zippy?" }, { name: "description", content: "Choose how you'll use Zippy." }] }),
  component: Welcome,
});

const OPTIONS = [
  { v: "send", title: "Send packages", body: "Book deliveries for yourself or your shop.", art: box },
  { v: "deliver", title: "Deliver packages and earn", body: "Become a verified Zippy courier.", art: motorbike },
  { v: "both", title: "Both", body: "Send and deliver — switch any time.", art: routeMap },
] as const;

function Welcome() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [pick, setPick] = useState<(typeof OPTIONS)[number]["v"] | null>(null);
  const [busy, setBusy] = useState(false);
  async function go() {
    if (!pick) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").update({ usage_intent: pick }).eq("id", u.user!.id);
    setBusy(false);
    if (error) return toast.error("Couldn't save your choice. Try again.");
    await qc.invalidateQueries({ queryKey: ["account"] });
    navigate({ to: pick === "deliver" ? "/driver" : "/app" });
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <h1 className="text-3xl font-extrabold">How will you use Zippy?</h1>
      <p className="mt-2 text-muted-foreground">You can change this later in your profile.</p>
      <div className="mt-8 space-y-3">
        {OPTIONS.map((o) => (
          <button key={o.v} onClick={() => setPick(o.v)} className={cn("flex w-full items-center gap-4 rounded-3xl border-2 bg-card p-4 text-left transition", pick === o.v ? "border-primary bg-secondary animate-bounce-in" : "border-border")}>
            <img src={o.art} alt="" className="h-16 w-16 object-contain" />
            <div>
              <div className="font-display text-lg font-extrabold">{o.title}</div>
              <div className="text-sm text-muted-foreground">{o.body}</div>
            </div>
          </button>
        ))}
      </div>
      <Button variant="zippy" size="xl" className="mt-auto w-full" disabled={!pick || busy} onClick={go}>Continue</Button>
    </main>
  );
}
