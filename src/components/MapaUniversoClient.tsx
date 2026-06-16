'use client'

import dynamic from 'next/dynamic'

const MapaUniverso = dynamic(() => import('./MapaUniverso'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '100%',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#334155',
        fontSize: 14,
      }}
    >
      Cargando mapa…
    </div>
  ),
})

export default function MapaUniversoClient() {
  return <MapaUniverso />
}
