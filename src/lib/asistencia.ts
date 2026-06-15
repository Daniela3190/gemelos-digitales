import type { User, Asistencia, ExposureData } from './types';
import type { FactorRiesgo } from './siniestro';

export type { FactorRiesgo };

export interface AsistenciaResult {
  probability: number;
  category: 'BAJO' | 'MEDIO' | 'ALTO';
  color: string;
  factors: FactorRiesgo[];
  breakdown: {
    vehiculo: number;
    manejo: number;
    historial: number;
    exposicion: number;
  };
}

export const TIPO_ASISTENCIA_ICON: Record<string, string> = {
  grua:        '🚛',
  bateria:     '🔋',
  combustible: '⛽',
  cerrajeria:  '🔑',
  auxilio:     '🔧',
  otro:        'ℹ️',
};

const B_SUAVIDAD_ASIST = 7.5; // (1 - 0.5) * 15

export function computeProbabilidadAsistencia(
  user: User,
  exposure: ExposureData,
  asistencias: Asistencia[],
): AsistenciaResult {
  const v = user.vehiculo;
  const scores = user.score_promedio;
  const factors: FactorRiesgo[] = [];

  // ── VEHÍCULO (max 36 pts) ────────────────────────────────────────────────
  const years = parseInt(v?.Antigüedad ?? '0') || 0;
  const antiguedadAsist = Math.min((years / 25) * 20, 20);

  const frenosTraseros = String(v?.['Frenos traseros'] ?? '').toLowerCase();
  const frenosRiesgo = frenosTraseros.includes('tambor') ? 6 : 0;

  const segActiva = parseInt(v?.['Score seguridad activa'] ?? '0') || 0;
  const sistemasRiesgo = ((6 - segActiva) / 6) * 10;

  const vehiculoAsist = antiguedadAsist + frenosRiesgo + sistemasRiesgo;

  if (years >= 15) {
    factors.push({ icon: '⚠️', text: `Auto con ${v?.Antigüedad} — desgaste acumulado, mayor riesgo de falla`, impact: Math.round(antiguedadAsist) });
  } else if (years <= 3) {
    factors.push({ icon: '✅', text: `Auto reciente (${v?.Antigüedad}) — componentes en buen estado`, impact: -8 });
  } else if (antiguedadAsist > 2) {
    factors.push({ icon: 'ℹ️', text: `Antigüedad moderada: ${v?.Antigüedad}`, impact: Math.round(antiguedadAsist) });
  }

  if (frenosRiesgo > 0) {
    factors.push({ icon: '⚠️', text: 'Frenos traseros de tambor — mayor desgaste y riesgo de falla', impact: frenosRiesgo });
  }

  if (sistemasRiesgo >= 7) {
    factors.push({ icon: '⚠️', text: `Sin sistemas de seguridad (${v?.['Score seguridad activa']}) — sin ABS ni asistencia electrónica`, impact: Math.round(sistemasRiesgo) });
  } else if (sistemasRiesgo <= 2) {
    factors.push({ icon: '✅', text: `Sistemas de seguridad completos (${v?.['Score seguridad activa']})`, impact: -Math.round(10 - sistemasRiesgo) });
  } else {
    factors.push({ icon: 'ℹ️', text: `Seguridad parcial (${v?.['Score seguridad activa']})`, impact: Math.round(sistemasRiesgo) });
  }

  // ── MANEJO (max 25 pts) ──────────────────────────────────────────────────
  const suavidad = (scores?.suavidad ?? 50) / 100;
  const suavidadAsist = (1 - suavidad) * 15;

  // distancia_total_m stored as centimeters → convert to km
  const distancia_total_km =
    user.scores_mensuales.reduce((s, m) => s + m.distancia_total_m, 0) / 100 / 1000;
  const distanciaAsist = Math.min(distancia_total_km / 10000, 1) * 10;

  const manejoAsist = suavidadAsist + distanciaAsist;

  if ((scores?.suavidad ?? 50) >= 80) {
    factors.push({ icon: '✅', text: `Manejo suave (${scores?.suavidad}/100) — menor desgaste mecánico`, impact: -Math.round(B_SUAVIDAD_ASIST - suavidadAsist) });
  } else {
    factors.push({ icon: '⚠️', text: `Frenadas bruscas (${scores?.suavidad}/100) — desgaste acelerado de frenos y transmisión`, impact: Math.round(suavidadAsist) });
  }

  if (distanciaAsist >= 3) {
    factors.push({ icon: '⚠️', text: `Alto kilometraje acumulado (${Math.round(distancia_total_km).toLocaleString()} km)`, impact: Math.round(distanciaAsist) });
  }

  // ── HISTORIAL (max 20 pts) ───────────────────────────────────────────────
  const numGrua = asistencias.filter(a => a.tipo === 'grua').length;
  const numBateria = asistencias.filter(a => a.tipo === 'bateria').length;
  const gruaRiesgo = numGrua > 0 ? 12 : 0;
  const bateriaRiesgo = numBateria > 0 ? 4 : 0;
  const historialAsist = Math.min(gruaRiesgo + bateriaRiesgo, 20);

  if (numGrua > 0) {
    factors.push({ icon: '⚠️', text: 'Grúa solicitada previamente — alta probabilidad de reincidencia', impact: gruaRiesgo });
  } else if (numBateria > 0) {
    factors.push({ icon: '⚠️', text: 'Falla de batería previa — sistema eléctrico en desgaste', impact: bateriaRiesgo });
  } else {
    factors.push({ icon: '✅', text: 'Sin historial de asistencias — perfil limpio', impact: -8 });
  }

  // ── EXPOSICIÓN GEOGRÁFICA (max 10 pts) ───────────────────────────────────
  // pct_riesgo / 100 as proxy for pct_autopistas (high-risk zones ↔ high-traffic roads)
  const pct_autopistas = exposure.pct_riesgo / 100;
  const exposicionAsist = pct_autopistas * 10;

  if (exposicionAsist >= 3) {
    factors.push({ icon: '⚠️', text: `${exposure.pct_riesgo}% de rutas en zonas de alta exposición vial`, impact: Math.round(exposicionAsist) });
  } else {
    factors.push({ icon: 'ℹ️', text: `Baja exposición en zonas de riesgo (${exposure.pct_riesgo}%)`, impact: Math.round(exposicionAsist) });
  }

  // ── RESULTADO ────────────────────────────────────────────────────────────
  const rawTotal = vehiculoAsist + manejoAsist + historialAsist + exposicionAsist;
  const probability = Math.min(Math.round(rawTotal), 100);

  // BAJO 0–25, MEDIO 26–50, ALTO 51+
  const category: AsistenciaResult['category'] = probability >= 51 ? 'ALTO' : probability >= 26 ? 'MEDIO' : 'BAJO';
  const color = probability >= 51 ? '#ef4444' : probability >= 26 ? '#eab308' : '#22c55e';

  factors.sort((a, b) => {
    if (a.impact > 0 && b.impact <= 0) return -1;
    if (b.impact > 0 && a.impact <= 0) return 1;
    return Math.abs(b.impact) - Math.abs(a.impact);
  });

  return {
    probability,
    category,
    color,
    factors,
    breakdown: {
      vehiculo: Math.round(vehiculoAsist),
      manejo: Math.round(manejoAsist),
      historial: Math.round(historialAsist),
      exposicion: Math.round(exposicionAsist),
    },
  };
}
