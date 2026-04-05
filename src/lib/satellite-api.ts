import { CameraFeed } from './types'

interface SatelliteData {
  name: string
  noradId: string
  type: 'earth-observation' | 'weather'
  orbitAlt: number
}

interface SatellitePosition {
  id: string
  name: string
  lat: number
  lng: number
  alt: number
  nextPass: Date
  status: 'active' | 'inactive'
  noradId: string
}

export interface SatellitePass {
  id: string
  name: string
  noradId: string
  passTime: Date
  duration: number
  maxElevation: number
  direction: string
  lat: number
  lng: number
  type: string
  altitude: number
  velocity: number
  nextPass: Date
  status: 'active' | 'inactive'
}

const REAL_SATELLITES: SatelliteData[] = [
  { name: 'Sentinel-2A', noradId: '40697', type: 'earth-observation', orbitAlt: 786 },
  { name: 'Landsat 8', noradId: '39084', type: 'earth-observation', orbitAlt: 705 },
  { name: 'Terra (EOS AM-1)', noradId: '25994', type: 'earth-observation', orbitAlt: 705 },
  { name: 'NOAA 20', noradId: '43013', type: 'weather', orbitAlt: 824 },
  { name: 'GOES-16', noradId: '41866', type: 'weather', orbitAlt: 35786 },
  { name: 'Sentinel-3A', noradId: '41335', type: 'earth-observation', orbitAlt: 814 },
  { name: 'SPOT 7', noradId: '40053', type: 'earth-observation', orbitAlt: 694 },
  { name: 'Aqua', noradId: '27424', type: 'earth-observation', orbitAlt: 705 },
  { name: 'Suomi NPP', noradId: '37849', type: 'weather', orbitAlt: 824 },
]

function calculateSatellitePosition(sat: SatelliteData): { lat: number; lng: number } {
  const time = Date.now() / 1000
  const period = 90 + (sat.orbitAlt / 100)
  const inclination = 98.2 * (Math.PI / 180)
  const angle = (time / (period * 60)) * 2 * Math.PI
  
  return {
    lat: Math.sin(inclination) * Math.sin(angle) * 90,
    lng: ((angle * (180 / Math.PI)) % 360) - 180,
  }
}

export function getSatellitePositions(): SatellitePosition[] {
  const now = new Date()
  return REAL_SATELLITES.map((sat, index) => {
    const pos = calculateSatellitePosition(sat)
    const nextPassTime = new Date(now.getTime() + (90 + index * 15) * 60000)
    
    return {
      id: sat.noradId,
      name: sat.name,
      lat: pos.lat,
      lng: pos.lng,
      alt: sat.orbitAlt,
      nextPass: nextPassTime,
      status: 'active' as const,
      noradId: sat.noradId,
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
    streamUrl: `https://eosdis.nasa.gov/worldview/?v=${sat.lng - 10},${sat.lat - 10},${sat.lng + 10},${sat.lat + 10}`,
    status: 'online' as const,
    lastFrame: new Date(),
    provider: 'NASA EOSDIS',
    type: 'satellite' as const,
    thumbnail: `https://earthobservatory.nasa.gov/ContentWOC/images/decadal/satellite_${sat.noradId}.jpg`,
  }))
}

export function fetchSatellitePasses(): SatellitePass[] {
  const now = new Date()
  return REAL_SATELLITES.map((sat, index) => {
    const pos = calculateSatellitePosition(sat)
    const passTime = new Date(now.getTime() + (30 + index * 45) * 60000)
    const velocity = 7.5 + (Math.random() * 0.5)
    
    return {
      id: `pass-${sat.noradId}-${index}`,
      name: sat.name,
      noradId: sat.noradId,
      passTime,
      duration: 8 + Math.random() * 4,
      maxElevation: 30 + Math.random() * 60,
      direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      lat: pos.lat,
      lng: pos.lng,
      type: sat.type,
      altitude: sat.orbitAlt,
      velocity,
      nextPass: passTime,
      status: 'active' as const,
    }
  })
}

export function generateSatelliteImageryFeeds(): CameraFeed[] {
  return getSatelliteCameraFeeds()
}
