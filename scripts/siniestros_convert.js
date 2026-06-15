// Converts siniestros_viales_hechos.xlsx to:
//   public/data/siniestros_grid.json   — 100m grid cells with counts
//   public/data/exposure_<shortId>.json — pre-computed exposure per user
const XLSX = require('xlsx');
const fs   = require('fs');
const path = require('path');

const DATOS = 'C:/Users/Daniela/Desktop/Gemelos digitales/datos';
const DATA  = path.join(__dirname, '../public/data');

const CELL    = 0.001;   // ~100 m
const THRESH  = 3;       // cells with 3+ siniestros = high risk
const STEP    = 3;       // sample every Nth path point

// ── 1. Read Excel ────────────────────────────────────────────────────────────
console.log('Reading siniestros_viales_hechos.xlsx …');
const wb   = XLSX.readFile(path.join(DATOS, 'siniestros_viales_hechos.xlsx'));
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
console.log(`Rows: ${rows.length}`);
if (rows.length) console.log('Columns:', Object.keys(rows[0]).join(', '));

// ── 2. Build grid ────────────────────────────────────────────────────────────
// Key = integer pair "lat1000,lon1000" (avoids float precision issues)
function key(lat, lon) {
  return `${Math.floor(lat * 1000)},${Math.floor(lon * 1000)}`;
}

const grid = {};
let valid = 0, skip = 0;

for (const r of rows) {
  const lat = parseFloat(r.latitud_siniestro);
  const lon = parseFloat(r.longitud_siniestro);
  if (!isFinite(lat) || !isFinite(lon) || lat === 0 || lon === 0) { skip++; continue; }
  valid++;

  const g = String(r.gravedad_siniestro).toLowerCase().trim();
  const k = key(lat, lon);
  if (!grid[k]) {
    // Cell centre at +0.5 CELL
    grid[k] = {
      lat: (Math.floor(lat * 1000) + 0.5) / 1000,
      lon: (Math.floor(lon * 1000) + 0.5) / 1000,
      L: 0, G: 0, M: 0
    };
  }
  if (g.startsWith('g'))      grid[k].G++;
  else if (g.startsWith('m')) grid[k].M++;
  else                        grid[k].L++;
}

console.log(`Valid: ${valid}, Skipped: ${skip}`);
console.log(`Grid cells: ${Object.keys(grid).length}`);

// Save compact array [lat, lon, leve, grave, mortal] — 4 decimal places
const cells = Object.values(grid).map(c => [
  Math.round(c.lat * 10000) / 10000,
  Math.round(c.lon * 10000) / 10000,
  c.L, c.G, c.M
]);
fs.writeFileSync(path.join(DATA, 'siniestros_grid.json'), JSON.stringify(cells));
console.log(`Saved siniestros_grid.json (${cells.length} cells)`);

// ── 3. High-risk set ─────────────────────────────────────────────────────────
const highRisk = new Set(
  Object.entries(grid)
    .filter(([, c]) => c.L + c.G + c.M >= THRESH)
    .map(([k]) => k)
);
console.log(`High-risk cells (≥${THRESH}): ${highRisk.size}`);

// ── 4. Exposure per user ─────────────────────────────────────────────────────
const users = JSON.parse(fs.readFileSync(path.join(DATA, 'users.json'), 'utf-8'));

for (const user of users) {
  const shortId = user.id.slice(-6);
  const viajesFile = path.join(DATA, `viajes_${shortId}.json`);
  if (!fs.existsSync(viajesFile)) { console.log(`No viajes: ${user.nombre}`); continue; }

  const viajes = JSON.parse(fs.readFileSync(viajesFile, 'utf-8'));

  let totalPts = 0, riskPts = 0, viajesEnRiesgo = 0;
  const warnMap = {}; // key → { lat, lon, total, grave }

  for (const v of viajes) {
    if (!v.path || v.path.length < 2) continue;
    let vRisk = 0, vTotal = 0;

    for (let i = 0; i < v.path.length; i += STEP) {
      const [lat, lon] = v.path[i];
      const k = key(lat, lon);
      vTotal++; totalPts++;
      if (highRisk.has(k)) {
        vRisk++; riskPts++;
        if (!warnMap[k]) {
          const c = grid[k];
          warnMap[k] = { lat: c.lat, lon: c.lon, total: c.L + c.G + c.M, grave: c.G + c.M };
        }
      }
    }
    if (vTotal > 0 && vRisk / vTotal > 0.08) viajesEnRiesgo++;
  }

  const pct = totalPts > 0 ? Math.round((riskPts / totalPts) * 100) : 0;
  const graveSev = Object.values(warnMap).reduce((a, c) => a + c.grave, 0);
  const score = Math.min(95, Math.round(pct * 2 + Math.min(graveSev / 5, 20)));
  const label = score >= 60 ? 'Alta' : score >= 30 ? 'Moderada' : 'Baja';

  // Top 30 warning points by severity
  const warning_points = Object.values(warnMap)
    .sort((a, b) => b.grave - a.grave || b.total - a.total)
    .slice(0, 30)
    .map(c => [c.lat, c.lon]);

  const exposure = { score, label, pct_riesgo: pct, warning_points, viajes_riesgo: viajesEnRiesgo, total_viajes: viajes.length };
  fs.writeFileSync(path.join(DATA, `exposure_${shortId}.json`), JSON.stringify(exposure));
  console.log(`${user.nombre}: score=${score} label=${label} pct=${pct}% viajes_riesgo=${viajesEnRiesgo}/${viajes.length} warnings=${warning_points.length}`);
}

console.log('Done.');
