export interface BreakdownItem {
  categoria: string
  pct: number
  descripcion: string
  icon: string
}

export interface EventoConduccion {
  tipo: string
  label: string
  pct_viajes: number
  vs_promedio: 'muy_por_encima' | 'en_linea' | 'por_debajo'
}

export interface AsistenciaHistorial {
  fecha: string
  tipo: string
  descripcion: string
}

export interface GemeloData {
  id: string
  nombre: string
  color: string

  // Vehículo
  vehiculo: string
  anio: number
  motor: string
  abs: boolean
  airbags: boolean
  antiguedad: number
  litros_ciudad: number
  litros_ruta: number

  // Probabilidad siniestro
  prob_siniestro: number
  narrativo_siniestro: string
  siniestro_breakdown: BreakdownItem[]

  // Probabilidad asistencia
  prob_asistencia: number
  narrativo_asistencia: string
  recomendacion_asistencia: string
  asistencia_breakdown: BreakdownItem[]
  historial_asistencias: AsistenciaHistorial[]

  // Eventos de conducción
  narrativo_conduccion: string
  eventos_conduccion: EventoConduccion[]
  score_total: number

  // Perfil de movilidad
  barrio: string
  km_a_ruta: number
  modo_transporte: { auto: number; caminando: number; publico: number }
  horarios: { pct_noche: number; pct_pico: number; pct_finde: number }
  distancia_km_mes: number
}

export const PRECIO_NAFTA = 1450 // ARS por litro (nafta premium)

export function calcularCombustible(g: GemeloData) {
  const litros_mes = Math.round((g.litros_ciudad / 100) * g.distancia_km_mes * 10) / 10
  const costo_mes = Math.round(litros_mes * PRECIO_NAFTA)
  const costo_anual = costo_mes * 12
  return { litros_mes, costo_mes, costo_anual }
}

