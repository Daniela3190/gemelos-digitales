import type { User, Asistencia, GruaResult, FactorGrua } from './types';

const MAX_SCORE = 85;

function pct(pts: number): number {
  return Math.round((pts / MAX_SCORE) * 100);
}

function mesAnio(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

export function computeProbabilidadGrua(user: User, asistencias: Asistencia[]): GruaResult {
  let score = 0;
  const factors: FactorGrua[] = [];
  const v = user.vehiculo;

  // ── 1. ANTIGÜEDAD (25 pts) ─────────────────────────────────────────────────
  const yearStr = v?.Antigüedad ?? '0 años';
  const years = parseInt(yearStr) || 0;
  const antigFactor =
    years >= 20 ? 1.0 :
    years >= 15 ? 0.80 :
    years >= 10 ? 0.56 :
    years >= 6  ? 0.36 :
    years >= 3  ? 0.20 : 0.08;
  const antigPts = Math.round(antigFactor * 25);
  score += antigPts;

  if (years >= 15) {
    factors.push({ icon: '⚠️', text: `Auto con ${yearStr} de antigüedad — alto desgaste acumulado`, impact: pct(antigPts) });
  } else if (years <= 2) {
    factors.push({ icon: '✅', text: `Auto reciente (${yearStr}) — componentes en buen estado`, impact: 0 });
  } else {
    factors.push({ icon: 'ℹ️', text: `Antigüedad moderada: ${yearStr}`, impact: pct(antigPts) });
  }

  // ── 2. SEGURIDAD ACTIVA (10 pts) ───────────────────────────────────────────
  const SAFETY_KEYS = ['ABS', 'ESP', 'TCS', 'EBD', 'Asistente frenado emergencia'] as const;
  const missingCount = SAFETY_KEYS.filter(k => v?.[k] === '❌').length;
  const safetyPts = Math.round((missingCount / SAFETY_KEYS.length) * 10);
  score += safetyPts;

  if (missingCount >= 4) {
    factors.push({ icon: '⚠️', text: `Sin sistemas de seguridad activa (${v?.['Score seguridad activa']}) — sin ABS, ESP, TCS`, impact: pct(safetyPts) });
  } else if (missingCount === 0) {
    factors.push({ icon: '✅', text: `Sistemas de seguridad completos (${v?.['Score seguridad activa']})`, impact: 0 });
  } else {
    factors.push({ icon: 'ℹ️', text: `Seguridad parcial (${v?.['Score seguridad activa']})`, impact: pct(safetyPts) });
  }

  // ── 3. FRENOS (5 pts) ─────────────────────────────────────────────────────
  const hasABS = v?.ABS === '✅';
  const frenosTraseros = String(v?.['Frenos traseros'] ?? '');
  const isTambor = frenosTraseros.toLowerCase().includes('tambor');
  const frenosPts = !hasABS && isTambor ? 5 : isTambor ? 2 : 0;
  score += frenosPts;
  if (!hasABS && isTambor) {
    factors.push({ icon: '⚠️', text: 'Frenos traseros de tambor sin ABS — mayor riesgo de desgaste', impact: pct(frenosPts) });
  }

  // ── 4. SUAVIDAD (8 pts) ───────────────────────────────────────────────────
  const suavidad = user.score_promedio?.suavidad ?? 50;
  const suavFactor = Math.max(0, (90 - suavidad) / 40);
  const suavPts = Math.round(suavFactor * 8);
  score += suavPts;

  if (suavidad < 75) {
    factors.push({ icon: '⚠️', text: `Score de suavidad bajo (${suavidad}/100) — frenadas bruscas generan desgaste mecánico`, impact: pct(suavPts) });
  } else {
    factors.push({ icon: '✅', text: `Manejo suave (score ${suavidad}/100) — menor desgaste de frenos y transmisión`, impact: 0 });
  }

  // ── 5. VOLUMEN DE USO (5 pts) ─────────────────────────────────────────────
  const usoPts = Math.round(Math.min(1, user.total_viajes / 100) * 5);
  score += usoPts;

  // ── 6. GRÚA PREVIA (20 pts) ──────────────────────────────────────────────
  const gruasData = asistencias.filter(a => a.tipo === 'grua');
  const gruaFactor = gruasData.length >= 2 ? 1.0 : gruasData.length === 1 ? 0.5 : 0;
  const gruaPts = Math.round(gruaFactor * 20);
  score += gruaPts;

  if (gruasData.length > 0) {
    factors.push({ icon: '⚠️', text: `Solicitó grúa en ${mesAnio(gruasData[0].fecha)} — alta probabilidad de reincidencia`, impact: pct(gruaPts) });
  } else {
    factors.push({ icon: '✅', text: 'Sin historial previo de solicitud de grúa', impact: 0 });
  }

  // ── 7. OTRAS ASISTENCIAS (7 pts) ─────────────────────────────────────────
  const otrasData = asistencias.filter(a => a.tipo !== 'grua');
  const otrasPts = Math.round(Math.min(1, otrasData.length / 3) * 7);
  score += otrasPts;

  if (otrasPts > 0) {
    const tiposStr = [...new Set(otrasData.map(a => a.tipo))].join(', ');
    factors.push({ icon: '⚠️', text: `${otrasData.length} asistencia(s) adicional(es) (${tiposStr})`, impact: pct(otrasPts) });
  }

  // ── 8. EXPOSICIÓN GEOGRÁFICA (5 pts fijos: CABA) ─────────────────────────
  score += 3;

  // ── RESULTADO ─────────────────────────────────────────────────────────────
  const probability = Math.max(5, Math.min(95, Math.round((score / MAX_SCORE) * 100)));
  const category: GruaResult['category'] = probability >= 51 ? 'ALTO' : probability >= 26 ? 'MEDIO' : 'BAJO';
  const color = probability >= 51 ? '#ef4444' : probability >= 26 ? '#eab308' : '#22c55e';

  return { probability, category, color, factors };
}

export const TIPO_ASISTENCIA_ICON: Record<string, string> = {
  grua:       '🚛',
  bateria:    '🔋',
  combustible: '⛽',
  cerrajeria: '🔑',
  auxilio:    '🔧',
  otro:       'ℹ️',
};
