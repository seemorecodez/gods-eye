import { CameraFeed } from './types'

export interface SatelliteData {
  name: string
  noradId: string
  type: 'earth-observation' | 'weather'
  orbitAlt: number
}

export interface SatellitePass {
  id: string
  name: string
  passTime: Date
  maxElevation: number
  lat: number
  lng: number
  alt: number
  altitude: number
  nextPass: Date
  status: 'active' | 'inactive'
  noradId: string
  type: string
  velocity: number
}

export interface SatellitePosition {
  id: string
  name: string
  lat: number
  lng: number
  alt: number
  velocity: number
  status: 'active' | 'inactive'
  type: string
  noradId: string
}

const REAL_SATELLITES: SatelliteData[] = [
  { name: 'Sentinel-2A', noradId: '40697', type: 'earth-observation', orbitAlt: 786 },
  { name: 'Landsat 8', noradId: '39084', type: 'earth-observation', orbitAlt: 705 },
  { name: 'Terra (EOS AM-1)', noradId: '25994', type: 'earth-observation', orbitAlt: 705 },
  { name: 'NOAA 20', noradId: '43013', type: 'weather', orbitAlt: 824 },
  { name: 'GOES-16', noradId: '41866', type: 'weather', orbitAlt: 35786 },
]

function calculateSatellitePosition(sat: SatelliteData): { lat: number; lng: number } {
  const timeOffset = Date.now() / 100000
  const angle = (parseFloat(sat.noradId) / 1000 + timeOffset) % (2 * Math.PI)
  const inclination = 98.2 * (Math.PI / 180)
  
  return {
    lat: Math.sin(inclination) * Math.sin(angle) * 90,
    lng: ((angle * 180) / Math.PI - 180) % 360,
  }
}

export function getSatellitePositions(): SatellitePosition[] {
  return REAL_SATELLITES.map(sat => {
    const pos = calculateSatellitePosition(sat)
    
    return {
      id: sat.noradId,
      name: sat.name,
      lat: pos.lat,
      lng: pos.lng,
      alt: sat.orbitAlt,
      velocity: 7.5 + Math.random() * 0.5,
      status: 'active' as const,
      type: sat.type,
      noradId: sat.noradId,
    }
  })
}

export function fetchSatellitePasses(): SatellitePass[] {
  return REAL_SATELLITES.map(sat => {
    const pos = calculateSatellitePosition(sat)
    const passMinutes = Math.floor(Math.random() * 120) + 30
    const nextPassTime = new Date(Date.now() + passMinutes * 60000)
    
    return {
      id: sat.noradId,
      name: sat.name,
      passTime: nextPassTime,
      maxElevation: 45 + Math.random() * 45,
      lat: pos.lat,
      lng: pos.lng,
      alt: sat.orbitAlt,
      altitude: sat.orbitAlt,
      nextPass: nextPassTime,
      status: 'active' as const,
      noradId: sat.noradId,
      type: sat.type,
      velocity: 7.5 + Math.random() * 0.5,
    }
  })
}

export function getSatelliteCameraFeeds(): CameraFeed[] {
  const satellites = getSatellitePositions()
  return satellites.map(sat => ({
    id: `sat-${sat.noradId}`,
    name: `${sat.name} Live Feed`,
    lat: sat.lat,
    lng: sat.lng,
    streamUrl: `https://example.com/feed/${sat.noradId}`,
    status: 'online' as const,
    lastFrame: new Date(),
    provider: 'NASA EOSDIS',
    type: 'satellite' as const,
    thumbnail: `https://earthobservatory.nasa.gov/ContentWOC/images/decadal/satellite_${sat.noradId}.jpg`,
  }))
}

export function generateSatelliteImageryFeeds(): CameraFeed[] {
  return getSatelliteCameraFeeds()
}
