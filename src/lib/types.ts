export interface Vehiculo {
  modelo: string;
  Tipo?: string;
  Motor?: string;
  Potencia?: string;
  Caja?: string;
  Peso?: string;
  ABS?: string;
  'Airbag frontal'?: string;
  'Airbag lateral'?: string;
  'Airbag cortina'?: string;
  ESP?: string;
  TCS?: string;
  EBD?: string;
  'Asistente frenado emergencia'?: string;
  'Score seguridad activa'?: string;
  Antigüedad?: string;
  'Valor Infoauto jun 2026'?: string;
  'Valor ARS'?: number;
  'Daño parcial (18%)'?: string;
  'Daño total (100%)'?: string;
  [key: string]: string | number | null | undefined;
}

export interface ScoreMensual {
  mes: string;
  cantidad_viajes: number;
  duracion_total: number;
  distancia_total_m: number;
  atencion: number;
  suavidad: number;
  legal: number;
  score_general: number;
}

export interface ScorePromedio {
  atencion: number;
  suavidad: number;
  legal: number;
  general: number;
}

export interface User {
  id: string;
  nombre: string;
  dispositivo: string;
  vehiculo: Vehiculo | null;
  scores_mensuales: ScoreMensual[];
  score_promedio: ScorePromedio | null;
  score_ultimo: ScoreMensual | null;
  total_viajes: number;
  lat: number | null;
  lon: number | null;
}

export interface EventoPath {
  start_at: string;
  duracion: number;
  path: [number, number][];
  magnitude?: number;
  speeds?: number[];
  speed_limits?: number[];
}

export interface EventoResumen {
  count: number;
  duracion_total: number;
  paths: EventoPath[];
}

export interface ViajeEventos {
  viaje: string;
  aceleracion: EventoResumen;
  uso_telefono: EventoResumen;
  curvas: EventoResumen;
  celular_fijo: EventoResumen;
  frenado: EventoResumen;
  exceso_de_velocidad: EventoResumen;
  llamados: EventoResumen;
  pantalla: EventoResumen;
}

export interface Viaje {
  id: string;
  distancia_m: number;
  comienzo: string;
  fin: string;
  duracion: number;
  ocupante: string;
  path: [number, number][];
}

export type SiniestroTuple = [string, string, string, number]; // [lat, lon, gravedad_initial, year]

export type TipoAsistencia = 'grua' | 'bateria' | 'combustible' | 'cerrajeria' | 'auxilio' | 'otro';

export interface Asistencia {
  id: string;
  fecha: string;
  tipo: TipoAsistencia;
  descripcion: string;
  zona?: string;
}

export interface FactorGrua {
  icon: '⚠️' | '✅' | 'ℹ️';
  text: string;
  impact: number; // percentage points contribution (0 for protective factors)
}

export interface GruaResult {
  probability: number;
  category: 'BAJO' | 'MEDIO' | 'ALTO';
  color: string;
  factors: FactorGrua[];
}

// [lat, lon, leve_count, grave_count, mortal_count]
export type GridCell = [number, number, number, number, number];

export interface ExposureData {
  score: number;
  label: string;
  pct_riesgo: number;
  warning_points: [number, number][];
  viajes_riesgo: number;
  total_viajes: number;
}
