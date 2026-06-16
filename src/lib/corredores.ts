import { decodePolyline } from './polyline'

// 300 metros en grados para Buenos Aires (latitud ~-34°)
const BUFFER_LAT = 0.0027  // 300 ÷ 111,000 m/grado
const BUFFER_LNG = 0.0033  // 300 ÷ (111,000 × cos(34°)) m/grado

interface Corredor {
  nombre: string
  lat_min: number
  lat_max: number
  lng_min: number
  lng_max: number
  tarifa: number
}

const CORREDORES: Corredor[] = [
  {
    nombre: 'Richieri',
    lat_min: -34.82,               lat_max: -34.62,
    lng_min: -58.55,               lng_max: -58.42,
    tarifa: 850,
  },
  {
    nombre: 'AU 25 de Mayo',
    lat_min: -34.62 - BUFFER_LAT,  lat_max: -34.62 + BUFFER_LAT,
    lng_min: -58.50,               lng_max: -58.37,
    tarifa: 850,
  },
  {
    nombre: 'Panamericana',
    lat_min: -34.52,               lat_max: -34.45,
    lng_min: -58.49 - BUFFER_LNG,  lng_max: -58.49 + BUFFER_LNG,
    tarifa: 1200,
  },
  {
    nombre: 'Acceso Oeste',
    lat_min: -34.63 - BUFFER_LAT,  lat_max: -34.63 + BUFFER_LAT,
    lng_min: -58.65,               lng_max: -58.50,
    tarifa: 950,
  },
  {
    nombre: 'AU Illia',
    lat_min: -34.57 - BUFFER_LAT,  lat_max: -34.57 + BUFFER_LAT,
    lng_min: -58.43,               lng_max: -58.37,
    tarifa: 750,
  },
]

export interface PeajeDetectado {
  nombre: string
  viajes_mes: number
  tarifa: number
}

function routeLengthKm(coords: [number, number][]): number {
  let km = 0
  for (let i = 1; i < coords.length; i++) {
    const dlat = (coords[i][0] - coords[i - 1][0]) * 111
    const dlng =
      (coords[i][1] - coords[i - 1][1]) *
      111 *
      Math.cos((coords[i - 1][0] * Math.PI) / 180)
    km += Math.sqrt(dlat * dlat + dlng * dlng)
  }
  return km
}

export function detectarPeajes(
  encodedPolyline: string,
  distanciaKmMes: number,
): PeajeDetectado[] {
  const coords = decodePolyline(encodedPolyline)
  const routeKm = routeLengthKm(coords)
  const viajesMes =
    routeKm > 0 ? Math.max(1, Math.round(distanciaKmMes / routeKm)) : 1

  return CORREDORES.filter(c =>
    coords.some(
      ([lat, lng]) =>
        lat >= c.lat_min &&
        lat <= c.lat_max &&
        lng >= c.lng_min &&
        lng <= c.lng_max,
    ),
  ).map(c => ({ nombre: c.nombre, viajes_mes: viajesMes, tarifa: c.tarifa }))
}
