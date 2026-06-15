import type { User, Asistencia, ExposureData } from './types';

export interface FactorRiesgo {
  icon: '⚠️' | '✅' | 'ℹ️';
  text: string;
  impact: number; // positive = points added (risk), negative = points saved (protection)
}

export interface SiniestroResult {
  probability: number;
  category: 'BAJO' | 'MEDIO' | 'ALTO';
  color: string;
  factors: FactorRiesgo[];
  breakdown: {
    comportamiento: number;
    exposicion: number;
    vehiculo: number;
    historial: number;
  };
}

// Average-driver baselines (score=50) for computing protective savings
const B_ATENCION = 7.5;  // (1 - 0.5) * 15
const B_SUAVIDAD = 7.5;
const B_LEGAL = 5;       // (1 - 0.5) * 10

export function computeProbabilidadSiniestro(
  user: User,
  exposure: ExposureData,
  asistencias: Asistencia[],
): SiniestroResult {
  const scores = user.score_promedio;
  const v = user.vehiculo;
  const factors: FactorRiesgo[] = [];

  // Scores normalized 0–1
  const atencion = (scores?.atencion ?? 50) / 100;
  const suavidad = (scores?.suavidad ?? 50) / 100;
  const legal = (scores?.legal ?? 50) / 100;

  // ── COMPORTAMIENTO (max 40 pts) ──────────────────────────────────────────
  const atencionRiesgo = (1 - atencion) * 15;
  const suavidadRiesgo = (1 - suavidad) * 15;
  const legalRiesgo = (1 - legal) * 10;
  const comportamiento = atencionRiesgo + suavidadRiesgo + legalRiesgo;

  if ((scores?.atencion ?? 50) >= 80) {
    factors.push({ icon: '✅', text: `Buena atención (${scores?.atencion}/100) — bajo riesgo de distracción`, impact: -Math.round(B_ATENCION - atencionRiesgo) });
  } else {
    factors.push({ icon: '⚠️', text: `Atención baja (${scores?.atencion}/100) — mayor riesgo de distracción`, impact: Math.round(atencionRiesgo) });
  }

  if ((scores?.suavidad ?? 50) >= 80) {
    factors.push({ icon: '✅', text: `Manejo suave (${scores?.suavidad}/100) — maniobras controladas`, impact: -Math.round(B_SUAVIDAD - suavidadRiesgo) });
  } else {
    factors.push({ icon: '⚠️', text: `Maniobras bruscas (${scores?.suavidad}/100) — mayor exposición a eventos`, impact: Math.round(suavidadRiesgo) });
  }

  if ((scores?.legal ?? 50) >= 80) {
    factors.push({ icon: '✅', text: `Respeta velocidades (${scores?.legal}/100)`, impact: -Math.round(B_LEGAL - legalRiesgo) });
  } else {
    factors.push({ icon: '⚠️', text: `Excesos de velocidad (${scores?.legal}/100)`, impact: Math.round(legalRiesgo) });
  }

  // ── EXPOSICIÓN GEOGRÁFICA (max 30 pts) ───────────────────────────────────
  // exposure.score → proxy for pct_rutas_zona_alta (0–100 → 0–1)
  // pct_riesgo * 0.5 → estimate for zona grave subset
  const pct_rutas_zona_alta = exposure.score / 100;
  const pct_rutas_zona_grave = (exposure.pct_riesgo / 100) * 0.5;
  const exposicionAlta = pct_rutas_zona_alta * 20;
  const exposicionGrave = pct_rutas_zona_grave * 10;
  const exposicion = exposicionAlta + exposicionGrave;

  if (exposure.score >= 60) {
    factors.push({ icon: '⚠️', text: `${exposure.pct_riesgo}% de rutas por zonas de alta siniestralidad CABA`, impact: Math.round(exposicion) });
  } else {
    factors.push({ icon: 'ℹ️', text: `Exposición geográfica moderada (${exposure.pct_riesgo}% en zonas de riesgo)`, impact: Math.round(exposicion) });
  }

  // ── VEHÍCULO (max 20 pts) ────────────────────────────────────────────────
  const years = parseInt(v?.Antigüedad ?? '0') || 0;
  const segActiva = parseInt(v?.['Score seguridad activa'] ?? '0') || 0;
  const antiguedadRiesgo = Math.min((years / 25) * 8, 8);
  const seguridadRiesgo = ((6 - segActiva) / 6) * 12;
  const vehiculo = antiguedadRiesgo + seguridadRiesgo;

  if (years >= 15) {
    factors.push({ icon: '⚠️', text: `Auto con ${v?.Antigüedad} — sin sistemas de protección modernos`, impact: Math.round(antiguedadRiesgo) });
  } else if (years <= 3) {
    factors.push({ icon: '✅', text: `Auto reciente (${v?.Antigüedad}) — mejor respuesta en colisión`, impact: -3 });
  } else if (antiguedadRiesgo > 1) {
    factors.push({ icon: 'ℹ️', text: `Antigüedad moderada: ${v?.Antigüedad}`, impact: Math.round(antiguedadRiesgo) });
  }

  if (seguridadRiesgo >= 10) {
    factors.push({ icon: '⚠️', text: `Sin seguridad activa (${v?.['Score seguridad activa']}) — sin ABS, ESP ni airbags`, impact: Math.round(seguridadRiesgo) });
  } else if (seguridadRiesgo <= 2) {
    factors.push({ icon: '✅', text: `Sistemas de protección completos (${v?.['Score seguridad activa']})`, impact: -Math.round(12 - seguridadRiesgo) });
  } else {
    factors.push({ icon: 'ℹ️', text: `Seguridad parcial (${v?.['Score seguridad activa']})`, impact: Math.round(seguridadRiesgo) });
  }

  // ── HISTORIAL (max 10 pts) ───────────────────────────────────────────────
  const numGrua = asistencias.filter(a => a.tipo === 'grua').length;
  const numBateria = asistencias.filter(a => a.tipo === 'bateria').length;
  const asistenciasRiesgo = Math.min(asistencias.length * 2, 6);
  const tipoRiesgo = numGrua > 0 ? 4 : numBateria > 0 ? 2 : 0;
  const historial = asistenciasRiesgo + tipoRiesgo;

  if (numGrua > 0) {
    factors.push({ icon: '⚠️', text: `Solicitud de grúa registrada — indica fragilidad mecánica`, impact: tipoRiesgo });
  } else if (numBateria > 0) {
    factors.push({ icon: 'ℹ️', text: `Asistencia eléctrica previa (batería)`, impact: tipoRiesgo });
  } else {
    factors.push({ icon: '✅', text: `Sin historial de asistencias previas`, impact: -4 });
  }
  if (asistenciasRiesgo > 0) {
    factors.push({ icon: '⚠️', text: `${asistencias.length} asistencia(s) registrada(s)`, impact: asistenciasRiesgo });
  }

  // ── RESULTADO ────────────────────────────────────────────────────────────
  const rawTotal = comportamiento + exposicion + vehiculo + historial;
  const probability = Math.min(Math.round(rawTotal), 100);

  // BAJO 0–20, MEDIO 21–50, ALTO 51+
  const category: SiniestroResult['category'] = probability >= 51 ? 'ALTO' : probability >= 21 ? 'MEDIO' : 'BAJO';
  const color = probability >= 51 ? '#ef4444' : probability >= 21 ? '#eab308' : '#22c55e';

  // Sort: risks (positive) by size first, then savings (negative) by size
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
      comportamiento: Math.round(comportamiento),
      exposicion: Math.round(exposicion),
      vehiculo: Math.round(vehiculo),
      historial: Math.round(historial),
    },
  };
}