export const GEMELOS: Record<string, GemeloData> = {
  micaela: {
    id: 'micaela',
    nombre: 'Micaela',
    color: '#3b82f6',

    vehiculo: 'Volkswagen Fox',
    anio: 2005,
    motor: '1.6 nafta',
    abs: false,
    airbags: false,
    antiguedad: 21,
    litros_ciudad: 9.5,
    litros_ruta: 7.5,

    prob_siniestro: 55,
    narrativo_siniestro:
      'Micaela tiene 55% de probabilidad de tener un accidente en los próximos 12 meses. El mayor problema es su auto — un Fox 2005 sin ABS ni airbags que circula por zonas de alta siniestralidad de CABA.',
    siniestro_breakdown: [
      { categoria: 'Vehículo', pct: 35, descripcion: 'Fox 2005 sin ABS ni airbags', icon: '🚗' },
      { categoria: 'Zona de circulación', pct: 28, descripcion: 'Rutas por zonas de alta siniestralidad', icon: '📍' },
      { categoria: 'Comportamiento al volante', pct: 22, descripcion: 'Uso frecuente del teléfono en movimiento', icon: '📱' },
      { categoria: 'Historial', pct: 15, descripcion: '1 siniestro registrado en los últimos 3 años', icon: '📋' },
    ],

    prob_asistencia: 53,
    narrativo_asistencia:
      'Micaela tiene 53% de probabilidad de necesitar asistencia en los próximos 6 meses. Su Fox 2005 con 21 años de antigüedad y frenos de tambor ya requirió una grúa — los autos de esta edad fallan con mayor frecuencia.',
    recomendacion_asistencia: 'Ofrecer plan de asistencia extendida preventiva',
    asistencia_breakdown: [
      { categoria: 'Antigüedad del vehículo', pct: 40, descripcion: '21 años — vida útil media del Fox superada', icon: '📅' },
      { categoria: 'Tipo de frenos', pct: 25, descripcion: 'Frenos de tambor en rodados traseros', icon: '⚠️' },
      { categoria: 'Seguridad pasiva', pct: 20, descripcion: 'Sin ABS, sin airbags — mayor exposición ante impactos', icon: '🛡️' },
      { categoria: 'Distancia por viaje', pct: 15, descripcion: 'Promedio 14 km por viaje — desgaste constante', icon: '🛣️' },
    ],
    historial_asistencias: [
      { fecha: '2026-03-08', tipo: 'Grúa', descripcion: 'Fallo de arranque en Av. Corrientes' },
      { fecha: '2025-09-22', tipo: 'Cambio de neumático', descripcion: 'Pinchazo en San Telmo' },
      { fecha: '2025-02-14', tipo: 'Batería', descripcion: 'Batería descargada en Palermo' },
    ],

    narrativo_conduccion:
      'El principal problema de Micaela al volante es el uso del teléfono — presente en casi todos sus viajes y el factor que más impacta su score de atención (60/100).',
    eventos_conduccion: [
      { tipo: 'telefono', label: 'Uso de teléfono', pct_viajes: 68, vs_promedio: 'muy_por_encima' },
      { tipo: 'frenada', label: 'Frenada brusca', pct_viajes: 34, vs_promedio: 'en_linea' },
      { tipo: 'velocidad', label: 'Exceso de velocidad', pct_viajes: 18, vs_promedio: 'por_debajo' },
      { tipo: 'giro', label: 'Giro brusco', pct_viajes: 12, vs_promedio: 'por_debajo' },
    ],
    score_total: 62,

    barrio: 'Palermo',
    km_a_ruta: 0.8,
    modo_transporte: { auto: 72, caminando: 18, publico: 10 },
    horarios: { pct_noche: 35, pct_pico: 45, pct_finde: 20 },
    distancia_km_mes: 420,
  },

  nico: {
    id: 'nico',
    nombre: 'Nico',
    color: '#22c55e',

    vehiculo: 'Peugeot 208',
    anio: 2020,
    motor: '1.6 nafta',
    abs: true,
    airbags: true,
    antiguedad: 6,
    litros_ciudad: 7.8,
    litros_ruta: 6.2,

    prob_siniestro: 38,
    narrativo_siniestro:
      'Nico tiene 38% de probabilidad de tener un accidente en los próximos 12 meses. Su Peugeot 208 está bien equipado con ABS y airbags, pero los excesos de velocidad en autopista son su principal factor de riesgo.',
    siniestro_breakdown: [
      { categoria: 'Comportamiento al volante', pct: 40, descripcion: 'Exceso de velocidad detectado en el 52% de sus viajes', icon: '🏎️' },
      { categoria: 'Zona de circulación', pct: 30, descripcion: 'Corredor Belgrano–Congreso de densidad media-alta', icon: '📍' },
      { categoria: 'Historial', pct: 18, descripcion: 'Sin siniestros en los últimos 3 años', icon: '📋' },
      { categoria: 'Vehículo', pct: 12, descripcion: 'Peugeot 208 2020 con ABS y airbags — bien protegido', icon: '🚗' },
    ],

    prob_asistencia: 28,
    narrativo_asistencia:
      'Nico tiene 28% de probabilidad de necesitar asistencia en los próximos 6 meses. Su Peugeot 208 2020 está en buen estado, dentro del período de garantía extendida y con mantenimiento al día.',
    recomendacion_asistencia: 'Asistencia estándar es suficiente — reevaluar en 2 años cuando venza la garantía',
    asistencia_breakdown: [
      { categoria: 'Comportamiento al volante', pct: 35, descripcion: 'La velocidad excesiva acelera el desgaste de motor y frenos', icon: '⚡' },
      { categoria: 'Mantenimiento', pct: 30, descripcion: 'Dentro de garantía, servicio realizado en concesionaria', icon: '🔧' },
      { categoria: 'Antigüedad del vehículo', pct: 20, descripcion: '6 años — dentro del rango de vida útil esperado', icon: '📅' },
      { categoria: 'Kilómetros mensuales', pct: 15, descripcion: '520 km/mes — uso intensivo que acelera el desgaste', icon: '🛣️' },
    ],
    historial_asistencias: [
      { fecha: '2025-11-03', tipo: 'Cambio de neumático', descripcion: 'Pinchazo en Av. Córdoba' },
    ],

    narrativo_conduccion:
      'Nico tiene un patrón claro de exceso de velocidad en autopista — registrado en el 52% de sus viajes. Su score general es bueno (75/100) pero la velocidad es su punto débil y el factor que más eleva su riesgo.',
    eventos_conduccion: [
      { tipo: 'velocidad', label: 'Exceso de velocidad', pct_viajes: 52, vs_promedio: 'muy_por_encima' },
      { tipo: 'frenada', label: 'Frenada brusca', pct_viajes: 28, vs_promedio: 'en_linea' },
      { tipo: 'telefono', label: 'Uso de teléfono', pct_viajes: 15, vs_promedio: 'por_debajo' },
      { tipo: 'giro', label: 'Giro brusco', pct_viajes: 10, vs_promedio: 'por_debajo' },
    ],
    score_total: 75,

    barrio: 'Belgrano',
    km_a_ruta: 0.3,
    modo_transporte: { auto: 55, caminando: 25, publico: 20 },
    horarios: { pct_noche: 20, pct_pico: 65, pct_finde: 15 },
    distancia_km_mes: 520,
  },

  jorge: {
    id: 'jorge',
    nombre: 'Jorge',
    color: '#f97316',

    vehiculo: 'Jeep Renegade',
    anio: 2022,
    motor: '1.3 turbo',
    abs: true,
    airbags: true,
    antiguedad: 4,
    litros_ciudad: 8.5,
    litros_ruta: 6.8,

    prob_siniestro: 42,
    narrativo_siniestro:
      'Jorge tiene 42% de probabilidad de tener un accidente en los próximos 12 meses. Aunque su Jeep Renegade es seguro y moderno, sus viajes nocturnos por La Boca y las frenadas bruscas registradas aumentan su exposición al riesgo.',
    siniestro_breakdown: [
      { categoria: 'Horarios nocturnos', pct: 35, descripcion: '40% de sus viajes son entre las 20:00 y las 06:00', icon: '🌙' },
      { categoria: 'Comportamiento al volante', pct: 30, descripcion: 'Frenadas bruscas en el 61% de los viajes', icon: '🛑' },
      { categoria: 'Zona de circulación', pct: 22, descripcion: 'Corredor La Boca–Retiro con alta siniestralidad nocturna', icon: '📍' },
      { categoria: 'Vehículo', pct: 13, descripcion: 'Jeep Renegade 2022 con ABS y 6 airbags — bien equipado', icon: '🚗' },
    ],

    prob_asistencia: 35,
    narrativo_asistencia:
      'Jorge tiene 35% de probabilidad de necesitar asistencia en los próximos 6 meses. Su Jeep Renegade usa motor 1.3 turbo de primera generación, conocido por requerir mantenimiento más frecuente en uso urbano.',
    recomendacion_asistencia: 'Ofrecer asistencia extendida con cobertura especial para motor turbo',
    asistencia_breakdown: [
      { categoria: 'Motor turbo 1.3', pct: 38, descripcion: 'Primera generación, mayor frecuencia de mantenimiento en ciudad', icon: '⚙️' },
      { categoria: 'Viajes nocturnos', pct: 28, descripcion: 'Mayor desgaste por arranques y paradas frecuentes en frío', icon: '🌙' },
      { categoria: 'Frenadas bruscas', pct: 22, descripcion: 'Desgaste acelerado del sistema de frenos y ABS', icon: '🛑' },
      { categoria: 'Antigüedad del vehículo', pct: 12, descripcion: '4 años — dentro de la garantía de fábrica', icon: '📅' },
    ],
    historial_asistencias: [
      { fecha: '2026-01-15', tipo: 'Fallo eléctrico', descripcion: 'Sistema turbo — revisión en concesionaria' },
      { fecha: '2025-06-28', tipo: 'Cambio de neumático', descripcion: 'Pinchazo en Puerto Madero' },
    ],

    narrativo_conduccion:
      'Jorge registra frenadas bruscas en el 61% de sus viajes, principalmente en el corredor de La Boca. Esto indica tráfico denso en sus rutas habituales — el factor que más daña su score de frenada (58/100).',
    eventos_conduccion: [
      { tipo: 'frenada', label: 'Frenada brusca', pct_viajes: 61, vs_promedio: 'muy_por_encima' },
      { tipo: 'giro', label: 'Giro brusco', pct_viajes: 38, vs_promedio: 'muy_por_encima' },
      { tipo: 'telefono', label: 'Uso de teléfono', pct_viajes: 22, vs_promedio: 'en_linea' },
      { tipo: 'velocidad', label: 'Exceso de velocidad', pct_viajes: 8, vs_promedio: 'por_debajo' },
    ],
    score_total: 68,

    barrio: 'La Boca',
    km_a_ruta: 0.5,
    modo_transporte: { auto: 80, caminando: 15, publico: 5 },
    horarios: { pct_noche: 40, pct_pico: 35, pct_finde: 25 },
    distancia_km_mes: 380,
  },
}
