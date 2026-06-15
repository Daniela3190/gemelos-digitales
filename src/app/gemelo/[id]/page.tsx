import { readFileSync } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { User, Viaje, ViajeEventos, ExposureData, Asistencia } from "@/lib/types";
import { getUserShortId, scoreColor, formatDistance } from "@/lib/utils";
import { computeProbabilidadSiniestro } from "@/lib/siniestro";
import { computeProbabilidadAsistencia } from "@/lib/asistencia";
import ScoreGauge from "@/components/ScoreGauge";
import ScoreChart from "@/components/ScoreChart";
import EventosPanel from "@/components/EventosPanel";
import PanelROI from "@/components/PanelROI";
import ViajesTable from "@/components/ViajesTable";
import PropensionPanel from "@/components/PropensionPanel";
import RiesgoGeografico from "@/components/RiesgoGeografico";
import ProbabilidadSiniestro from "@/components/ProbabilidadSiniestro";
import ProbabilidadAsistencia from "@/components/ProbabilidadAsistencia";
import ChatAI from "@/components/ChatAI";
import MapaRutasClient from "@/components/MapaRutasClient";

function readData<T>(filename: string): T {
  const dir = path.join(process.cwd(), "public", "data");
  return JSON.parse(readFileSync(path.join(dir, filename), "utf-8"));
}

const section = {
  background: "#1e293b",
  borderRadius: 12,
  padding: 20,
  border: "1px solid rgba(255,255,255,0.06)",
} as const;

const sectionTitle = {
  fontSize: 11,
  fontWeight: 600,
  color: "#475569",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  marginBottom: 14,
} as const;

