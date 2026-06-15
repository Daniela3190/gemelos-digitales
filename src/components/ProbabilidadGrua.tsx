import type { GruaResult, Asistencia } from "@/lib/types";
import { TIPO_ASISTENCIA_ICON } from "@/lib/grua";
import { formatDate } from "@/lib/utils";

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 4, background: "#0f172a", borderRadius: 2, overflow: "hidden", flex: 1 }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color, borderRadius: 2 }} />
    </div>
  );
}

export default function ProbabilidadGrua({
  result,
  asistencias,
}: {
  result: GruaResult;
  asistencias: Asistencia[];
}) {
  const { probability, category, color, factors } = result;

  const tagline =
    category === "ALTO"
      ? "Puede necesitar grúa antes de saberlo."
      : category === "MEDIO"
      ? "Riesgo moderado. Monitorear estado del vehículo."
      : "Bajo riesgo de asistencia en los próximos 6 meses.";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Left: score + factors */}
      <div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div
            style={{
              width: 80,
              height: 80,
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
            <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>
              {probability}
            </div>
            <div style={{ fontSize: 9, color: "#334155", marginTop: 1 }}>%</div>
          </div>

          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 4 }}>
              {category} probabilidad
            </div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: 8 }}>
              de solicitar grúa en los próximos 6 meses
            </div>
            {/* Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Bar pct={probability} color={color} />
              <span style={{ fontSize: 10, color: "#334155", flexShrink: 0 }}>
                {probability}%
              </span>
            </div>
          </div>
        </div>

        {/* Commercial tagline */}
        <div
          style={{
            background:
              category === "ALTO"
                ? "rgba(239,68,68,0.08)"
                : category === "MEDIO"
                ? "rgba(234,179,8,0.08)"
                : "rgba(34,197,94,0.08)",
            border: `1px solid ${color}30`,
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 14,
            fontSize: 12,
            color: color,
            lineHeight: 1.5,
          }}
        >
          💡 {tagline}
        </div>

        {/* Factors breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {factors.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: 12,
                lineHeight: 1.4,
              }}
            >
              <span style={{ flexShrink: 0, fontSize: 13 }}>{f.icon}</span>
              <span
                style={{
                  flex: 1,
                  color:
                    f.icon === "⚠️"
                      ? "#fca5a5"
                      : f.icon === "✅"
                      ? "#86efac"
                      : "#94a3b8",
                }}
              >
                {f.text}
              </span>
              {f.impact > 0 && (
                <span
                  style={{
                    color,
                    fontWeight: 700,
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  +{f.impact}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: historial de asistencias */}
      <div>
        <div
          style={{
            fontSize: 11,
            color: "#475569",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Historial de asistencias
        </div>

        {asistencias.length === 0 ? (
          <div
            style={{
              background: "#0f172a",
              borderRadius: 10,
              padding: "20px 16px",
              textAlign: "center",
              color: "#334155",
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
            <div>Sin asistencias previas registradas</div>
            <div style={{ fontSize: 11, marginTop: 4, color: "#1e293b" }}>
              Perfil sin antecedentes
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {asistencias.map((a) => (
              <div
                key={a.id}
                style={{
                  background: "#0f172a",
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  border:
                    a.tipo === "grua"
                      ? "1px solid rgba(239,68,68,0.2)"
                      : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.2 }}>
                  {TIPO_ASISTENCIA_ICON[a.tipo] ?? "ℹ️"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 2, fontWeight: 500 }}>
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
                    padding: "2px 7px",
                    fontSize: 10,
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
        )}

        {/* Model note */}
        <div
          style={{
            marginTop: 14,
            padding: "8px 10px",
            background: "#0f172a",
            borderRadius: 8,
            fontSize: 11,
            color: "#334155",
            lineHeight: 1.6,
          }}
        >
          Modelo combina estado del vehículo (40%), comportamiento (30%),
          historial de asistencias (20%) y exposición geográfica (10%).
        </div>
      </div>
    </div>
  );
}
