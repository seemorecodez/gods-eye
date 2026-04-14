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
  isLive?: boolean
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
  isLive?: boolean
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
  isLive?: boolean
}

// Catalog of tracked satellites with their NORAD IDs and known orbital altitudes
const SATELLITES: SatelliteData[] = [
  { name: 'ISS (Zarya)', noradId: '25544', type: 'satellite', orbitAlt: 408 },
  { name: 'Hubble Space Telescope', noradId: '20580', type: 'satellite', orbitAlt: 540 },
  { name: 'Sentinel-1A', noradId: '39634', type: 'satellite', orbitAlt: 693 },
  { name: 'Sentinel-2A', noradId: '40697', type: 'satellite', orbitAlt: 786 },
  { name: 'Landsat-8', noradId: '39084', type: 'satellite', orbitAlt: 705 },
  { name: 'Landsat-9', noradId: '49260', type: 'satellite', orbitAlt: 705 },
  { name: 'Terra', noradId: '25994', type: 'satellite', orbitAlt: 705 },
  { name: 'Aqua', noradId: '27424', type: 'satellite', orbitAlt: 705 },
  { name: 'NOAA-20', noradId: '43013', type: 'satellite', orbitAlt: 824 },
]

// Cache: { data, fetchedAt }
const cache: { positions: { data: SatellitePass[]; fetchedAt: number } | null } = { positions: null }
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Where The ISS At API (free, no auth)
// https://wheretheiss.at/w/developer
interface WhereTheISSAtResponse {
  name: string
  id: number
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  visibility: string
  footprint: number
  timestamp: number
  daynum: number
  solar_lat: number
  solar_lon: number
  units: string
}

// Open Notify API for ISS crew (free, no auth)
// http://api.open-notify.org/astros.json
interface OpenNotifyAstroResponse {
  people: Array<{ craft: string; name: string }>
  number: number
  message: string
}

export async function fetchLiveISSData(): Promise<ISSData> {
  try {
    const [posResponse, crewResponse] = await Promise.all([
      fetch('https://api.wheretheiss.at/v1/satellites/25544'),
      fetch('https://api.open-notify.org/astros.json')
    ])

    if (!posResponse.ok) throw new Error(`ISS position API: ${posResponse.status}`)
    const posData: WhereTheISSAtResponse = await posResponse.json()

    let crew: string[] = []
    if (crewResponse.ok) {
      const crewData: OpenNotifyAstroResponse = await crewResponse.json()
      crew = crewData.people
        .filter(p => p.craft === 'ISS')
        .map(p => p.name)
    }

    return {
      position: {
        lat: posData.latitude,
        lng: posData.longitude,
      },
      velocity: posData.velocity,
      altitude: posData.altitude,
      crew,
      liveStreamUrl: 'https://www.youtube.com/embed/P9C25Un7xaM',
      isLive: true,
    }
  } catch (err) {
    console.warn('ISS live data unavailable, returning last-known placeholder:', err)
    return {
      position: { lat: 0, lng: 0 },
      velocity: 27600,
      altitude: 408,
      crew: ['Live crew data unavailable'],
      liveStreamUrl: 'https://www.youtube.com/embed/P9C25Un7xaM',
      isLive: false,
    }
  }
}

// Fetch ISS position alone (used by globe refreshes)
export async function fetchISSPosition(): Promise<{ lat: number; lng: number; altitude: number; velocity: number; isLive: boolean }> {
  try {
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
    if (!response.ok) throw new Error(`ISS API: ${response.status}`)
    const data: WhereTheISSAtResponse = await response.json()
    return {
      lat: data.latitude,
      lng: data.longitude,
      altitude: data.altitude,
      velocity: data.velocity,
      isLive: true,
    }
  } catch {
    return { lat: 0, lng: 0, altitude: 408, velocity: 27600, isLive: false }
  }
}

