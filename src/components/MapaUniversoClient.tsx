"use client";

import dynamic from "next/dynamic";
import type { User } from "@/lib/types";
import type { Indicadores } from "@/app/page";

const MapaUniverso = dynamic(() => import("./MapaUniverso"), {
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
      }}
    >
      Cargando mapa…
    </div>
  ),
});

export default function MapaUniversoClient({
  users,
  indicadores,
}: {
  users: User[];
  indicadores: Indicadores;
}) {
  return <MapaUniverso users={users} indicadores={indicadores} />;
}
