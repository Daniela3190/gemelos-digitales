"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import type { User } from "@/lib/types";
import type { Indicadores } from "@/app/page";
import { getUserShortId, scoreColor, scoreLabel } from "@/lib/utils";

// Fix Leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createScoreIcon(score: number): L.DivIcon {
  const color = scoreColor(score);
  return L.divIcon({
    className: "",
    html: `<div style="
      background:#1e293b;
      border:3px solid ${color};
      border-radius:50%;
      width:52px;height:52px;
      display:flex;align-items:center;justify-content:center;
      color:${color};font-weight:700;font-size:15px;
      font-family:system-ui;
      box-shadow:0 2px 16px rgba(0,0,0,0.7);
      cursor:pointer;
    ">${score}</div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -32],
  });
}

export default function MapaUniverso({
  users,
  indicadores,
}: {
  users: User[];
  indicadores: Indicadores;
}) {
  const valid = users.filter((u) => u.lat != null && u.lon != null);

  return (
    <MapContainer
      center={[-37, -63]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      zoomControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      {valid.map((user) => {
        const score = user.score_promedio?.general ?? 0;
        const shortId = getUserShortId(user.id);
        const ind = indicadores[shortId];

        return (
          <Marker
            key={user.id}
            position={[user.lat!, user.lon!]}
            icon={createScoreIcon(score)}
          >
            <Popup>
              <div style={{ minWidth: 200, fontFamily: "system-ui" }}>
                {/* Name + vehicle */}
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: "#f1f5f9" }}>
                  {user.nombre}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                  {user.vehiculo?.modelo}
                </div>

                {/* Sub-scores */}
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {(
                    [
                      ["Atención", user.score_promedio?.atencion ?? 0],
                      ["Suavidad", user.score_promedio?.suavidad ?? 0],
                      ["Legal", user.score_promedio?.legal ?? 0],
                    ] as [string, number][]
                  ).map(([label, s]) => (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        background: "#0f172a",
                        borderRadius: 6,
                        padding: "5px 3px",
                      }}
                    >
                      <div style={{ color: scoreColor(s), fontWeight: 700, fontSize: 15 }}>{s}</div>
                      <div style={{ fontSize: 9, color: "#475569" }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: scoreColor(score),
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  {scoreLabel(score)}
                </div>

                {/* Dual risk indicators */}
                {ind && (
                  <>
                    <div
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        paddingTop: 10,
                        marginBottom: 10,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 6,
                      }}
                    >
                      {/* Indicator 1: Siniestro */}
                      <div
                        style={{
                          background: "#0f172a",
                          borderRadius: 7,
                          padding: "7px 8px",
                          textAlign: "center",
                          border: `1px solid ${ind.siniestroColor}25`,
                        }}
                      >
                        <div style={{ fontSize: 9, color: "#475569", marginBottom: 2 }}>
                          🚨 Siniestro
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: ind.siniestroColor,
                          }}
                        >
                          {ind.siniestroCategory}
                        </div>
                        <div style={{ fontSize: 10, color: "#334155" }}>
                          {ind.siniestro}%
                        </div>
                      </div>

                      {/* Indicator 2: Asistencia */}
                      <div
                        style={{
                          background: "#0f172a",
                          borderRadius: 7,
                          padding: "7px 8px",
                          textAlign: "center",
                          border: `1px solid ${ind.asistenciaColor}25`,
                        }}
                      >
                        <div style={{ fontSize: 9, color: "#475569", marginBottom: 2 }}>
                          🔧 Asistencia
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: ind.asistenciaColor,
                          }}
                        >
                          {ind.asistenciaCategory}
                        </div>
                        <div style={{ fontSize: 10, color: "#334155" }}>
                          {ind.asistencia}%
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Link */}
                <a
                  href={`/gemelo/${shortId}`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "#1d4ed8",
                    color: "white",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Ver gemelo →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
