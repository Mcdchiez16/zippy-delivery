import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type P = { lat: number; lng: number } | null;
const pin = (color: string, label: string) =>
  L.divIcon({ className: "", iconSize: [34, 34], iconAnchor: [17, 34], html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:4px solid white;box-shadow:0 6px 14px rgba(0,0,0,.25);display:grid;place-items:center"><span style="transform:rotate(45deg);color:white;font:800 12px sans-serif">${label}</span></div>` });

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
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { attribution: "© OpenStreetMap © CARTO", maxZoom: 19 }).addTo(m);
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
    if (from) { L.marker([from.lat, from.lng], { icon: pin("#58CC02", "A") }).addTo(g); pts.push([from.lat, from.lng]); }
    if (to) { L.marker([to.lat, to.lng], { icon: pin("#35B7FF", "B") }).addTo(g); pts.push([to.lat, to.lng]); }
    if (pts.length === 2) {
      L.polyline(pts, { color: "#2E8B20", weight: 5, dashArray: "2 10", lineCap: "round" }).addTo(g);
      m.fitBounds(L.latLngBounds(pts), { paddingTopLeft: [40, 60], paddingBottomRight: [40, 380] });
    } else if (pts.length === 1) m.setView(pts[0]!, 14);
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  return <div ref={el} className="absolute inset-0 z-0" />;
}
