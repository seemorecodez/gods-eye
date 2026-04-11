import { twoline2satrec, propagate, gstime, eciToGeodetic, degreesLat, degreesLong } from 'satellite.js'
import { CameraFeed } from './types'

export interface SatelliteData {
  noradId: string
  name: string
  type: 'satellite' | 'ground' | 'aerial'
  orbitAlt: number
}

export interface SatellitePosition {
  name: string
  lat: number
  lng: number
  velocity: number
  type: 'satellite' | 'ground' | 'aerial'
}

export interface SatellitePass {
  id: string
  name: string
  passTime: Date
  lat: number
  lng: number
  alt: number
  altitude: number
  nextPass: Date
  noradId: string
  velocity: number
  type: 'satellite' | 'ground' | 'aerial'
  status: 'online' | 'offline' | 'error'
}

export interface ISSData {
  position: {
    lat: number
    lng: number
  }
  velocity: number
  altitude: number
  crew: string[]
  liveStreamUrl: string
}

const SATELLITE_METADATA: SatelliteData[] = [
  { name: 'ISS (Zarya)', noradId: '25544', type: 'satellite', orbitAlt: 408 },
  { name: 'Hubble Space Telescope', noradId: '20580', type: 'satellite', orbitAlt: 540 },
  { name: 'Sentinel-1A', noradId: '39634', type: 'satellite', orbitAlt: 693 },
  { name: 'Sentinel-2A', noradId: '40697', type: 'satellite', orbitAlt: 786 },
  { name: 'Landsat-8', noradId: '39084', type: 'satellite', orbitAlt: 705 },
  { name: 'Landsat-9', noradId: '49260', type: 'satellite', orbitAlt: 705 },
  { name: 'Terra', noradId: '25994', type: 'satellite', orbitAlt: 705 },
  { name: 'Aqua', noradId: '27424', type: 'satellite', orbitAlt: 705 },
  { name: 'NOAA-20', noradId: '43013', type: 'satellite', orbitAlt: 824 },
  { name: 'WorldView-3', noradId: '40115', type: 'satellite', orbitAlt: 617 },
  { name: 'WorldView-4', noradId: '41848', type: 'satellite', orbitAlt: 617 },
]

const CELESTRAK_TLE_URL = 'https://celestrak.org/GP/query?GROUP=active&FORMAT=tle'
const TLE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

interface ParsedSatRec {
  name: string
  noradId: string
  satrec: ReturnType<typeof twoline2satrec>
  type: 'satellite' | 'ground' | 'aerial'
  orbitAlt: number
}

let tleCache: { records: ParsedSatRec[]; fetchedAt: number } | null = null

function parseTleText(text: string): Map<string, [string, string]> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const tleMap = new Map<string, [string, string]>()
  let i = 0
  while (i < lines.length - 2) {
    if (lines[i + 1].startsWith('1 ') && lines[i + 2].startsWith('2 ')) {
      const name = lines[i].replace(/^0 /, '').trim()
      const noradId = lines[i + 1].substring(2, 7).trim()
      tleMap.set(noradId, [lines[i + 1], lines[i + 2]])
      i += 3
    } else {
      i++
    }
  }
  return tleMap
}

async function loadTleRecords(): Promise<ParsedSatRec[]> {
  const now = Date.now()
  if (tleCache && now - tleCache.fetchedAt < TLE_TTL_MS) {
    return tleCache.records
  }

  let tleMap = new Map<string, [string, string]>()
  try {
    const resp = await fetch(CELESTRAK_TLE_URL)
    if (!resp.ok) throw new Error(`Celestrak responded ${resp.status}`)
    const text = await resp.text()
    tleMap = parseTleText(text)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('fetch_error: Celestrak TLE:', msg)
    if (tleCache) return tleCache.records
    return []
  }

  const records: ParsedSatRec[] = []
  for (const meta of SATELLITE_METADATA) {
    const tle = tleMap.get(meta.noradId)
    if (!tle) continue
    try {
      const satrec = twoline2satrec(tle[0], tle[1])
      records.push({ name: meta.name, noradId: meta.noradId, satrec, type: meta.type, orbitAlt: meta.orbitAlt })
    } catch {
      // skip satellites with invalid TLE
    }
  }

  tleCache = { records, fetchedAt: now }
  return records
}

function propagatePosition(record: ParsedSatRec, date: Date): { lat: number; lng: number; alt: number; velocity: number } | null {
  try {
    const result = propagate(record.satrec, date)
    if (!result.position || typeof result.position === 'boolean') return null
    const gmst = gstime(date)
    const geodetic = eciToGeodetic(result.position, gmst)
    const lat = degreesLat(geodetic.latitude)
    const lng = degreesLong(geodetic.longitude)
    const alt = geodetic.height
    let velocity = 0
    if (result.velocity && typeof result.velocity !== 'boolean') {
      const v = result.velocity as { x: number; y: number; z: number }
      velocity = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
    }
    return { lat, lng, alt, velocity }
  } catch {
    return null
  }
}

export async function getSatellitePositionsAsync(): Promise<SatellitePosition[]> {
  const records = await loadTleRecords()
  const now = new Date()
  const positions: SatellitePosition[] = []
  for (const record of records) {
    const pos = propagatePosition(record, now)
    if (!pos) continue
    positions.push({ name: record.name, lat: pos.lat, lng: pos.lng, velocity: pos.velocity, type: record.type })
  }
  return positions
}

