"use client";

import dynamic from "next/dynamic";
import type { Viaje, ViajeEventos } from "@/lib/types";

const MapaRutas = dynamic(() => import("./MapaRutas"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#334155",
        fontSize: 14,
        borderRadius: 12,
      }}
    >
      Cargando mapa…
    </div>
  ),
});

export default function MapaRutasClient(props: {
  viajes: Viaje[];
  eventos: Record<string, ViajeEventos>;
  center: [number, number];
  warningPoints: [number, number][];
}) {
  return <MapaRutas {...props} />;
}
