function encodeNum(n: number): string {
  let v = n < 0 ? ~(n << 1) : n << 1
  let s = ''
  while (v >= 0x20) {
    s += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
    v >>= 5
  }
  return s + String.fromCharCode(v + 63)
}

export function encodePolyline(coords: [number, number][]): string {
  let prevLat = 0, prevLng = 0, result = ''
  for (const [lat, lng] of coords) {
    const iLat = Math.round(lat * 1e5)
    const iLng = Math.round(lng * 1e5)
    result += encodeNum(iLat - prevLat) + encodeNum(iLng - prevLng)
    prevLat = iLat
    prevLng = iLng
  }
  return result
}

export function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = []
  let idx = 0, lat = 0, lng = 0
  while (idx < encoded.length) {
    let b: number, shift = 0, result = 0
    do {
      b = encoded.charCodeAt(idx++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1

    shift = 0; result = 0
    do {
      b = encoded.charCodeAt(idx++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1

    coords.push([lat / 1e5, lng / 1e5])
  }
  return coords
}