export function getSatellitePositions(): SatellitePosition[] {
  if (tleCache && tleCache.records.length > 0) {
    const now = new Date()
    return tleCache.records.flatMap(record => {
      const pos = propagatePosition(record, now)
      if (!pos) return []
      return [{ name: record.name, lat: pos.lat, lng: pos.lng, velocity: pos.velocity, type: record.type }]
    })
  }
  // TLE not yet loaded — return empty; callers should use getSatellitePositionsAsync()
  return []
}

export async function fetchSatellitePassesAsync(): Promise<SatellitePass[]> {
  const records = await loadTleRecords()
  const now = new Date()
  const passes: SatellitePass[] = []
  for (const record of records) {
    const pos = propagatePosition(record, now)
    if (!pos) continue
    const nextPassTime = new Date(now.getTime() + 5400000) // ~90 min later (one orbit approx)
    passes.push({
      id: `pass-${record.noradId}`,
      name: record.name,
      passTime: now,
      lat: pos.lat,
      lng: pos.lng,
      alt: pos.alt,
      altitude: pos.alt,
      nextPass: nextPassTime,
      noradId: record.noradId,
      velocity: pos.velocity,
      type: record.type,
      status: 'online' as const,
    })
  }
  return passes
}

export function fetchSatellitePasses(): SatellitePass[] {
  if (tleCache && tleCache.records.length > 0) {
    const now = new Date()
    return tleCache.records.flatMap(record => {
      const pos = propagatePosition(record, now)
      if (!pos) return []
      const nextPassTime = new Date(now.getTime() + 5400000)
      return [{
        id: `pass-${record.noradId}`,
        name: record.name,
        passTime: now,
        lat: pos.lat,
        lng: pos.lng,
        alt: pos.alt,
        altitude: pos.alt,
        nextPass: nextPassTime,
        noradId: record.noradId,
        velocity: pos.velocity,
        type: record.type,
        status: 'online' as const,
      }]
    })
  }
  return []
}

export async function getSatelliteFeedsAsync(): Promise<CameraFeed[]> {
  const satellites = await getSatellitePositionsAsync()
  return satellites.map(sat => ({
    id: `sat-${sat.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: sat.name,
    lat: sat.lat,
    lng: sat.lng,
    streamUrl: `https://satellite-feed.example.com/${sat.name}`,
    status: 'online' as const,
    lastFrame: new Date(),
    provider: 'ESA/NASA',
    type: 'satellite' as const,
    thumbnail: `https://satellite-feed.example.com/${sat.name}/thumb.jpg`,
  }))
}

export function getSatelliteFeeds(): CameraFeed[] {
  const satellites = getSatellitePositions()
  return satellites.map(sat => ({
    id: `sat-${sat.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: sat.name,
    lat: sat.lat,
    lng: sat.lng,
    streamUrl: `https://satellite-feed.example.com/${sat.name}`,
    status: 'online' as const,
    lastFrame: new Date(),
    provider: 'ESA/NASA',
    type: 'satellite' as const,
    thumbnail: `https://satellite-feed.example.com/${sat.name}/thumb.jpg`,
  }))
}

export function generateSatelliteImageryFeeds(): CameraFeed[] {
  return getSatelliteFeeds()
}

export async function getISSDataAsync(): Promise<ISSData> {
  const records = await loadTleRecords()
  const issRecord = records.find(r => r.name.includes('ISS'))
  if (!issRecord) throw new Error('ISS TLE record not found')
  const pos = propagatePosition(issRecord, new Date())
  if (!pos) throw new Error('ISS propagation failed')
  return {
    position: { lat: pos.lat, lng: pos.lng },
    velocity: pos.velocity,
    altitude: Math.round(pos.alt),
    crew: [
      'Commander: Matthew Dominick (NASA)',
      'Flight Engineer: Michael Barratt (NASA)',
      'Flight Engineer: Jeanette Epps (NASA)',
      'Flight Engineer: Alexander Grebenkin (Roscosmos)',
      'Flight Engineer: Tracy Dyson (NASA)',
      'Flight Engineer: Oleg Kononenko (Roscosmos)',
      'Flight Engineer: Nikolai Chub (Roscosmos)'
    ],
    liveStreamUrl: 'https://www.youtube.com/embed/P9C25Un7xaM'
  }
}

export function getISSData(): ISSData {
  const issRecord = tleCache?.records.find(r => r.name.includes('ISS'))
  if (!issRecord) throw new Error('ISS TLE not yet loaded — call getISSDataAsync()')
  const pos = propagatePosition(issRecord, new Date())
  if (!pos) throw new Error('ISS propagation failed')
  return {
    position: { lat: pos.lat, lng: pos.lng },
    velocity: pos.velocity,
    altitude: Math.round(pos.alt),
    crew: [
      'Commander: Matthew Dominick (NASA)',
      'Flight Engineer: Michael Barratt (NASA)',
      'Flight Engineer: Jeanette Epps (NASA)',
      'Flight Engineer: Alexander Grebenkin (Roscosmos)',
      'Flight Engineer: Tracy Dyson (NASA)',
      'Flight Engineer: Oleg Kononenko (Roscosmos)',
      'Flight Engineer: Nikolai Chub (Roscosmos)'
    ],
    liveStreamUrl: 'https://www.youtube.com/embed/P9C25Un7xaM'
  }
}

export function getOrbitalPeriod(noradId: string): number {
  const meta = SATELLITE_METADATA.find(s => s.noradId === noradId)
  if (!meta) return 90
  return 90 + (meta.orbitAlt - 600) * 0.1
}

export function getSatelliteByNoradId(noradId: string): SatelliteData | undefined {
  return SATELLITE_METADATA.find(s => s.noradId === noradId)
}

// Kick off TLE load on module init so positions are ready quickly
loadTleRecords().catch(() => {})
