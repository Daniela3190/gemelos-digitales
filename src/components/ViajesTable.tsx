import type { Viaje, ViajeEventos } from "@/lib/types";
import { formatDateTime, formatDistance, formatDuration } from "@/lib/utils";

function countEventos(ev: ViajeEventos | undefined): number {
  if (!ev) return 0;
  return (
    (ev.aceleracion?.count ?? 0) +
    (ev.uso_telefono?.count ?? 0) +
    (ev.curvas?.count ?? 0) +
    (ev.celular_fijo?.count ?? 0) +
    (ev.frenado?.count ?? 0) +
    (ev.exceso_de_velocidad?.count ?? 0) +
    (ev.llamados?.count ?? 0) +
    (ev.pantalla?.count ?? 0)
  );
}

export default function ViajesTable({
  viajes,
  eventos,
}: {
  viajes: Viaje[];
  eventos: Record<string, ViajeEventos>;
}) {
  const recent = [...viajes]
    .sort((a, b) => new Date(b.comienzo).getTime() - new Date(a.comienzo).getTime())
    .slice(0, 10);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              color: "#475569",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            <th style={{ textAlign: "left", padding: "6px 0" }}>Fecha</th>
            <th style={{ textAlign: "right", padding: "6px 8px" }}>Dist.</th>
            <th style={{ textAlign: "right", padding: "6px 8px" }}>Dur.</th>
            <th style={{ textAlign: "right", padding: "6px 0" }}>Eventos</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((v) => {
            const ev = countEventos(eventos[v.id]);
            return (
              <tr
                key={v.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
              >
                <td style={{ padding: "9px 0", color: "#94a3b8", whiteSpace: "nowrap" }}>
                  {formatDateTime(v.comienzo)}
                </td>
                <td style={{ padding: "9px 8px", textAlign: "right", color: "#f1f5f9" }}>
                  {formatDistance(v.distancia_m)}
                </td>
                <td style={{ padding: "9px 8px", textAlign: "right", color: "#64748b" }}>
                  {formatDuration(v.duracion)}
                </td>
                <td style={{ padding: "9px 0", textAlign: "right" }}>
                  <span
                    style={{
                      color:
                        ev > 5 ? "#ef4444" : ev > 2 ? "#eab308" : "#22c55e",
                      fontWeight: 600,
                    }}
                  >
                    {ev}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