export default async function GemeloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const users = readData<User[]>("users.json");
  const user = users.find((u) => getUserShortId(u.id) === id);
  if (!user) notFound();

  const shortId = getUserShortId(user.id);
  const viajes = readData<Viaje[]>(`viajes_${shortId}.json`);
  const eventos = readData<Record<string, ViajeEventos>>(`eventos_${shortId}.json`);
  const exposure = readData<ExposureData>(`exposure_${shortId}.json`);
  const asistencias = readData<Asistencia[]>(`asistencias_${shortId}.json`);
  const siniestroResult = computeProbabilidadSiniestro(user, exposure, asistencias);
  const asistenciaResult = computeProbabilidadAsistencia(user, exposure, asistencias);

  const center: [number, number] = [user.lat ?? -34.6, user.lon ?? -58.45];
  const score = user.score_promedio?.general ?? 0;
  const color = scoreColor(score);
  const lastScore = user.score_ultimo;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9" }}>
      {/* Header */}
      <header
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ color: "#475569", textDecoration: "none", fontSize: 13, flexShrink: 0 }}>
          ← Universo
        </Link>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
        <div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{user.nombre}</span>
          <span style={{ fontSize: 12, color: "#475569", marginLeft: 10 }}>{user.vehiculo?.modelo}</span>
          <span style={{ fontSize: 11, color: "#334155", marginLeft: 8 }}>· {user.dispositivo}</span>
        </div>

        {/* Exposure badge */}
        <div
          style={{
            background: exposure.score >= 65 ? "rgba(239,68,68,0.12)" : exposure.score >= 35 ? "rgba(249,115,22,0.12)" : "rgba(34,197,94,0.12)",
            border: `1px solid ${exposure.score >= 65 ? "rgba(239,68,68,0.3)" : exposure.score >= 35 ? "rgba(249,115,22,0.3)" : "rgba(34,197,94,0.3)"}`,
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            color: exposure.score >= 65 ? "#ef4444" : exposure.score >= 35 ? "#f97316" : "#22c55e",
          }}
        >
          🗺️ Riesgo geográfico: {exposure.label} ({exposure.score})
        </div>

        {/* Siniestro badge */}
        <div
          style={{
            background: `${siniestroResult.color}15`,
            border: `1px solid ${siniestroResult.color}50`,
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            color: siniestroResult.color,
          }}
        >
          🚨 Siniestro: {siniestroResult.category} ({siniestroResult.probability}%)
        </div>

        {/* Asistencia badge */}
        <div
          style={{
            background: `${asistenciaResult.color}15`,
            border: `1px solid ${asistenciaResult.color}50`,
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 11,
            color: asistenciaResult.color,
          }}
        >
          🔧 Asistencia: {asistenciaResult.category} ({asistenciaResult.probability}%)
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {lastScore && (
            <div style={{ textAlign: "right", fontSize: 11, color: "#475569" }}>
              <div>Último mes: {lastScore.cantidad_viajes} viajes</div>
              <div>{formatDistance(lastScore.distancia_total_m)}</div>
            </div>
          )}
          <div
            style={{
              width: 44, height: 44, borderRadius: "50%",
              border: `2px solid ${color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#1e293b", flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color }}>{score}</span>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <div
        style={{
          padding: "20px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
        }}
      >
        {/* Row 1: Scores + Chart */}
        <div style={{ ...section, gridColumn: "span 3" }}>
          <div style={sectionTitle}>Scores de conducción</div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <ScoreGauge score={score} label="General" size={100} />
            <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
            <ScoreGauge score={user.score_promedio?.atencion ?? 0} label="Atención" size={76} />
            <ScoreGauge score={user.score_promedio?.suavidad ?? 0} label="Suavidad" size={76} />
            <ScoreGauge score={user.score_promedio?.legal ?? 0} label="Legalidad" size={76} />
            <div style={{ flex: 1, minWidth: 260 }}>
              <ScoreChart scores={user.scores_mensuales} />
            </div>
          </div>
        </div>

        {/* Row 2: Dual probability gauges */}
        <div style={{ gridColumn: "span 3", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ ...section, border: `1px solid ${siniestroResult.color}30` }}>
            <div style={{ ...sectionTitle, color: siniestroResult.color }}>
              🚨 Probabilidad de Siniestro
            </div>
            <ProbabilidadSiniestro result={siniestroResult} />
          </div>
          <div style={{ ...section, border: `1px solid ${asistenciaResult.color}30` }}>
            <div style={{ ...sectionTitle, color: asistenciaResult.color }}>
              🔧 Probabilidad de Asistencia
            </div>
            <ProbabilidadAsistencia result={asistenciaResult} asistencias={asistencias} />
          </div>
        </div>

        {/* Row 3: Map + Events + Riesgo */}
        <div
          style={{
            ...section,
            gridColumn: "span 2",
            padding: 0,
            overflow: "hidden",
            height: 480,
          }}
        >
          <MapaRutasClient
            viajes={viajes}
            eventos={eventos}
            center={center}
            warningPoints={exposure.warning_points}
          />
        </div>

        {/* Right column: Events + Riesgo Geográfico stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={{ ...section, flexShrink: 0 }}>
            <div style={sectionTitle}>Eventos de conducción</div>
            <EventosPanel eventos={eventos} />
          </div>
          <div style={{ ...section, flex: 1 }}>
            <div style={sectionTitle}>Riesgo geográfico</div>
            <RiesgoGeografico exposure={exposure} />
          </div>
        </div>

        {/* Row 4: Viajes + ROI + Propensión */}
        <div style={section}>
          <div style={sectionTitle}>
            Últimos viajes
            <span style={{ fontSize: 10, color: "#334155", fontWeight: 400, marginLeft: 6 }}>
              ({user.total_viajes} total)
            </span>
          </div>
          <ViajesTable viajes={viajes} eventos={eventos} />
        </div>

        <div style={section}>
          <div style={sectionTitle}>ROI del vehículo</div>
          <PanelROI vehiculo={user.vehiculo} />
        </div>

        <div style={section}>
          <div style={sectionTitle}>Panel de propensión siniestral</div>
          <PropensionPanel user={user} eventos={eventos} viajes={viajes} />
        </div>

        {/* Row 5: Chat AI */}
        <div style={{ ...section, gridColumn: "span 3" }}>
          <div style={sectionTitle}>
            Chat con IA · Gemelo de {user.nombre.split(" ")[0]}
          </div>
          <ChatAI user={user} />
        </div>
      </div>
    </div>
  );
}
