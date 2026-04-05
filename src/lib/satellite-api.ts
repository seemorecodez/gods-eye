import { CameraFeed } from './types'

export interface SatelliteData {
  noradId: string
  name: string
  type: 'optical' | 'radar' | 'weather' | 'communication'
  orbitAlt: number
}

export interface SatellitePosition {
  id: string
  name: string
  lat: number
  lng: number
  alt: number
  velocity: number
  status: 'active' | 'offline' | 'error'
  type: 'optical' | 'radar' | 'weather' | 'communication'
  noradId: string
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
  status: 'active' | 'offline' | 'error'
  noradId: string
  type: 'optical' | 'radar' | 'weather' | 'communication'
  velocity: number
}

const REAL_SATELLITES: SatelliteData[] = [
  { name: 'Sentinel-2A', noradId: '40697', type: 'optical', orbitAlt: 786 },
  { name: 'Sentinel-2B', noradId: '42063', type: 'optical', orbitAlt: 786 },
  { name: 'Sentinel-1A', noradId: '39634', type: 'radar', orbitAlt: 693 },
  { name: 'Sentinel-1B', noradId: '41456', type: 'radar', orbitAlt: 693 },
  { name: 'Landsat 8', noradId: '39084', type: 'optical', orbitAlt: 705 },
  { name: 'Landsat 9', noradId: '49260', type: 'optical', orbitAlt: 705 },
  { name: 'Terra', noradId: '25994', type: 'optical', orbitAlt: 705 },
  { name: 'Aqua', noradId: '27424', type: 'optical', orbitAlt: 705 },
  { name: 'NOAA-20', noradId: '43013', type: 'weather', orbitAlt: 824 },
  { name: 'Suomi NPP', noradId: '37849', type: 'weather', orbitAlt: 824 },
  { name: 'WorldView-3', noradId: '40115', type: 'optical', orbitAlt: 617 },
  { name: 'SPOT-7', noradId: '40053', type: 'optical', orbitAlt: 694 },
]

function calculateSatellitePosition(satellite: SatelliteData): { lat: number; lng: number } {
  const now = Date.now()
  const orbitalPeriod = 90 * 60 * 1000
  const angle = ((now % orbitalPeriod) / orbitalPeriod) * 2 * Math.PI
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
    const velocity = 7.5 + Math.random() * 0.5
    
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
      velocity,
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
    streamUrl: `https://satellite-feeds.example.com/live/${sat.noradId}`,
    embedUrl: `https://satellite-feeds.example.com/embed/${sat.noradId}`,
    status: sat.status === 'active' ? 'online' : 'offline',
    lastFrame: new Date(),
    provider: 'ESA/NASA',
    type: 'satellite',
    thumbnail: `https://satellite-feeds.example.com/thumb/${sat.noradId}.jpg`,
  }))
}

export function generateSatelliteImageryFeeds(): CameraFeed[] {
  return getSatelliteCameraFeeds()
}
