'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  GEMELOS, calcularCombustible,
  type BreakdownItem, type EventoConduccion, type GemeloData,
} from '@/lib/mock-gemelos'
import { DRIVER_ROUTES } from '@/lib/mock-drivers'
import { detectarPeajes, type PeajeDetectado } from '@/lib/corredores'

// ─── Gauge semicircular SVG ─────────────────────────────────────────────────

function ProbGauge({ prob, color }: { prob: number; color: string }) {
  const arc = 157.08 // π × 50
  const fill = (prob / 100) * arc
  const riskLabel = prob >= 70 ? 'Riesgo muy alto' : prob >= 50 ? 'Riesgo alto' : prob >= 30 ? 'Riesgo moderado' : 'Riesgo bajo'
  const riskCls = prob >= 70 ? 'text-red-600' : prob >= 50 ? 'text-orange-500' : prob >= 30 ? 'text-yellow-600' : 'text-green-600'
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 120 72" className="w-40 h-auto overflow-visible">
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${fill} ${arc}`} />
        <text x="60" y="55" textAnchor="middle" fontSize="24" fontWeight="900" fill={color}>{prob}%</text>
        <text x="60" y="68" textAnchor="middle" fontSize="8.5" fill="#9ca3af">probabilidad</text>
      </svg>
      <span className={`text-xs font-bold ${riskCls}`}>{riskLabel}</span>
    </div>
  )
}

// ─── Barra de contribución al riesgo ────────────────────────────────────────

function BreakdownBar({ item, color }: { item: BreakdownItem; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">{item.icon} {item.categoria}</span>
        <span className="text-xs font-bold text-gray-900">{item.pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-gray-400 leading-snug">{item.descripcion}</p>
    </div>
  )
}

// ─── Badge de comparación con promedio ──────────────────────────────────────

function VsPromedioBadge({ v }: { v: EventoConduccion['vs_promedio'] }) {
  if (v === 'muy_por_encima') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 whitespace-nowrap">🔴 Muy por encima del promedio</span>
  if (v === 'en_linea')       return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 whitespace-nowrap">🟡 En línea con el promedio</span>
  return                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">🟢 Por debajo del promedio</span>
}

// ─── Score badge ─────────────────────────────────────────────────────────────

function scoreBadge(n: number) {
  if (n >= 80) return { label: 'Excelente', cls: 'bg-blue-100 text-blue-700' }
  if (n >= 65) return { label: 'Bueno',     cls: 'bg-green-100 text-green-700' }
  if (n >= 50) return { label: 'Regular',   cls: 'bg-yellow-100 text-yellow-800' }
  return             { label: 'Riesgo',     cls: 'bg-red-100 text-red-700' }
}

// ─── Barra horizontal simple ─────────────────────────────────────────────────

function HBar({ label, pct, color = '#6b7280' }: { label: string; pct: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold text-gray-900">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ─── Tooltip del pie chart ────────────────────────────────────────────────────

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-1.5 text-xs font-semibold">
      {d.name}: <span style={{ color: d.payload.color }}>{d.value}%</span>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GemeloPage() {
  const params = useParams()
  const id = params?.id as string
  const g: GemeloData | undefined = GEMELOS[id]

  if (!g) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-3">
          <p className="text-gray-400 text-sm">Conductor no encontrado</p>
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            ← Volver al mapa
          </Link>
        </div>
      </div>
    )
  }

  const combustible = calcularCombustible(g)
  const pesos = (n: number) => `$${n.toLocaleString('es-AR')}`

  const driverRoute = DRIVER_ROUTES.find(r => r.id === id)
  const peajesDetectados: PeajeDetectado[] = driverRoute
    ? detectarPeajes(driverRoute.polyline, g.distancia_km_mes)
    : []
  const peajesCostoMes = peajesDetectados.reduce((s, p) => s + p.viajes_mes * p.tarifa, 0)
  const peajesViajesMes = peajesDetectados.reduce((s, p) => s + p.viajes_mes, 0)

  const transportData = [
    { name: '🚗 Auto',               value: g.modo_transporte.auto,      color: g.color },
    { name: '🚶 Caminando',           value: g.modo_transporte.caminando, color: '#94a3b8' },
    { name: '🚌 Transporte público',  value: g.modo_transporte.publico,   color: '#cbd5e1' },
  ]

  const sb = scoreBadge(g.score_total)

  return (
    <div className="min-h-screen bg-slate-50">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 48px' }}>
        <div className="space-y-6">

          {/* ── Breadcrumb ── */}
          <div>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 font-medium">
              ← Vista Universo
            </Link>
          </div>

          {/* ── Hero ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-none"
                  style={{ backgroundColor: g.color }}>
                  {g.nombre[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">{g.nombre}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {g.vehiculo} {g.anio} · {g.motor}
                    {g.abs && <span className="ml-2 text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">ABS</span>}
                    {!g.abs && <span className="ml-2 text-xs font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">Sin ABS</span>}
                    {g.airbags && <span className="ml-1 text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">Airbags</span>}
                    {!g.airbags && <span className="ml-1 text-xs font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">Sin airbags</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{g.antiguedad} años de antigüedad · {g.barrio}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Score de conducción</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${sb.cls}`}>
                    {g.score_total}/100 · {sb.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Probabilidades ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* Siniestro */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
              <p className="text-sm font-bold text-gray-900">Probabilidad de siniestro</p>
              <p className="text-xs text-gray-500">Estimación para los próximos 12 meses</p>

              <div className="flex justify-center">
                <ProbGauge prob={g.prob_siniestro} color={g.color} />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                {g.narrativo_siniestro}
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Factores que explican el riesgo
                </p>
                <div className="space-y-4">
                  {g.siniestro_breakdown.map(item => (
                    <div key={item.categoria}>
                      <p className="text-xs text-gray-500 mb-1">
                        {item.categoria} explica el <strong className="text-gray-800">{item.pct}%</strong> del riesgo total
                      </p>
                      <BreakdownBar item={item} color={g.color} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Asistencia */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
              <p className="text-sm font-bold text-gray-900">Probabilidad de asistencia</p>
              <p className="text-xs text-gray-500">Estimación para los próximos 6 meses</p>

              <div className="flex justify-center">
                <ProbGauge prob={g.prob_asistencia} color={g.color} />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                {g.narrativo_asistencia}
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Factores que explican el riesgo
                </p>
                {g.asistencia_breakdown.map(item => (
                  <div key={item.categoria}>
                    <p className="text-xs text-gray-500 mb-1">
                      {item.categoria} explica el <strong className="text-gray-800">{item.pct}%</strong> del riesgo total
                    </p>
                    <BreakdownBar item={item} color={g.color} />
                  </div>
                ))}
              </div>

              {/* Recomendación */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl p-3.5">
                  <span className="text-base flex-none mt-0.5">💡</span>
                  <div>
                    <p className="text-xs font-bold text-blue-800">Recomendación</p>
                    <p className="text-xs text-blue-700 mt-0.5">{g.recomendacion_asistencia}</p>
                  </div>
                </div>
              </div>

              {/* Historial */}
              {g.historial_asistencias.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Historial de asistencias</p>
                  {g.historial_asistencias.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full flex-none" style={{ backgroundColor: g.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{h.tipo}</p>
                        <p className="text-xs text-gray-400 truncate">{h.descripcion}</p>
                      </div>
                      <p className="text-xs text-gray-400 whitespace-nowrap flex-none">
                        {new Date(h.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── Eventos de conducción ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
            <div>
              <p className="text-sm font-bold text-gray-900">Eventos de conducción</p>
              <p className="text-xs text-gray-500 mt-0.5">Detectados por el sensor telemático en todos sus viajes</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
              {g.narrativo_conduccion}
            </div>

            <div className="divide-y divide-gray-50">
              {g.eventos_conduccion.map(ev => (
                <div key={ev.tipo} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{ev.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Presente en el <span className="font-bold text-gray-800">{ev.pct_viajes}%</span> de sus viajes
                      </p>
                    </div>
                    <VsPromedioBadge v={ev.vs_promedio} />
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${ev.pct_viajes}%`,
                      backgroundColor: ev.vs_promedio === 'muy_por_encima' ? '#ef4444'
                        : ev.vs_promedio === 'en_linea' ? '#f59e0b' : '#22c55e',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
                <span className="text-2xl font-black" style={{ color: g.color }}>{g.score_total}</span>
                <div>
                  <p className="text-xs font-bold text-gray-700">Score total</p>
                  <p className="text-xs text-gray-400">sobre 100 puntos</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 flex-1">
                Un score de <strong className="text-gray-700">{g.score_total}/100</strong> significa{' '}
                {g.score_total >= 80 ? 'una conducción excelente, por debajo del riesgo medio de la aseguradora.'
                  : g.score_total >= 65 ? 'una conducción buena con áreas de mejora puntuales.'
                  : g.score_total >= 50 ? 'una conducción regular que impacta el riesgo de siniestro.'
                  : 'una conducción de riesgo que requiere atención inmediata.'}
              </p>
            </div>
          </div>

          {/* ── Perfil de movilidad ── */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Perfil de movilidad</h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

              {/* Card izquierda: dónde vive + modos de transporte */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-6">

                {/* Dónde vive */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dónde vive</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{g.barrio}</p>
                      <p className="text-xs text-gray-500">
                        a <strong className="text-gray-700">{g.km_a_ruta} km</strong> de su ruta habitual
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {g.nombre} vive en {g.barrio}. Su punto de inicio es consistente con los viajes registrados por telemática.
                  </p>
                </div>

                <div className="border-t border-gray-100" />

                {/* Modos de transporte */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Modos de transporte</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-none">
                      <ResponsiveContainer width={100} height={100}>
                        <PieChart>
                          <Pie data={transportData} cx={45} cy={45} innerRadius={28} outerRadius={45} dataKey="value" startAngle={90} endAngle={-270}>
                            {transportData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={(p: any) => <PieTooltip active={p.active} payload={p.payload} />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {transportData.map(t => (
                        <div key={t.name} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: t.color }} />
                          <span className="text-xs text-gray-600 flex-1">{t.name}</span>
                          <span className="text-xs font-bold text-gray-800">{t.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Card derecha: horarios + combustible + peajes */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-6">

                {/* Horarios de manejo */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Horarios de manejo</p>
                  <div className="space-y-3">
                    <HBar
                      label="🌙 Horario nocturno (20:00–06:00)"
                      pct={g.horarios.pct_noche}
                      color={g.horarios.pct_noche >= 30 ? '#ef4444' : '#94a3b8'}
                    />
                    <HBar
                      label="🚦 Hora pico (7–9hs y 17–20hs)"
                      pct={g.horarios.pct_pico}
                      color={g.color}
                    />
                    <HBar
                      label="📅 Fines de semana"
                      pct={g.horarios.pct_finde}
                      color="#94a3b8"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Combustible */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Consumo de nafta estimado</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Litros/mes</p>
                      <p className="text-lg font-black text-gray-900">{combustible.litros_mes} L</p>
                      <p className="text-xs text-gray-400 mt-0.5">{g.motor} · {g.litros_ciudad} L/100km ciudad</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Gasto mensual</p>
                      <p className="text-lg font-black" style={{ color: g.color }}>{pesos(combustible.costo_mes)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">nafta premium · $1.450/L</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Gasto anual estimado en combustible: <strong className="text-gray-700">{pesos(combustible.costo_anual)}</strong>
                  </p>
                </div>

                <div className="border-t border-gray-100" />

                {/* Peajes */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Peajes estimados</p>
                  {peajesDetectados.length === 0 ? (
                    <div className="text-center py-3">
                      <p className="text-sm text-gray-400">Sin autopistas detectadas en su ruta habitual</p>
                      <p className="text-xs text-gray-300 mt-1">Circula por calles de acceso libre</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-3">
                        {peajesDetectados.map(p => (
                          <div key={p.nombre} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-700 font-medium">🛣️ {p.nombre}</span>
                            <span className="text-gray-400">{p.viajes_mes} viajes/mes</span>
                            <span className="font-bold text-gray-900">{pesos(p.viajes_mes * p.tarifa)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-orange-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-orange-800">Peajes estimados por mes</p>
                          <p className="text-xs text-orange-600">basado en {peajesViajesMes} viajes detectados en autopistas</p>
                        </div>
                        <p className="text-base font-black text-orange-700">{pesos(peajesCostoMes)}</p>
                      </div>
                    </>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
