import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import box from "@/assets/box-hero.png";
import routeMap from "@/assets/route-map.png";
import success from "@/assets/success-delivery.png";
import { VEHICLE_ART } from "@/components/zippy/vehicle-art";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zippy — Anything delivered. Anywhere we go." },
      { name: "description", content: "Send anything by bicycle, motorbike, car or cargo with verified couriers and live tracking." },
      { property: "og:title", content: "Zippy — Anything delivered. Anywhere we go." },
      { property: "og:description", content: "Send anything by bicycle, motorbike, car or cargo with verified couriers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const SLIDES = [
  { title: "Send anything, effortlessly.", body: "Documents, groceries, gifts or a whole sofa — book in a few taps.", art: "route" },
  { title: "The perfect ride for every delivery.", body: "Bicycle, motorbike, car or cargo. We'll recommend the right fit.", art: "vehicles" },
  { title: "Know exactly where it is.", body: "Follow every step from pickup to doorstep.", art: "box" },
  { title: "Fast delivery. Happy moments.", body: "Earn Zippy Points every time your package lands safely.", art: "success" },
] as const;

function Landing() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"splash" | "onboard">("splash");
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/go", replace: true });
    });
    const t = setTimeout(() => setPhase("onboard"), 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  if (phase === "splash") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-primary text-primary-foreground">
        <img src={box} alt="" className="h-40 w-40 animate-pop object-contain" width={816} height={816} />
        <h1 className="mt-4 font-display text-5xl font-extrabold animate-pop [animation-delay:150ms]">Zippy</h1>
        <p className="mt-2 text-lg font-bold opacity-90 animate-pop [animation-delay:300ms]">Anything delivered. Anywhere we go.</p>
      </main>
    );
  }

  const s = SLIDES[i] ?? SLIDES[0];
  const last = i === SLIDES.length - 1;
  return (
    <main
      className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-8 pt-6"
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (dx < -50 && !last) setI(i + 1);
        if (dx > 50 && i > 0) setI(i - 1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl font-extrabold text-primary">Zippy</span>
        {!last && (
          <Link to="/auth" className="text-sm font-bold text-muted-foreground">Skip</Link>
        )}
      </div>
      <div key={i} className="flex flex-1 flex-col items-center justify-center text-center animate-bounce-in">
        <div className="grid h-72 w-full place-items-center">
          {s.art === "vehicles" ? (
            <div className="grid grid-cols-2 gap-3">
              {(["bicycle", "motorbike", "car", "cargo"] as const).map((v, k) => (
                <div key={v} className="grid h-32 w-32 place-items-center rounded-3xl bg-secondary animate-pop" style={{ animationDelay: `${k * 90}ms` }}>
                  <img src={VEHICLE_ART[v]} alt={v} className="h-24 w-24 object-contain" />
                </div>
              ))}
            </div>
          ) : (
            <img src={s.art === "route" ? routeMap : s.art === "box" ? box : success} alt="" className="h-64 w-64 animate-float object-contain" />
          )}
        </div>
        <h2 className="mt-6 text-3xl font-extrabold">{s.title}</h2>
        <p className="mt-3 text-muted-foreground">{s.body}</p>
      </div>
      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, k) => (
          <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={cn("h-2.5 rounded-full transition-all", k === i ? "w-8 bg-primary" : "w-2.5 bg-border")} />
        ))}
      </div>
      {last ? (
        <Button variant="zippy" size="xl" className="w-full" onClick={() => navigate({ to: "/auth" })}>Get Started</Button>
      ) : (
        <Button variant="zippy" size="xl" className="w-full" onClick={() => setI(i + 1)}>Continue</Button>
      )}
    </main>
  );
}
