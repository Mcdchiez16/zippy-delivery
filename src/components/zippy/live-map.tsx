import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type P = { lat: number; lng: number } | null;
const PKG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>`;
const FLAG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4c5-3 9 3 16 0v10c-7 3-11-3-16 0"/></svg>`;
const pin = (color: string, svg: string, label: string) =>
  L.divIcon({ className: "", iconSize: [120, 60], iconAnchor: [60, 56], html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="background:#17251D;color:white;font:800 11px 'Plus Jakarta Sans',sans-serif;padding:3px 9px;border-radius:999px;margin-bottom:4px;box-shadow:0 4px 10px rgba(0,0,0,.2)">${label}</div><div style="width:30px;height:30px;border-radius:12px;background:${color};border:3px solid white;box-shadow:0 6px 14px rgba(0,0,0,.25);display:grid;place-items:center">${svg}</div></div>` });

// Browser-only map (OpenStreetMap tiles). Loaded lazily from the Send page.
export default function LiveMap({ from, to, onPick }: { from: P; to: P; onPick?: (p: { lat: number; lng: number }) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true }).setView([-15.4167, 28.2833], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19, className: "zippy-tiles" }).addTo(m);
    setTimeout(() => m.invalidateSize(), 200);
    layer.current = L.layerGroup().addTo(m);
    m.on("click", (e) => pickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
    map.current = m;
    return () => { m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const pts: L.LatLngExpression[] = [];
    if (from) { L.marker([from.lat, from.lng], { icon: pin("#58CC02", PKG, "Pickup") }).addTo(g); pts.push([from.lat, from.lng]); }
    if (to) { L.marker([to.lat, to.lng], { icon: pin("#35B7FF", FLAG, "Drop-off") }).addTo(g); pts.push([to.lat, to.lng]); }
    if (pts.length === 2) {
      m.fitBounds(L.latLngBounds(pts), { paddingTopLeft: [60, 80], paddingBottomRight: [60, 380] });
      const ac = new AbortController();
      // Free OSRM routing: draws the real road path between the two points.
      fetch(`https://router.project-osrm.org/route/v1/driving/${from!.lng},${from!.lat};${to!.lng},${to!.lat}?overview=full&geometries=geojson`, { signal: ac.signal })
        .then((r) => r.json())
        .then((d) => {
          const c = d?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
          const line: L.LatLngExpression[] = c ? c.map(([x, y]) => [y, x]) : pts;
          L.polyline(line, { color: "#17251D", weight: 9, opacity: 0.15, lineCap: "round", lineJoin: "round" }).addTo(g);
          L.polyline(line, { color: "#58CC02", weight: 5, lineCap: "round", lineJoin: "round" }).addTo(g);
          m.fitBounds(L.latLngBounds(line), { paddingTopLeft: [60, 80], paddingBottomRight: [60, 380] });
        })
        .catch(() => {});
      return () => ac.abort();
    } else if (pts.length === 1) m.setView(pts[0]!, 14);
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  return <div ref={el} className="absolute inset-0 z-0" />;
}
