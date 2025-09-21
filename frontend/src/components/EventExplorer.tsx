import { useEffect, useMemo, useRef, useState } from "react";
// Lazy-import mapbox-gl for smaller initial bundle
type MapboxType = typeof import("mapbox-gl");
let mapboxgl: MapboxType | null = null;
// import CSS only once map is mounted to avoid SSR issues (Vite SPA is fine)
import { EventItem } from "@/types/events";

type EventExplorerProps = {
  events: EventItem[];
  centerLocationText?: string;
};

type GeocodedEvent = EventItem & { latitude?: number; longitude?: number };

const geocodeCache = new Map<string, { lat: number; lng: number }>();

async function geocodeAddress(address: string, token: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null;
  const key = address.toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;
  try {
    // Bias to Australia if string hints Canberra/ACT, otherwise let Mapbox decide
    const proximity = /canberra|griffith|act\b/i.test(address) ? "&proximity=149.1286,-35.2809" : "";
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?limit=1&language=en${proximity}&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    if (feature && Array.isArray(feature.center)) {
      const [lng, lat] = feature.center;
      const coords = { lat, lng };
      geocodeCache.set(key, coords);
      return coords;
    }
  } catch (_) {}
  return null;
}

export function EventExplorer({ events, centerLocationText }: EventExplorerProps) {
  const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markersRef = useRef<import("mapbox-gl").Marker[]>([]);
  const popupsRef = useRef<import("mapbox-gl").Popup[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [geocodedEvents, setGeocodedEvents] = useState<GeocodedEvent[]>(events);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setGeocodedEvents(events);
  }, [events]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const run = async () => {
      const uniqueAddresses = Array.from(
        new Set(
          events.map((e) => (e.address?.trim() ? e.address.trim() : e.locationText?.trim() || "")).filter(Boolean)
        )
      );
      await Promise.all(
        uniqueAddresses.map(async (addr) => {
          await geocodeAddress(addr, token);
        })
      );
      const enriched = await Promise.all(
        events.map(async (e) => {
          const addr = e.address?.trim() ? e.address.trim() : e.locationText?.trim();
          if (!addr) return e;
          const coords = await geocodeCache.get(addr.toLowerCase());
          return coords ? { ...e, latitude: coords.lat, longitude: coords.lng } : e;
        })
      );
      if (!cancelled) setGeocodedEvents(enriched);

      if (centerLocationText && !cancelled) {
        const center = await geocodeAddress(centerLocationText, token);
        if (!cancelled) setCenterCoords(center);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [events, centerLocationText, token]);

  const initialCenter = useMemo(() => {
    if (centerCoords) return centerCoords;
    const firstWithCoords = geocodedEvents.find((e) => e.latitude && e.longitude);
    if (firstWithCoords) return { lat: firstWithCoords.latitude!, lng: firstWithCoords.longitude! };
    // default to Sydney
    return { lat: -33.8688, lng: 151.2093 };
  }, [centerCoords, geocodedEvents]);

  useEffect(() => {
    if (!token) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;
    const containerEl = mapContainerRef.current;
    (async () => {
      if (!mapboxgl) {
        const m = await import("mapbox-gl");
        mapboxgl = (m as unknown as MapboxType) || (m.default as unknown as MapboxType);
        await import("mapbox-gl/dist/mapbox-gl.css");
      }
      if (!mapboxgl) return;
      // mapbox-gl types sometimes export accessToken on default namespace
      (mapboxgl as any).accessToken = token;
      const map = new mapboxgl.Map({
        container: containerEl!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialCenter.lng, initialCenter.lat],
      zoom: 11,
      attributionControl: true,
      });
      mapRef.current = map;
    })();
    return () => {
      if (mapRef.current) {
        markersRef.current.forEach((m) => m.remove());
        popupsRef.current.forEach((p) => p.remove());
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token, initialCenter]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    popupsRef.current.forEach((p) => p.remove());
    markersRef.current = [];
    popupsRef.current = [];

    geocodedEvents.forEach((e, idx) => {
      if (typeof e.latitude !== "number" || typeof e.longitude !== "number") return;
      if (!mapboxgl) return;
      const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
        `<div style="font-size:12px"><div style="font-weight:600;margin-bottom:4px">${
          e.name
        }</div><div>${e.timeText || ""}</div><div style="margin-top:4px">${
          e.locationText || ""
        }</div><div style="margin-top:6px"><a href="${e.link}" target="_blank" rel="noopener noreferrer">Open Link</a></div></div>`
      );
      const marker = new mapboxgl.Marker({ color: idx === selectedIndex ? "#3b82f6" : "#ef4444" })
        .setLngLat([e.longitude, e.latitude])
        .setPopup(popup)
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        setSelectedIndex(idx);
        popup.addTo(map);
      });
      markersRef.current.push(marker);
      popupsRef.current.push(popup);
    });

    if (selectedIndex != null) {
      const e = geocodedEvents[selectedIndex];
      if (e && typeof e.latitude === "number" && typeof e.longitude === "number") {
        map.flyTo({ center: [e.longitude, e.latitude], zoom: 13 });
        const popup = popupsRef.current[selectedIndex];
        if (popup) popup.addTo(map);
      }
    }
  }, [geocodedEvents, selectedIndex]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !centerCoords) return;
    map.flyTo({ center: [centerCoords.lng, centerCoords.lat], zoom: 12 });
  }, [centerCoords]);

  return (
    <div className="w-full">
      {!token ? (
        <div className="text-sm text-red-400 p-3 border border-red-500/40 rounded">
          Missing VITE_MAPBOX_TOKEN. Add it to your frontend env to enable the map.
        </div>
      ) : (
        <div className="flex gap-3 w-full" style={{ minHeight: 420 }}>
          <div className="w-1/4 min-w-[220px] bg-neutral-700 rounded p-3 overflow-y-auto">
            <div className="text-sm font-semibold mb-2">Events</div>
            <div className="space-y-2">
              {geocodedEvents.map((e, idx) => (
                <button
                  key={`${e.name}-${idx}`}
                  className={`w-full text-left p-2 rounded ${
                    selectedIndex === idx ? "bg-neutral-600" : "bg-neutral-800 hover:bg-neutral-700"
                  }`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <div className="text-xs text-neutral-300">{e.timeText}</div>
                  <div className="text-sm font-medium text-neutral-100 line-clamp-2">{e.name}</div>
                  <div className="text-xs text-neutral-400 line-clamp-1">{e.locationText}</div>
                </button>
              ))}
              {geocodedEvents.length === 0 && (
                <div className="text-xs text-neutral-300">No events found.</div>
              )}
            </div>
          </div>
          <div className="flex-1 rounded overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full min-h-[420px] rounded" />
          </div>
        </div>
      )}
    </div>
  );
}


