import { encodePolyline } from './polyline'

export interface DriverRoute {
  id: string
  name: string
  color: string
  polyline: string
  twinHref: string
}

export interface Siniestro {
  lat: number
  lng: number
  severity: number // 1-3
}

export const DRIVER_ROUTES: DriverRoute[] = [
  {
    id: 'micaela',
    name: 'Micaela',
    color: '#3b82f6',
    polyline: encodePolyline([
      [-34.5753, -58.4341], // Palermo norte
      [-34.5820, -58.4250], // Palermo centro
      [-34.5900, -58.4130], // Santa Fe / Pueyrredón
      [-34.5970, -58.4020], // Recoleta
      [-34.6025, -58.3985], // Tribunales
      [-34.6060, -58.3900], // Corrientes / Florida
      [-34.6087, -58.3820], // Microcentro
      [-34.6135, -58.3770], // San Telmo norte
      [-34.6222, -58.3700], // San Telmo
    ]),
    twinHref: '/gemelo/micaela',
  },
  {
    id: 'nico',
    name: 'Nico',
    color: '#22c55e',
    polyline: encodePolyline([
      [-34.5510, -58.4620], // Belgrano C
      [-34.5600, -58.4540], // Villa Urquiza border
      [-34.5710, -58.4460], // Colegiales
      [-34.5810, -58.4410], // Palermo Hollywood
      [-34.5880, -58.4380], // Villa Crespo
      [-34.5960, -58.4310], // Almagro norte
      [-34.6010, -58.4260], // Almagro sur
      [-34.6055, -58.4160], // Balvanera
      [-34.6100, -58.4050], // Once / Congreso
    ]),
    twinHref: '/gemelo/nico',
  },
  {
    id: 'jorge',
    name: 'Jorge',
    color: '#f97316',
    polyline: encodePolyline([
      [-34.6345, -58.3636], // La Boca
      [-34.6280, -58.3660], // La Boca norte
      [-34.6210, -58.3690], // San Telmo sur
      [-34.6150, -58.3720], // San Telmo
      [-34.6080, -58.3740], // Monserrat
      [-34.5990, -58.3750], // Puerto Madero sur
      [-34.5900, -58.3745], // Puerto Madero norte
      [-34.5840, -58.3738], // Catalinas
      [-34.5790, -58.3730], // Retiro
    ]),
    twinHref: '/gemelo/jorge',
  },
]

export const SINIESTROS: Siniestro[] = [
  { lat: -34.5970, lng: -58.4020, severity: 2 },
  { lat: -34.6025, lng: -58.3985, severity: 3 },
  { lat: -34.6080, lng: -58.3740, severity: 1 },
  { lat: -34.6150, lng: -58.3720, severity: 2 },
  { lat: -34.5710, lng: -58.4460, severity: 1 },
  { lat: -34.6010, lng: -58.4260, severity: 3 },
  { lat: -34.6222, lng: -58.3700, severity: 2 },
  { lat: -34.5790, lng: -58.3730, severity: 1 },
  { lat: -34.6100, lng: -58.4050, severity: 2 },
  { lat: -34.5510, lng: -58.4620, severity: 1 },
  { lat: -34.6087, lng: -58.3820, severity: 3 },
  { lat: -34.5880, lng: -58.4380, severity: 2 },
  { lat: -34.6055, lng: -58.4160, severity: 1 },
  { lat: -34.5900, lng: -58.4130, severity: 2 },
]
