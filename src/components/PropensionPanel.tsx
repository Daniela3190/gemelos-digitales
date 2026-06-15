import type { User, ViajeEventos, Viaje } from "@/lib/types";
import { computePropension, scoreColor } from "@/lib/utils";

export default function PropensionPanel({
  user,
  eventos,
  viajes,
}: {
  user: User;
  eventos: Record<string, ViajeEventos>;
  viajes: Viaje[];
}) {
  const propension = computePropension(user, eventos, viajes);
  const color = scoreColor(100 - propension);
  const nivel = propension >= 65 ? "Alta" : propension >= 35 ? "Media" : "Baja";
  const descripcion =
    propension < 30
      ? "Conductor de bajo riesgo. Perfil ideal para retener y fidelizar."
      : propension < 60
      ? "Riesgo moderado. Monitorear eventos de conducción."
      : "Riesgo elevado. Revisar tarifa y condiciones de la póliza.";

  const scores = user.score_promedio;
  const factores = scores
    ? [
        { label: "Atención", score: scores.atencion, peso: "30%" },
        { label: "Legalidad", score: scores.legal, peso: "35%" },
        { label: "Suavidad", score: scores.suavidad, peso: "20%" },
      ]
    : [];

  return (
    <div>
      {/* Score circle + text */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
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
          <div style={{ fontSize: 26, fontWeight: 700, color }}>{propension}</div>
          <div style={{ fontSize: 9, color: "#475569" }}>/100</div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 4 }}>
            Riesgo {nivel}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
            {descripcion}
          </div>
        </div>
      </div>

      {/* Factor breakdown */}
      {factores.length > 0 && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}
        >
          {factores.map(({ label, score, peso }) => (
            <div
              key={label}
              style={{
                background: "#0f172a",
                borderRadius: 8,
                padding: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#475569" }}>{label}</div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: scoreColor(score),
                  margin: "4px 0",
                }}
              >
                {score}
              </div>
              <div style={{ fontSize: 10, color: "#334155" }}>peso {peso}</div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle info */}
      <div
        style={{
          marginTop: 12,
          padding: "10px 12px",
          background: "#0f172a",
          borderRadius: 8,
          fontSize: 12,
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        Vehículo: {user.vehiculo?.modelo} ·{" "}
        {user.vehiculo?.Antigüedad} de antigüedad · Seguridad activa:{" "}
        {user.vehiculo?.["Score seguridad activa"]}
      </div>
    </div>
  );
}