// Propagate a simplified circular orbit position from the orbital altitude.
// This is a known-approximate model used only for non-ISS satellites where
// live positional data requires authenticated APIs. Clearly flagged isLive=false.
function propagateCircularOrbit(sat: SatelliteData): { lat: number; lng: number } {
  // Orbital period in minutes (Kepler's third law approximation for LEO)
  const mu = 398600.4418 // Earth's gravitational parameter km³/s²
  const R_EARTH = 6371 // km
  const a = R_EARTH + sat.orbitAlt // semi-major axis km
  const periodMinutes = (2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu)) / 60

  const currentTimeMinutes = Date.now() / 60000
  const phase = (currentTimeMinutes / periodMinutes) % 1

  // Sun-synchronous inclination ≈ 98° for most Earth-observation satellites
  const inclinationDeg = 98.2
  const inclinationRad = inclinationDeg * (Math.PI / 180)

  // Right ascension of ascending node drifts ~0.9856°/day for SSO
  const raan = (currentTimeMinutes * (0.9856 / 1440)) % 360

  // Position in orbital plane
  const argLat = phase * 2 * Math.PI
  const xOrbit = Math.cos(argLat)
  const yOrbit = Math.sin(argLat)

  // Rotate by inclination and RAAN
  const raanRad = raan * (Math.PI / 180)
  const lat = Math.asin(Math.sin(inclinationRad) * yOrbit) * (180 / Math.PI)
  const lng = (Math.atan2(
    Math.cos(inclinationRad) * yOrbit * Math.cos(raanRad) - xOrbit * Math.sin(raanRad),
    xOrbit * Math.cos(raanRad) + Math.cos(inclinationRad) * yOrbit * Math.sin(raanRad)
  ) * (180 / Math.PI) + 360) % 360 - 180

  return { lat, lng }
}

// Returns live ISS position + propagated positions for all other tracked satellites.
// The ISS is the only one with a live API endpoint that doesn't require authentication.
export async function fetchSatellitePasses(): Promise<SatellitePass[]> {
  if (cache.positions && Date.now() - cache.positions.fetchedAt < CACHE_TTL_MS) {
    return cache.positions.data
  }

  const issData = await fetchLiveISSData()

  const passes: SatellitePass[] = SATELLITES.map(sat => {
    const isISS = sat.noradId === '25544'
    const pos = isISS
      ? { lat: issData.position.lat, lng: issData.position.lng }
      : propagateCircularOrbit(sat)

    const velocity = isISS ? issData.velocity / 3.6 : 7.5 // km/s for display

    return {
      id: `pass-${sat.noradId}`,
      name: sat.name,
      passTime: new Date(),
      lat: pos.lat,
      lng: pos.lng,
      alt: isISS ? issData.altitude : sat.orbitAlt,
      altitude: isISS ? issData.altitude : sat.orbitAlt,
      nextPass: new Date(Date.now() + 90 * 60 * 1000), // placeholder
      noradId: sat.noradId,
      velocity,
      type: sat.type,
      status: 'online' as const,
      isLive: isISS,
    }
  })

  cache.positions = { data: passes, fetchedAt: Date.now() }
  return passes
}

export async function getSatellitePositions(): Promise<SatellitePosition[]> {
  const passes = await fetchSatellitePasses()
  return passes.map(p => ({
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    velocity: p.velocity,
    type: p.type,
    isLive: p.isLive,
  }))
}

// Returns only the ISS legacy-compatible data structure (still used by ISSData consumers)
export async function getISSData(): Promise<ISSData> {
  return fetchLiveISSData()
}

export async function generateSatelliteImageryFeeds(): Promise<CameraFeed[]> {
  const passes = await fetchSatellitePasses()
  return passes.map(p => ({
    id: `sat-${p.noradId}`,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    streamUrl: '', // no public unauthenticated stream endpoints exist
    status: 'online' as const,
    lastFrame: new Date(),
    provider: 'ESA/NASA/NOAA',
    type: 'satellite' as const,
  }))
}

export function getOrbitalPeriod(noradId: string): number {
  const sat = SATELLITES.find(s => s.noradId === noradId)
  if (!sat) return 90
  const R_EARTH = 6371
  const mu = 398600.4418
  const a = R_EARTH + sat.orbitAlt
  return (2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu)) / 60
}

export function getSatelliteByNoradId(noradId: string): SatelliteData | undefined {
  return SATELLITES.find(s => s.noradId === noradId)
}
