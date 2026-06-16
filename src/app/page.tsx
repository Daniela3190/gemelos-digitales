import Link from 'next/link'
import { GEMELOS } from '@/lib/mock-gemelos'
import MapaUniversoClient from '@/components/MapaUniversoClient'

const card = {
  background: '#1e293b',
  borderRadius: 12,
  padding: 16,
  border: '1px solid rgba(255,255,255,0.06)',
  cursor: 'pointer',
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
  position: 'relative' as const,
} as const

function riskColor(pct: number) {
  if (pct >= 50) return '#ef4444'
  if (pct >= 35) return '#f97316'
  return '#22c55e'
}

export default function HomePage() {
  const drivers = Object.values(GEMELOS)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            Gemelos Digitales
          </h1>
          <p style={{ fontSize: 12, color: '#475569', margin: 0, marginTop: 2 }}>
            Panel de conducción · Swiss Medical Seguros
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#475569' }}>3 asegurados activos</span>
          <div
            className="pulse"
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}
          />
        </div>
      </header>

      {/* Layout: sidebar + map */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 57px)' }}>
        {/* Sidebar */}
        <div
          style={{
            width: 360,
            flexShrink: 0,
            overflowY: 'auto',
            padding: 16,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: '#475569',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            Gemelos activos
          </div>

          {drivers.map(g => (
            <Link key={g.id} href={`/gemelo/${g.id}`} style={card}>
              {/* Score circle */}
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  border: `3px solid ${g.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0f172a',
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: g.color }}>{g.score_total}</span>
              </div>

              {/* Name + vehicle */}
              <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 3, paddingRight: 64 }}>
                {g.nombre}
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 12 }}>
                {g.vehiculo} {g.anio} · {g.barrio}
              </div>

              {/* Risk indicators */}
              <div style={{ display: 'flex', gap: 6 }}>
                <div
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    borderRadius: 6,
                    padding: '5px 8px',
                    border: `1px solid ${riskColor(g.prob_siniestro)}25`,
                  }}
                >
                  <div style={{ fontSize: 9, color: '#334155', marginBottom: 1 }}>🚨 Siniestro</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: riskColor(g.prob_siniestro) }}>
                    {g.prob_siniestro}%
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    borderRadius: 6,
                    padding: '5px 8px',
                    border: `1px solid ${riskColor(g.prob_asistencia)}25`,
                  }}
                >
                  <div style={{ fontSize: 9, color: '#334155', marginBottom: 1 }}>🔧 Asistencia</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: riskColor(g.prob_asistencia) }}>
                    {g.prob_asistencia}%
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: '#334155',
                  textAlign: 'right',
                }}
              >
                {g.distancia_km_mes} km/mes
              </div>
            </Link>
          ))}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapaUniversoClient />
        </div>
      </div>
    </div>
  )
}
