import type { AsistenciaResult } from "@/lib/asistencia";
import type { Asistencia } from "@/lib/types";
import { TIPO_ASISTENCIA_ICON } from "@/lib/asistencia";
import { formatDate } from "@/lib/utils";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: "#0f172a", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.min(100, (value / max) * 100)}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
          }}
        />
      </div>
      <span style={{ fontSize: 10, color: "#475569", flexShrink: 0, minWidth: 28, textAlign: "right" }}>
        {value}/{max}
      </span>
    </div>
  );
}

export default function ProbabilidadAsistencia({
  result,
  asistencias,
}: {
  result: AsistenciaResult;
  asistencias: Asistencia[];
}) {
  const { probability, category, color, factors, breakdown } = result;

  const tagline =
    category === "ALTO"
      ? "Alta probabilidad de necesitar grúa u otro servicio de emergencia."
      : category === "MEDIO"
      ? "Riesgo moderado de asistencia. Monitorear estado del vehículo."
      : "Bajo riesgo de asistencia en los próximos 6 meses.";

  const topColor = color;

  return (
    <div>
      {/* Score + bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: `4px solid ${topColor}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 700, color: topColor, lineHeight: 1 }}>
            {probability}
          </div>
          <div style={{ fontSize: 9, color: "#334155", marginTop: 1 }}>%</div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: topColor, marginBottom: 3 }}>
            {category} probabilidad
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
            de solicitar asistencia en los próximos 6 meses
          </div>
          <div style={{ height: 6, background: "#0f172a", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.min(100, probability)}%`,
                height: "100%",
                background: topColor,
                borderRadius: 3,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          background: `${topColor}10`,
          border: `1px solid ${topColor}30`,
          borderRadius: 7,
          padding: "7px 11px",
          marginBottom: 14,
          fontSize: 11,
          color: topColor,
          lineHeight: 1.5,
        }}
      >
        💡 {tagline}
      </div>

      {/* Factor breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
        {factors.map((f, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, lineHeight: 1.4 }}
          >
            <span style={{ flexShrink: 0, fontSize: 12, lineHeight: 1.4 }}>{f.icon}</span>
            <span
              style={{
                flex: 1,
                color:
                  f.icon === "⚠️" ? "#fca5a5" : f.icon === "✅" ? "#86efac" : "#94a3b8",
              }}
            >
              {f.text}
            </span>
            {f.impact !== 0 && (
              <span
                style={{
                  color: f.impact > 0 ? "#ef4444" : "#22c55e",
                  fontWeight: 700,
                  fontSize: 11,
                  flexShrink: 0,
                }}
              >
                {f.impact > 0 ? "+" : ""}{f.impact}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Section mini-bars */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 10,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          marginBottom: asistencias.length > 0 ? 14 : 0,
        }}
      >
        {(
          [
            ["Vehículo", breakdown.vehiculo, 36],
            ["Manejo", breakdown.manejo, 25],
            ["Historial", breakdown.historial, 20],
            ["Exposición", breakdown.exposicion, 10],
          ] as [string, number, number][]
        ).map(([label, val, max]) => (
          <div key={label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "#334155",
                marginBottom: 2,
              }}
            >
              <span>{label}</span>
            </div>
            <MiniBar value={val} max={max} color={topColor} />
          </div>
        ))}
      </div>

      {/* Historial de asistencias (compact) */}
      {asistencias.length > 0 && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: 10,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#475569",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 7,
            }}
          >
            Historial de asistencias
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {asistencias.map((a) => (
              <div
                key={a.id}
                style={{
                  background: "#0f172a",
                  borderRadius: 8,
                  padding: "8px 10px",
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  border:
                    a.tipo === "grua"
                      ? "1px solid rgba(239,68,68,0.2)"
                      : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.2 }}>
                  {TIPO_ASISTENCIA_ICON[a.tipo] ?? "ℹ️"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#e2e8f0", marginBottom: 1, fontWeight: 500 }}>
                    {a.descripcion}
                  </div>
                  <div style={{ fontSize: 10, color: "#475569" }}>
                    {formatDate(a.fecha)}
                    {a.zona ? ` · ${a.zona}` : ""}
                  </div>
                </div>
                <span
                  style={{
                    background:
                      a.tipo === "grua"
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(249,115,22,0.12)",
                    color: a.tipo === "grua" ? "#ef4444" : "#f97316",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: 9,
                    fontWeight: 600,
                    flexShrink: 0,
                    textTransform: "uppercase",
                  }}
                >
                  {a.tipo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
