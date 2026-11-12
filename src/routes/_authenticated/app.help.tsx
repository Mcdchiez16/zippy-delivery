import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, LifeBuoy, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/zippy/ui";

export const Route = createFileRoute("/_authenticated/app/help")({
  head: () => ({ meta: [{ title: "Help center — Zippy" }, { name: "description", content: "Answers and support for your Zippy deliveries." }] }),
  component: Help,
});

const faqs = [
  ["How is my price calculated?", "Prices use a base fare plus distance, time and package handling for the vehicle you choose. You always see the full breakdown before confirming."],
  ["Can I cancel a delivery?", "Yes — before a driver picks up your package you can cancel from the tracking screen."],
  ["What can't I send?", "Illegal, dangerous or hazardous items, cash and live animals are not allowed."],
  ["My package is damaged or missing", "Report it below with your tracking number and our team will investigate."],
];

function Help() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-4 px-5 pt-6 pb-28">
      <h1 className="text-2xl font-extrabold">Help center</h1>
      <Card className="divide-y divide-border">
        {faqs.map(([q, a], i) => (
          <button key={q} onClick={() => setOpen(open === i ? null : i)} className="block w-full p-4 text-left">
            <div className="flex items-center justify-between font-bold">{q}<ChevronDown className={`h-4 w-4 transition ${open === i ? "rotate-180" : ""}`} /></div>
            {open === i && <p className="mt-2 text-sm text-muted-foreground">{a}</p>}
          </button>
        ))}
      </Card>
      <Card className="space-y-3 p-5">
        <div className="flex items-center gap-2 font-display font-extrabold"><LifeBuoy className="h-5 w-5 text-sky" />Report an issue</div>
        <p className="text-sm text-muted-foreground">Ticket submission is coming soon. For now, call our support line.</p>
        <Button className="w-full" variant="outline" onClick={() => toast("Support line coming soon")}><Phone className="h-4 w-4" />Call support</Button>
      </Card>
    </div>
  );
}
