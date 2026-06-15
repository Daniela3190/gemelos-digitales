"use client";

import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet.heat";
import type { Viaje, ViajeEventos, GridCell } from "@/lib/types";
import { EVENTO_CONFIG } from "@/lib/utils";

// ── Heat map layer (leaflet.heat, canvas-based) ──────────────────────────────
function HeatMapLayer({
  cells,
  showLeve,
  showGrave,
  showMortal,
  visible,
}: {
  cells: GridCell[];
  showLeve: boolean;
  showGrave: boolean;
  showMortal: boolean;
  visible: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!visible || cells.length === 0) return;

    const pts: [number, number, number][] = [];
    for (const [lat, lon, l, g, m] of cells) {
      const w =
        (showLeve ? l * 0.3 : 0) +
        (showGrave ? g * 0.7 : 0) +
        (showMortal ? m * 1.0 : 0);
      if (w > 0) pts.push([lat, lon, w]);
    }

    const layer = L.heatLayer(pts, {
      radius: 22,
      blur: 18,
      maxZoom: 17,
      max: 8,
      minOpacity: 0.04,
      gradient: {
        0.0: "rgba(34,197,94,0)",
        0.25: "rgba(250,204,21,0.7)",
        0.55: "rgba(249,115,22,0.9)",
        0.75: "rgba(239,68,68,1.0)",
        1.0:  "rgba(127,29,29,1.0)",
      },
    }).addTo(map);

    return () => { map.removeLayer(layer); };
  }, [map, cells, showLeve, showGrave, showMortal, visible]);

  return null;
}

// ── Warning icon (⚠️ at pre-computed danger spots) ──────────────────────────
const warnIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:16px;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.95));cursor:pointer">⚠️</div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ── Main component ───────────────────────────────────────────────────────────
type Props = {
  viajes: Viaje[];
  eventos: Record<string, ViajeEventos>;
  center: [number, number];
  warningPoints: [number, number][];
};

export default function MapaRutas({ viajes, eventos, center, warningPoints }: Props) {
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [showHeat, setShowHeat] = useState(true);
  const [showLeve, setShowLeve] = useState(true);
  const [showGrave, setShowGrave] = useState(true);
  const [showMortal, setShowMortal] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  useEffect(() => {
    fetch("/data/siniestros_grid.json")
      .then((r) => r.json())
      .then((data: GridCell[]) => setGrid(data))
      .catch(console.error);
  }, []);

  const tripPaths = useMemo(
    () => viajes.filter((v) => v.path && v.path.length > 1),
    [viajes]
  );

  const eventoPaths = useMemo(() => {
    const result: { key: string; path: [number, number][]; color: string }[] = [];
    let idx = 0;
    for (const ev of Object.values(eventos)) {
      for (const [tipo, cfg] of Object.entries(EVENTO_CONFIG)) {
        const evData = (ev as unknown as Record<string, { paths: { path: [number, number][] }[] }>)[tipo];
        if (!evData?.paths) continue;
        for (const p of evData.paths) {
          if (p.path && p.path.length > 1) {
            result.push({ key: `${tipo}-${idx++}`, path: p.path, color: cfg.color });
          }
        }
      }
    }
    return result;
  }, [eventos]);

  const pill = (active: boolean, accent: string) =>
    ({
      background: active ? accent : "rgba(15,23,42,0.6)",
      color: active ? "#fff" : "#475569",
      border: `1px solid ${active ? accent : "rgba(255,255,255,0.06)"}`,
      borderRadius: 5,
      padding: "3px 9px",
      fontSize: 11,
      cursor: "pointer" as const,
      transition: "all 0.15s",
    } as const);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        zoomControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; CARTO"
          subdomains="abcd"
          maxZoom={19}
        />

        <HeatMapLayer
          cells={grid}
          showLeve={showLeve}
          showGrave={showGrave}
          showMortal={showMortal}
          visible={showHeat}
        />

        {showRoutes &&
          tripPaths.map((v) => (
            <Polyline
              key={v.id}
              positions={v.path}
              pathOptions={{ color: "#3b82f6", weight: 2, opacity: 0.45 }}
            />
          ))}

        {showEvents &&
          eventoPaths.map(({ key, path, color }) => (
            <Polyline
              key={key}
              positions={path}
              pathOptions={{ color, weight: 4, opacity: 0.9 }}
            />
          ))}

        {showWarnings &&
          warningPoints.map(([lat, lon], i) => (
            <Marker key={i} position={[lat, lon]} icon={warnIcon} />
          ))}
      </MapContainer>

      {/* Controls overlay */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontFamily: "system-ui",
        }}
      >
        {/* Heat map panel */}
        <div
          style={{
            background: "rgba(10,18,30,0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: 10,
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7 }}>
            Mapa de calor · CABA
          </div>

          <button
            onClick={() => setShowHeat((v) => !v)}
            style={{
              ...pill(showHeat, "rgba(239,68,68,0.85)"),
              width: "100%",
              marginBottom: 6,
            }}
          >
            🔥 {showHeat ? "Ocultar" : "Mostrar"} calor ({grid.length.toLocaleString()} celdas)
          </button>

          {showHeat && (
            <>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                <button onClick={() => setShowLeve((v) => !v)} style={pill(showLeve, "#eab308")}>Leve</button>
                <button onClick={() => setShowGrave((v) => !v)} style={pill(showGrave, "#f97316")}>Grave</button>
                <button onClick={() => setShowMortal((v) => !v)} style={pill(showMortal, "#ef4444")}>Mortal</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 9, color: "#334155" }}>bajo</span>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: "linear-gradient(to right,rgba(250,204,21,0.7),rgba(249,115,22,0.9),rgba(239,68,68,1),rgba(127,29,29,1))" }} />
                <span style={{ fontSize: 9, color: "#334155" }}>alto</span>
              </div>
            </>
          )}
        </div>

        {/* Routes & alerts panel */}
        <div
          style={{
            background: "rgba(10,18,30,0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: 10,
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
            Capas del gemelo
          </div>
          <button onClick={() => setShowRoutes((v) => !v)} style={pill(showRoutes, "#3b82f6")}>― Trayectos</button>
          <button onClick={() => setShowEvents((v) => !v)} style={pill(showEvents, "#f97316")}>― Eventos</button>
          <button onClick={() => setShowWarnings((v) => !v)} style={pill(showWarnings, "#eab308")}>
            ⚠️ Alertas de ruta ({warningPoints.length})
          </button>
        </div>

        {/* Mini legend */}
        <div
          style={{
            background: "rgba(10,18,30,0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: 10,
            padding: "8px 10px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {[
            { c: "#3b82f6", l: "Trayecto" },
            { c: "#dc2626", l: "Velocidad" },
            { c: "#ef4444", l: "Frenada" },
            { c: "#f97316", l: "Aceleración" },
            { c: "#eab308", l: "Teléfono" },
          ].map(({ c, l }) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <div style={{ width: 14, height: 3, background: c, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#64748b" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
