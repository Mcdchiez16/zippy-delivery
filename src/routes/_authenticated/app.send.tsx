import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Crosshair, MapPin, Flag, Check, Clock, CalendarClock, Package, Map as MapIcon, Search, Loader2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, Field, StepProgress, inputCls, CourierLoader } from "@/components/zippy/ui";
import { VEHICLE_ART } from "@/components/zippy/vehicle-art";
import { PLACES } from "@/lib/places";
import { estimateDistanceKm, ineligibilityReason, quoteFor, recommendVehicle, type PricingRule, type VehicleCode, type VehicleRule } from "@/lib/pricing";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createDeliveryOrder } from "@/lib/orders.functions";
import { useAccount } from "@/hooks/use-account";

export const Route = createFileRoute("/_authenticated/app/send")({
  head: () => ({ meta: [{ title: "Send a package — Zippy" }, { name: "description", content: "Book a Zippy delivery." }] }),
  component: SendFlow,
});

const LiveMap = lazy(() => import("@/components/zippy/live-map"));

const STEPS = ["Pickup", "Drop-off", "Package", "Vehicle", "Timing", "Review"];
const PRESETS: Record<string, { emoji: string; weight_kg: number; length_cm: number; width_cm: number; height_cm: number; fragile: boolean }> = {
  Documents: { emoji: "📄", weight_kg: 0.5, length_cm: 35, width_cm: 25, height_cm: 3, fragile: false },
  Food: { emoji: "🍱", weight_kg: 2, length_cm: 35, width_cm: 30, height_cm: 20, fragile: false },
  Groceries: { emoji: "🛒", weight_kg: 8, length_cm: 45, width_cm: 35, height_cm: 30, fragile: false },
  Clothing: { emoji: "👕", weight_kg: 3, length_cm: 45, width_cm: 35, height_cm: 15, fragile: false },
  Electronics: { emoji: "📱", weight_kg: 5, length_cm: 50, width_cm: 40, height_cm: 30, fragile: true },
  Gifts: { emoji: "🎁", weight_kg: 2, length_cm: 35, width_cm: 30, height_cm: 25, fragile: false },
  Furniture: { emoji: "🛋️", weight_kg: 60, length_cm: 190, width_cm: 90, height_cm: 90, fragile: false },
  "Business Goods": { emoji: "📦", weight_kg: 25, length_cm: 70, width_cm: 60, height_cm: 50, fragile: false },
  Other: { emoji: "✨", weight_kg: 3, length_cm: 40, width_cm: 30, height_cm: 25, fragile: false },
};
const CATEGORIES = ["Documents", "Food", "Groceries", "Clothing", "Electronics", "Gifts", "Furniture", "Business Goods", "Other"] as const;

interface Stop { area: string; street: string; lat: number | null; lng: number | null; contact_name: string; contact_phone: string; instructions: string }
const emptyStop: Stop = { area: "", street: "", lat: null, lng: null, contact_name: "", contact_phone: "", instructions: "" };

const configQuery = {
  queryKey: ["pricing-config"],
  queryFn: async () => {
    const [v, r] = await Promise.all([
      supabase.from("vehicle_types").select("*").order("sort"),
      supabase.from("pricing_rules").select("*"),
    ]);
    if (v.error || r.error) throw v.error ?? r.error;
    return { vehicles: v.data as VehicleRule[], rules: r.data as PricingRule[] };
  },
};

