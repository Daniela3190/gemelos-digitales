'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as L from 'leaflet'
import { decodePolyline } from '@/lib/polyline'
import { DRIVER_ROUTES, SINIESTROS } from '@/lib/mock-drivers'

export default function MapaUniverso() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [-34.6037, -58.3816],
      zoom: 12,
      preferCanvas: true,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map
    const routeLayers: L.Polyline[] = []

    for (const driver of DRIVER_ROUTES) {
      const coords = decodePolyline(driver.polyline)

      const polyline = L.polyline(coords, {
        color: driver.color,
        weight: 4,
        opacity: 0.4,
      }).addTo(map)

      polyline.bindTooltip(
        `<strong>${driver.name}</strong><br><span style="font-size:11px;color:#94a3b8">Ver gemelo digital →</span>`,
        { sticky: true }
      )

      polyline.on('click', () => {
        routerRef.current.push(driver.twinHref)
      })

      const lastPos = coords[coords.length - 1]
      L.circleMarker(lastPos, {
        radius: 7,
        color: '#ffffff',
        fillColor: driver.color,
        fillOpacity: 1,
        weight: 2.5,
      })
        .bindTooltip(`${driver.name} — en ruta`, { permanent: false })
        .addTo(map)

      routeLayers.push(polyline)
    }

    for (const s of SINIESTROS) {
      const radius = 5 + s.severity * 3
      L.circleMarker([s.lat, s.lng], {
        radius,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.15 + s.severity * 0.08,
        weight: 1,
      })
        .bindTooltip(
          `<strong>Siniestro</strong><br>Severidad: ${'●'.repeat(s.severity)}${'○'.repeat(3 - s.severity)}`,
          { sticky: true }
        )
        .addTo(map)
    }

    // Breathing animation: 10 pasos × 300ms = 3s por ciclo
    let phase = 0
    intervalRef.current = setInterval(() => {
      phase += (2 * Math.PI) / 10
      const opacity = 0.2 + 0.2 * (1 + Math.sin(phase))
      routeLayers.forEach(l => l.setStyle({ opacity }))
    }, 300)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Leyenda */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          right: 16,
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          padding: 16,
          minWidth: 144,
          pointerEvents: 'auto',
        }}
      >
        <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Conductores
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DRIVER_ROUTES.map(driver => (
            <div key={driver.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 20, height: 3, borderRadius: 2, backgroundColor: driver.color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{driver.name}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.6)', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: '#64748b' }}>Siniestro</span>
          </div>
        </div>
      </div>
    </div>
  )
}
