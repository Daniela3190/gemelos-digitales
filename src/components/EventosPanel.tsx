import type { ViajeEventos } from "@/lib/types";
import { getTotalEventos, EVENTO_CONFIG } from "@/lib/utils";

export default function EventosPanel({
  eventos,
}: {
  eventos: Record<string, ViajeEventos>;
}) {
  const totals = getTotalEventos(eventos);
  const totalAll = Object.values(totals).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(totals)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) {
    return (
      <p style={{ color: "#475569", fontSize: 13, textAlign: "center", marginTop: 20 }}>
        Sin eventos registrados
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {sorted.map(([tipo, count]) => {
        const cfg = EVENTO_CONFIG[tipo];
        const pct = Math.round((count / totalAll) * 100);
        return (
          <div key={tipo}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
              }}
            >
              <span style={{ fontSize: 13, color: cfg.color }}>
                {cfg.emoji} {cfg.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>
                {count}
              </span>
            </div>
            <div
              style={{
                height: 5,
                background: "#0f172a",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: cfg.color,
                  borderRadius: 3,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          color: "#475569",
          textAlign: "right",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingTop: 8,
        }}
      >
        Total: {totalAll} eventos
      </div>
    </div>
  );
}
