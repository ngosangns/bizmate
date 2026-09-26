"use client";

import { useEffect, useState } from "react";
import type { Ward } from "../lib/load-state";

type Geo = Record<string, { lat: number; lng: number }>;

interface Props {
  wards: Ward[];
  wardGeo: Geo;
}

/**
 * Leaflet map of HCMC wards — flooded vs clear.
 * Client-only; fixture pins, not live GPS / SPX tracking.
 */
export default function FloodMap({ wards, wardGeo }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leafletMod: any = await import("leaflet");
      const L = leafletMod.default ?? leafletMod;
      if (cancelled) return;

      const el = document.getElementById("floodops-map");
      if (!el) return;
      // Avoid double-init in React strict mode
      if ((el as HTMLElement & { _leaflet_id?: number })._leaflet_id) {
        setReady(true);
        return;
      }

      const map = L.map(el).setView([10.78, 106.7], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · FloodOps sandbox pins',
        maxZoom: 18,
      }).addTo(map);

      for (const w of wards) {
        const g = wardGeo[w.id];
        if (!g) continue;
        const color = w.status === "flooded" ? "#e85d4c" : "#3dba7a";
        const marker = L.circleMarker([g.lat, g.lng], {
          radius: w.status === "flooded" ? 14 : 10,
          color,
          fillColor: color,
          fillOpacity: 0.75,
          weight: 2,
        }).addTo(map);
        marker.bindPopup(
          `<strong>${w.name}</strong><br/>` +
            `status: <b>${w.status}</b><br/>` +
            `flood: ${w.floodCm}cm<br/>` +
            `<em>fixture pin · not live GPS</em>`
        );
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [wards, wardGeo]);

  return (
    <div>
      <div id="floodops-map" className="map-wrap" />
      {!ready && <p className="muted">Đang tải bản đồ Leaflet…</p>}
      <div className="legend">
        <span className="flooded">flooded / ngập</span>
        <span className="dry">clear / khô</span>
      </div>
      <p className="muted" style={{ marginTop: "0.4rem" }}>
        Pin fixture HCMC · analogy last-mile (SPX-style) — không live tracking.
      </p>
    </div>
  );
}
