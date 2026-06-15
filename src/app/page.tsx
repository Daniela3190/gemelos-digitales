import { readFileSync } from "fs";
import path from "path";
import Link from "next/link";
import type { User, Asistencia, ExposureData } from "@/lib/types";
import { getUserShortId, scoreColor, scoreLabel } from "@/lib/utils";
import { computeProbabilidadSiniestro } from "@/lib/siniestro";
import { computeProbabilidadAsistencia } from "@/lib/asistencia";
import MapaUniversoClient from "@/components/MapaUniversoClient";

function readData<T>(filename: string): T {
  const dir = path.join(process.cwd(), "public", "data");
  return JSON.parse(readFileSync(path.join(dir, filename), "utf-8"));
}

const card = {
  background: "#1e293b",
  borderRadius: 12,
  padding: 16,
  border: "1px solid rgba(255,255,255,0.06)",
  cursor: "pointer",
  display: "block",
  textDecoration: "none",
  color: "inherit",
  position: "relative" as const,
} as const;

export type Indicadores = Record<
  string,
  {
    siniestro: number;
    siniestroCategory: string;
    siniestroColor: string;
    asistencia: number;
    asistenciaCategory: string;
    asistenciaColor: string;
  }
>;

export default function HomePage() {
  const users = readData<User[]>("users.json");

  // Compute both indicators for all users server-side (small files only)
  const indicadores: Indicadores = {};
  for (const user of users) {
    const shortId = getUserShortId(user.id);
    const asistencias = readData<Asistencia[]>(`asistencias_${shortId}.json`);
    const exposure = readData<ExposureData>(`exposure_${shortId}.json`);
    const sin = computeProbabilidadSiniestro(user, exposure, asistencias);
    const asist = computeProbabilidadAsistencia(user, exposure, asistencias);
    indicadores[shortId] = {
      siniestro: sin.probability,
      siniestroCategory: sin.category,
      siniestroColor: sin.color,
      asistencia: asist.probability,
      asistenciaCategory: asist.category,
      asistenciaColor: asist.color,
    };
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            Gemelos Digitales
          </h1>
          <p style={{ fontSize: 12, color: "#475569", margin: 0, marginTop: 2 }}>
            Panel de conducción · Swiss Medical Seguros
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#475569" }}>
            {users.length} asegurados activos
          </span>
          <div
            className="pulse"
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}
          />
        </div>
      </header>

      {/* Layout: sidebar + map */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - 57px)" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 360,
            flexShrink: 0,
            overflowY: "auto",
            padding: 16,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#475569",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            Gemelos activos
          </div>

          {users.map((user) => {
            const score = user.score_promedio?.general ?? 0;
            const color = scoreColor(score);
            const shortId = getUserShortId(user.id);
            const ind = indicadores[shortId];

            return (
              <Link key={user.id} href={`/gemelo/${shortId}`} style={card}>
                {/* Score circle */}
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    border: `3px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0f172a",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color }}>{score}</span>
                </div>

                {/* Name + vehicle */}
                <div
                  style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 3, paddingRight: 64 }}
                >
                  {user.nombre}
                </div>
                <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>
                  {user.vehiculo?.modelo} · {user.dispositivo}
                </div>

                {/* Mini scores */}
                <div style={{ display: "flex", gap: 6 }}>
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
                        padding: "6px 4px",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 600, color: scoreColor(s) }}>{s}</div>
                      <div style={{ fontSize: 10, color: "#334155" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Dual indicator row */}
                {ind && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        background: "#0f172a",
                        borderRadius: 6,
                        padding: "5px 8px",
                        border: `1px solid ${ind.siniestroColor}25`,
                      }}
                    >
                      <div style={{ fontSize: 9, color: "#334155", marginBottom: 1 }}>🚨 Siniestro</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: ind.siniestroColor }}>
                        {ind.siniestroCategory} · {ind.siniestro}%
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: "#0f172a",
                        borderRadius: 6,
                        padding: "5px 8px",
                        border: `1px solid ${ind.asistenciaColor}25`,
                      }}
                    >
                      <div style={{ fontSize: 9, color: "#334155", marginBottom: 1 }}>🔧 Asistencia</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: ind.asistenciaColor }}>
                        {ind.asistenciaCategory} · {ind.asistencia}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "#334155",
                  }}
                >
                  <span>{user.total_viajes} viajes registrados</span>
                  <span style={{ color }}>{scoreLabel(score)}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: "relative" }}>
          <MapaUniversoClient users={users} indicadores={indicadores} />
        </div>
      </div>
    </div>
  );
}
