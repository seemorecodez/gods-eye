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

const SATELLITES: SatelliteData[] = [
  { name: 'Sentinel-1A', noradId: '39634', type: 'satellite', orbitAlt: 693 },
  { name: 'Landsat-8', noradId: '39084', type: 'satellite', orbitAlt: 705 },
  { name: 'Terra', noradId: '25994', type: 'satellite', orbitAlt: 705 },
  { name: 'NOAA-20', noradId: '43013', type: 'satellite', orbitAlt: 824 },
  { name: 'WorldView-3', noradId: '40115', type: 'satellite', orbitAlt: 617 },
]

function calculateSatellitePosition(sat: SatelliteData) {
  const orbitalPeriod = 90 + (sat.orbitAlt - 600) * 0.1
  const inclination = 98.2 * (Math.PI / 180)
  const currentTime = Date.now() / 60000
  const phase = (currentTime / orbitalPeriod) % 1
  
  return {
    lat: Math.sin(phase * 2 * Math.PI) * inclination * (180 / Math.PI),
    lng: (phase * 360 - 180 + currentTime * 0.25) % 360 - 180,
  }
}

export function getSatellitePositions(): SatellitePosition[] {
  return SATELLITES.map(sat => {
    const pos = calculateSatellitePosition(sat)
    return {
      name: sat.name,
      lat: pos.lat,
      lng: pos.lng,
      velocity: 7.5 + Math.random() * 0.5,
      type: sat.type,
    }
  })
}

export function fetchSatellitePasses(): SatellitePass[] {
  return SATELLITES.map(sat => {
    const pos = calculateSatellitePosition(sat)
    const passMinutes = Math.random() * 120 + 30
    const nextPassTime = new Date(Date.now() + passMinutes * 60000)
    const velocity = 7.5 + Math.random() * 0.5
    
    return {
      id: `pass-${sat.noradId}`,
      name: sat.name,
      passTime: new Date(),
      lat: pos.lat,
      lng: pos.lng,
      alt: sat.orbitAlt,
      altitude: sat.orbitAlt,
      nextPass: nextPassTime,
      noradId: sat.noradId,
      velocity,
      type: sat.type,
      status: 'online' as const,
    }
  })
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