function StopForm({ value, onChange, kind }: { value: Stop; onChange: (s: Stop) => void; kind: "pickup" | "dropoff" }) {
  const set = (k: keyof Stop, v: string | number | null) => onChange({ ...value, [k]: v });
  function useCurrent() {
    if (!navigator.geolocation) { toast.error("Location isn't available on this device. Pick an area instead."); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => onChange({ ...value, area: "Current location", lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error("We couldn't get your location. Please allow location access or pick an area."),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }
  return (
    <div className="space-y-4">
      {kind === "pickup" && (
        <Button type="button" variant="soft" className="h-12 w-full" onClick={useCurrent}><Crosshair />Use my current location</Button>
      )}
      <Field label="Area">
        <select className={inputCls} value={value.area} onChange={(e) => {
          const p = PLACES.find((x) => x.name === e.target.value);
          onChange({ ...value, area: e.target.value, lat: p?.lat ?? null, lng: p?.lng ?? null });
        }}>
          <option value="">Choose an area…</option>
          {value.area === "Current location" && <option>Current location</option>}
          {PLACES.map((p) => <option key={p.name}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="Street, building or landmark"><input className={inputCls} value={value.street} onChange={(e) => set("street", e.target.value)} placeholder="e.g. Plot 12, Blue gate" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={kind === "pickup" ? "Pickup contact" : "Recipient name"}><input className={inputCls} value={value.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></Field>
        <Field label="Phone"><input className={inputCls} type="tel" value={value.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+260…" /></Field>
      </div>
      <Field label="Instructions (optional)"><input className={inputCls} value={value.instructions} onChange={(e) => set("instructions", e.target.value)} placeholder={kind === "pickup" ? "Ask for Mary at reception" : "Leave with security"} /></Field>
    </div>
  );
}

function stopError(s: Stop) {
  if (s.lat == null || s.lng == null) return "Pick an area or use your current location.";
  if (s.street.trim().length < 3) return "Add a street, building or landmark.";
  if (s.contact_name.trim().length < 2) return "Add a contact name.";
  if (s.contact_phone.replace(/\D/g, "").length < 6) return "Add a valid phone number.";
  return null;
}

type Suggestion = { name: string; detail: string; lat: number; lng: number };
const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
// Matches if every typed word is the start of some word in the text ("man hi" -> "Manda Hill").
const prefixMatch = (text: string, q: string) => {
  const words = norm(text).split(/[^a-z0-9]+/);
  return norm(q).split(/\s+/).filter(Boolean).every((w) => words.some((x) => x.startsWith(w)) || norm(text).includes(w));
};
function dedupe(list: Suggestion[]) {
  const seen = new Set<string>();
  return list.filter((x) => { const k = norm(x.name); if (seen.has(k)) return false; seen.add(k); return true; });
}
// Free search-as-you-type (Photon/OSM) biased to Lusaka, plus local landmarks for instant results.
async function searchPlaces(q: string, signal: AbortSignal): Promise<Suggestion[]> {
  const local: Suggestion[] = PLACES.filter((p) => prefixMatch(p.name, q)).map((p) => ({ name: p.name, detail: "Lusaka", lat: p.lat, lng: p.lng }));
  let remote: Suggestion[] = [];
  try {
    const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=-15.4167&lon=28.2833&limit=10&lang=en&bbox=27.6,-15.9,28.9,-15.0`, { signal });
    const d = (await r.json()) as { features: { geometry: { coordinates: [number, number] }; properties: { countrycode?: string; name?: string; housenumber?: string; street?: string; city?: string; district?: string; locality?: string } }[] };
    remote = d.features.filter((f) => !f.properties.countrycode || f.properties.countrycode === "ZM").map((f) => {
      const pr = f.properties;
      const name = pr.name || [pr.housenumber, pr.street].filter(Boolean).join(" ") || pr.city || "Unnamed place";
      return { name, detail: [pr.street !== name ? pr.street : null, pr.district || pr.locality, pr.city].filter(Boolean).join(", "), lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
    });
  } catch (e) { if ((e as Error).name === "AbortError") throw e; }
  return dedupe([...local, ...remote]).slice(0, 8);
}
const RECENT_KEY = "zippy.recentPlaces";
function readLocalRecent(): Suggestion[] { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; } }
function saveRecent(s: Suggestion) {
  if (s.name === "Finding address…") return;
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(dedupe([s, ...readLocalRecent()]).slice(0, 8))); } catch { /* ignore */ }
}
// Places from the user's past deliveries + places they recently chose on this device.
const recentPlacesQuery = {
  queryKey: ["recent-places"],
  queryFn: async (): Promise<Suggestion[]> => {
    const { data: u } = await supabase.auth.getUser();
    let fromOrders: Suggestion[] = [];
    if (u.user) {
      const { data } = await supabase.from("delivery_stops").select("address, lat, lng, delivery_orders!inner(customer_id, created_at)").eq("delivery_orders.customer_id", u.user.id).limit(40);
      fromOrders = (data ?? []).map((x) => { const [n, ...rest] = x.address.split(", "); return { name: n!, detail: rest.join(", ") || "Past delivery", lat: x.lat, lng: x.lng }; });
    }
    return dedupe([...readLocalRecent(), ...fromOrders]).slice(0, 6);
  },
  staleTime: 60_000,
};

// Creative "locate me" arrow: a bold navigation arrow with a soft green glow.
function LocateArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M20.5 3.5 3.8 10.4c-.8.3-.7 1.5.1 1.7l6.6 1.6 1.6 6.6c.2.8 1.4.9 1.7.1L20.5 3.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20.5 3.5 10.5 13.7" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}
async function reverseName(lat: number, lng: number): Promise<string | null> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=17&lat=${lat}&lon=${lng}`, { headers: { "Accept-Language": "en" } });
    const d = await r.json();
    return d?.display_name ? (d.display_name as string).split(", ").slice(0, 2).join(", ") : null;
  } catch { return null; }
}

function SendFlow() {
  const navigate = useNavigate();
  const { data: acc } = useAccount();
  const { data: cfg, isLoading } = useQuery(configQuery);
  const [stage, setStage] = useState<"map" | "form">("map");
  const [editing, setEditing] = useState<"from" | "to">("from");
  const [query, setQuery] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [typing, setTyping] = useState<"from" | "to" | null>(null);
  const [pinMode, setPinMode] = useState(false);
  const [sugs, setSugs] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const { data: recents = [] } = useQuery(recentPlacesQuery);
  const activeQ = typing ? query[typing] : "";
  useEffect(() => {
    if (!typing || activeQ.trim().length < 1) { setSugs([]); setSearching(false); return; }
    const ac = new AbortController();
    setSearching(true);
    const t = setTimeout(() => {
      searchPlaces(activeQ.trim(), ac.signal).then(setSugs).catch(() => {}).finally(() => setSearching(false));
    }, 220);
    return () => { clearTimeout(t); ac.abort(); };
  }, [activeQ, typing]);
  const [step, setStep] = useState(0);
  const [pickup, setPickup] = useState<Stop>(emptyStop);
  const [dropoff, setDropoff] = useState<Stop>(emptyStop);
  const [pkg, setPkg] = useState({ category: "Documents" as (typeof CATEGORIES)[number], description: "", weight_kg: 1, length_cm: 30, width_cm: 20, height_cm: 10, quantity: 1, fragile: false, declared_value: "", instructions: "" });
  const [vehicle, setVehicle] = useState<VehicleCode | null>(null);
  const [typePicked, setTypePicked] = useState(false);
  const pickType = (c: (typeof CATEGORIES)[number]) => {
    const { emoji: _e, ...d } = PRESETS[c]!;
    setPkg((p) => ({ ...p, category: c, ...d })); setVehicle(null); setTypePicked(true);
  };
  const [when, setWhen] = useState<"now" | "later">("now");
  const [at, setAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestId] = useState(() => crypto.randomUUID());

  const distance = pickup.lat != null && dropoff.lat != null ? estimateDistanceKm({ lat: pickup.lat, lng: pickup.lng! }, { lat: dropoff.lat, lng: dropoff.lng! }) : 0;
  const scheduled = when === "later";
  const options = useMemo(() => {
    if (!cfg) return [];
    return cfg.vehicles.map((v) => {
      const r = cfg.rules.find((x) => x.vehicle_type === v.code);
      return { v, reason: r ? ineligibilityReason(v, pkg, distance) : "Not available", quote: r ? quoteFor(v, r, pkg, distance, scheduled) : null };
    });
  }, [cfg, pkg, distance, scheduled]);
  const recommended = cfg ? recommendVehicle(cfg.vehicles, cfg.rules, pkg, distance, scheduled) : null;
  const chosen = options.find((o) => o.v.code === vehicle && !o.reason);

  function next() {
    let err: string | null = null;
    if (step === 0) err = stopError(pickup);
    if (step === 1) {
      err = stopError(dropoff);
      if (!err && distance < 0.2 && pickup.area === dropoff.area && pickup.street.trim() === dropoff.street.trim()) err = "Pickup and drop-off look identical.";
    }
    if (step === 2) {
      if (pkg.description.trim().length < 2) err = "Describe what you're sending.";
      else if ([pkg.weight_kg, pkg.length_cm, pkg.width_cm, pkg.height_cm, pkg.quantity].some((n) => !(n > 0))) err = "Weight, size and quantity must be above zero.";
      if (!err && recommended && !chosen) setVehicle(recommended);
      if (!err && !recommended) err = "No vehicle can carry this package. Try splitting it into smaller items.";
    }
    if (step === 3 && !chosen) err = "Choose an available vehicle.";
    if (step === 4 && scheduled) {
      if (!at) err = "Pick a date and time.";
      else if (new Date(at).getTime() < Date.now() + 15 * 60_000) err = "Schedule at least 15 minutes from now.";
    }
    if (err) { toast.error(err); return; }
    setStep(step + 1);
  }

  async function confirm() {
    if (!chosen) return;
    setBusy(true);
    try {
      const toStop = (s: Stop) => ({ address: `${s.street.trim()}, ${s.area}`, lat: s.lat!, lng: s.lng!, contact_name: s.contact_name, contact_phone: s.contact_phone, instructions: s.instructions });
      const res = await createDeliveryOrder({
        data: {
          client_request_id: requestId,
          pickup: toStop(pickup),
          dropoff: toStop(dropoff),
          pkg: {
            category: pkg.category, description: pkg.description, weight_kg: pkg.weight_kg, length_cm: pkg.length_cm, width_cm: pkg.width_cm, height_cm: pkg.height_cm,
            quantity: pkg.quantity, fragile: pkg.fragile, instructions: pkg.instructions,
            declared_value_minor: pkg.declared_value ? Math.round(Number(pkg.declared_value) * 100) : undefined,
          },
          vehicle_type: chosen.v.code,
          scheduled_for: scheduled ? new Date(at).toISOString() : null,
        },
      });
      navigate({ to: "/app/order/$id", params: { id: res.id }, replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Booking failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || !cfg) return <CourierLoader label="Loading prices…" />;

  if (stage === "map") {
    const fromP = pickup.lat != null ? { lat: pickup.lat, lng: pickup.lng! } : null;
    const toP = dropoff.lat != null ? { lat: dropoff.lat, lng: dropoff.lng! } : null;
    const setPlace = (which: "from" | "to", name: string, lat: number, lng: number) => {
      if (which === "from") { setPickup((p) => ({ ...p, area: name, lat, lng })); setEditing("to"); }
      else setDropoff((p) => ({ ...p, area: name, lat, lng }));
      setQuery((q) => ({ ...q, [which]: name }));
      setTyping(null); setSugs([]);
      saveRecent({ name, detail: "Recent", lat, lng });
    };
    const pinAt = async (which: "from" | "to", lat: number, lng: number) => {
      setPlace(which, "Finding address…", lat, lng);
      if (which === "from") setEditing("from");
      const n = await reverseName(lat, lng);
      if (n) {
        if (which === "from") setPickup((p) => (p.lat === lat ? { ...p, area: n } : p));
        else setDropoff((p) => (p.lat === lat ? { ...p, area: n } : p));
        setQuery((q) => ({ ...q, [which]: n }));
        saveRecent({ name: n, detail: "Pinned on map", lat, lng });
      }
    };
    const locate = () => navigator.geolocation?.getCurrentPosition(
      (p) => pinAt("from", p.coords.latitude, p.coords.longitude),
      () => toast.error("We couldn't get your location. Pick a place instead."),
      { timeout: 8000 },
    );
    const both = fromP && toP;
    return (
      <div className="fixed inset-0 z-[1000] mx-auto max-w-md bg-secondary">
        <ClientOnly fallback={null}><Suspense fallback={null}>
          <LiveMap from={fromP} to={toP} focus={pinMode ? (editing === "from" ? fromP : toP) : null} onPick={(pt) => { if (pinMode) pinAt(editing, pt.lat, pt.lng); }} />
        </Suspense></ClientOnly>
        <Link to="/app" aria-label="Back" className="absolute left-4 top-4 z-[500] grid h-11 w-11 place-items-center rounded-full bg-card shadow-float"><ArrowLeft className="h-5 w-5" /></Link>
        <button onClick={locate} aria-label="Use my location" className="group absolute right-4 top-4 z-[500] grid h-12 w-12 place-items-center rounded-2xl bg-card shadow-float transition active:scale-90"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary-deep ring-4 ring-primary/10"><LocateArrow className="h-5 w-5" /></span></button>
        {pinMode && (
          <div className="absolute inset-x-0 bottom-0 z-[600] rounded-t-[2rem] bg-card p-5 pb-6 shadow-float">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">{editing === "from" ? "Pickup address" : "Drop-off address"}</p>
            <div className="mt-2 flex items-center gap-3">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary-foreground", editing === "from" ? "bg-primary" : "bg-sky")}>{editing === "from" ? <Package className="h-5 w-5" /> : <Flag className="h-5 w-5" />}</span>
              <span className="min-w-0 flex-1 font-display text-lg font-extrabold leading-tight">{(editing === "from" ? fromP : toP) ? query[editing] : <span className="text-muted-foreground">Tap the map to choose</span>}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="h-12 flex-1" onClick={() => setPinMode(false)}>Back</Button>
              <Button variant="zippy" className="h-12 flex-[2]" disabled={!(editing === "from" ? fromP : toP)} onClick={() => { setPinMode(false); if (editing === "from" && !toP) setEditing("to"); }}>Confirm {editing === "from" ? "pickup" : "drop-off"}</Button>
            </div>
          </div>
        )}
        <div className={cn("absolute inset-x-0 bottom-0 z-[500] max-h-[75%] overflow-y-auto rounded-t-[2rem] bg-card p-4 pb-6 shadow-float transition", pinMode && "pointer-events-none translate-y-full opacity-0")}>
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
          <div className="rounded-3xl bg-muted p-1.5">
            {(["from", "to"] as const).map((w) => (
              <div key={w} className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2 transition", (typing ?? editing) === w && "bg-card shadow-card")}>
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl text-primary-foreground", w === "from" ? "bg-primary" : "bg-sky")}>{w === "from" ? <Package className="h-4 w-4" /> : <Flag className="h-4 w-4" />}</span>
                <input
                  value={query[w]}
                  onFocus={(e) => { setEditing(w); setTyping(w); e.currentTarget.select(); }}
                  onChange={(e) => setQuery({ ...query, [w]: e.target.value })}
                  placeholder={w === "from" ? "Pickup point" : "Where to?"}
                  className="h-9 min-w-0 flex-1 bg-transparent font-bold outline-none placeholder:text-muted-foreground"
                />
                <button type="button" aria-label={`Pick ${w === "from" ? "pickup" : "drop-off"} on map`} onClick={() => { setEditing(w); setTyping(null); setSugs([]); setPinMode(true); }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <MapIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {typing && (
            <div className="mt-2">
              {typing === "from" && (
                <button onClick={locate} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-muted">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary-deep"><LocateArrow className="h-4 w-4" /></span>
                  <span className="font-bold">Use my current location</span>
                </button>
              )}
              {searching && <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Searching…</div>}
              {!searching && activeQ.trim().length >= 1 && sugs.length === 0 && <div className="px-3 py-3 text-sm text-muted-foreground">No places found. Try another name or pick on the map.</div>}
              {sugs.map((sg) => (
                <button key={`${sg.lat},${sg.lng}`} onClick={() => setPlace(typing, sg.name, sg.lat, sg.lng)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-muted">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted"><MapPin className="h-4 w-4" /></span>
                  <span className="min-w-0"><span className="block truncate font-bold">{sg.name}</span><span className="block truncate text-xs text-muted-foreground">{sg.detail}</span></span>
                </button>
              ))}
              {activeQ.trim().length < 1 && recents.length > 0 && (
                <>
                  <p className="px-3 pb-1 pt-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">Recent places</p>
                  {recents.map((sg) => (
                    <button key={`r${sg.lat},${sg.lng}`} onClick={() => setPlace(typing, sg.name, sg.lat, sg.lng)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-muted">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun/25 text-sun-foreground"><History className="h-4 w-4" /></span>
                      <span className="min-w-0"><span className="block truncate font-bold">{sg.name}</span><span className="block truncate text-xs text-muted-foreground">{sg.detail}</span></span>
                    </button>
                  ))}
                </>
              )}
              {activeQ.trim().length < 1 && recents.length === 0 && <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground"><Search className="h-3.5 w-3.5" />Type a few letters of a place, street or landmark</div>}
            </div>
          )}
          {typing ? null : !both ? (
            <div className="mt-3">
            </div>
          ) : !typePicked ? (
            <div className="mt-4">
              <p className="px-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">What are you sending?</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => pickType(c)} className="flex flex-col items-center gap-1 rounded-2xl border-2 border-border bg-card px-2 py-3 transition active:scale-95">
                    <span className="text-2xl">{PRESETS[c]!.emoji}</span>
                    <span className="text-center text-xs font-bold leading-tight">{c}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <button type="button" onClick={() => setTypePicked(false)} className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">{PRESETS[pkg.category]!.emoji} {pkg.category} · ~{pkg.weight_kg} kg · Change</button>
              <div className="max-h-[11.5rem] space-y-2 overflow-y-auto">
                {options.filter((o) => !o.reason).map(({ v, quote }) => {
                  const sel = (vehicle ?? recommended) === v.code;
                  const eta = quote ? new Date(Date.now() + quote.duration_min * 60_000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                  return (
                    <button key={v.code} onClick={() => setVehicle(v.code)} className={cn("relative flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left transition active:scale-[0.98]", sel ? "border-primary bg-secondary" : "border-border bg-card")}>
                      <img src={VEHICLE_ART[v.code]} alt={v.name} loading="lazy" className="h-12 w-16 object-contain" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-extrabold">{v.name}</span>
                          {recommended === v.code && <span className="rounded-full bg-sun px-2 py-0.5 text-[10px] font-extrabold text-sun-foreground">Best fit</span>}
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground">{quote?.duration_min} min · arrives ~{eta}</div>
                      </div>
                      <div className="font-display font-extrabold">{quote ? money(quote.total_minor, quote.currency) : "—"}</div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">≈ {distance} km · final price confirmed after package details</p>
              <Button variant="zippy" size="xl" className="mt-3 w-full" onClick={() => {
                const pick = vehicle ?? recommended;
                if (!pick) { toast.error("No vehicle available for this trip."); return; }
                setVehicle(pick); setStage("form"); setStep(0);
              }}>Continue</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center gap-3">
        {step === 0 ? (
          <button aria-label="Back" onClick={() => setStage("map")} className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-card"><ArrowLeft className="h-5 w-5" /></button>
        ) : (
          <button aria-label="Back" onClick={() => setStep(step - 1)} className="grid h-10 w-10 place-items-center rounded-2xl bg-card shadow-card"><ArrowLeft className="h-5 w-5" /></button>
        )}
        <div className="flex-1"><StepProgress step={step} total={STEPS.length} /></div>
      </div>
      <h1 className="mt-5 text-2xl font-extrabold">
        {["Where should we pick up?", "Where's it going?", "What are we sending?", "Pick your ride", "When should we go?", "Review your delivery"][step]}
      </h1>
      <p className="mb-5 text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>

      <div key={step} className="animate-bounce-in">
        {step === 0 && <StopForm kind="pickup" value={pickup} onChange={setPickup} />}
        {step === 1 && <StopForm kind="dropoff" value={dropoff} onChange={setDropoff} />}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setPkg({ ...pkg, category: c })} className={cn("rounded-full border-2 px-4 py-2 text-sm font-bold transition", pkg.category === c ? "border-primary bg-secondary text-secondary-foreground" : "border-border bg-card")}>{c}</button>
              ))}
            </div>
            <Field label="Description"><input className={inputCls} value={pkg.description} onChange={(e) => setPkg({ ...pkg, description: e.target.value })} placeholder="e.g. Signed contract in an envelope" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Weight (kg, each)"><input className={inputCls} type="number" min={0.1} step={0.1} value={pkg.weight_kg} onChange={(e) => setPkg({ ...pkg, weight_kg: Number(e.target.value) })} /></Field>
              <Field label="Quantity"><input className={inputCls} type="number" min={1} value={pkg.quantity} onChange={(e) => setPkg({ ...pkg, quantity: Math.floor(Number(e.target.value)) })} /></Field>
            </div>
            <Field label="Size (cm) — L × W × H">
              <div className="grid grid-cols-3 gap-2">
                {(["length_cm", "width_cm", "height_cm"] as const).map((k) => (
                  <input key={k} aria-label={k} className={inputCls} type="number" min={1} value={pkg[k]} onChange={(e) => setPkg({ ...pkg, [k]: Number(e.target.value) })} />
                ))}
              </div>
            </Field>
            <label className="flex items-center justify-between rounded-2xl border-2 border-border bg-card px-4 py-3 font-bold">
              Fragile item
              <input type="checkbox" className="h-6 w-6 accent-[var(--color-primary)]" checked={pkg.fragile} onChange={(e) => setPkg({ ...pkg, fragile: e.target.checked })} />
            </label>
            <Field label="Declared value (K, optional)"><input className={inputCls} type="number" min={0} value={pkg.declared_value} onChange={(e) => setPkg({ ...pkg, declared_value: e.target.value })} /></Field>
            <Field label="Special handling (optional)"><input className={inputCls} value={pkg.instructions} onChange={(e) => setPkg({ ...pkg, instructions: e.target.value })} /></Field>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Trip distance ≈ {distance} km</p>
            {options.map(({ v, reason, quote }) => {
              const sel = vehicle === v.code && !reason;
              return (
                <button key={v.code} disabled={!!reason} onClick={() => setVehicle(v.code)} className={cn("relative flex w-full items-center gap-3 rounded-3xl border-2 bg-card p-3 text-left transition", sel ? "border-primary bg-secondary animate-bounce-in" : "border-border", reason && "opacity-55")}>
                  {recommended === v.code && <span className="absolute -top-2.5 right-4 rounded-full bg-sun px-2.5 py-0.5 text-[11px] font-extrabold text-sun-foreground">Recommended</span>}
                  <img src={VEHICLE_ART[v.code]} alt="" className="h-20 w-20 object-contain" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-lg font-extrabold">{v.name}</span>
                      {quote && !reason && <span className="font-display font-extrabold">{money(quote.total_minor, quote.currency)}</span>}
                    </div>
                    <div className="text-sm text-muted-foreground">{v.tagline}</div>
                    {reason ? <div className="mt-1 text-xs font-bold text-destructive">{reason}</div> : (
                      <div className="mt-1 flex flex-wrap gap-x-3 text-xs font-semibold text-muted-foreground">
                        <span>Up to {v.max_weight_kg} kg</span><span>~{quote?.duration_min} min trip</span>
                      </div>
                    )}
                  </div>
                  {sel && <Check className="h-6 w-6 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3">
            {([["now", "Deliver now", "A driver heads out right away.", Clock], ["later", "Schedule for later", "Pick a date and time.", CalendarClock]] as const).map(([k, t, b, Icon]) => (
              <button key={k} onClick={() => setWhen(k)} className={cn("flex w-full items-center gap-4 rounded-3xl border-2 bg-card p-4 text-left", when === k ? "border-primary bg-secondary" : "border-border")}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-muted"><Icon className="h-6 w-6" /></span>
                <div><div className="font-display font-extrabold">{t}</div><div className="text-sm text-muted-foreground">{b}</div></div>
              </button>
            ))}
            {scheduled && <Field label="Date & time"><input type="datetime-local" className={inputCls} value={at} onChange={(e) => setAt(e.target.value)} /></Field>}
          </div>
        )}
        {step === 5 && chosen?.quote && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><div className="text-xs font-bold text-muted-foreground">PICKUP</div><div className="font-bold">{pickup.street}, {pickup.area}</div><div className="text-sm text-muted-foreground">{pickup.contact_name} · {pickup.contact_phone}</div></div></div>
              <div className="ml-2.5 my-1 h-6 border-l-2 border-dashed border-border" />
              <div className="flex gap-3"><Flag className="mt-0.5 h-5 w-5 shrink-0 text-sky" /><div><div className="text-xs font-bold text-muted-foreground">DROP-OFF</div><div className="font-bold">{dropoff.street}, {dropoff.area}</div><div className="text-sm text-muted-foreground">{dropoff.contact_name} · {dropoff.contact_phone}</div></div></div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <img src={VEHICLE_ART[chosen.v.code]} alt="" className="h-14 w-14 object-contain" />
              <div className="flex-1">
                <div className="font-display font-extrabold">{chosen.v.name} · {pkg.category}</div>
                <div className="text-sm text-muted-foreground">{pkg.quantity} × {pkg.weight_kg} kg{pkg.fragile ? " · Fragile" : ""} · {scheduled ? new Date(at).toLocaleString() : "Now"}</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-2 flex justify-between text-sm text-muted-foreground"><span>≈ {chosen.quote.distance_km} km</span><span>≈ {chosen.quote.duration_min} min</span></div>
              {chosen.quote.lines.map((l) => (
                <div key={l.label} className="flex justify-between py-1 text-sm"><span>{l.label}</span><span className="font-semibold">{money(l.amount_minor, chosen.quote!.currency)}</span></div>
              ))}
              <div className="mt-2 flex justify-between border-t border-border pt-3 font-display text-lg font-extrabold"><span>Total</span><span>{money(chosen.quote.total_minor, chosen.quote.currency)}</span></div>
              <p className="mt-2 text-xs text-muted-foreground">Pay your driver in cash on delivery for now. Online payments arrive in a later update.</p>
            </Card>
          </div>
        )}
      </div>

      <div className="sticky bottom-24 mt-6 pb-2">
        {step < 5 ? (
          <Button variant="zippy" size="xl" className="w-full" onClick={next}>Continue</Button>
        ) : (
          <Button variant="zippy" size="xl" className="w-full" disabled={busy || !acc} onClick={confirm}>{busy ? "Booking…" : "Confirm Delivery"}</Button>
        )}
      </div>
    </div>
  );
}
