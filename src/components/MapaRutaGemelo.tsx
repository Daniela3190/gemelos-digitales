'use client'

import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import { decodePolyline } from '@/lib/polyline'

export default function MapaRutaGemelo({
  polyline,
  color,
  nombre,
}: {
  polyline: string
  color: string
  nombre: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const coords = decodePolyline(polyline)
    const bounds = L.latLngBounds(coords)

    const map = L.map(containerRef.current, {
      preferCanvas: true,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.polyline(coords, { color, weight: 5, opacity: 0.85 }).addTo(map)

    // Punto de inicio
    L.circleMarker(coords[0], {
      radius: 7,
      color: '#ffffff',
      fillColor: color,
      fillOpacity: 1,
      weight: 2.5,
    }).bindTooltip(`${nombre} — origen`, { permanent: false }).addTo(map)

    // Punto actual (último)
    const last = coords[coords.length - 1]
    L.circleMarker(last, {
      radius: 9,
      color: '#ffffff',
      fillColor: color,
      fillOpacity: 1,
      weight: 3,
    }).bindTooltip(`${nombre} — posición actual`, { permanent: false }).addTo(map)

    map.fitBounds(bounds, { padding: [24, 24] })
    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
