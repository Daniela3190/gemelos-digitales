import type { User, ViajeEventos, Viaje } from './types';

export function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  return '#ef4444';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

export function scoreLabel(score: number): string {
  if (score >= 85) return 'Excelente';
  if (score >= 75) return 'Muy bueno';
  if (score >= 60) return 'Regular';
  if (score >= 45) return 'Bajo';
  return 'Crítico';
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function formatDate(dt: string): string {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(dt: string): string {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function formatMonth(mes: string): string {
  const y = mes.slice(0, 4);
  const m = parseInt(mes.slice(4, 6));
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${months[m - 1]} ${y}`;
}

export function getUserShortId(userId: string): string {
  return userId.slice(-6);
}

// Compute propensity score (0-100) — higher = more risk
export function computePropension(user: User, eventos: Record<string, ViajeEventos>, viajes: Viaje[]): number {
  const scores = user.score_promedio;
  if (!scores) return 50;

  // Invert scores (higher score = lower risk)
  const riskAtencion = 100 - scores.atencion;   // phone use risk
  const riskLegal = 100 - scores.legal;          // speeding risk
  const riskSuavidad = 100 - scores.suavidad;    // harsh maneuvers risk

  // Vehicle age factor
  const antiguedad = parseInt(String(user.vehiculo?.Antigüedad || '5')) || 5;
  const vehicleRisk = Math.min(antiguedad * 2, 40); // older = riskier, max 40pts

  // Safety systems
  const hasABS = user.vehiculo?.ABS === '✅';
  const hasAirbag = user.vehiculo?.['Airbag frontal'] === '✅';
  const hasESP = user.vehiculo?.ESP === '✅';
  const safetyBonus = (hasABS ? 5 : 0) + (hasAirbag ? 3 : 0) + (hasESP ? 4 : 0);

  // Weighted risk
  const rawRisk = riskAtencion * 0.30 + riskLegal * 0.35 + riskSuavidad * 0.20 + vehicleRisk * 0.15 - safetyBonus;

  return Math.max(5, Math.min(95, Math.round(rawRisk)));
}

// Event totals across all trips
export function getTotalEventos(eventos: Record<string, ViajeEventos>) {
  const totals: Record<string, number> = {
    aceleracion: 0, uso_telefono: 0, curvas: 0, celular_fijo: 0,
    frenado: 0, exceso_de_velocidad: 0, llamados: 0, pantalla: 0,
  };
  for (const viajeId of Object.keys(eventos)) {
    const ev = eventos[viajeId];
    for (const tipo of Object.keys(totals)) {
      totals[tipo] += (ev as unknown as Record<string, EventoResumen>)[tipo]?.count || 0;
    }
  }
  return totals;
}

interface EventoResumen {
  count: number;
  duracion_total: number;
  paths: unknown[];
}

export const EVENTO_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  exceso_de_velocidad: { label: 'Exceso de velocidad', color: '#dc2626', emoji: '🚀' },
  frenado:            { label: 'Frenada brusca',      color: '#ef4444', emoji: '🛑' },
  aceleracion:        { label: 'Aceleración brusca',  color: '#f97316', emoji: '⚡' },
  uso_telefono:       { label: 'Uso de teléfono',     color: '#eab308', emoji: '📱' },
  llamados:           { label: 'Llamados',            color: '#f59e0b', emoji: '📞' },
  pantalla:           { label: 'Pantalla',            color: '#a78bfa', emoji: '📲' },
  curvas:             { label: 'Curva brusca',        color: '#8b5cf6', emoji: '↩️' },
  celular_fijo:       { label: 'Celular fijo',        color: '#6366f1', emoji: '🎧' },
};
