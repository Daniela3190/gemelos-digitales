import type { Vehiculo } from "@/lib/types";

const sistemas = [
  { key: "ABS", label: "ABS" },
  { key: "Airbag frontal", label: "Airbag frontal" },
  { key: "Airbag lateral", label: "Airbag lateral" },
  { key: "Airbag cortina", label: "Airbag cortina" },
  { key: "ESP", label: "ESP" },
  { key: "TCS", label: "TCS" },
  { key: "EBD", label: "EBD" },
  { key: "Asistente frenado emergencia", label: "Asist. fren. emerg." },
];

export default function PanelROI({ vehiculo }: { vehiculo: Vehiculo | null }) {
  if (!vehiculo) {
    return <p style={{ color: "#475569", fontSize: 13 }}>Sin datos de vehículo</p>;
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            background: "#0f172a",
            borderRadius: 8,
            padding: "12px",
            gridColumn: "span 2",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>
            Valor de mercado (jun 2026)
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>
            {vehiculo["Valor Infoauto jun 2026"]}
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
            ARS {(vehiculo["Valor ARS"] ?? 0).toLocaleString("es-AR")}
          </div>
        </div>
        <div style={{ background: "#0f172a", borderRadius: 8, padding: "12px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>
            Daño parcial 18%
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#eab308" }}>
            {vehiculo["Daño parcial (18%)"]}
          </div>
        </div>
        <div style={{ background: "#0f172a", borderRadius: 8, padding: "12px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>
            Daño total 100%
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#ef4444" }}>
            {vehiculo["Daño total (100%)"]}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#94a3b8",
          fontWeight: 600,
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Sistemas de seguridad activa</span>
        <span style={{ color: "#3b82f6" }}>{vehiculo["Score seguridad activa"]}</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5px 12px",
        }}
      >
        {sistemas.map(({ key, label }) => {
          const val = String(vehiculo[key] ?? "❌");
          const ok = val === "✅";
          return (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
            >
              <span style={{ fontSize: 11 }}>{val}</span>
              <span style={{ color: ok ? "#94a3b8" : "#334155" }}>{label}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        {[
          { label: "Motor", val: vehiculo.Motor },
          { label: "Potencia", val: vehiculo.Potencia },
          { label: "Antigüedad", val: vehiculo.Antigüedad },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{val ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
