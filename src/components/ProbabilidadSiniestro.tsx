import type { SiniestroResult } from "@/lib/siniestro";

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

export default function ProbabilidadSiniestro({ result }: { result: SiniestroResult }) {
  const { probability, category, color, factors, breakdown } = result;

  const tagline =
    category === "ALTO"
      ? "Perfil de alta siniestralidad — requiere acción preventiva."
      : category === "MEDIO"
      ? "Riesgo moderado. Hay oportunidad de mejora con cobertura diferenciada."
      : "Bajo riesgo siniestral para los próximos 12 meses.";

  const topColor =
    category === "ALTO" ? "#ef4444" : category === "MEDIO" ? "#eab308" : "#22c55e";

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
            {category} riesgo
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
            de siniestro en los próximos 12 meses
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
        }}
      >
        {(
          [
            ["Comportamiento", breakdown.comportamiento, 40],
            ["Exposición geo.", breakdown.exposicion, 30],
            ["Vehículo", breakdown.vehiculo, 20],
            ["Historial", breakdown.historial, 10],
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
    </div>
  );
}
