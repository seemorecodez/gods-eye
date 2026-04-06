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
  { name: 'WorldView-3', noradId: '40115', type: 'satellite', orbitAlt: 617 },
  { name: 'WorldView-4', noradId: '41848', type: 'satellite', orbitAlt: 617 },
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

export function getISSData(): ISSData {
  const issSat = SATELLITES.find(s => s.name.includes('ISS'))
  if (!issSat) {
    throw new Error('ISS data not found')
  }
  
  const pos = calculateSatellitePosition(issSat)
  
  return {
    position: {
      lat: pos.lat,
      lng: pos.lng
    },
    velocity: 7.66,
    altitude: 408,
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
  const sat = SATELLITES.find(s => s.noradId === noradId)
  if (!sat) return 90
  
  return 90 + (sat.orbitAlt - 600) * 0.1
}

export function getSatelliteByNoradId(noradId: string): SatelliteData | undefined {
  return SATELLITES.find(s => s.noradId === noradId)
}
