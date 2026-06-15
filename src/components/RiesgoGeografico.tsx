import type { ExposureData } from "@/lib/types";

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 5, background: "#0f172a", borderRadius: 3, overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.min(100, pct)}%`,
          height: "100%",
          background: color,
          borderRadius: 3,
        }}
      />
    </div>
  );
}

export default function RiesgoGeografico({ exposure }: { exposure: ExposureData }) {
  const color =
    exposure.score >= 65
      ? "#ef4444"
      : exposure.score >= 35
      ? "#f97316"
      : "#22c55e";

  return (
    <div>
      {/* Score + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            border: `4px solid ${color}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 21, fontWeight: 700, color }}>{exposure.score}</div>
          <div style={{ fontSize: 9, color: "#334155" }}>/100</div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color, marginBottom: 3 }}>
            Exposición {exposure.label}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
            {exposure.pct_riesgo}% de sus rutas pasan<br />
            por zonas de alta siniestralidad
          </div>
        </div>
      </div>

      {/* Bar */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#475569",
            marginBottom: 4,
          }}
        >
          <span>% ruta en zona de riesgo</span>
          <span style={{ color, fontWeight: 600 }}>{exposure.pct_riesgo}%</span>
        </div>
        <Bar pct={exposure.pct_riesgo} color={color} />
      </div>

      {/* Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div
          style={{
            background: "#0f172a",
            borderRadius: 8,
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color }}>{exposure.viajes_riesgo}</div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>viajes en zona riesgo</div>
          <div style={{ fontSize: 9, color: "#334155" }}>de {exposure.total_viajes} total</div>
        </div>
        <div
          style={{
            background: "#0f172a",
            borderRadius: 8,
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, color }}>
            {exposure.warning_points.length}
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>zonas de riesgo</div>
          <div style={{ fontSize: 9, color: "#334155" }}>identificadas en rutas</div>
        </div>
      </div>

      {/* Note */}
      <div
        style={{
          padding: "8px 10px",
          background: "#0f172a",
          borderRadius: 8,
          fontSize: 11,
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        Basado en 62.787 siniestros viales de CABA (2019–2024).
        Los ⚠️ en el mapa marcan las intersecciones más frecuentes.
      </div>
    </div>
  );
}
